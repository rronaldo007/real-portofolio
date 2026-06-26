from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import Bootstrap, PhotoViewSet, ProjectViewSet

router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="project")
router.register("photos", PhotoViewSet, basename="photo")

app_name = "api"

urlpatterns = [
    path("bootstrap/", Bootstrap.as_view(), name="bootstrap"),
    path("", include(router.urls)),
]
