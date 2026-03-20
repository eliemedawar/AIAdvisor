from __future__ import annotations

from rest_framework import serializers

from .models import Assignment, CalendarEvent, Course, Task


class CourseSerializer(serializers.ModelSerializer):
  class Meta:
      model = Course
      fields = (
          "id",
          "user",
          "name",
          "code",
          "term",
          "credits",
      )
      read_only_fields = ("id", "user")


class AssignmentSerializer(serializers.ModelSerializer):
    course_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Assignment
        fields = (
            "id",
            "course",
            "course_name",
            "title",
            "description",
            "due_at",
            "status",
            "weight",
            "type",
        )

    def get_course_name(self, obj):
        return obj.course.name if getattr(obj, "course", None) else None


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = (
            "id",
            "user",
            "assignment",
            "title",
            "description",
            "due_at",
            "status",
            "priority",
        )
        read_only_fields = ("id", "user")


class CalendarEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = (
            "id",
            "user",
            "title",
            "description",
            "start_at",
            "end_at",
            "type",
            "course",
            "assignment",
        )
        read_only_fields = ("id", "user")


