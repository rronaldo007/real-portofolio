from django.db import migrations

# The v2 "Mission Control" home sections, in order. Idempotent: keyed on `key`.
SECTIONS = [
    ("about",   "À propos",  1, "Trajectoire",      "violet"),
    ("stack",   "Stack",     2, "Outils",           "cyan"),
    ("work",    "Projets",   3, "Sélection",        "violet"),
    ("log",     "Parcours",  4, "Journal de bord",  "lime"),
    ("edu",     "Formation", 5, "Habilitations",    "cyan"),
    ("ai",      "IA",        6, "Cap sur l'IA",     "pink"),
    ("gallery", "Galerie",   7, "Hors-champ",       "lime"),
    ("contact", "Contact",   8, "Établir le lien",  "violet"),
]


def seed(apps, schema_editor):
    Section = apps.get_model("pages", "Section")
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


def unseed(apps, schema_editor):
    Section = apps.get_model("pages", "Section")
    Section.objects.filter(key__in=[s[0] for s in SECTIONS]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("pages", "0013_photo_section_education_accent_education_is_target_and_more"),
    ]
    operations = [migrations.RunPython(seed, unseed)]
