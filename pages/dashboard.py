"""Callbacks for the Unfold admin: sidebar count badges + dashboard context."""

from django.contrib.admin.models import LogEntry
from django.urls import reverse

from .models import Experience, Project, Skill, Testimonial


# ─── Sidebar badge callbacks (Unfold calls these with the request) ───
def project_count(request):
    return Project.objects.count() or None


def experience_count(request):
    return Experience.objects.count() or None


def skill_count(request):
    return Skill.objects.count() or None


def testimonial_count(request):
    return Testimonial.objects.count() or None


# ─── Dashboard callback ───
def dashboard_callback(request, context):
    """Inject stat cards, quick links and recent activity into the admin index."""
    published = Project.objects.filter(status=Project.Status.PUBLISHED).count()
    total = Project.objects.count()

    context["stats"] = [
        {"label": "Projets", "value": total,
         "sub": f"{published} publiés", "icon": "deployed_code"},
        {"label": "En vedette", "value": Project.objects.filter(featured=True).count(),
         "sub": "sur la home", "icon": "star"},
        {"label": "Expériences", "value": Experience.objects.count(),
         "sub": "rôles", "icon": "timeline"},
        {"label": "Compétences", "value": Skill.objects.count(),
         "sub": "outils", "icon": "bolt"},
    ]

    context["quick_links"] = [
        {"title": "Nouveau projet", "desc": "Ajouter une étude de cas",
         "icon": "add", "link": reverse("admin:pages_project_add")},
        {"title": "Projets", "desc": "Gérer la grille",
         "icon": "deployed_code", "link": reverse("admin:pages_project_changelist")},
        {"title": "Profil du site", "desc": "Hero, contact, branding",
         "icon": "person", "link": reverse("admin:pages_siteprofile_changelist")},
        {"title": "Voir le site", "desc": "Ouvrir la home ↗",
         "icon": "open_in_new", "link": "/"},
    ]

    context["recent_activity"] = (
        LogEntry.objects.select_related("content_type", "user")
        .order_by("-action_time")[:8]
    )
    return context
