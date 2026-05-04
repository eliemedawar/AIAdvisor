"""
Specialist agents: scheduling, advisor, course_progress.
Each takes structured context + conversation messages and returns a single reply string.
"""
from __future__ import annotations

import logging
from typing import Any

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage

from .context import format_context_for_agent
from .llm import call_llm
from .prompts import (
    ADVISOR_SYSTEM_PROMPT_PREFIX,
    COURSE_PROGRESS_SYSTEM_PROMPT_PREFIX,
    SCHEDULING_SYSTEM_PROMPT_PREFIX,
)
from .types import EventPlan

logger = logging.getLogger(__name__)

KNOWN_ROLES = frozenset({"system", "user", "assistant"})


def _conversation_to_messages(messages: list[dict[str, Any]]) -> list[BaseMessage]:
    """
    Convert list of {role, content} dicts to LangChain messages.
    Preserves exact roles: system -> SystemMessage, user -> HumanMessage, assistant -> AIMessage.
    Unknown roles are skipped. Empty or whitespace-only content is skipped.
    """
    out: list[BaseMessage] = []
    for m in messages:
        role = (m.get("role") or "user").strip().lower()
        content = (m.get("content") or "").strip()
        if not content:
            continue
        if role not in KNOWN_ROLES:
            continue
        if role == "system":
            out.append(SystemMessage(content=content))
        elif role == "user":
            out.append(HumanMessage(content=content))
        else:
            out.append(AIMessage(content=content))
    return out


def _extract_last_user_message(messages: list[dict[str, Any]]) -> str:
    """Return the content of the most recent user message, or empty string."""
    for m in reversed(messages):
        if (m.get("role") or "").strip().lower() == "user":
            return (m.get("content") or "").strip()
    return ""


def _build_system_prompt(
    prefix: str,
    context: dict[str, Any],
    agent_name: str,
    *,
    conversation_summary: str | None = None,
    attached_context: str | None = None,
    last_user_message: str | None = None,
    event_plan: EventPlan | None = None,
) -> str:
    context_block = format_context_for_agent(context, agent_name)
    base = f"{prefix}\n\n--- Student context ---\n{context_block}"
    if attached_context and attached_context.strip():
        base += f"\n\n--- User-highlighted context ---\n{attached_context.strip()}"
    # Conversation summary is background context — explicitly lower priority
    if conversation_summary:
        summary_block = (
            "Prior conversation summary (BACKGROUND ONLY — lower priority than CURRENT MESSAGE below):\n"
            + conversation_summary
        )
        base = f"{summary_block}\n\n{base}"
    # Current message pinned at the very top so the LLM reads it first
    if last_user_message:
        current_block = (
            "==============================================\n"
            "CURRENT MESSAGE (HIGHEST PRIORITY -- governs course, date, and time):\n"
            f"{last_user_message}\n"
            "=============================================="
        )
        base = f"{current_block}\n\n{base}"
    # Locked EventPlan sits above everything when available
    if event_plan is not None and (event_plan.course_code or event_plan.event_datetime):
        plan_lines = [
            "==============================================",
            "LOCKED EVENT PLAN (deterministically extracted -- do NOT deviate):",
            f"  course_code : {event_plan.course_code or 'N/A'}",
        ]
        if event_plan.event_type:
            plan_lines.append(f"  event_type  : {event_plan.event_type}")
        if event_plan.event_datetime:
            plan_lines.append(f"  datetime    : {event_plan.event_datetime}")
        if event_plan.availability_note:
            plan_lines.append(f"  when        : {event_plan.availability_note}")
        plan_lines.append("==============================================")
        base = "\n".join(plan_lines) + "\n\n" + base
    return base


def run_scheduling_agent(
    context: dict[str, Any],
    messages: list[dict[str, Any]],
    *,
    request_id: str | None = None,
    conversation_summary: str | None = None,
    attached_context: str | None = None,
    event_plan: EventPlan | None = None,
) -> str:
    """Scheduling specialist: deadlines, calendar, assignments, tasks, time management."""
    logger.info(
        "run_scheduling_agent",
        extra={"request_id": request_id} if request_id else {},
    )
    system = _build_system_prompt(
        SCHEDULING_SYSTEM_PROMPT_PREFIX,
        context,
        "scheduling",
        conversation_summary=conversation_summary,
        attached_context=attached_context,
        last_user_message=_extract_last_user_message(messages),
        event_plan=event_plan,
    )
    chat = _conversation_to_messages(messages)
    return call_llm(system, chat, request_id=request_id, max_tokens=1500)


def run_advisor_agent(
    context: dict[str, Any],
    messages: list[dict[str, Any]],
    *,
    request_id: str | None = None,
    conversation_summary: str | None = None,
    attached_context: str | None = None,
    event_plan: EventPlan | None = None,
) -> str:
    """Advisor specialist: general advice, study tips, motivation, goals, GPA."""
    logger.info(
        "run_advisor_agent",
        extra={"request_id": request_id} if request_id else {},
    )
    system = _build_system_prompt(
        ADVISOR_SYSTEM_PROMPT_PREFIX,
        context,
        "advisor",
        conversation_summary=conversation_summary,
        attached_context=attached_context,
        last_user_message=_extract_last_user_message(messages),
        event_plan=event_plan,
    )
    chat = _conversation_to_messages(messages)
    return call_llm(system, chat, request_id=request_id, max_tokens=1200)


def run_course_progress_agent(
    context: dict[str, Any],
    messages: list[dict[str, Any]],
    *,
    request_id: str | None = None,
    conversation_summary: str | None = None,
    attached_context: str | None = None,
    event_plan: EventPlan | None = None,
) -> str:
    """Course/progress specialist: courses, credits, grades, on-track."""
    logger.info(
        "run_course_progress_agent",
        extra={"request_id": request_id} if request_id else {},
    )
    system = _build_system_prompt(
        COURSE_PROGRESS_SYSTEM_PROMPT_PREFIX,
        context,
        "course_progress",
        conversation_summary=conversation_summary,
        attached_context=attached_context,
        last_user_message=_extract_last_user_message(messages),
        event_plan=event_plan,
    )
    chat = _conversation_to_messages(messages)
    return call_llm(system, chat, request_id=request_id, max_tokens=1200)


# Dispatch by name for orchestration
AGENT_RUNNERS: dict[str, Any] = {
    "scheduling": run_scheduling_agent,
    "advisor": run_advisor_agent,
    "course_progress": run_course_progress_agent,
}
