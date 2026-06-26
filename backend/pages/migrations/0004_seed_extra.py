from django.db import migrations


# project slug -> [(label, value, unit), ...]
METRICS = {
    "mosaic": [("Studios actifs", "14", " équipes"), ("P50 réponse", "42", " ms")],
    "ledger": [("Transactions suivies", "8k", "+")],
    "drift": [("Utilisateurs simultanés", "120", "")],
    "atlas": [("Toujours en service", "4", " ans")],
}

MESSAGES = [
    ("Camille Roy", "camille@cobalt.studio", "Collaboration",
     "Bonjour Rukundo, on aimerait discuter d’une mission plateforme pour cet automne."),
    ("Jonas Weber", "jonas@acre.co", "Question",
     "Ton approche HTMX m’intéresse — disponible pour un appel rapide la semaine prochaine ?"),
    ("Aïcha Ndiaye", "aicha@studiok.fr", "Disponibilité",
     "On a un projet Django qui te correspond parfaitement. Es-tu libre dès août ?"),
]


def seed(apps, schema_editor):
    Project = apps.get_model("pages", "Project")
    ProjectMetric = apps.get_model("pages", "ProjectMetric")
    ContactMessage = apps.get_model("pages", "ContactMessage")

    if not ProjectMetric.objects.exists():
        for slug, rows in METRICS.items():
            project = Project.objects.filter(slug=slug).first()
            if not project:
                continue
            for i, (label, value, unit) in enumerate(rows):
                ProjectMetric.objects.create(
                    project=project, label=label, value=value, unit=unit, order=i
                )

    if not ContactMessage.objects.exists():
        for name, email, subject, message in MESSAGES:
            ContactMessage.objects.create(
                name=name, email=email, subject=subject, message=message
            )


def unseed(apps, schema_editor):
    apps.get_model("pages", "ProjectMetric").objects.all().delete()
    apps.get_model("pages", "ContactMessage").objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [("pages", "0003_contactmessage_project_open_source_and_more")]

    operations = [migrations.RunPython(seed, unseed)]
