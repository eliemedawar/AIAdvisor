from __future__ import annotations

from calendar import day_name
from collections import defaultdict
from datetime import timedelta

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
from profiles.models import StudentProfile


def _weekday_abbrev(dt):
    """Return Mon, Tue, ... for a date."""
    return day_name[dt.weekday()][:3]


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

        # GPA trend: last 8 weeks placeholder (use current_gpa if available; no history stored yet)
        gpa_trend = []
        if current_gpa is not None:
            for i in range(8, 0, -1):
                week_start = now - timedelta(weeks=i)
                gpa_trend.append({
                    "label": f"Week {9 - i}",
                    "gpa": round(current_gpa, 2),
                })
        else:
            for i in range(1, 9):
                gpa_trend.append({"label": f"Week {i}", "gpa": 0})

        # Weekly task stats: this week Mon–Sun, planned vs completed (by task due_at and status)
        week_start = now - timedelta(days=now.weekday())
        week_end = week_start + timedelta(days=7)
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        planned_by_day = defaultdict(int)
        completed_by_day = defaultdict(int)
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

        # Study time by course: no tracking model yet; use assignment count per course as proxy or empty
        courses_qs = Course.objects.filter(user=user)
        study_time_by_course = []
        for c in courses_qs[:10]:
            count = Assignment.objects.filter(course=c).count()
            if count > 0:
                study_time_by_course.append({"courseName": c.name, "hours": count * 2})
        study_time_by_course = study_time_by_course[:5]

        data = {
            "current_gpa": current_gpa,
            "upcoming_deadlines": upcoming_deadlines,
            "weekly_tasks": weekly_tasks,
            "study_time_this_week_hours": sum(s["hours"] for s in study_time_by_course) or 0,
            "next_events": next_events,
            "gpa_trend": gpa_trend,
            "weekly_task_stats": weekly_task_stats,
            "study_time_by_course": study_time_by_course,
        }
        return Response(data, status=status.HTTP_200_OK)


