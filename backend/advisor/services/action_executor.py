from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
from typing import Any

from django.db import transaction
from django.utils import timezone

from planner.models import Assignment, CalendarEvent, Course, Task

from .types import (
    ActionPlanInput,
    CreateAssignmentAction,
    CreateCalendarEventAction,
    CreateTaskAction,
)


def _parse_iso_datetime(value: str) -> datetime:
    """
    Parse an ISO datetime string into a timezone-aware datetime (UTC fallback).

    The LLM should output ISO strings; we keep parsing conservative so bad inputs
    don't create wrong timestamps.
    """
    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if timezone.is_aware(dt):
        return dt
    return dt.replace(tzinfo=timezone.utc)


def _parse_optional_decimal(value: Any) -> Decimal | None:
    if value is None:
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError):
        return None


@dataclass(frozen=True)
class ExecutionResult:
    created_assignment_ids: list[int]
    created_event_ids: list[int]
    created_task_ids: list[int]
    assistant_lines: list[str]


def execute_action_plan(
    *,
    user: Any,
    actions: list[dict[str, Any]],
) -> ExecutionResult:
    """
    Execute planner/calendar writes for the given user.

    This is intentionally defensive: we validate expected fields via Pydantic
    and we skip actions that cannot be resolved to a user's Course.
    """
    try:
        parsed = ActionPlanInput.model_validate({"actions": actions})
    except Exception:
        return ExecutionResult(
            created_assignment_ids=[],
            created_event_ids=[],
            created_task_ids=[],
            assistant_lines=["No valid planner/calendar actions to apply."],
        )

    if not parsed.actions:
        return ExecutionResult(
            created_assignment_ids=[],
            created_event_ids=[],
            created_task_ids=[],
            assistant_lines=["No planner/calendar items to add."],
        )

    created_assignment_ids: list[int] = []
    created_event_ids: list[int] = []
    created_task_ids: list[int] = []
    assistant_lines: list[str] = []
    skipped_course_codes: list[str] = []

    def _find_course_by_code(code: str | None) -> Course | None:
        if not code:
            return None
        normalized = code.strip()
        if not normalized:
            return None
        # Case-insensitive match; Planner codes can include spacing/casing.
        return Course.objects.filter(user=user, code__iexact=normalized).first()

    # Atomic so "confirm" feels consistent.
    with transaction.atomic():
        # If the LLM explicitly proposed calendar events, we avoid creating
        # a duplicate "assignment due" calendar event at the same time.
        proposed_event_start_times: list[datetime] = []
        for action in parsed.actions:
            if getattr(action, "type", None) != "create_calendar_event":
                continue
            event_action = CreateCalendarEventAction.model_validate(action.model_dump())
            try:
                proposed_event_start_times.append(_parse_iso_datetime(event_action.start_at))
            except Exception:
                continue

        # Create assignments first; events may depend on them later (future).
        for action in parsed.actions:
            if action.type != "create_assignment":
                continue

            assignment_action = CreateAssignmentAction.model_validate(action.model_dump())
            course = _find_course_by_code(assignment_action.course_code)
            if not course:
                skipped_course_codes.append(str(assignment_action.course_code))
                continue

            try:
                due_at = _parse_iso_datetime(assignment_action.due_at)
            except Exception:
                continue
            proposed_title = (assignment_action.title or "").strip()
            course_name = (course.name or "").strip()
            course_code = (course.code or "").strip()
            lower_title = proposed_title.lower()

            # Make titles consistent for planner/calendar:
            # - If the LLM already included the course name/code, keep it as-is.
            # - Otherwise prefix with course name so the assignment is self-describing.
            if course_name and (course_name.lower() in lower_title or course_code.lower() in lower_title):
                final_title = proposed_title
            else:
                final_title = f"{course_name} - {proposed_title}" if course_name else proposed_title

            assignment = Assignment.objects.create(
                course=course,
                title=final_title,
                description=(assignment_action.description or ""),
                due_at=due_at,
                status=assignment_action.status,
                weight=_parse_optional_decimal(assignment_action.weight),
                type=assignment_action.assignment_type,
            )
            created_assignment_ids.append(assignment.id)
            assistant_lines.append(f"- Assignment added: {assignment.title}")

            # Also mirror assignment deadlines into the calendar.
            # This ensures "homework due ..." shows up on the Calendar view.
            should_create_event = True
            for proposed_start in proposed_event_start_times:
                if abs((proposed_start - due_at).total_seconds()) < 60:
                    should_create_event = False
                    break

            if should_create_event:
                start_at = due_at
                end_at = due_at + timedelta(hours=1)
                event = CalendarEvent.objects.create(
                    user=user,
                    title=f"{assignment.title} (due)",
                    description=(
                        f"Auto-added from AI chat.\n"
                        f"Assignment: {assignment.title}"
                    ),
                    start_at=start_at,
                    end_at=end_at,
                    type="other",
                    course=course,
                    assignment=assignment,
                )
                created_event_ids.append(event.id)
                assistant_lines.append(f"- Calendar event added: {event.title}")

        # Create tasks.
        for action in parsed.actions:
            if action.type != "create_task":
                continue

            task_action = CreateTaskAction.model_validate(action.model_dump())
            due_at = None
            if task_action.due_at:
                try:
                    due_at = _parse_iso_datetime(task_action.due_at)
                except Exception:
                    pass

            task = Task.objects.create(
                user=user,
                title=(task_action.title or "").strip(),
                description=(task_action.description or ""),
                due_at=due_at,
                status=task_action.status,
                priority=task_action.priority,
            )
            created_task_ids.append(task.id)
            assistant_lines.append(f"- Task added: {task.title}")

        # Then create events.
        for action in parsed.actions:
            if action.type != "create_calendar_event":
                continue

            event_action = CreateCalendarEventAction.model_validate(action.model_dump())
            try:
                start_at = _parse_iso_datetime(event_action.start_at)
                end_at = _parse_iso_datetime(event_action.end_at)
            except Exception:
                continue

            # If LLM produced inverted range, fix safely rather than failing.
            if end_at <= start_at:
                end_at = start_at + timedelta(hours=1)

            course = None
            if event_action.course_code:
                course = _find_course_by_code(event_action.course_code)

            event = CalendarEvent.objects.create(
                user=user,
                title=event_action.title,
                description=(event_action.description or ""),
                start_at=start_at,
                end_at=end_at,
                type=event_action.event_type,
                course=course,
                assignment=None,
            )
            created_event_ids.append(event.id)
            assistant_lines.append(f"- Calendar event added: {event.title}")

    # Ensure at least one line if we skipped everything due to missing courses.
    if not assistant_lines:
        if skipped_course_codes:
            unique = sorted(set(skipped_course_codes))
            assistant_lines = [
                "No items were added (missing or unknown course context).",
                f"Course code(s) tried: {', '.join(unique)}",
            ]
        else:
            assistant_lines = ["No items were added (missing or unknown course context)."]

    return ExecutionResult(
        created_assignment_ids=created_assignment_ids,
        created_event_ids=created_event_ids,
        created_task_ids=created_task_ids,
        assistant_lines=assistant_lines,
    )

