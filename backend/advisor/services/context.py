"""
Student context for the AI advisor: trimmed, structured data for prompts.
"""
from __future__ import annotations

from datetime import timedelta
from typing import Any

from django.utils import timezone

from planner.models import Assignment, CalendarEvent, Course, Task
from profiles.models import StudentProfile

CONTEXT_VERSION = "1.0"

# Limits to keep token usage bounded; no list may exceed these
MAX_ASSIGNMENTS = 5
MAX_TASKS = 10
TASK_DAYS_AHEAD = 7
MAX_EVENTS = 5
MAX_COURSES_CURRENT_TERM = 20


def _metadata_base(now: Any) -> dict[str, Any]:
    """Always-present metadata fields for debugging and consistency."""
    return {
        "context_version": CONTEXT_VERSION,
        "generated_at": now.isoformat(),
        "date_iso": now.date().isoformat(),
        "timezone": str(now.tzinfo) if getattr(now, "tzinfo", None) else "UTC",
        "num_assignments": 0,
        "num_tasks": 0,
        "num_events": 0,
        "num_courses": 0,
    }


def build_student_context(user) -> dict[str, Any]:
    """
    Build a trimmed, structured context for the given user.
    All lists are sorted by date ascending and capped by MAX_* limits.
    Context always contains metadata with date_iso, timezone, and counts.
    """
    now = timezone.now()
    seven_days_later = now + timedelta(days=TASK_DAYS_AHEAD)
    metadata = _metadata_base(now)

    # Profile
    profile_obj = StudentProfile.objects.filter(user=user).first()
    profile: dict[str, Any] = {}
    if profile_obj:
        profile = {
            "major": profile_obj.major or "",
            "year": profile_obj.year or "",
            "current_gpa": float(profile_obj.current_gpa) if profile_obj.current_gpa is not None else None,
            "target_gpa": float(profile_obj.target_gpa) if profile_obj.target_gpa is not None else None,
            "goals": (profile_obj.goals or "").strip(),
            "study_style": profile_obj.study_style or "",
        }

    # Assignments: next 5 by due_at ascending, only relevant fields
    assignments_qs = (
        Assignment.objects.filter(course__user=user, due_at__gte=now)
        .select_related("course")
        .order_by("due_at")[:MAX_ASSIGNMENTS]
    )
    assignments = [
        {
            "title": a.title,
            "due_at": a.due_at.isoformat(),
            "course": a.course.code,
            "course_name": a.course.name,
            "status": a.status,
            "weight": float(a.weight) if a.weight is not None else None,
            "type": a.type,
        }
        for a in assignments_qs
    ]
    # Ensure sorted by due_at ascending (queryset already is; keep explicit for safety)
    assignments.sort(key=lambda x: x["due_at"])
    metadata["num_assignments"] = len(assignments)

    # Tasks: next 7 days, max 10, sorted by due_at ascending
    tasks_qs = (
        Task.objects.filter(
            user=user,
            due_at__isnull=False,
            due_at__gte=now,
            due_at__lte=seven_days_later,
        )
        .select_related("assignment", "assignment__course")
        .order_by("due_at")[:MAX_TASKS]
    )
    tasks = []
    for t in tasks_qs:
        course_code = ""
        if t.assignment and t.assignment.course:
            course_code = t.assignment.course.code
        tasks.append({
            "title": t.title,
            "due_at": t.due_at.isoformat() if t.due_at else None,
            "priority": t.priority,
            "status": t.status,
            "course": course_code,
        })
    tasks.sort(key=lambda x: (x["due_at"] or ""))
    metadata["num_tasks"] = len(tasks)

    # Events: next 5, sorted by start_at ascending
    events_qs = (
        CalendarEvent.objects.filter(user=user, start_at__gte=now)
        .select_related("course", "assignment")
        .order_by("start_at")[:MAX_EVENTS]
    )
    events = []
    for e in events_qs:
        course_code = e.course.code if e.course else ""
        events.append({
            "title": e.title,
            "start_at": e.start_at.isoformat(),
            "end_at": e.end_at.isoformat(),
            "type": e.type,
            "course": course_code,
        })
    events.sort(key=lambda x: x["start_at"])
    metadata["num_events"] = len(events)

    # Courses: current term only (most recent term by name), capped
    courses_qs = Course.objects.filter(user=user).order_by("-term")
    current_term = None
    if courses_qs.exists():
        current_term = courses_qs.first().term
    courses_qs = (
        Course.objects.filter(user=user, term=current_term)
        .order_by("code")[:MAX_COURSES_CURRENT_TERM]
    ) if current_term else Course.objects.none()
    courses = [
        {"name": c.name, "code": c.code, "term": c.term, "credits": c.credits}
        for c in courses_qs
    ]
    metadata["num_courses"] = len(courses)

    return {
        "profile": profile,
        "assignments": assignments,
        "tasks": tasks,
        "events": events,
        "courses": courses,
        "metadata": metadata,
    }


def format_context_for_agent(context: dict[str, Any], agent_name: str) -> str:
    """
    Turn structured context into a compact text block for an agent's prompt.
    Keeps token usage bounded by using only the pre-trimmed context.
    """
    lines = []
    meta = context.get("metadata") or {}
    lines.append(
        f"[Context v{meta.get('context_version', '?')} @ {meta.get('generated_at', '')} "
        f"date={meta.get('date_iso', '')} tz={meta.get('timezone', '')}]"
    )

    profile = context.get("profile") or {}
    if profile:
        lines.append("\n--- Profile ---")
        if profile.get("major"):
            lines.append(f"Major: {profile['major']}")
        if profile.get("year"):
            lines.append(f"Year: {profile['year']}")
        if profile.get("current_gpa") is not None:
            lines.append(f"Current GPA: {profile['current_gpa']}")
        if profile.get("target_gpa") is not None:
            lines.append(f"Target GPA: {profile['target_gpa']}")
        if profile.get("goals"):
            lines.append(f"Goals: {profile['goals'][:500]}")
        if profile.get("study_style"):
            lines.append(f"Study style: {profile['study_style']}")

    # Scheduling-focused
    if agent_name in ("scheduling", "advisor"):
        assignments = context.get("assignments") or []
        if assignments:
            lines.append("\n--- Upcoming assignments (next 5) ---")
            for a in assignments:
                lines.append(f"  - {a['title']} | due {a['due_at']} | {a['course']} | {a['status']}")
        tasks = context.get("tasks") or []
        if tasks:
            lines.append("\n--- Tasks (next 7 days, max 10) ---")
            for t in tasks:
                lines.append(f"  - {t['title']} | due {t.get('due_at', '?')} | {t['priority']} | {t['status']}")
        events = context.get("events") or []
        if events:
            lines.append("\n--- Next events ---")
            for e in events:
                lines.append(f"  - {e['title']} | {e['start_at']}–{e['end_at']} | {e['type']}")

    # Course/progress-focused
    if agent_name in ("course_progress", "advisor"):
        courses = context.get("courses") or []
        if courses:
            lines.append("\n--- Current term courses ---")
            for c in courses:
                cred = f" ({c['credits']} cr)" if c.get("credits") else ""
                lines.append(f"  - {c['code']}: {c['name']}{cred}")

    return "\n".join(lines) if lines else "No student context available."
