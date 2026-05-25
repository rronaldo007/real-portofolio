"""Sitemaps for search engines. Wired into config/urls.py at /sitemap.xml.

Uses the request host (RequestSite) — the django.contrib.sites framework is not
required. Absolute URLs come out as https:// because SECURE_PROXY_SSL_HEADER is set."""

from django.contrib.sitemaps import Sitemap
from django.urls import reverse

from .models import Project


class StaticViewSitemap(Sitemap):
    priority = 0.9
    changefreq = "monthly"
    protocol = "https"

    def items(self):
        return ["pages:home"]

    def location(self, item):
        return reverse(item)


class ProjectSitemap(Sitemap):
    priority = 0.7
    changefreq = "monthly"
    protocol = "https"

    def items(self):
        # Public case studies — same set surfaced in the work index.
        return Project.objects.filter(show_in_index=True)

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return reverse("pages:project_detail", kwargs={"slug": obj.slug})


sitemaps = {
    "static": StaticViewSitemap,
    "projects": ProjectSitemap,
}
