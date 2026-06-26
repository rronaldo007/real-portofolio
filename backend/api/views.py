"""Read-only API for the v2 frontend.

``bootstrap/`` returns everything the home one-pager needs in a single request;
the project/photo viewsets back the detail and gallery pages.
"""
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from pages.models import (
    Education,
    Experience,
    Photo,
    Project,
    Section,
    SiteProfile,
    Skill,
    Testimonial,
)

from .serializers import (
    EducationSerializer,
    ExperienceSerializer,
    PhotoSerializer,
    ProjectSerializer,
    SectionSerializer,
    SiteSettingsSerializer,
    SkillSerializer,
    TestimonialSerializer,
)


def _published_projects():
    return (
        Project.objects.filter(status=Project.Status.PUBLISHED)
        .prefetch_related("shots", "metrics")
    )


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProjectSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return _published_projects()


class PhotoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer


class Bootstrap(APIView):
    """One call that returns everything the home page needs."""

    def get(self, request):
        ctx = {"request": request}
        projects = _published_projects()
        return Response({
            "settings": SiteSettingsSerializer(SiteProfile.load(), context=ctx).data,
            "sections": SectionSerializer(
                Section.objects.filter(is_enabled=True), many=True, context=ctx
            ).data,
            "projects": ProjectSerializer(projects, many=True, context=ctx).data,
            "experiences": ExperienceSerializer(
                Experience.objects.all(), many=True, context=ctx
            ).data,
            "education": EducationSerializer(
                Education.objects.all(), many=True, context=ctx
            ).data,
            "skills": SkillSerializer(Skill.objects.all(), many=True, context=ctx).data,
            "testimonials": TestimonialSerializer(
                Testimonial.objects.all(), many=True, context=ctx
            ).data,
            "photos": PhotoSerializer(Photo.objects.all(), many=True, context=ctx).data,
        })
