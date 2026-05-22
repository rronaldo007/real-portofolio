"""Callbacks for the Unfold admin: sidebar count badges + dashboard context."""

from django.contrib.admin.models import LogEntry
from django.db.models import Count
from django.urls import reverse

from .models import ContactMessage, Experience, Project, Skill, SiteProfile, Testimonial

ACCENT_SWATCHES = ["#c084fc", "#ff5a1f", "#4d7cfe", "#d4ff3a", "#6ee7b7", "#f5f2ec"]


# ─── Sidebar badge callbacks (Unfold calls these with the request) ───
def project_count(request):
    return Project.objects.count() or None


def experience_count(request):
    return Experience.objects.count() or None


def skill_count(request):
    return Skill.objects.count() or None


def testimonial_count(request):
    return Testimonial.objects.count() or None


def message_count(request):
    return ContactMessage.objects.filter(is_read=False).count() or None


# ─── Dashboard callback ───
def dashboard_callback(request, context):
    """Inject the full dashboard: greeting, stats, chart, quick actions,
    recent activity and the theme/site panel — mirroring reference/admin.html."""
    total = Project.objects.count()
    published = Project.objects.filter(status=Project.Status.PUBLISHED).count()
    drafts = Project.objects.filter(status=Project.Status.DRAFT).count()
    unread = ContactMessage.objects.filter(is_read=False).count()
    profile = SiteProfile.objects.first()

    # Greeting line
    context["greeting_name"] = (profile.name.split()[0] if profile else "Rukundo")
    context["greeting_sub"] = (
        f"{drafts} brouillon{'s' if drafts != 1 else ''} en attente · "
        f"{unread} message{'s' if unread != 1 else ''} non lu{'s' if unread != 1 else ''}."
    )

    # Stat cards
    context["stats"] = [
        {"label": "Projets", "value": total, "sub": f"{published} publiés",
         "icon": "deployed_code"},
        {"label": "En vedette", "value": Project.objects.filter(featured=True).count(),
         "sub": "sur la home", "icon": "star"},
        {"label": "Messages", "value": ContactMessage.objects.count(),
         "sub": f"{unread} non lus", "icon": "inbox"},
        {"label": "Compétences", "value": Skill.objects.count(),
         "sub": f"{Experience.objects.count()} expériences", "icon": "bolt"},
    ]

    # Chart — projects per year (real data)
    rows = list(Project.objects.values("year").annotate(n=Count("id")).order_by("year"))
    chart_max = max((r["n"] for r in rows), default=1)
    context["chart"] = [
        {"label": r["year"], "value": r["n"], "height": int(r["n"] / chart_max * 100)}
        for r in rows
    ]

    # Quick actions
    context["quick_links"] = [
        {"title": "Nouveau projet", "desc": "Ajouter une étude de cas",
         "icon": "add", "link": reverse("admin:pages_project_add")},
        {"title": "Éditer le hero", "desc": "Tagline & intro",
         "icon": "article", "link": reverse("admin:pages_siteprofile_changelist")},
        {"title": "Profil & contact", "desc": "Bio, socials, CV",
         "icon": "person", "link": reverse("admin:pages_siteprofile_changelist")},
        {"title": "Voir le site", "desc": "Ouvrir la home ↗",
         "icon": "open_in_new", "link": "/"},
    ]

    context["recent_activity"] = (
        LogEntry.objects.select_related("content_type", "user").order_by("-action_time")[:6]
    )

    # Theme & site panel
    context["theme_panel"] = {
        "accent": (profile.accent_color if profile else "#c084fc"),
        "swatches": ACCENT_SWATCHES,
        "default_theme": (profile.get_default_theme_display() if profile else "Dark"),
        "variant": (profile.get_home_variant_display() if profile else "Atelier · editorial"),
        "edit_link": reverse("admin:pages_siteprofile_changelist"),
    }
    return context
