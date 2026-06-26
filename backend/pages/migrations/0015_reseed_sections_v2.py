from django.db import migrations

# Align the Section rows with the v2 "Mission Control" reference (Portfolio.dc.html):
# key = the section's DOM id, nav_label = the mono eyebrow label, title = the big
# italic-serif heading, accent = the section glow. Idempotent on `key`.
SECTIONS = [
    ("about",     "about",         1, "About me",                       "violet"),
    ("stack",     "stack",         2, "Skills",                         "cyan"),
    ("work",      "selected work", 3, "Projects",                       "violet"),
    ("timeline",  "mission log",   4, "Experience",                     "violet"),
    ("education", "edu",           5, "Education",                      "lime"),
    ("ai",        "trajectory",    6, "From full-stack to AI engineer", "lime"),
    ("gallery",   "lens",          7, "Photography",                    "cyan"),
    ("contact",   "contact",       8, "Let us build something.",        "violet"),
]
# Old French keys from 0014 that the reference renames/replaces.
STALE = ["log", "edu"]


def seed(apps, schema_editor):
    Section = apps.get_model("pages", "Section")
    # Drop the superseded keys (edu -> education, log -> timeline) before reseeding.
    Section.objects.filter(key__in=STALE).delete()
    for order, (key, nav_label, number, title, accent) in enumerate(SECTIONS):
        Section.objects.update_or_create(
            key=key,
            defaults={
                "nav_label": nav_label,
                "number": number,
                "title": title,
                "accent": accent,
                "order": order,
                "is_enabled": True,
            },
        )


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [("pages", "0014_seed_sections")]
    operations = [migrations.RunPython(seed, noop)]
