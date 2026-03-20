"""
Management command to seed demo data for the AI Academic Advisor.

Usage:
    python manage.py populate_demo_data
    python manage.py populate_demo_data --reset   # deletes existing demo data first

Creates:
  - 1 demo user  (email: demo@advisor.app  /  password: Demo1234!)
  - 1 student profile
  - 3 courses (Spring 2026)
  - 5 assignments across different statuses and types
  - 5 tasks (mix of priorities and due dates)
  - 4 calendar events (class, exam, study session, other)
"""
from __future__ import annotations

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

User = get_user_model()

DEMO_EMAIL = "demo@advisor.app"
DEMO_PASSWORD = "Demo1234!"


class Command(BaseCommand):
    help = "Seed demo data for the AI Academic Advisor application."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete and recreate the demo user and all associated data.",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            deleted, _ = User.objects.filter(email=DEMO_EMAIL).delete()
            if deleted:
                self.stdout.write(self.style.WARNING(f"Deleted existing demo user ({DEMO_EMAIL})."))

        if User.objects.filter(email=DEMO_EMAIL).exists():
            raise CommandError(
                f"Demo user {DEMO_EMAIL} already exists. "
                "Run with --reset to recreate it."
            )

        # ── User & Profile ─────────────────────────────────────────────────────
        user = User.objects.create_user(  # type: ignore[call-arg]
            email=DEMO_EMAIL,
            password=DEMO_PASSWORD,
        )
        self.stdout.write(f"Created user: {DEMO_EMAIL}")

        from profiles.models import StudentProfile

        StudentProfile.objects.create(
            user=user,
            major="Computer Science",
            year="Junior",
            current_gpa="3.40",
            target_gpa="3.70",
            goals="Graduate with honors and land a software engineering internship.",
            study_style="Visual learner; prefers spaced repetition and practice problems.",
        )
        self.stdout.write("Created student profile.")

        # ── Courses ────────────────────────────────────────────────────────────
        from planner.models import Assignment, CalendarEvent, Course, Task

        cs301 = Course.objects.create(
            user=user, name="Data Structures & Algorithms", code="CS 301", term="Spring 2026", credits=3
        )
        math240 = Course.objects.create(
            user=user, name="Linear Algebra", code="MATH 240", term="Spring 2026", credits=3
        )
        eng202 = Course.objects.create(
            user=user, name="Technical Writing", code="ENG 202", term="Spring 2026", credits=2
        )
        self.stdout.write("Created 3 courses.")

        now = timezone.now()

        # ── Assignments ────────────────────────────────────────────────────────
        hw1 = Assignment.objects.create(
            course=cs301,
            title="Homework 3 – Graph Traversal",
            description="Implement BFS and DFS on an adjacency list.",
            due_at=now + timedelta(days=3),
            status="pending",
            weight="10.00",
            type="homework",
        )
        proj1 = Assignment.objects.create(
            course=cs301,
            title="Midterm Project – Binary Search Tree",
            description="Build a self-balancing BST with insert, delete, and search.",
            due_at=now + timedelta(days=10),
            status="in_progress",
            weight="25.00",
            type="project",
        )
        exam1 = Assignment.objects.create(
            course=math240,
            title="Midterm Exam",
            description="Covers chapters 1–5: vectors, matrices, and linear transformations.",
            due_at=now + timedelta(days=7),
            status="pending",
            weight="30.00",
            type="exam",
        )
        essay1 = Assignment.objects.create(
            course=eng202,
            title="Technical Report Draft",
            description="First draft of the semester technical report.",
            due_at=now + timedelta(days=14),
            status="pending",
            weight="20.00",
            type="homework",
        )
        done_hw = Assignment.objects.create(
            course=math240,
            title="Problem Set 2",
            description="Linear transformations and eigenvalues.",
            due_at=now - timedelta(days=5),
            status="done",
            weight="5.00",
            type="homework",
        )
        self.stdout.write("Created 5 assignments.")

        # ── Tasks ──────────────────────────────────────────────────────────────
        Task.objects.create(
            user=user,
            assignment=hw1,
            title="Review BFS/DFS lecture slides",
            description="Go through week 8 slides before starting the homework.",
            due_at=now + timedelta(days=1),
            status="pending",
            priority="high",
        )
        Task.objects.create(
            user=user,
            assignment=proj1,
            title="Write AVL tree rotation functions",
            due_at=now + timedelta(days=5),
            status="in_progress",
            priority="high",
        )
        Task.objects.create(
            user=user,
            assignment=exam1,
            title="Complete practice exam (chapters 1–3)",
            due_at=now + timedelta(days=4),
            status="pending",
            priority="medium",
        )
        Task.objects.create(
            user=user,
            title="Create study schedule for midterm week",
            due_at=now + timedelta(days=2),
            status="pending",
            priority="medium",
        )
        Task.objects.create(
            user=user,
            assignment=essay1,
            title="Outline technical report structure",
            due_at=now + timedelta(days=7),
            status="pending",
            priority="low",
        )
        self.stdout.write("Created 5 tasks.")

        # ── Calendar Events ────────────────────────────────────────────────────
        CalendarEvent.objects.create(
            user=user,
            title="CS 301 Lecture",
            description="Weekly lecture on graph algorithms.",
            start_at=now + timedelta(days=1, hours=10),
            end_at=now + timedelta(days=1, hours=11, minutes=15),
            type="class",
            course=cs301,
        )
        CalendarEvent.objects.create(
            user=user,
            title="MATH 240 Midterm Exam",
            description="Covers chapters 1–5.",
            start_at=now + timedelta(days=7, hours=14),
            end_at=now + timedelta(days=7, hours=16),
            type="exam",
            course=math240,
            assignment=exam1,
        )
        CalendarEvent.objects.create(
            user=user,
            title="CS 301 Study Session",
            description="Group study for BST project with lab partners.",
            start_at=now + timedelta(days=4, hours=18),
            end_at=now + timedelta(days=4, hours=20),
            type="study_session",
            course=cs301,
        )
        CalendarEvent.objects.create(
            user=user,
            title="Advisor Office Hours",
            description="Discuss course load and internship planning.",
            start_at=now + timedelta(days=6, hours=15),
            end_at=now + timedelta(days=6, hours=15, minutes=30),
            type="other",
        )
        self.stdout.write("Created 4 calendar events.")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDemo data ready!\n"
                f"  Email:    {DEMO_EMAIL}\n"
                f"  Password: {DEMO_PASSWORD}\n"
            )
        )
