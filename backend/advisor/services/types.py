"""
Pydantic schemas for advisor services (e.g. router output).
"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


AgentName = Literal["scheduling", "advisor", "course_progress"]

VALID_AGENT_NAMES: tuple[AgentName, ...] = ("scheduling", "advisor", "course_progress")


class RouterOutput(BaseModel):
    agents: list[AgentName] = Field(min_length=1, max_length=3)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)


AssignmentType = Literal["homework", "project", "exam", "quiz", "other"]
EventType = Literal["exam", "class", "study_session", "deadline", "quiz", "homework", "project", "other"]
AssignmentStatus = Literal["pending", "in_progress", "done"]
TaskPriority = Literal["low", "medium", "high"]


class CreateAssignmentAction(BaseModel):
    type: Literal["create_assignment"]
    course_code: str
    title: str
    description: str | None = Field(default=None)
    due_at: str
    assignment_type: AssignmentType = Field(default="homework")
    weight: float | None = Field(default=None)
    status: AssignmentStatus = Field(default="pending")


class CreateCalendarEventAction(BaseModel):
    type: Literal["create_calendar_event"]
    title: str
    description: str | None = Field(default=None)
    start_at: str
    end_at: str
    event_type: EventType = Field(default="other")
    course_code: str | None = Field(default=None)


class CreateTaskAction(BaseModel):
    type: Literal["create_task"]
    title: str
    description: str | None = Field(default=None)
    due_at: str | None = Field(default=None)
    priority: TaskPriority = Field(default="medium")
    status: AssignmentStatus = Field(default="pending")
    course_code: str | None = Field(default=None)


class SelectElectiveAction(BaseModel):
    type: Literal["select_elective"]
    placeholder_course_id: int = Field(
        description="ID of the placeholder Course row to replace (from 'Unresolved elective slots')."
    )
    selected_course_code: str = Field(
        description="Course code of the chosen elective (must appear in Available electives for that category)."
    )
    selected_course_name: str = Field(
        description="Official name of the chosen elective."
    )
    credits: int = Field(description="Credit count of the chosen elective.")


Action = CreateAssignmentAction | CreateCalendarEventAction | CreateTaskAction | SelectElectiveAction


class ActionPlanInput(BaseModel):
    actions: list[Action] = Field(default_factory=list)


class ActionPlanOutput(BaseModel):
    actions: list[Action] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0, default=0.0)
    note: str | None = Field(default=None)


# ── EventPlan: single source of truth for a scheduling event ────────────────

class StudySession(BaseModel):
    """One study block extracted from a create_calendar_event action."""
    title: str
    start_at: str             # ISO 8601 with UTC offset
    end_at: str               # ISO 8601 with UTC offset
    description: str | None = None


class StudyTask(BaseModel):
    """One study task extracted from a create_task action."""
    title: str
    due_at: str | None = None  # ISO 8601 with UTC offset
    priority: TaskPriority = "medium"


class EventPlan(BaseModel):
    """
    Authoritative object representing a scheduling event extracted from the
    current user message. Flows through agents, action planner, and the
    frontend modal. course_code and event_datetime are set deterministically
    by Python (no LLM); study_sessions and tasks are populated after the
    action planner runs.
    """
    course_code: str | None = None
    event_type: str | None = None        # "quiz", "exam", "homework", …
    event_datetime: str | None = None    # ISO 8601 — the anchor event time
    availability_note: str | None = None # human-readable e.g. "Friday 2026-05-08 17:00"
    study_sessions: list[StudySession] = Field(default_factory=list)
    tasks: list[StudyTask] = Field(default_factory=list)
