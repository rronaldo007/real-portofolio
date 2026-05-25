from django.db import migrations

PHOTO = (
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce"
    "?w=900&h=1100&fit=crop&auto=format&q=80"
)


def seed(apps, schema_editor):
    SiteProfile = apps.get_model("pages", "SiteProfile")
    profile = SiteProfile.objects.first()
    if profile and not profile.photo_url:
        profile.photo_url = PHOTO
        profile.save(update_fields=["photo_url"])


def unseed(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [("pages", "0005_siteprofile_photo_url_alter_siteprofile_bio")]

    operations = [migrations.RunPython(seed, unseed)]
