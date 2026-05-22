from django.urls import path
from django.views.generic import TemplateView

app_name = "pages"

urlpatterns = [
    path("", TemplateView.as_view(template_name="pages/home_atelier.html"), name="home"),
    path("etudes/", TemplateView.as_view(template_name="pages/home_etudes.html"), name="home_etudes"),
    path("project/", TemplateView.as_view(template_name="pages/project.html"), name="project"),
    path("dashboard/", TemplateView.as_view(template_name="pages/admin.html"), name="admin_demo"),
    path("design-system/", TemplateView.as_view(template_name="pages/design_system.html"), name="design_system"),
    path("nav-options/", TemplateView.as_view(template_name="pages/nav_options.html"), name="nav_options"),
]
