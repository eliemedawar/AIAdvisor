from __future__ import annotations

from rest_framework import serializers

from .models import StudentProfile


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = (
            "id",
            "user",
            "major",
            "year",
            "current_gpa",
            "target_gpa",
            "goals",
            "time_zone",
            "study_style",
        )
        read_only_fields = ("id", "user")


