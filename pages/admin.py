from django.contrib import admin
from django.contrib.admin.models import LogEntry
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from unfold.decorators import display

from .models import Experience, Project, Skill, SiteProfile, Testimonial

# Status pill colors (mirrors the design's status-* / pill colors).
_STATUS_COLORS = {
    "draft": "#fcd34d",
    "published": "#6ee7b7",
    "archived": "#8a8378",
}
_BADGE_COLORS = {
    "live": "#6ee7b7",
    "beta": "#c084fc",
    "working": "#fcd34d",
    "oss": "#93c5fd",
    "archived": "#8a8378",
}


def _pill(label, color):
    return format_html(
        '<span style="display:inline-flex;align-items:center;gap:6px;'
        'font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.04em;'
        'padding:3px 10px;border-radius:999px;border:1px solid {0}55;color:{0};">'
        '<span style="width:6px;height:6px;border-radius:50%;background:{0};"></span>{1}</span>',
        color,
        label,
    )


@admin.register(Project)
class ProjectAdmin(ModelAdmin):
    list_display = ("title", "year", "status_pill", "badge_pill", "featured", "order")
    list_display_links = ("title",)
    list_editable = ("order",)
    list_filter = ("status", "badge", "featured", "card_style", "year")
    search_fields = ("title", "short_description", "tech_stack", "client")
    prepopulated_fields = {"slug": ("title",)}
    ordering = ("order", "-year")
    list_per_page = 25

    fieldsets = (
        (
            "Basics",
            {
                "classes": ["tab"],
                "fields": (
                    "title",
                    "slug",
                    "year",
                    "short_description",
                    ("role", "client"),
                    ("live_url", "repo_url"),
                    "tech_stack",
                ),
            },
        ),
        (
            "Cover & media",
            {"classes": ["tab"], "fields": ("cover_image_url", "card_style")},
        ),
        (
            "Case study",
            {"classes": ["tab"], "fields": ("case_study_body",)},
        ),
        (
            "SEO & meta",
            {"classes": ["tab"], "fields": ("meta_title", "meta_description")},
        ),
        (
            "Settings",
            {"classes": ["tab"], "fields": (("status", "badge"), "featured", "order")},
        ),
    )

    @display(description="Status")
    def status_pill(self, obj):
        return _pill(obj.get_status_display(), _STATUS_COLORS.get(obj.status, "#8a8378"))

    @display(description="Badge")
    def badge_pill(self, obj):
        return _pill(obj.get_badge_display(), _BADGE_COLORS.get(obj.badge, "#8a8378"))


@admin.register(Experience)
class ExperienceAdmin(ModelAdmin):
    list_display = ("role", "company", "period", "order")
    list_editable = ("order",)
    search_fields = ("role", "company", "description")
    ordering = ("order", "-start_year")
    fieldsets = (
        (
            "Role",
            {
                "fields": (
                    ("role", "company"),
                    "location",
                    ("start_year", "end_year"),
                    "description",
                )
            },
        ),
        ("Detail", {"fields": ("highlights", "stack", "order")}),
    )


@admin.register(Skill)
class SkillAdmin(ModelAdmin):
    list_display = ("name", "category", "tier", "favorite", "order")
    list_editable = ("order", "favorite")
    list_filter = ("category", "tier", "favorite")
    search_fields = ("name",)
    ordering = ("category", "order", "name")


@admin.register(Testimonial)
class TestimonialAdmin(ModelAdmin):
    list_display = ("author", "author_role", "short_quote", "order")
    list_editable = ("order",)
    search_fields = ("author", "quote", "author_role")
    ordering = ("order",)

    @display(description="Quote")
    def short_quote(self, obj):
        return (obj.quote[:70] + "…") if len(obj.quote) > 70 else obj.quote


@admin.register(SiteProfile)
class SiteProfileAdmin(ModelAdmin):
    fieldsets = (
        ("Profile", {"classes": ["tab"], "fields": ("name", "tagline", "bio",
                                                     "location", "timezone", "availability")}),
        ("Hero copy", {"classes": ["tab"], "fields": ("hero_prefix", "hero_heading", "hero_sub")}),
        ("Contact & socials", {"classes": ["tab"], "fields": ("email", "github_url",
                                                              "linkedin_url", "twitter_url",
                                                              "dribbble_url")}),
        ("Theme & branding", {"classes": ["tab"], "fields": ("accent_color",)}),
        ("Resume / CV", {"classes": ["tab"], "fields": ("resume_url",)}),
    )

    def has_add_permission(self, request):
        # Singleton: only allow creating the first one.
        return not SiteProfile.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(LogEntry)
class LogEntryAdmin(ModelAdmin):
    """Read-only Activity Log (the design's System → Activity Log)."""

    list_display = ("action_time", "user", "content_type", "object_repr", "action_flag")
    list_filter = ("action_flag", "content_type")
    search_fields = ("object_repr", "change_message")
    date_hierarchy = "action_time"
    ordering = ("-action_time",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
