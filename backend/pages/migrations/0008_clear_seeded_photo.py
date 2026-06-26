from django.db import migrations

# The placeholder seeded by 0006_seed_photo. We clear it so the portrait shows
# only once a real photo is uploaded (or a real photo_url is set), rather than a
# stock image. Guarded by equality so a real value is never clobbered.
PLACEHOLDER = (
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce"
    "?w=900&h=1100&fit=crop&auto=format&q=80"
)


def clear(apps, schema_editor):
    SiteProfile = apps.get_model("pages", "SiteProfile")
    SiteProfile.objects.filter(photo_url=PLACEHOLDER).update(photo_url="")


def restore(apps, schema_editor):
    SiteProfile = apps.get_model("pages", "SiteProfile")
    SiteProfile.objects.filter(photo_url="", photo="").update(photo_url=PLACEHOLDER)


class Migration(migrations.Migration):

    dependencies = [("pages", "0007_siteprofile_photo_alter_siteprofile_photo_url")]

    operations = [migrations.RunPython(clear, restore)]
