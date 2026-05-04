from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planner', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='status',
            field=models.CharField(
                choices=[
                    ('completed', 'Completed'),
                    ('in_progress', 'In Progress'),
                    ('planned', 'Planned'),
                ],
                default='planned',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='course',
            name='category',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='course',
            name='major',
            field=models.CharField(blank=True, max_length=10),
        ),
    ]
