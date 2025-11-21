from django.contrib import admin

from .models import StudentProfile


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "major", "year", "current_gpa", "target_gpa")
    search_fields = ("user__email", "major", "year")


