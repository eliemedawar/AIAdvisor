from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AssignmentViewSet,
    CalendarEventViewSet,
    CourseViewSet,
    TaskViewSet,
)

router = DefaultRouter()
router.register(r"courses", CourseViewSet, basename="course")
router.register(r"assignments", AssignmentViewSet, basename="assignment")
router.register(r"tasks", TaskViewSet, basename="task")
router.register(r"events", CalendarEventViewSet, basename="event")

urlpatterns = [
    path("", include(router.urls)),
]
