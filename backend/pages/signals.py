"""Ping the Next.js frontend to revalidate when editable content changes.

Best-effort: runs on a daemon thread with a short timeout so an admin save is
never blocked or broken if the frontend is unreachable. Wire-up is in
``PagesConfig.ready`` (apps.py).
"""
import threading
import urllib.error
import urllib.request

from django.conf import settings
from django.db.models.signals import post_delete, post_save

# Models whose changes affect the public site.
WATCHED = [
    "Project", "ProjectMetric", "ProjectShot", "Experience", "Education",
    "Skill", "Testimonial", "SiteProfile", "Section", "Photo",
]


def _ping():
    url = getattr(settings, "FRONTEND_REVALIDATE_URL", "")
    secret = getattr(settings, "FRONTEND_REVALIDATE_SECRET", "")
    if not url or not secret:
        return
    full = f"{url}?secret={secret}"
    try:
        req = urllib.request.Request(full, method="POST", data=b"")
        urllib.request.urlopen(req, timeout=3)
    except (urllib.error.URLError, OSError):
        pass  # frontend down / unreachable — ignore, ISR window still covers it


def _on_change(sender, **kwargs):
    threading.Thread(target=_ping, daemon=True).start()


def connect():
    from django.apps import apps

    for name in WATCHED:
        try:
            model = apps.get_model("pages", name)
        except LookupError:
            continue
        post_save.connect(_on_change, sender=model, dispatch_uid=f"revalidate_{name}_save")
        post_delete.connect(_on_change, sender=model, dispatch_uid=f"revalidate_{name}_del")
