from __future__ import annotations

from collections import defaultdict
from datetime import timedelta

from django.db.models import Count
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from planner.models import Assignment, CalendarEvent, Course, Task
from planner.serializers import (
    AssignmentSerializer,
    CalendarEventSerializer,
    TaskSerializer,
)
from profiles.models import GpaSnapshot, StudentProfile


class DashboardOverviewView(APIView):
    """
    High-level overview for the dashboard.

    Includes current GPA, upcoming deadlines, weekly tasks, upcoming events,
    gpa_trend, weekly_task_stats, and study_time_by_course.
    """

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        user = request.user
        now = timezone.now()
        seven_days_later = now + timedelta(days=7)

        # Profile / GPA
        profile = StudentProfile.objects.filter(user=user).first()
        current_gpa = float(profile.current_gpa) if profile and profile.current_gpa is not None else None
        target_gpa = float(profile.target_gpa) if profile and profile.target_gpa is not None else None

        # Upcoming assignments (deadlines) — exclude completed ones
        upcoming_deadlines_qs = (
            Assignment.objects.filter(
                course__user=user,
                due_at__gte=now,
            )
            .exclude(status="done")
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

        # GPA trend: use stored snapshots (recorded whenever the user saves their profile GPA)
        snapshots = list(
            GpaSnapshot.objects.filter(user=user)
            .order_by("recorded_at")
            .values_list("recorded_at", "gpa")
        )
        snapshots = snapshots[-8:]
        if snapshots:
            gpa_trend = [
                {"label": f"Week {i + 1}", "gpa": round(float(gpa), 2)}
                for i, (_, gpa) in enumerate(snapshots)
            ]
        else:
            gpa_trend = []

        # Weekly task stats: this week Mon–Sun, planned vs completed (by task due_at and status)
        week_start = now - timedelta(days=now.weekday())
        week_end = week_start + timedelta(days=7)
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        planned_by_day: dict[str, int] = defaultdict(int)
        completed_by_day: dict[str, int] = defaultdict(int)
        tasks_this_week = Task.objects.filter(
            user=user,
            due_at__isnull=False,
            due_at__gte=week_start,
            due_at__lt=week_end,
        )
        for t in tasks_this_week:
            day_idx = (t.due_at.date() - week_start.date()).days
            if 0 <= day_idx < 7:
                key = day_names[day_idx]
                planned_by_day[key] += 1
                if t.status == "done":
                    completed_by_day[key] += 1
        weekly_task_stats = [
            {"day": d, "completed": completed_by_day[d], "planned": planned_by_day[d]}
            for d in day_names
        ]

        # Study time by course: use a single annotated query to avoid N+1.
        # Proxy: assignment_count × 2h (no real study-tracking model yet).
        courses_with_counts = (
            Course.objects.filter(user=user)
            .annotate(assignment_count=Count("assignments"))
            .filter(assignment_count__gt=0)
            .order_by("-assignment_count")[:5]
        )
        study_time_by_course = [
            {"courseName": c.name, "hours": c.assignment_count * 2}
            for c in courses_with_counts
        ]

        data = {
            "current_gpa": current_gpa,
            "target_gpa": target_gpa,
            "upcoming_deadlines": upcoming_deadlines,
            "weekly_tasks": weekly_tasks,
            "study_time_this_week_hours": sum(s["hours"] for s in study_time_by_course) or 0,
            "next_events": next_events,
            "gpa_trend": gpa_trend,
            "weekly_task_stats": weekly_task_stats,
            "study_time_by_course": study_time_by_course,
        }
        return Response(data, status=status.HTTP_200_OK)


