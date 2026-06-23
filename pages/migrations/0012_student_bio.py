from django.db import migrations

NEW_BIO = (
    "Étudiant en Mastère Management de la transformation digitale en IA, "
    "après un parcours de développeur fullstack (LumApps, Néatemys). "
    "J’apprends en construisant : des produits de bout en bout en Django et "
    "React, et de plus en plus de projets autour de l’IA et de la data.\n"
    "En recherche d’une alternance en IA / data science dès août 2026."
)


def set_student_bio(apps, schema_editor):
    """Replace the placeholder senior-framed bio with a student/alternance one.
    Guarded so a custom bio set later via the admin is never clobbered."""
    SiteProfile = apps.get_model("pages", "SiteProfile")
    sp = SiteProfile.objects.first()
    if sp and (not sp.bio or "Six ans" in sp.bio):
        sp.bio = NEW_BIO
        sp.save(update_fields=["bio"])


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("pages", "0011_add_linux_cli_skills"),
    ]

    operations = [
        migrations.RunPython(set_student_bio, noop),
    ]
