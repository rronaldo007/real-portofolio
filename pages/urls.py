from django.urls import path
from django.views.generic import TemplateView

from . import views

app_name = "pages"

urlpatterns = [
    path("", views.home, name="home"),
    path("etudes/", views.home_etudes, name="home_etudes"),
    path("project/", views.project_index, name="project"),
    path("work/<slug:slug>/", views.project_detail, name="project_detail"),
    path("contact/", views.contact_submit, name="contact"),
    path("dashboard/", TemplateView.as_view(template_name="pages/admin.html"), name="admin_demo"),
    path("design-system/", TemplateView.as_view(template_name="pages/design_system.html"), name="design_system"),
    path("nav-options/", TemplateView.as_view(template_name="pages/nav_options.html"), name="nav_options"),
]
