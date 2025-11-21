from __future__ import annotations

from datetime import timedelta

from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from planner.models import Assignment, CalendarEvent, Task
from planner.serializers import (
    AssignmentSerializer,
    CalendarEventSerializer,
    TaskSerializer,
)
from profiles.models import StudentProfile


class DashboardOverviewView(APIView):
    """
    High-level overview for the dashboard.

    Includes current GPA, upcoming deadlines, weekly tasks, and upcoming events.
    """

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        user = request.user
        now = timezone.now()
        seven_days_later = now + timedelta(days=7)

        # Profile / GPA
        profile = StudentProfile.objects.filter(user=user).first()
        current_gpa = profile.current_gpa if profile else None

        # Upcoming assignments (deadlines)
        upcoming_deadlines_qs = (
            Assignment.objects.filter(
                course__user=user,
                due_at__gte=now,
            )
            .select_related("course")
            .order_by("due_at")[:5]
        )
        upcoming_deadlines = AssignmentSerializer(
            upcoming_deadlines_qs,
            many=True,
        ).data

        # Tasks for the next 7 days
        weekly_tasks_qs = (
            Task.objects.filter(
                user=user,
                due_at__isnull=False,
                due_at__gte=now,
                due_at__lte=seven_days_later,
            )
            .select_related("assignment", "assignment__course")
            .order_by("due_at")[:10]
        )
        weekly_tasks = TaskSerializer(weekly_tasks_qs, many=True).data

        # Calendar events starting from now
        next_events_qs = (
            CalendarEvent.objects.filter(
                user=user,
                start_at__gte=now,
            )
            .select_related("course", "assignment")
            .order_by("start_at")[:5]
        )
        next_events = CalendarEventSerializer(next_events_qs, many=True).data

        data = {
            "current_gpa": current_gpa,
            "upcoming_deadlines": upcoming_deadlines,
            "weekly_tasks": weekly_tasks,
            "study_time_this_week_hours": 0,
            "next_events": next_events,
        }
        return Response(data, status=status.HTTP_200_OK)


