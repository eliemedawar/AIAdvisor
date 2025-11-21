from __future__ import annotations

from django.conf import settings
from django.db import models


class Course(models.Model):
    """A course the student is enrolled in."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="courses",
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    term = models.CharField(max_length=100)
    credits = models.IntegerField(null=True, blank=True)

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return f"{self.code} - {self.name}"


class Assignment(models.Model):
    """An assignment within a specific course."""

    STATUS_PENDING = "pending"
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_DONE = "done"
    STATUS_CHOICES = (
        (STATUS_PENDING, "Pending"),
        (STATUS_IN_PROGRESS, "In progress"),
        (STATUS_DONE, "Done"),
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="assignments",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_at = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )
    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
    )
    type = models.CharField(max_length=50)

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return self.title


class Task(models.Model):
    """A study task or todo item possibly linked to an assignment."""

    PRIORITY_LOW = "low"
    PRIORITY_MEDIUM = "medium"
    PRIORITY_HIGH = "high"

    PRIORITY_CHOICES = (
        (PRIORITY_LOW, "Low"),
        (PRIORITY_MEDIUM, "Medium"),
        (PRIORITY_HIGH, "High"),
    )

    STATUS_PENDING = Assignment.STATUS_PENDING
    STATUS_IN_PROGRESS = Assignment.STATUS_IN_PROGRESS
    STATUS_DONE = Assignment.STATUS_DONE
    STATUS_CHOICES = Assignment.STATUS_CHOICES

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tasks",
    )
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.SET_NULL,
        related_name="tasks",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default=PRIORITY_MEDIUM,
    )

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return self.title


class CalendarEvent(models.Model):
    """Calendar events such as exams, classes, and study sessions."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="calendar_events",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    type = models.CharField(max_length=50)
    course = models.ForeignKey(
        Course,
        on_delete=models.SET_NULL,
        related_name="calendar_events",
        null=True,
        blank=True,
    )
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.SET_NULL,
        related_name="calendar_events",
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["start_at"]

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return self.title
