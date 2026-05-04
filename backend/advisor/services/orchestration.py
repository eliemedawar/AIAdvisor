"""
Orchestration: single entry point to produce the advisor reply.
Builds context, runs router, runs selected agents in parallel, merges replies.
"""
from __future__ import annotations

import logging
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any

# ── Course-code correction helpers ───────────────────────────────────────────
# Used to enforce that proposed actions always use the course from the current
# user message, not stale course codes from the conversation history.

_COURSE_CODE_RE = re.compile(r"\b([A-Z]{2,5})\s*(\d{3,4})\b", re.IGNORECASE)


def _replace_course_in_text(text: str, wrong: str, correct: str) -> str:
    """Replace occurrences of *wrong* course code with *correct* in text."""
    if not text or not wrong:
        return text
    parts = wrong.split()
    if len(parts) == 2:
        pattern = re.compile(
            r"\b" + re.escape(parts[0]) + r"\s*" + re.escape(parts[1]) + r"\b",
            re.IGNORECASE,
        )
        return pattern.sub(correct, text)
    return text.replace(wrong, correct)


def _fix_proposed_action_course_codes(
    actions: list[dict],
    last_user_message: str,
) -> list[dict]:
    """
    Post-processing guardrail: if the last user message names a course code,
    ensure every write action (create_assignment / create_calendar_event /
    create_task) uses that course code. Replaces both the course_code field
    and any occurrence in title / description.
    select_elective actions are never modified.
    """
    if not last_user_message or not actions:
        return actions

    m = _COURSE_CODE_RE.search(last_user_message)
    if not m:
        return actions

    correct = f"{m.group(1).upper()} {m.group(2)}"
    correct_key = correct.upper().replace(" ", "")

    fixed: list[dict] = []
    for action in actions:
        a = dict(action)
        if a.get("type") in ("create_assignment", "create_calendar_event", "create_task"):
            existing = (a.get("course_code") or "").strip()
            if existing and existing.upper().replace(" ", "") != correct_key:
                a["course_code"] = correct
                for field in ("title", "description"):
                    if a.get(field):
                        a[field] = _replace_course_in_text(a[field], existing, correct)
        fixed.append(a)
    return fixed

from django.utils import timezone as django_tz

from .agents import AGENT_RUNNERS
from .clarifier import run_clarifier
from .context import build_student_context
from .llm import LLMServiceError
from .merge import merge_agent_replies
from .memory import build_conversation_summary
from .action_planner import (
    run_action_planner,
    extract_event_plan_from_message,
    build_event_plan_from_actions,
)
from .router import run_router
from .types import ActionPlanOutput

logger = logging.getLogger(__name__)

FALLBACK_REPLY = (
    "I'm sorry, I couldn't generate a response right now. "
    "Please try again in a moment."
)


def _conversation_messages(conversation: Any) -> list[dict[str, str]]:
    """Return list of {role, content} for all messages in the conversation."""
    return [
        {"role": m.role, "content": m.content}
        for m in conversation.messages.all()
    ]


def get_advisor_reply(
    user: Any,
    conversation: Any,
    *,
    request_id: str | None = None,
) -> str:
    """
    Produce the assistant reply: build context, route, run selected agents
    in parallel, merge. Only returns fallback if no successful agent replies.
    """
    log_extra = {"request_id": request_id} if request_id else {}
    t0 = time.perf_counter()
    logger.info("orchestration_start", extra=log_extra)

    try:
        context = build_student_context(user)
        messages = _conversation_messages(conversation)
        if not messages:
            return FALLBACK_REPLY

        conversation_summary = build_conversation_summary(messages)
        router_output = run_router(
            messages,
            request_id=request_id,
            conversation_summary=conversation_summary,
        )
        logger.info(
            "orchestration_after_router selected_agents=%s router_confidence=%.2f",
            router_output.agents,
            router_output.confidence,
            extra=log_extra,
        )

        # Clarifier: when confidence is low or router selected only advisor, maybe ask one question
        run_clarifier_step = (
            router_output.confidence < 0.45
            or router_output.agents == ["advisor"]
        )
        if run_clarifier_step:
            try:
                clarifier_out = run_clarifier(
                    messages,
                    conversation_summary,
                    request_id=request_id,
                )
                if (
                    clarifier_out.action == "ask_question"
                    and clarifier_out.question
                    and clarifier_out.question.strip()
                ):
                    logger.info("clarifier_triggered", extra=log_extra)
                    return clarifier_out.question.strip()
            except Exception as e:
                logger.warning("clarifier failed, continuing: %s", e, extra=log_extra)

        # Run agents in parallel; collect in router order for deterministic merge
        replies: dict[str, str] = {}
        failed_agents: list[str] = []
        agent_order = list(router_output.agents)

        def run_one(agent_name: str) -> tuple[str, str]:
            runner = AGENT_RUNNERS.get(agent_name)
            if not runner:
                return agent_name, ""
            reply = runner(
                context,
                messages,
                request_id=request_id,
                conversation_summary=conversation_summary,
            )
            return agent_name, reply

        with ThreadPoolExecutor(max_workers=min(len(agent_order), 3)) as executor:
            future_to_agent = {
                executor.submit(run_one, name): name
                for name in agent_order
                if AGENT_RUNNERS.get(name)
            }
            for future in as_completed(future_to_agent):
                agent_name = future_to_agent[future]
                try:
                    name, reply = future.result()
                    if name and reply:
                        replies[name] = reply
                except LLMServiceError as e:
                    logger.warning(
                        "agent %s failed (LLMServiceError): %s",
                        agent_name,
                        e,
                        extra=log_extra,
                    )
                    failed_agents.append(agent_name)
                except Exception as e:
                    logger.warning(
                        "agent %s failed: %s",
                        agent_name,
                        e,
                        extra=log_extra,
                    )
                    failed_agents.append(agent_name)

        # Preserve deterministic merge order (same as router_output.agents)
        ordered_replies: dict[str, str] = {}
        for name in agent_order:
            if name in replies:
                ordered_replies[name] = replies[name]

        elapsed_ms = (time.perf_counter() - t0) * 1000
        logger.info(
            "orchestration_after_agents ran_agents=%s failed_agents=%s total_elapsed_ms=%.0f",
            list(ordered_replies.keys()),
            failed_agents,
            elapsed_ms,
            extra=log_extra,
        )

        if not ordered_replies:
            return FALLBACK_REPLY
        return merge_agent_replies(ordered_replies)
    except LLMServiceError as e:
        logger.exception("orchestration LLM error: %s", e, extra=log_extra)
        return FALLBACK_REPLY


def get_advisor_reply_payload(
    user: Any,
    conversation: Any,
    *,
    request_id: str | None = None,
    user_timezone: str | None = None,
    attached_context: str | None = None,
) -> dict[str, Any]:
    """
    Produce assistant reply plus a proposed action plan (confirmation-first).

    The action plan is computed after the reply text is generated. It is never
    executed here; execution happens only after frontend confirmation.
    """
    log_extra = {"request_id": request_id} if request_id else {}
    t0 = time.perf_counter()
    logger.info("orchestration_payload_start", extra=log_extra)

    try:
        context = build_student_context(user)
        messages = _conversation_messages(conversation)
        if not messages:
            return {"reply_text": FALLBACK_REPLY, "proposed_actions": []}

        conversation_summary = build_conversation_summary(messages)
        router_output = run_router(
            messages,
            request_id=request_id,
            conversation_summary=conversation_summary,
        )

        logger.info(
            "orchestration_payload_after_router selected_agents=%s router_confidence=%.2f",
            router_output.agents,
            router_output.confidence,
            extra=log_extra,
        )

        # Extract EventPlan deterministically from the last user message.
        # This becomes the single source of truth for course/datetime throughout.
        last_user = next(
            (m for m in reversed(messages) if (m.get("role") or "").lower() == "user"),
            None,
        )
        last_user_content = (last_user.get("content") if last_user else "") or ""
        last_user_lower = last_user_content.lower()
        now = django_tz.now()
        event_plan = extract_event_plan_from_message(last_user_content, user_timezone, now)

        run_clarifier_step = (
            router_output.confidence < 0.45
            or router_output.agents == ["advisor"]
        )
        if run_clarifier_step:
            # If we must ask a clarifying question, we should not propose writes.
            try:
                clarifier_out = run_clarifier(
                    messages,
                    conversation_summary,
                    request_id=request_id,
                )
                if (
                    clarifier_out.action == "ask_question"
                    and clarifier_out.question
                    and clarifier_out.question.strip()
                ):
                    return {
                        "reply_text": clarifier_out.question.strip(),
                        "proposed_actions": [],
                        "event_plan": None,
                    }
            except Exception as e:
                logger.warning("clarifier failed, continuing: %s", e, extra=log_extra)

        # Run agents in parallel; collect in router order for deterministic merge
        replies: dict[str, str] = {}
        failed_agents: list[str] = []
        agent_order = list(router_output.agents)

        def run_one(agent_name: str) -> tuple[str, str]:
            runner = AGENT_RUNNERS.get(agent_name)
            if not runner:
                return agent_name, ""
            reply = runner(
                context,
                messages,
                request_id=request_id,
                conversation_summary=conversation_summary,
                attached_context=attached_context,
                event_plan=event_plan,
            )
            return agent_name, reply

        with ThreadPoolExecutor(max_workers=min(len(agent_order), 3)) as executor:
            future_to_agent = {
                executor.submit(run_one, name): name
                for name in agent_order
                if AGENT_RUNNERS.get(name)
            }
            for future in as_completed(future_to_agent):
                agent_name = future_to_agent[future]
                try:
                    name, reply = future.result()
                    if name and reply:
                        replies[name] = reply
                except LLMServiceError as e:
                    logger.warning(
                        "agent %s failed (LLMServiceError): %s",
                        agent_name,
                        e,
                        extra=log_extra,
                    )
                    failed_agents.append(agent_name)
                except Exception as e:
                    logger.warning(
                        "agent %s failed: %s",
                        agent_name,
                        e,
                        extra=log_extra,
                    )
                    failed_agents.append(agent_name)

        ordered_replies: dict[str, str] = {}
        for name in agent_order:
            if name in replies:
                ordered_replies[name] = replies[name]

        if not ordered_replies:
            return {"reply_text": FALLBACK_REPLY, "proposed_actions": [], "event_plan": None}

        reply_text = merge_agent_replies(ordered_replies)

        # Build proposed actions (confirmation-first).
        # Heuristic gate: scan the last user message AND recent conversation
        # context so follow-up requests like "can u add it" still trigger
        # the action planner when a date was mentioned earlier.

        # Build a window of recent conversation text (last 6 messages) for
        # date-signal detection so "can u add it to the calendar" still passes
        # when "next Tuesday at 11 pm" appeared in a prior turn.
        recent_window = " ".join(
            (m.get("content") or "").lower()
            for m in messages[-6:]
        )

        write_keywords = [
            "add",
            "create",
            "plan",
            "focus",
            "schedule",
            "calendar",
            "event",
            "assignment",
            "due",
            "deadline",
            "study",
            "session",
            "remind",
            "put",
            "include",
            "insert",
        ]
        # Affirmative short replies the user types to confirm a prior AI suggestion.
        affirmative_keywords = [
            "yes",
            "yeah",
            "yep",
            "yup",
            "sure",
            "ok",
            "okay",
            "do it",
            "go ahead",
            "add it",
            "sounds good",
            "please",
            "confirm",
            "approved",
            "agree",
            "great",
        ]
        has_write_intent = any(k in last_user_lower for k in write_keywords)
        # Also treat a short affirmative reply as write intent when the recent
        # conversation window already contains write-intent keywords — this
        # covers the common "yes" / "ok" confirmation pattern.
        if not has_write_intent:
            is_affirmative = any(k in last_user_lower for k in affirmative_keywords)
            recent_has_write_intent = any(k in recent_window for k in write_keywords)
            has_write_intent = is_affirmative and recent_has_write_intent

        def _has_date_in(text: str) -> bool:
            return bool(
                re.search(r"\b\d{4}-\d{2}-\d{2}\b", text)
                # "5 jan" format
                or re.search(r"\b\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b", text)
                # "May 12" / "January 5th" format
                or re.search(r"\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}\b", text)
                or "today" in text
                or "tomorrow" in text
                or "next week" in text
                or "this week" in text
                or "week" in text
                or "tuesday" in text
                or "wednesday" in text
                or "thursday" in text
                or "friday" in text
                or "saturday" in text
                or "sunday" in text
                or "monday" in text
                or re.search(r"\b\d{1,2}(/\d{1,2}){1,2}\b", text)
                or re.search(r"\bat\s+\d{1,2}(:\d{2})?\s*(am|pm)\b", text)
            )

        # A date signal in the last message OR anywhere in the recent window
        # (so follow-up "add it" messages inherit context).
        has_date_signal = _has_date_in(last_user_lower) or _has_date_in(recent_window)

        # Elective selection intent: user explicitly picks a course for a slot
        elective_select_verbs = ["select", "choose", "pick", "apply", "use", "assign"]
        has_elective_select_intent = (
            any(k in last_user_lower for k in elective_select_verbs)
            and ("elective" in last_user_lower or "elective" in recent_window)
            and bool(
                context.get("academic_plan", {}).get("elective_placeholders")
            )
        )

        # Study plan intent: user wants AI to generate a structured study plan
        # (doesn't need a specific date — AI will propose slots across the coming week)
        study_plan_phrases = [
            "study plan",
            "study schedule",
            "study session",
            "plan my week",
            "plan my study",
            "make a plan",
            "help me study",
            "study for my",
            "organize my",
            "organize tasks",
        ]
        has_study_plan_intent = any(k in last_user_lower for k in study_plan_phrases)
        if not has_study_plan_intent:
            # Generic: "plan"/"schedule"/"organize" combined with a learning context keyword
            has_study_plan_intent = (
                any(k in last_user_lower for k in ["plan", "schedule", "organize"])
                and any(k in last_user_lower for k in ["course", "exam", "deadline", "week", "study", "task"])
            )

        # Deadline statement intent: user declares an upcoming academic deadline
        # e.g. "I have a homework in EECE 451 due next Tuesday at 8 PM"
        # e.g. "I have an exam in INDE 301 on May 12 at 9 AM"
        _deadline_type_words = ["exam", "quiz", "homework", "project", "report", "midterm", "final"]
        _deadline_declaration_phrases = ["have a ", "have an ", "is due", "are due", "due on", "scheduled for", "scheduled on"]
        has_deadline_statement_intent = (
            any(k in last_user_lower for k in _deadline_type_words)
            and _has_date_in(last_user_lower)
            and any(k in last_user_lower for k in _deadline_declaration_phrases)
        )

        proposed_actions = []
        action_plan_confidence: float | None = None
        if (
            (has_write_intent and has_date_signal)
            or has_elective_select_intent
            or has_study_plan_intent
            or has_deadline_statement_intent
        ):
            action_plan: ActionPlanOutput = run_action_planner(
                user=user,
                context=context,
                messages=messages,
                conversation_summary=conversation_summary,
                request_id=request_id,
                user_timezone=user_timezone,
                attached_context=attached_context,
                event_plan=event_plan,
            )
            action_plan_confidence = action_plan.confidence
            proposed_actions = (
                action_plan.actions if action_plan.confidence >= 0.4 else []
            )

        elapsed_ms = (time.perf_counter() - t0) * 1000
        logger.info(
            "orchestration_payload_after_actions proposed_count=%s total_elapsed_ms=%.0f",
            len(proposed_actions),
            elapsed_ms,
            extra=log_extra,
        )
        # Deterministic post-processing: fix any wrong course codes in the
        # proposed actions against what the user actually said.
        raw_actions = [a.model_dump() for a in proposed_actions]
        corrected_actions = _fix_proposed_action_course_codes(raw_actions, last_user_content)

        # Build full EventPlan with study_sessions/tasks populated from actions.
        full_event_plan = None
        if event_plan is not None:
            full_event_plan = build_event_plan_from_actions(event_plan, corrected_actions)

        return {
            "reply_text": reply_text,
            "proposed_actions": corrected_actions,
            "action_plan_confidence": action_plan_confidence,
            "event_plan": full_event_plan.model_dump() if full_event_plan else None,
        }
    except LLMServiceError as e:
        logger.exception("orchestration_payload LLM error: %s", e, extra=log_extra)
        return {"reply_text": FALLBACK_REPLY, "proposed_actions": []}
    except Exception as e:
        logger.exception("orchestration_payload error: %s", e, extra=log_extra)
        return {"reply_text": FALLBACK_REPLY, "proposed_actions": []}
