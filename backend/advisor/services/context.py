"""
Student context for the AI advisor: trimmed, structured data for prompts.
"""
from __future__ import annotations

from datetime import timedelta
from typing import Any

from django.utils import timezone

from planner.electives import ELECTIVE_LISTS
from planner.models import Assignment, CalendarEvent, Course, Task
from profiles.models import StudentProfile

CONTEXT_VERSION = "1.2"

MAX_ASSIGNMENTS = 15
MAX_TASKS = 15
TASK_DAYS_AHEAD = 14
MAX_EVENTS = 14
MAX_COURSES_CURRENT_TERM = 20
MAX_ELECTIVE_OPTIONS_PER_TYPE = 20


def _metadata_base(now: Any) -> dict[str, Any]:
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


# ── Public helper functions ─────────────────────────────────────────────────

def get_completed_courses(user) -> list[dict[str, Any]]:
    return list(
        Course.objects.filter(user=user, status=Course.STATUS_COMPLETED)
        .order_by("term", "code")
        .values("id", "code", "name", "credits", "term", "category", "requirement_type", "original_placeholder")
    )


def get_current_courses(user) -> list[dict[str, Any]]:
    return list(
        Course.objects.filter(user=user, status=Course.STATUS_IN_PROGRESS)
        .order_by("term", "code")
        .values("id", "code", "name", "credits", "term", "category", "requirement_type", "original_placeholder")
    )


def get_planned_courses(user) -> list[dict[str, Any]]:
    return list(
        Course.objects.filter(user=user, status=Course.STATUS_PLANNED)
        .order_by("term", "code")
        .values("id", "code", "name", "credits", "term", "category", "requirement_type", "original_placeholder")
    )


def get_remaining_requirements(user) -> dict[str, Any]:
    planned = get_planned_courses(user)
    return {
        "elective_placeholders": [c for c in planned if c["requirement_type"] and not c["original_placeholder"]],
        "planned_core": [c for c in planned if not c["requirement_type"]],
    }


def get_available_electives(requirement_type: str) -> list[dict]:
    return ELECTIVE_LISTS.get(requirement_type, [])


def validate_elective_selection(course_code: str, requirement_type: str) -> bool:
    options = ELECTIVE_LISTS.get(requirement_type, [])
    return any(e["code"].lower() == course_code.lower() for e in options)


def _build_academic_plan(user) -> dict[str, Any]:
    all_courses = list(
        Course.objects.filter(user=user)
        .order_by("term", "code")
        .values(
            "id", "code", "name", "credits", "term", "category",
            "status", "requirement_type", "original_placeholder",
        )
    )

    completed = [c for c in all_courses if c["status"] == Course.STATUS_COMPLETED]
    in_progress = [c for c in all_courses if c["status"] == Course.STATUS_IN_PROGRESS]
    planned = [c for c in all_courses if c["status"] == Course.STATUS_PLANNED]

    # Unresolved placeholder: slot exists (requirement_type set) but no real course chosen yet
    elective_placeholders = [
        c for c in planned
        if c["requirement_type"] and not c["original_placeholder"]
    ]

    # Resolved electives: student already chose a real course for the slot
    selected_electives = [c for c in all_courses if c["original_placeholder"]]

    needed_types = {c["requirement_type"] for c in elective_placeholders if c["requirement_type"]}
    available_electives: dict[str, list] = {
        req_type: ELECTIVE_LISTS.get(req_type, [])[:MAX_ELECTIVE_OPTIONS_PER_TYPE]
        for req_type in needed_types
    }

    return {
        "completed": completed,
        "in_progress": in_progress,
        "planned": planned,
        "elective_placeholders": elective_placeholders,
        "selected_electives": selected_electives,
        "available_electives": available_electives,
        "credits_completed": sum(c["credits"] or 0 for c in completed),
        "credits_in_progress": sum(c["credits"] or 0 for c in in_progress),
    }


def build_student_context(user) -> dict[str, Any]:
    now = timezone.now()
    seven_days_later = now + timedelta(days=TASK_DAYS_AHEAD)
    metadata = _metadata_base(now)

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
    assignments.sort(key=lambda x: x["due_at"])
    metadata["num_assignments"] = len(assignments)

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

    # Current-term snapshot kept for scheduling agent (backward compat)
    courses_qs = Course.objects.filter(user=user).order_by("-term")
    current_term = courses_qs.first().term if courses_qs.exists() else None
    courses_qs = (
        Course.objects.filter(user=user, term=current_term)
        .order_by("code")[:MAX_COURSES_CURRENT_TERM]
        if current_term else Course.objects.none()
    )
    courses = [
        {"name": c.name, "code": c.code, "term": c.term, "credits": c.credits}
        for c in courses_qs
    ]
    metadata["num_courses"] = len(courses)

    academic_plan = _build_academic_plan(user)

    return {
        "profile": profile,
        "assignments": assignments,
        "tasks": tasks,
        "events": events,
        "courses": courses,
        "academic_plan": academic_plan,
        "metadata": metadata,
    }


def format_context_for_agent(context: dict[str, Any], agent_name: str) -> str:
    lines: list[str] = []
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

    if agent_name in ("scheduling", "advisor"):
        assignments = context.get("assignments") or []
        if assignments:
            lines.append(f"\n--- Upcoming assignments (next {len(assignments)}, sorted by deadline) ---")
            for a in assignments:
                atype = (a.get("type") or "?").upper()
                due = a["due_at"][:16].replace("T", " ")
                lines.append(
                    f"  - [{atype}] {a['title']} | course: {a['course']} ({a.get('course_name','')}) "
                    f"| due: {due} | status: {a['status']}"
                )
        tasks = context.get("tasks") or []
        if tasks:
            lines.append(f"\n--- Existing tasks (next {TASK_DAYS_AHEAD} days, max {MAX_TASKS}) ---")
            for t in tasks:
                due = (t.get("due_at") or "no date")[:16].replace("T", " ")
                lines.append(
                    f"  - {t['title']} | due: {due} | priority: {t['priority']} | status: {t['status']}"
                    + (f" | course: {t['course']}" if t.get("course") else "")
                )
        events = context.get("events") or []
        if events:
            lines.append(f"\n--- Existing calendar events (next {MAX_EVENTS} days) ---")
            for e in events:
                start = e["start_at"][:16].replace("T", " ")
                end = e["end_at"][11:16]
                lines.append(
                    f"  - {e['title']} | {start}–{end} | type: {e['type']}"
                    + (f" | course: {e['course']}" if e.get("course") else "")
                )

    # Scheduling + advisor agent: show current-term courses for course code lookup
    if agent_name in ("scheduling", "advisor"):
        courses = context.get("courses") or []
        if courses:
            lines.append("\n--- Current term courses (valid course codes) ---")
            for c in courses:
                cred = f" ({c['credits']} cr)" if c.get("credits") else ""
                lines.append(f"  - {c['code']}: {c['name']}{cred}")

    # Course/progress agent: full academic plan
    if agent_name in ("course_progress", "advisor"):
        plan = context.get("academic_plan") or {}
        if plan:
            completed = plan.get("completed", [])
            in_progress = plan.get("in_progress", [])
            planned = plan.get("planned", [])
            placeholders = plan.get("elective_placeholders", [])
            selected = plan.get("selected_electives", [])
            available = plan.get("available_electives", {})
            credits_done = plan.get("credits_completed", 0)
            credits_ip = plan.get("credits_in_progress", 0)

            lines.append("\n--- Academic Plan ---")
            lines.append(f"Credits completed: {credits_done} | In progress: {credits_ip}")

            if completed:
                codes = ", ".join(c["code"] for c in completed)
                lines.append(f"\nCompleted ({len(completed)} courses, {credits_done} cr):\n  {codes}")

            if in_progress:
                lines.append("\nIn-progress (current term):")
                for c in in_progress:
                    lines.append(
                        f"  - {c['code']}: {c['name']} ({c.get('credits', '?')} cr) [{c['term']}]"
                    )

            if placeholders:
                lines.append(
                    "\nUnresolved elective slots (student must still choose a real course):"
                )
                for c in placeholders:
                    lines.append(
                        f"  - ID#{c['id']} | Slot: {c['code']} | Term: {c['term']} "
                        f"| Category: {c['requirement_type']}"
                    )

            if selected:
                lines.append("\nResolved electives (already chosen):")
                for c in selected:
                    lines.append(
                        f"  - {c['code']}: {c['name']} (was: {c['original_placeholder']}) [{c['term']}]"
                    )

            planned_core = [c for c in planned if not c.get("requirement_type")]
            if planned_core:
                shown = planned_core[:10]
                lines.append(
                    f"\nPlanned core courses ({len(planned_core)} total, next {len(shown)} shown):"
                )
                for c in shown:
                    lines.append(
                        f"  - {c['code']}: {c['name']} ({c.get('credits', '?')} cr) [{c['term']}]"
                    )

            if available:
                lines.append("\nAvailable electives by category (for unresolved slots):")
                for req_type, elec_list in available.items():
                    entries = " | ".join(
                        f"{e['code']} {e['name']} ({e['credits']} cr)" for e in elec_list
                    )
                    lines.append(f"  [{req_type}]: {entries}")

    return "\n".join(lines) if lines else "No student context available."
