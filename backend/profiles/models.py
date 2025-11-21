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

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return f"Profile({self.user.email})"


