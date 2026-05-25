"""Template context processors — make the site profile + social links available
to every template (so the shared SEO head partial works on all pages, including
the static TemplateView pages that don't pass `profile` explicitly)."""

from .models import SiteProfile


def site(request):
    profile = SiteProfile.objects.first()
    socials = []
    if profile:
        socials = [
            u for u in (
                profile.github_url,
                profile.linkedin_url,
                profile.twitter_url,
                profile.dribbble_url,
            ) if u
        ]
    return {"profile": profile, "social_links": socials}
