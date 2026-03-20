"""
Action planner: proposes structured planner/calendar writes for confirmation.

This does NOT modify any DB models. It only returns a JSON-shaped proposal
based on the student context and the conversation.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from django.utils import timezone
from langchain_core.messages import HumanMessage

from .context import format_context_for_agent
from .llm import call_llm
from .prompts import ACTION_PLANNER_SYSTEM_PROMPT
from .types import ActionPlanOutput

logger = logging.getLogger(__name__)


def _extract_outer_json(text: str) -> str | None:
    """Extract the outermost {...} JSON object from a string.

    Tries json.loads on the whole text first (handles clean LLM output), then
    falls back to brace-counting extraction for text wrapped in prose/code fences.
    """
    if not text:
        return None
    # Fast path: try stripping code fences then parsing directly
    stripped = text.strip()
    if stripped.startswith("```"):
        lines = stripped.splitlines()
        stripped = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    try:
        json.loads(stripped)
        return stripped
    except (json.JSONDecodeError, ValueError):
        pass
    # Fallback: brace-counting (handles JSON embedded in prose)
    start = text.find("{")
    if start == -1:
        return None
    depth = 0
    end = -1
    for i in range(start, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                end = i
                break
    if end == -1:
        return None
    return text[start : end + 1]


def build_action_planner_context_text(context: dict[str, Any]) -> str:
    """
    Produce a compact student-context text for the action planner.

    We intentionally reuse the existing context formatting for a predictable
    structure.
    """
    # Reuse formatting logic by injecting into an "advisor" view, which includes
    # both scheduling and course context in this repo's implementation.
    # (format_context_for_agent decides which sections to include based on agent_name)
    return format_context_for_agent(context, "advisor")


def run_action_planner(
    *,
    user: Any,
    context: dict[str, Any],
    messages: list[dict[str, Any]],
    conversation_summary: str,
    request_id: str | None = None,
    user_timezone: str | None = None,
    attached_context: str | None = None,
) -> ActionPlanOutput:
    """
    Ask the LLM for proposed actions (assignment/calendar event creations).
    On any parse/validation error, returns an empty plan.
    """
    log_extra = {"request_id": request_id} if request_id else {}
    logger.info("action_planner_start", extra=log_extra)

    user_messages = [m for m in messages if (m.get("role") or "").lower() == "user"]
    last_user = user_messages[-1] if user_messages else None
    last_user_content = (last_user.get("content") if last_user else "") or ""

    context_text = build_action_planner_context_text(context)

    # Include the last 6 raw messages verbatim so follow-up requests like
    # "can u add it" can resolve dates/courses from the immediately preceding turns,
    # even when the conversation summary hasn't captured them yet.
    recent_turns = messages[-6:] if len(messages) >= 6 else messages
    recent_transcript = "\n".join(
        f"{(m.get('role') or 'user').capitalize()}: {(m.get('content') or '').strip()}"
        for m in recent_turns
    )

    now = timezone.now()
    current_datetime_iso = now.isoformat()
    current_date_iso = now.date().isoformat()

    # Build a timezone instruction so the LLM converts times correctly.
    # If the user's browser timezone is known, tell the LLM to treat all
    # user-provided times (e.g. "11 PM") as being in that timezone and to
    # output ISO datetimes with the correct UTC offset.
    tz_label = user_timezone or "UTC"
    tz_instruction = (
        f"User's local timezone: {tz_label}\n"
        f"IMPORTANT: When the user says a time like '11 PM' or '9 AM', treat it as "
        f"{tz_label} local time. Convert to the correct ISO 8601 datetime with the "
        f"UTC offset for {tz_label} (e.g. if timezone is Asia/Jerusalem and the user "
        f"says '11 PM Tuesday', output '2026-03-24T23:00:00+02:00', NOT '...T23:00:00Z')."
    )

    attached_section = (
        f"\nUser-highlighted context:\n{attached_context.strip()}\n"
        if attached_context and attached_context.strip()
        else ""
    )
    planner_input = (
        f"Conversation summary:\n{conversation_summary}\n\n"
        f"Recent conversation (last {len(recent_turns)} messages):\n{recent_transcript}\n\n"
        f"Student context:\n{context_text}\n"
        f"{attached_section}\n"
        f"Current date (server): {current_date_iso}\n"
        f"Current datetime (server): {current_datetime_iso}\n"
        f"{tz_instruction}\n\n"
        f"Last user message:\n{last_user_content.strip()}\n\n"
        f"Return JSON matching ActionPlanOutput."
    )

    raw = call_llm(
        ACTION_PLANNER_SYSTEM_PROMPT,
        [HumanMessage(content=planner_input)],
        request_id=request_id,
        max_tokens=1000,
    )

    text = (raw or "").strip()
    json_blob = _extract_outer_json(text)
    if not json_blob:
        return ActionPlanOutput(actions=[], confidence=0.0, note="No JSON produced.")

    try:
        data = json.loads(json_blob)
    except json.JSONDecodeError as e:
        logger.warning("action_planner json decode error: %s", e, extra=log_extra)
        return ActionPlanOutput(actions=[], confidence=0.0, note="JSON decode error.")

    try:
        out = ActionPlanOutput.model_validate(data)
    except Exception as e:
        logger.warning("action_planner validation error: %s", e, extra=log_extra)
        return ActionPlanOutput(actions=[], confidence=0.0, note="Validation error.")

    # Extra safety: only allow a small number of actions.
    if len(out.actions) > 6:
        out.actions = out.actions[:6]
        out.confidence = min(out.confidence, 0.6)

    logger.info(
        "action_planner_decided actions=%d confidence=%.2f",
        len(out.actions),
        out.confidence,
        extra=log_extra,
    )
    return out

