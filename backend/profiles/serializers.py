from __future__ import annotations

from django.utils import timezone
from rest_framework import serializers

from .models import GpaSnapshot, StudentProfile


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = (
            "id",
            "user",
            "major",
            "year",
            "current_semester",
            "current_gpa",
            "target_gpa",
            "goals",
            "time_zone",
            "study_style",
        )
        read_only_fields = ("id", "user")

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        new_gpa = instance.current_gpa
        if new_gpa is not None:
            last = GpaSnapshot.objects.filter(user=instance.user).order_by("-recorded_at").first()
            should_record = (
                last is None
                or last.gpa != new_gpa
                or last.recorded_at.date() != timezone.now().date()
            )
            if should_record:
                GpaSnapshot.objects.create(user=instance.user, gpa=new_gpa)
        return instance


