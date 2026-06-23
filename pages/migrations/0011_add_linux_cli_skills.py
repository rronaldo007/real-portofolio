from django.db import migrations

# (name, order) — both Tooling & infra, daily-use tier.
SKILLS = [
    ("Linux", 4),
    ("Ligne de commande", 5),
]


def add_skills(apps, schema_editor):
    Skill = apps.get_model("pages", "Skill")
    for name, order in SKILLS:
        Skill.objects.get_or_create(
            name=name,
            defaults={"category": "tooling", "tier": "primary", "order": order},
        )


def remove_skills(apps, schema_editor):
    Skill = apps.get_model("pages", "Skill")
    Skill.objects.filter(
        name__in=[n for n, _ in SKILLS], category="tooling"
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("pages", "0010_add_jira_skill"),
    ]

    operations = [
        migrations.RunPython(add_skills, remove_skills),
    ]
