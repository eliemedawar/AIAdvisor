from django.contrib import admin

from .models import Assignment, Course, Task


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "user")
    search_fields = ("name", "code", "user__email")


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "due_at")
    search_fields = ("title", "course__name", "course__code")


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "status", "priority")
    list_filter = ("status", "priority")
    search_fields = ("title", "user__email")


