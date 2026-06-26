from django.db import migrations

# The v2 CV is served by the frontend from public/cv/. Point the singleton's
# resume_url at that site-relative path so the "Download CV" button works in
# production without a manual admin step. Only touches an existing profile.
CV_PATH = "/cv/Rukundo-Ronaldo-CV.pdf"


def set_cv(apps, schema_editor):
    SiteProfile = apps.get_model("pages", "SiteProfile")
    obj = SiteProfile.objects.first()
    if obj and obj.resume_url != CV_PATH:
        obj.resume_url = CV_PATH
        obj.save(update_fields=["resume_url"])


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [("pages", "0016_siteprofile_phone")]
    operations = [migrations.RunPython(set_cv, noop)]
