from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planner', '0002_course_onboarding_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='requirement_type',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='course',
            name='original_placeholder',
            field=models.CharField(blank=True, max_length=100),
        ),
    ]
