from __future__ import annotations

from django.conf import settings
from django.db import models


class StudentProfile(models.Model):
    """Student profile information for the current user."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    major = models.CharField(max_length=255, blank=True)
    year = models.CharField(max_length=50, blank=True)
    current_gpa = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
    )
    target_gpa = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
    )
    goals = models.TextField(blank=True)
    time_zone = models.CharField(max_length=100, blank=True)
    study_style = models.CharField(max_length=255, blank=True)
    current_semester = models.IntegerField(null=True, blank=True)

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return f"Profile({self.user.email})"


class GpaSnapshot(models.Model):
    """One GPA reading for a user at a point in time."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="gpa_snapshots",
    )
    gpa = models.DecimalField(max_digits=3, decimal_places=2)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["recorded_at"]

    def __str__(self) -> str:  # pragma: no cover
        return f"GpaSnapshot({self.user_id}, {self.gpa}, {self.recorded_at.date()})"


