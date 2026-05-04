from django.db import migrations


PLACEHOLDER_TO_REQUIREMENT = {
    "HSS Elective": "hss",
    "Science Elective": "science",
    "ARAB": "arabic",
    "EECE 3xx/4xx": "cce_restricted",
    "MATH Elective": "math_elective",
    "EECE Elective": "eece_elective",
    "EECE Restricted Laboratory": "restricted_lab",
    "Technical Elective": "technical",
    "EECE Elective Laboratory": "elective_lab",
}


def backfill_requirement_type(apps, schema_editor):
    Course = apps.get_model("planner", "Course")
    to_update = []
    for course in Course.objects.filter(requirement_type=""):
        req = PLACEHOLDER_TO_REQUIREMENT.get(course.code, "")
        if req:
            course.requirement_type = req
            to_update.append(course)
    if to_update:
        Course.objects.bulk_update(to_update, ["requirement_type"])


class Migration(migrations.Migration):

    dependencies = [
        ("planner", "0003_course_elective_fields"),
    ]

    operations = [
        migrations.RunPython(backfill_requirement_type, migrations.RunPython.noop),
    ]
