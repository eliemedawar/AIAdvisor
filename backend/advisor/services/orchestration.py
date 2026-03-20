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

from .agents import AGENT_RUNNERS
from .clarifier import run_clarifier
from .context import build_student_context
from .llm import LLMServiceError
from .merge import merge_agent_replies
from .memory import build_conversation_summary
from .action_planner import run_action_planner
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

        run_clarifier_step = (
            router_output.confidence < 0.45
            or router_output.agents == ["advisor"]
        )
        if run_clarifier_step:
            # If we must ask a clarifying question, we should not propose writes.
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
                }

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

        ordered_replies: dict[str, str] = {}
        for name in agent_order:
            if name in replies:
                ordered_replies[name] = replies[name]

        if not ordered_replies:
            return {"reply_text": FALLBACK_REPLY, "proposed_actions": []}

        reply_text = merge_agent_replies(ordered_replies)

        # Build proposed actions (confirmation-first).
        # Heuristic gate: scan the last user message AND recent conversation
        # context so follow-up requests like "can u add it" still trigger
        # the action planner when a date was mentioned earlier.
        last_user = next(
            (m for m in reversed(messages) if (m.get("role") or "").lower() == "user"),
            None,
        )
        last_user_content = (last_user.get("content") if last_user else "") or ""
        last_user_lower = last_user_content.lower()

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
        has_write_intent = any(k in last_user_lower for k in write_keywords)

        def _has_date_in(text: str) -> bool:
            return bool(
                re.search(r"\b\d{4}-\d{2}-\d{2}\b", text)
                or re.search(r"\b\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b", text)
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

        proposed_actions = []
        action_plan_confidence: float | None = None
        if has_write_intent and has_date_signal:
            action_plan: ActionPlanOutput = run_action_planner(
                user=user,
                context=context,
                messages=messages,
                conversation_summary=conversation_summary,
                request_id=request_id,
                user_timezone=user_timezone,
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
        return {
            "reply_text": reply_text,
            "proposed_actions": [a.model_dump() for a in proposed_actions],
            "action_plan_confidence": action_plan_confidence,
        }
    except LLMServiceError as e:
        logger.exception("orchestration_payload LLM error: %s", e, extra=log_extra)
        return {"reply_text": FALLBACK_REPLY, "proposed_actions": []}
    except Exception as e:
        logger.exception("orchestration_payload error: %s", e, extra=log_extra)
        return {"reply_text": FALLBACK_REPLY, "proposed_actions": []}
