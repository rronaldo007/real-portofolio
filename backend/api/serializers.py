"""DRF serializers that adapt the existing ``pages`` models into the JSON shape
the v2 "Mission Control" frontend expects (see v2/portfolio-build-guide.md).

The frontend never sees Django field names — these serializers do the mapping
(title -> name, short_description -> summary, period -> when, …) so the existing
admin-edited content drives the new design unchanged.
"""
from rest_framework import serializers

from pages.models import (
    Education,
    Experience,
    Photo,
    Project,
    ProjectMetric,
    ProjectSection,
    ProjectShot,
    Section,
    SiteProfile,
    Skill,
    Testimonial,
)


def _abs(request, url):
    """Return the media/asset URL unchanged (relative paths stay relative).

    In the single-origin v2 deploy the public Next origin serves the API and
    proxies ``/media`` + ``/static`` to Django, so a relative ``/media/...`` path
    resolves correctly in the browser. We must NOT absolutize it: the request
    reaches Django over the internal loopback (127.0.0.1:8001), so
    ``build_absolute_uri`` would bake in that unreachable host (and the proxied
    https scheme), producing dead image URLs. External http(s) URLs are already
    absolute and pass through as-is. ``request`` is kept for signature stability.
    """
    return url or None


class _ContextMixin:
    @property
    def _request(self):
        return self.context.get("request")


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ["key", "nav_label", "number", "title", "accent", "order"]


class ProjectShotSerializer(_ContextMixin, serializers.ModelSerializer):
    src = serializers.SerializerMethodField()

    class Meta:
        model = ProjectShot
        fields = ["src", "caption"]

    def get_src(self, obj):
        return _abs(self._request, obj.src)


class ProjectSectionSerializer(_ContextMixin, serializers.ModelSerializer):
    src = serializers.SerializerMethodField()

    class Meta:
        model = ProjectSection
        fields = ["title", "body", "src", "caption"]

    def get_src(self, obj):
        return _abs(self._request, obj.src)


class ProjectMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMetric
        fields = ["label", "value", "unit"]


class ProjectSerializer(_ContextMixin, serializers.ModelSerializer):
    name = serializers.CharField(source="title")
    year = serializers.SerializerMethodField()
    summary = serializers.CharField(source="short_description")
    lead = serializers.SerializerMethodField()
    overview = serializers.CharField(source="case_study_body")
    stack = serializers.ListField(source="tech_list", child=serializers.CharField())
    highlights = serializers.ListField(source="highlight_list", child=serializers.CharField())
    is_featured = serializers.BooleanField(source="featured")
    cover = serializers.SerializerMethodField()
    sections = ProjectSectionSerializer(many=True, read_only=True)
    shots = ProjectShotSerializer(many=True, read_only=True)
    metrics = ProjectMetricSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            "slug", "name", "category", "year", "accent", "summary", "lead",
            "overview", "role", "stack", "highlights", "cover", "live_url",
            "repo_url", "badge", "is_featured", "sections", "shots", "metrics",
        ]

    def get_year(self, obj):
        return str(obj.year)

    def get_lead(self, obj):
        return obj.lead or obj.short_description

    def get_cover(self, obj):
        return _abs(self._request, obj.cover_image_url)


class ExperienceSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source="role")
    when = serializers.CharField(source="period")
    tags = serializers.ListField(source="stack_list", child=serializers.CharField())
    highlights = serializers.ListField(source="highlight_list", child=serializers.CharField())

    class Meta:
        model = Experience
        fields = [
            "title", "company", "when", "location", "description",
            "highlights", "tags", "accent",
        ]


class EducationSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source="degree")
    institution = serializers.CharField(source="school")
    status = serializers.CharField(source="status_label")
    focus = serializers.CharField(source="field")
    when = serializers.CharField(source="period")

    class Meta:
        model = Education
        fields = [
            "title", "institution", "rncp_level", "status", "focus", "when",
            "description", "accent", "is_target",
        ]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["name", "category", "tier", "favorite"]


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ["quote", "author", "author_role"]


class PhotoSerializer(_ContextMixin, serializers.ModelSerializer):
    src = serializers.SerializerMethodField()

    class Meta:
        model = Photo
        fields = ["src", "caption", "taken", "span"]

    def get_src(self, obj):
        return _abs(self._request, obj.src)


class SiteSettingsSerializer(_ContextMixin, serializers.ModelSerializer):
    full_name = serializers.CharField(source="name")
    github = serializers.CharField(source="github_url")
    linkedin = serializers.CharField(source="linkedin_url")
    cv = serializers.SerializerMethodField()
    photo = serializers.SerializerMethodField()

    class Meta:
        model = SiteProfile
        fields = [
            "logo_text", "logo_super", "full_name", "tagline", "bio",
            "location", "timezone", "availability", "lat", "lon",
            "email", "phone", "github", "linkedin", "twitter_url",
            "hero_prefix", "hero_heading", "hero_sub",
            "accent_color", "cv", "photo",
        ]

    def get_cv(self, obj):
        # Returned verbatim — NOT absolutized to the backend. A site-relative path
        # (e.g. /cv/...pdf, served from the frontend's public/) resolves against
        # the public origin in the browser; an absolute URL is used as-is.
        return obj.resume_url or None

    def get_photo(self, obj):
        return _abs(self._request, obj.photo_src)
