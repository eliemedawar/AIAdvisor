"""
Pydantic schemas for advisor services (e.g. router output).
"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


AgentName = Literal["scheduling", "advisor", "course_progress"]

VALID_AGENT_NAMES: tuple[AgentName, ...] = ("scheduling", "advisor", "course_progress")


class RouterOutput(BaseModel):
    """Strict schema for the router LLM response. Invalid or missing fields → fallback to advisor."""

    agents: list[AgentName] = Field(
        description="List of specialist agent names to run",
        min_length=1,
        max_length=3,
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Router confidence in this routing decision (0-1)",
    )


AssignmentType = Literal["homework", "project", "exam", "quiz", "other"]
EventType = Literal["exam", "class", "study_session", "other"]
AssignmentStatus = Literal["pending", "in_progress", "done"]
TaskPriority = Literal["low", "medium", "high"]


class CreateAssignmentAction(BaseModel):
    type: Literal["create_assignment"]
    course_code: str = Field(description="Course code must match one of the student's current-term courses.")
    title: str = Field(description="Assignment title to create.")
    description: str | None = Field(default=None, description="Optional assignment description.")
    due_at: str = Field(
        description="ISO 8601 datetime string (e.g. 2026-03-25T18:00:00Z) for the assignment deadline."
    )
    assignment_type: AssignmentType = Field(default="homework")
    weight: float | None = Field(default=None, description="Optional weight/percentage for the assignment.")
    status: AssignmentStatus = Field(default="pending")


class CreateCalendarEventAction(BaseModel):
    type: Literal["create_calendar_event"]
    title: str = Field(description="Calendar event title.")
    description: str | None = Field(default=None, description="Optional event description.")
    start_at: str = Field(
        description="ISO 8601 datetime string (e.g. 2026-03-25T18:00:00Z) for event start."
    )
    end_at: str = Field(
        description="ISO 8601 datetime string (e.g. 2026-03-25T19:00:00Z) for event end."
    )
    event_type: EventType = Field(default="other")
    course_code: str | None = Field(
        default=None,
        description="Optional course code to link the event to (must be a current-term course code).",
    )


class CreateTaskAction(BaseModel):
    type: Literal["create_task"]
    title: str = Field(description="Task title.")
    description: str | None = Field(default=None, description="Optional task description.")
    due_at: str | None = Field(
        default=None,
        description="Optional ISO 8601 datetime string for when the task is due.",
    )
    priority: TaskPriority = Field(default="medium")
    status: AssignmentStatus = Field(default="pending")
    course_code: str | None = Field(
        default=None,
        description="Optional course code to provide context (informational).",
    )


Action = CreateAssignmentAction | CreateCalendarEventAction | CreateTaskAction


class ActionPlanInput(BaseModel):
    actions: list[Action] = Field(default_factory=list, description="List of actions to execute.")


class ActionPlanOutput(BaseModel):
    """
    LLM output shape for action planning.

    This is returned to the frontend for user confirmation, and only executed
    when the user explicitly accepts.
    """

    actions: list[Action] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0, default=0.0)
    note: str | None = Field(default=None, description="Optional short note for why actions were proposed.")
