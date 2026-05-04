"""
Action planner: proposes structured planner/calendar writes for confirmation.

This does NOT modify any DB models. It only returns a JSON-shaped proposal
based on the student context and the conversation.
"""

from __future__ import annotations

import json
import logging
import re
from datetime import date, datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

from django.utils import timezone
from langchain_core.messages import HumanMessage

from .context import format_context_for_agent
from .llm import call_llm
from .prompts import ACTION_PLANNER_SYSTEM_PROMPT
from .types import ActionPlanOutput, EventPlan, StudySession, StudyTask

logger = logging.getLogger(__name__)

_EVENT_TYPES = ["quiz", "exam", "homework", "project", "report", "midterm", "final", "lab"]
_DAY_NAMES = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
_TIME_RE = re.compile(r"\b(\d{1,2}(?::\d{2})?)\s*(am|pm)\b", re.IGNORECASE)
_COURSE_RE = re.compile(r"\b([A-Z]{2,5})\s*(\d{3,4})\b", re.IGNORECASE)

_STUDY_DAYS_RE = re.compile(r"\b(\d+)\s*[-\s]?\s*day\s+study", re.IGNORECASE)

_WEEKDAY_MAP: dict[str, int] = {
    "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
    "friday": 4, "saturday": 5, "sunday": 6,
}
_MONTH_MAP: dict[str, int] = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}
_MONTH_RE = re.compile(
    r"\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|"
    r"jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)"
    r"\s+(\d{1,2})(?:st|nd|rd|th)?\b",
    re.IGNORECASE,
)
_ISO_DATE_RE = re.compile(r"\b(\d{4})-(\d{2})-(\d{2})\b")


# ── Deterministic datetime helpers ───────────────────────────────────────────

def _parse_time_from_message(message: str) -> tuple[int, int] | None:
    """Return (hour_24, minute) from the first AM/PM time in *message*, or None."""
    m = _TIME_RE.search(message)
    if not m:
        return None
    time_str, ampm = m.group(1), m.group(2).lower()
    if ":" in time_str:
        h, mins = int(time_str.split(":")[0]), int(time_str.split(":")[1])
    else:
        h, mins = int(time_str), 0
    if ampm == "pm" and h != 12:
        h += 12
    elif ampm == "am" and h == 12:
        h = 0
    return h, mins


def _resolve_datetime_from_message(
    message: str,
    user_timezone: str | None,
    now: datetime,
) -> str | None:
    """
    Deterministically resolve a user message to an ISO 8601 datetime string.
    Returns None when no explicit time is present (avoids wrong midnight defaults).
    Handles:
      - Weekday names: "next Friday at 5 PM", "Monday at 9 AM"
      - Named months: "May 12 at 11 PM", "December 5th at 9 AM"
      - ISO dates: "2026-05-12 at 3 PM"
      - Relative: "tomorrow at 8 PM", "today at 5 PM"
    """
    try:
        tz = ZoneInfo(user_timezone) if user_timezone else ZoneInfo("UTC")
    except Exception:
        tz = ZoneInfo("UTC")

    now_local = now.astimezone(tz)
    today = now_local.date()
    msg_lower = message.lower()

    time_parts = _parse_time_from_message(message)
    if time_parts is None:
        return None  # No time → don't guess midnight

    resolved_date: date | None = None

    # 1. ISO date: 2026-05-12
    m = _ISO_DATE_RE.search(message)
    if m:
        try:
            resolved_date = date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        except ValueError:
            pass

    # 2. "May 12" / "December 5th"
    if resolved_date is None:
        m = _MONTH_RE.search(message)
        if m:
            month_key = m.group(1)[:3].lower()
            month_num = _MONTH_MAP.get(month_key)
            if month_num:
                try:
                    candidate = date(today.year, month_num, int(m.group(2)))
                    if candidate < today:
                        candidate = date(today.year + 1, month_num, int(m.group(2)))
                    resolved_date = candidate
                except ValueError:
                    pass

    # 3. Weekday names: "next Friday", "this Monday", "Friday"
    if resolved_date is None:
        next_m = re.search(
            r"\bnext\s+(" + "|".join(_WEEKDAY_MAP.keys()) + r")\b", msg_lower
        )
        if next_m:
            target_wd = _WEEKDAY_MAP[next_m.group(1)]
            days_ahead = (target_wd - today.weekday()) % 7
            if days_ahead == 0:
                days_ahead = 7
            resolved_date = today + timedelta(days=days_ahead)
        else:
            day_m = re.search(
                r"\b(" + "|".join(_WEEKDAY_MAP.keys()) + r")\b", msg_lower
            )
            if day_m:
                target_wd = _WEEKDAY_MAP[day_m.group(1)]
                days_ahead = (target_wd - today.weekday()) % 7
                if days_ahead == 0:
                    days_ahead = 7
                resolved_date = today + timedelta(days=days_ahead)

    # 4. "tomorrow" / "today"
    if resolved_date is None:
        if "tomorrow" in msg_lower:
            resolved_date = today + timedelta(days=1)
        elif "today" in msg_lower:
            resolved_date = today

    if resolved_date is None:
        return None

    h, mins = time_parts
    local_dt = datetime(resolved_date.year, resolved_date.month, resolved_date.day, h, mins, tzinfo=tz)
    return local_dt.isoformat()


def extract_event_plan_from_message(
    message: str,
    user_timezone: str | None,
    now: datetime,
) -> EventPlan | None:
    """
    Extract a structured EventPlan from the user's message.
    Returns None when no course code is present (no useful anchor).
    """
    course_match = _COURSE_RE.search(message)
    if not course_match:
        return None

    course_code = f"{course_match.group(1).upper()} {course_match.group(2)}"
    msg_lower = message.lower()
    event_type = next((e for e in _EVENT_TYPES if e in msg_lower), None)
    event_datetime = _resolve_datetime_from_message(message, user_timezone, now)

    availability_note: str | None = None
    if event_datetime:
        try:
            tz = ZoneInfo(user_timezone) if user_timezone else ZoneInfo("UTC")
            local_dt = datetime.fromisoformat(event_datetime).astimezone(tz)
            availability_note = local_dt.strftime("%A %Y-%m-%d %H:%M")
        except Exception:
            availability_note = event_datetime

    return EventPlan(
        course_code=course_code,
        event_type=event_type,
        event_datetime=event_datetime,
        availability_note=availability_note,
    )


def _build_locked_event_plan_block(plan: EventPlan, study_days: int | None = None) -> str:
    """Build a LOCKED EVENT PLAN guardrail block for the action planner input."""
    lines = [
        "==============================================",
        "LOCKED EVENT PLAN (source of truth -- do NOT deviate):",
        f"  course_code    : {plan.course_code or 'N/A'} -> ALL actions MUST use this course_code",
    ]
    if plan.event_type:
        lines.append(f"  event_type     : {plan.event_type}")
    if plan.event_datetime:
        lines.append(
            f"  event_datetime : {plan.event_datetime}"
            "  -> deadline/exam action MUST use this exact datetime"
        )
        lines.append(
            f"  CONSTRAINT     : ALL study sessions MUST end BEFORE {plan.event_datetime}"
        )
    if plan.availability_note:
        lines.append(f"  human-readable : {plan.availability_note}")
    if study_days and study_days > 0:
        lines.append(
            f"  study_days     : {study_days} "
            f"-> you MUST generate EXACTLY {study_days} study session + task pairs "
            f"({study_days * 2} total actions). Do NOT stop at 3."
        )
    lines += [
        "Do NOT invent a different course, date, or time.",
        "==============================================",
    ]
    return "\n".join(lines)


def build_event_plan_from_actions(
    event_plan: EventPlan,
    actions: list[dict],
) -> EventPlan:
    """
    Populate study_sessions and tasks in an EventPlan from corrected proposed actions.
    """
    sessions: list[StudySession] = []
    tasks: list[StudyTask] = []

    for action in actions:
        atype = action.get("type")
        if atype == "create_calendar_event" and action.get("event_type") == "study_session":
            try:
                sessions.append(StudySession(
                    title=action["title"],
                    start_at=action["start_at"],
                    end_at=action["end_at"],
                    description=action.get("description"),
                ))
            except Exception:
                pass
        elif atype == "create_task":
            try:
                tasks.append(StudyTask(
                    title=action["title"],
                    due_at=action.get("due_at"),
                    priority=action.get("priority", "medium"),
                ))
            except Exception:
                pass

    return event_plan.model_copy(update={"study_sessions": sessions, "tasks": tasks})


# ── Legacy guardrail (used when no EventPlan is available) ───────────────────

def _extract_current_message_guardrail(message: str) -> str:
    """
    Deterministically extract course, event type, day, and time from the last
    user message and return a guardrail block injected into the action planner.
    """
    msg = message.strip()
    msg_lower = msg.lower()

    course_match = _COURSE_RE.search(msg)
    course = f"{course_match.group(1).upper()} {course_match.group(2)}" if course_match else None

    event_type = next((e for e in _EVENT_TYPES if e in msg_lower), None)
    day = next((d for d in _DAY_NAMES if d in msg_lower), None)

    time_match = _TIME_RE.search(msg)
    time_str = f"{time_match.group(1)} {time_match.group(2).upper()}" if time_match else None

    lines = [
        "==============================================",
        "EXTRACTED FROM CURRENT MESSAGE (source of truth):",
        f"  Raw message : {msg}",
    ]
    if course:
        lines.append(f"  Course      : {course}  -> ALL actions MUST use this course_code")
    if event_type:
        lines.append(f"  Event type  : {event_type}")
    if day:
        lines.append(f"  Day         : next {day}  -> resolve against today's date")
    if time_str:
        lines.append(f"  Time        : {time_str}  -> use this exact time, do NOT invent another")
    if not (course or event_type or day or time_str):
        lines.append("  (No specific course/date/time detected -- use context as-is)")
    lines += [
        "Do NOT use course codes or datetimes from earlier conversation turns",
        "unless the current message explicitly names them.",
        "==============================================",
    ]
    return "\n".join(lines)


def _extract_outer_json(text: str) -> str | None:
    """Extract the outermost {...} JSON object from a string."""
    if not text:
        return None
    stripped = text.strip()
    if stripped.startswith("```"):
        lines = stripped.splitlines()
        stripped = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    try:
        json.loads(stripped)
        return stripped
    except (json.JSONDecodeError, ValueError):
        pass
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
    event_plan: EventPlan | None = None,
) -> ActionPlanOutput:
    """
    Ask the LLM for proposed actions (assignment/calendar event creations).
    When an EventPlan is supplied, its locked course/datetime replaces the
    legacy guardrail so the LLM cannot deviate from the deterministic anchor.
    On any parse/validation error, returns an empty plan.
    """
    log_extra = {"request_id": request_id} if request_id else {}
    logger.info("action_planner_start", extra=log_extra)

    user_messages = [m for m in messages if (m.get("role") or "").lower() == "user"]
    last_user = user_messages[-1] if user_messages else None
    last_user_content = (last_user.get("content") if last_user else "") or ""

    context_text = build_action_planner_context_text(context)

    recent_turns = messages[-6:] if len(messages) >= 6 else messages
    recent_transcript = "\n".join(
        f"{(m.get('role') or 'user').capitalize()}: {(m.get('content') or '').strip()}"
        for m in recent_turns
    )

    now = timezone.now()
    current_datetime_iso = now.isoformat()
    current_date_iso = now.date().isoformat()

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

    # Extract requested study day count from the user message (e.g. "5-day study plan").
    days_match = _STUDY_DAYS_RE.search(last_user_content)
    study_days: int | None = int(days_match.group(1)) if days_match else None

    # Use the locked EventPlan guardrail when available; fall back to text extraction.
    if event_plan is not None:
        guardrail = _build_locked_event_plan_block(event_plan, study_days=study_days)
    else:
        guardrail = _extract_current_message_guardrail(last_user_content)

    # Extract availability window from user message (e.g. "after 5 pm", "after 6 pm")
    availability_note = ""
    avail_match = re.search(
        r"\bafter\s+(\d{1,2}(?::\d{2})?)\s*(am|pm)\b", last_user_content, re.IGNORECASE
    )
    if avail_match:
        availability_note = (
            f"\nAVAILABILITY: User can only study AFTER {avail_match.group(1)} {avail_match.group(2).upper()}. "
            f"ALL session start_at times MUST be at or after this time.\n"
        )

    study_days_note = ""
    if study_days:
        study_days_note = (
            f"\nSTUDY PLAN SIZE: The user explicitly requested a {study_days}-DAY study plan. "
            f"You MUST generate EXACTLY {study_days} create_calendar_event + {study_days} create_task actions "
            f"({study_days * 2} total). Do NOT stop early.\n"
        )

    planner_input = (
        f"{guardrail}\n\n"
        f"Current date (server): {current_date_iso}\n"
        f"Current datetime (server): {current_datetime_iso}\n"
        f"{tz_instruction}"
        f"{availability_note}"
        f"{study_days_note}\n"
        f"Recent conversation (last {len(recent_turns)} messages):\n{recent_transcript}\n\n"
        f"Prior conversation summary (background only -- lower priority than LOCKED EVENT PLAN above):\n"
        f"{conversation_summary}\n\n"
        f"Student context:\n{context_text}\n"
        f"{attached_section}\n"
        f"Return JSON matching ActionPlanOutput."
    )

    raw = call_llm(
        ACTION_PLANNER_SYSTEM_PROMPT,
        [HumanMessage(content=planner_input)],
        request_id=request_id,
        max_tokens=3500,
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

    if len(out.actions) > 14:
        out.actions = out.actions[:14]
        out.confidence = min(out.confidence, 0.6)

    logger.info(
        "action_planner_decided actions=%d confidence=%.2f",
        len(out.actions),
        out.confidence,
        extra=log_extra,
    )
    return out
