from __future__ import annotations

from rest_framework import permissions, status as http_status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .catalogue import CURRICULA, is_placeholder
from .electives import ELECTIVE_LISTS, get_requirement_type
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
        qs = Course.objects.filter(user=self.request.user).order_by("name")
        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # ── Read-only elective lists ─────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="electives")
    def electives(self, request):
        """Return all elective lists keyed by requirement_type."""
        return Response({"electives": ELECTIVE_LISTS})

    # ── Read-only curriculum metadata ────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="curricula")
    def curricula(self, request):
        """Return available majors and their term structures (no course details)."""
        result = {}
        for major, data in CURRICULA.items():
            result[major] = {
                "program": data["program"],
                "total_credits": data.get("total_credits"),
                "terms": [
                    {
                        "term_number": t["term_number"],
                        "label": t["label"],
                        "season": t.get("season", ""),
                        "year": t.get("year", 0),
                        "term_credits": t.get("term_credits", 0),
                    }
                    for t in data["terms"]
                ],
            }
        return Response({"available_majors": sorted(CURRICULA.keys()), "curricula": result})

    # ── Plan generation ──────────────────────────────────────────────────────

    @action(detail=False, methods=["post"], url_path="generate-plan")
    def generate_plan(self, request):
        """
        Preview an academic plan based on the real curriculum.

        Body: { major: str, current_term: int }

        Returns every course in the curriculum tagged as completed (past terms),
        in_progress (current term), or planned (future terms).
        Courses already in the user's planner are flagged is_duplicate=true
        (placeholders are never flagged as duplicates).
        """
        major = str(request.data.get("major", "")).upper().strip()

        try:
            current_term = int(request.data.get("current_term", 0))
        except (ValueError, TypeError):
            return Response(
                {"error": "current_term must be an integer."},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        if major not in CURRICULA:
            available = sorted(CURRICULA.keys())
            return Response(
                {"error": f"Major not available. Choose from: {', '.join(available)}."},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        curriculum = CURRICULA[major]
        valid_terms = {t["term_number"] for t in curriculum["terms"]}

        if current_term not in valid_terms:
            return Response(
                {"error": f"Invalid term for {major}. Valid terms: {sorted(valid_terms)}."},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        existing_codes = set(
            Course.objects.filter(user=request.user).values_list("code", flat=True)
        )

        courses = []
        for term in curriculum["terms"]:
            term_num = term["term_number"]
            term_label = term["label"]

            if term_num < current_term:
                plan_status = "completed"
            elif term_num == current_term:
                plan_status = "in_progress"
            else:
                plan_status = "planned"

            for slot_idx, entry in enumerate(term["courses"]):
                code = entry["code"]
                placeholder = is_placeholder(code)

                courses.append(
                    {
                        "code": code,
                        "name": entry["name"],
                        "credits": entry["credits"],
                        "term_num": term_num,
                        "term_label": term_label,
                        "category": entry["category"],
                        "major": major,
                        "status": plan_status,
                        "is_placeholder": placeholder,
                        # Only real courses can be duplicates
                        "is_duplicate": not placeholder and code in existing_codes,
                        # Slot index to distinguish repeated placeholder codes within a term
                        "slot": slot_idx,
                        # Elective requirement type (empty for non-placeholders)
                        "requirement_type": get_requirement_type(code) if placeholder else "",
                    }
                )

        return Response({"courses": courses, "major": major})

    @action(detail=False, methods=["post"], url_path="apply-plan")
    def apply_plan(self, request):
        """
        Persist the user-confirmed subset of a generated plan.

        Body: { courses: PlannedCourse[] }

        Rules:
        - Non-placeholder courses: skipped if the code already exists for this user.
        - Placeholder courses: always created (each slot is distinct).
        """
        courses_data = request.data.get("courses", [])
        if not isinstance(courses_data, list):
            return Response(
                {"error": "courses must be a list."},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        existing_codes = set(
            Course.objects.filter(user=request.user).values_list("code", flat=True)
        )

        created = []
        skipped = []

        for item in courses_data:
            code = str(item.get("code", "")).strip()
            if not code:
                continue

            placeholder = item.get("is_placeholder", is_placeholder(code))

            if not placeholder and code in existing_codes:
                skipped.append(code)
                continue

            course = Course.objects.create(
                user=request.user,
                code=code,
                name=item.get("name", ""),
                credits=item.get("credits"),
                term=item.get("term_label", ""),
                status=item.get("status", "planned"),
                category=item.get("category", ""),
                major=item.get("major", ""),
                requirement_type=item.get("requirement_type", ""),
                original_placeholder=item.get("original_placeholder", ""),
            )
            if not placeholder:
                existing_codes.add(code)
            created.append(CourseSerializer(course).data)

        return Response({"created": created, "skipped": skipped})


class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Assignment.objects.filter(course__user=self.request.user).select_related("course")

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
