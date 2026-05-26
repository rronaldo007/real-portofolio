from django.contrib import messages
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect, render

from .models import (
    ContactMessage,
    Experience,
    Project,
    Skill,
    SiteProfile,
    Testimonial,
)

_TIER_LABELS = [
    (Skill.Tier.PRIMARY, "Au quotidien", "tier primary"),
    (Skill.Tier.FREQUENT, "Fréquent", "tier"),
    (Skill.Tier.OCCASIONAL, "Occasionnel", "tier"),
]


def _skill_groups():
    """Group skills into category columns, each split into tiers (home skills section)."""
    groups = []
    for value, label in Skill.Category.choices:
        cat_skills = list(Skill.objects.filter(category=value))
        if not cat_skills:
            continue
        tiers = []
        for tier_value, tier_label, css in _TIER_LABELS:
            chips = [s for s in cat_skills if s.tier == tier_value]
            if chips:
                tiers.append({"label": tier_label, "css": css, "chips": chips})
        groups.append({"name": label, "count": len(cat_skills), "tiers": tiers})
    return groups


def _published_projects():
    """Projects that may surface publicly — published and flagged for the index."""
    return Project.objects.filter(
        status=Project.Status.PUBLISHED, show_in_index=True
    )


def _home_context():
    profile = SiteProfile.objects.first()
    projects = list(_published_projects())
    years = [p.year for p in projects]
    return {
        "profile": profile,
        "projects": projects,
        "project_year_range": (f"{min(years)}–{max(years)}" if years else ""),
        "experiences": list(Experience.objects.all()),
        "skill_groups": _skill_groups(),
        "skill_total": Skill.objects.count(),
        "testimonials": list(Testimonial.objects.all()),
    }


def home(request):
    profile = SiteProfile.objects.first()
    variant = profile.home_variant if profile else SiteProfile.HomeVariant.ATELIER
    template = (
        "pages/home_etudes.html"
        if variant == SiteProfile.HomeVariant.ETUDES
        else "pages/home_atelier.html"
    )
    return render(request, template, _home_context())


def home_etudes(request):
    return render(request, "pages/home_etudes.html", _home_context())


def project_detail(request, slug):
    project = get_object_or_404(
        Project.objects.prefetch_related("metrics"), slug=slug
    )
    nxt = (
        _published_projects()
        .exclude(pk=project.pk)
        .filter(order__gte=project.order)
        .first()
    )
    return render(request, "pages/project.html", {
        "profile": SiteProfile.objects.first(),
        "project": project,
        "next_project": nxt,
    })


def project_index(request):
    """No-arg fallback — redirect to the first indexed project."""
    project = _published_projects().first() or Project.objects.first()
    if project:
        return redirect("pages:project_detail", slug=project.slug)
    return render(request, "pages/project.html", {"profile": SiteProfile.objects.first(), "project": None})


def robots_txt(request):
    """Serve /robots.txt — allow everything except the admin, point to the sitemap."""
    sitemap_url = f"{request.scheme}://{request.get_host()}/sitemap.xml"
    body = "\n".join([
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin/",
        f"Sitemap: {sitemap_url}",
        "",
    ])
    return HttpResponse(body, content_type="text/plain")


def contact_submit(request):
    """Receive the public contact form into the admin inbox."""
    if request.method == "POST":
        ContactMessage.objects.create(
            name=request.POST.get("name", "").strip() or "Anonyme",
            email=request.POST.get("email", "").strip(),
            subject=request.POST.get("subject", "").strip(),
            message=request.POST.get("message", "").strip(),
        )
        messages.success(request, "Merci — votre message a bien été envoyé.")
    return redirect("/#contact")
