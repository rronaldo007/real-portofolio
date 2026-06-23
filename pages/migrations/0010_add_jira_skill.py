from django.db import migrations


def add_jira(apps, schema_editor):
    """Seed the Jira skill under Tooling & infra (idempotent on name)."""
    Skill = apps.get_model("pages", "Skill")
    Skill.objects.get_or_create(
        name="Jira",
        defaults={"category": "tooling", "tier": "frequent", "order": 3},
    )


def remove_jira(apps, schema_editor):
    Skill = apps.get_model("pages", "Skill")
    Skill.objects.filter(name="Jira", category="tooling").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("pages", "0009_education"),
    ]

    operations = [
        migrations.RunPython(add_jira, remove_jira),
    ]
