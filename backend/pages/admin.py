from django.contrib import admin
from django.contrib.admin.models import LogEntry
from django.utils.html import format_html, format_html_join
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import action, display

from .models import (
    ContactMessage,
    Education,
    Experience,
    Photo,
    Project,
    ProjectMetric,
    ProjectSection,
    ProjectShot,
    SectionMedia,
    Section,
    Skill,
    SiteProfile,
    Testimonial,
)

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
# Representative color per card gradient style (from shared.css).
_CARD_COLORS = {
    "mosaic": "#7c3aed",
    "ledger": "#4d7cfe",
    "roost": "#a8633a",
    "drift": "#0e7490",
    "quill": "#a21caf",
    "atlas": "#0f9d6e",
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


class ProjectMetricInline(TabularInline):
    model = ProjectMetric
    extra = 0
    fields = ("label", "value", "unit", "order")
    ordering = ("order",)


class ProjectSectionInline(TabularInline):
    model = ProjectSection
    extra = 0
    fields = ("title", "body", "image", "image_url", "caption", "order")
    ordering = ("order",)


class ProjectShotInline(TabularInline):
    model = ProjectShot
    extra = 0
    fields = ("image", "image_url", "caption", "order")
    ordering = ("order",)


class SectionMediaInline(TabularInline):
    model = SectionMedia
    extra = 0
    fields = ("image", "image_url", "document", "caption", "order")
    ordering = ("order",)


@admin.register(ProjectSection)
class ProjectSectionAdmin(ModelAdmin):
    """Sections are listed inline on the project, but edited here so their
    media can be attached (Django has no nested inlines)."""

    list_display = ("title", "project", "order")
    list_filter = ("project",)
    search_fields = ("title", "body")
    ordering = ("project", "order")
    inlines = [SectionMediaInline]


@admin.register(Project)
class ProjectAdmin(ModelAdmin):
    list_display = ("cover", "project_cell", "stack_tags", "year", "status_pill", "featured", "order")
    list_display_links = ("project_cell",)
    list_editable = ("order",)
    list_filter = ("status", "badge", "featured", "open_source", "card_style", "year")
    search_fields = ("title", "short_description", "tech_stack", "client")
    prepopulated_fields = {"slug": ("title",)}
    ordering = ("order", "-year")
    list_per_page = 25
    inlines = [ProjectSectionInline, ProjectMetricInline, ProjectShotInline]

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
            "Mission Control (v2)",
            {
                "classes": ["tab"],
                "fields": ("accent", "category", "lead", "highlights"),
                "description": "Drives the v2 “Mission Control” design (accent glow, "
                               "card category, punchy lead, case-study highlights).",
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
            {
                "classes": ["tab"],
                "fields": (
                    ("status", "badge"),
                    ("featured", "show_in_index", "open_source"),
                    "order",
                ),
            },
        ),
    )

    @display(description="")
    def cover(self, obj):
        color = _CARD_COLORS.get(obj.card_style, "#7c3aed")
        return format_html(
            '<span style="display:block;width:34px;height:26px;border-radius:5px;'
            'background:linear-gradient(135deg,{0},rgba(14,13,12,.9));'
            'border:1px solid rgba(245,242,236,.12);"></span>',
            color,
        )

    @display(description="Project")
    def project_cell(self, obj):
        return format_html(
            '<div style="display:flex;flex-direction:column;gap:2px;">'
            '<b>{0}</b>'
            '<span style="font-size:11px;color:#8a8378;font-family:ui-monospace,monospace;">'
            '/work/{1} · {2}</span></div>',
            obj.title,
            obj.slug,
            (obj.short_description[:48] + "…") if len(obj.short_description) > 48 else obj.short_description,
        )

    @display(description="Stack")
    def stack_tags(self, obj):
        chips = format_html_join(
            " ",
            '<span style="font-size:10px;font-family:ui-monospace,monospace;color:#8a8378;'
            'border:1px solid rgba(245,242,236,.14);padding:2px 7px;border-radius:999px;">{}</span>',
            ((t,) for t in obj.tech_list[:4]),
        )
        return chips or "—"

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
        ("Detail", {"fields": ("highlights", "stack", "accent", "order")}),
    )


@admin.register(Education)
class EducationAdmin(ModelAdmin):
    list_display = ("degree", "school", "period", "order")
    list_editable = ("order",)
    search_fields = ("degree", "school", "field", "description")
    ordering = ("order", "-start_year")
    fieldsets = (
        (
            "Formation",
            {
                "fields": (
                    "degree",
                    ("school", "field"),
                    "location",
                    ("start_year", "end_year"),
                    "description",
                    "order",
                )
            },
        ),
        (
            "Habilitation (v2)",
            {
                "fields": (("rncp_level", "status_label"), ("accent", "is_target")),
                "description": "v2 “clearance card” fields.",
            },
        ),
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


@admin.register(ContactMessage)
class ContactMessageAdmin(ModelAdmin):
    """Inbox for public contact-form submissions."""

    list_display = ("name", "email", "subject", "preview", "read_pill", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = ("name", "email", "subject", "message")
    readonly_fields = ("name", "email", "subject", "message", "created_at")
    ordering = ("-created_at",)
    actions = ["mark_read", "mark_unread"]

    fieldsets = (("Message", {"fields": (("name", "email"), "subject", "message",
                                         "is_read", "created_at")}),)

    def has_add_permission(self, request):
        return False  # messages arrive via the public form

    @display(description="Message")
    def preview(self, obj):
        return (obj.message[:60] + "…") if len(obj.message) > 60 else obj.message

    @display(description="State")
    def read_pill(self, obj):
        return _pill("Lu", "#8a8378") if obj.is_read else _pill("Nouveau", "#c084fc")

    @action(description="Marquer comme lu")
    def mark_read(self, request, queryset):
        queryset.update(is_read=True)

    @action(description="Marquer comme non lu")
    def mark_unread(self, request, queryset):
        queryset.update(is_read=False)


@admin.register(SiteProfile)
class SiteProfileAdmin(ModelAdmin):
    fieldsets = (
        ("Profile", {"classes": ["tab"], "fields": ("name", ("logo_text", "logo_super"),
                                                     "photo", "photo_url", "tagline", "bio",
                                                     "location", "timezone", "availability",
                                                     ("lat", "lon"))}),
        ("Hero copy", {"classes": ["tab"], "fields": ("hero_prefix", "hero_heading", "hero_sub")}),
        ("Contact & socials", {"classes": ["tab"], "fields": ("email", "phone", "github_url",
                                                              "linkedin_url", "twitter_url",
                                                              "dribbble_url")}),
        ("Theme & branding", {"classes": ["tab"], "fields": ("accent_color", "default_theme",
                                                             "home_variant")}),
        ("Resume / CV", {"classes": ["tab"], "fields": ("resume_url",)}),
    )

    def has_add_permission(self, request):
        # Singleton: only allow creating the first one.
        return not SiteProfile.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Section)
class SectionAdmin(ModelAdmin):
    """The v2 home sections — drive the nav pill + section headers."""

    list_display = ("number", "nav_label", "title", "accent_pill", "is_enabled", "order")
    list_editable = ("is_enabled", "order")
    list_filter = ("is_enabled", "accent")
    ordering = ("order",)
    fieldsets = (
        ("Section", {"fields": (("key", "number"), ("nav_label", "title"),
                                ("accent", "is_enabled"), "order")}),
    )

    @display(description="Accent")
    def accent_pill(self, obj):
        colors = {"violet": "#9B6BFF", "cyan": "#2BF1FF", "lime": "#C6FF3A", "pink": "#FF7AD9"}
        return _pill(obj.get_accent_display(), colors.get(obj.accent, "#9B6BFF"))


@admin.register(Photo)
class PhotoAdmin(ModelAdmin):
    """The v2 gallery mosaic photos."""

    list_display = ("thumb", "caption", "taken", "span", "order")
    list_editable = ("order",)
    search_fields = ("caption", "taken")
    ordering = ("order",)
    fieldsets = (
        ("Photo", {"fields": ("image", "image_url", "caption", "taken", "span", "order")}),
    )

    @display(description="")
    def thumb(self, obj):
        src = obj.src
        if not src:
            return "—"
        return format_html(
            '<span style="display:block;width:44px;height:30px;border-radius:5px;'
            'background:#1d1c1a center/cover url({});border:1px solid rgba(245,242,236,.12);"></span>',
            src,
        )


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
