from __future__ import annotations

from rest_framework import permissions, viewsets
from rest_framework.exceptions import ValidationError

from .models import Assignment, CalendarEvent, Course, Task
from .serializers import (
    AssignmentSerializer,
    CalendarEventSerializer,
    CourseSerializer,
    TaskSerializer,
)


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Course.objects.filter(user=self.request.user).order_by("name")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Only assignments for courses owned by the current user
        return Assignment.objects.filter(course__user=self.request.user).select_related(
            "course"
        )

    def perform_create(self, serializer):
        course = serializer.validated_data.get("course")
        if course.user != self.request.user:
            raise ValidationError("You can only create assignments for your own courses.")
        serializer.save()


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).select_related(
            "assignment",
            "assignment__course",
        )

    def perform_create(self, serializer):
        assignment = serializer.validated_data.get("assignment")
        if assignment and assignment.course.user != self.request.user:
            raise ValidationError("You can only link tasks to your own assignments.")
        serializer.save(user=self.request.user)


class CalendarEventViewSet(viewsets.ModelViewSet):
    serializer_class = CalendarEventSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return CalendarEvent.objects.filter(user=self.request.user).select_related(
            "course",
            "assignment",
        )

    def perform_create(self, serializer):
        course = serializer.validated_data.get("course")
        assignment = serializer.validated_data.get("assignment")

        if course and course.user != self.request.user:
            raise ValidationError("You can only link events to your own courses.")
        if assignment and assignment.course.user != self.request.user:
            raise ValidationError("You can only link events to your own assignments.")

        serializer.save(user=self.request.user)


