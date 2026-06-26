"""URL configuration.

The public site is now the Next.js frontend (../frontend); Django serves only
the JSON API (``/api/``), the Unfold admin (``/admin/``), and user-uploaded media.
"""

from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve as media_serve

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    # Serve user-uploaded media even under DEBUG=False (WhiteNoise only covers
    # static). Acceptable for a low-traffic portfolio; not a high-throughput path.
    re_path(r"^media/(?P<path>.*)$", media_serve, {"document_root": settings.MEDIA_ROOT}),
]
