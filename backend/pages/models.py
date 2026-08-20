import os
from django.db import models
from django.utils.text import slugify


class TimeStamped(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


def _csv_list(value):
    """Split a comma-separated string into a clean list."""
    return [p.strip() for p in (value or "").split(",") if p.strip()]


class Accent(models.TextChoices):
    """The four neon accents of the v2 "Mission Control" design system."""

    VIOLET = "violet", "Violet"
    CYAN = "cyan", "Cyan"
    LIME = "lime", "Lime"
    PINK = "pink", "Pink"


class Project(TimeStamped):
    """A portfolio project — drives the home grid and the case-study page."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        ARCHIVED = "archived", "Archived"

    class Badge(models.TextChoices):
        LIVE = "live", "En production"
        BETA = "beta", "En bêta"
        WORKING = "working", "En cours"
        OSS = "oss", "Open source"
        ARCHIVED = "archived", "Archivé"

    # Card gradient styles defined in static/css/shared.css (.img-mosaic, …).
    class CardStyle(models.TextChoices):
        MOSAIC = "mosaic", "Mosaic"
        LEDGER = "ledger", "Ledger"
        ROOST = "roost", "Roost"
        DRIFT = "drift", "Drift"
        QUILL = "quill", "Quill"
        ATLAS = "atlas", "Atlas"

    # Basics
    title = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    year = models.PositiveIntegerField()
    short_description = models.TextField(help_text="120–180 chars · used in cards")
    role = models.CharField(max_length=120, blank=True)
    client = models.CharField(max_length=120, blank=True)
    live_url = models.URLField(blank=True)
    repo_url = models.URLField(blank=True)
    tech_stack = models.CharField(
        max_length=300, blank=True, help_text="Comma-separated, e.g. Django, Postgres, HTMX"
    )

    # Cover & media
    cover_image_url = models.URLField(blank=True)
    card_style = models.CharField(
        max_length=20, choices=CardStyle.choices, default=CardStyle.MOSAIC,
        help_text="Gradient style for the card background",
    )

    # v2 "Mission Control" fields
    accent = models.CharField(
        max_length=8, choices=Accent.choices, default=Accent.VIOLET,
        help_text="Neon accent used by the v2 design",
    )
    category = models.CharField(
        max_length=80, blank=True, help_text="v2 card category, e.g. “Full-stack · SaaS”"
    )
    lead = models.CharField(
        max_length=240, blank=True,
        help_text="v2 punchy one-liner; falls back to short_description",
    )
    highlights = models.TextField(blank=True, help_text="v2 case-study highlights, one per line")

    # Case study
    case_study_body = models.TextField(blank=True, help_text="Markdown")

    # SEO & meta
    meta_title = models.CharField(max_length=180, blank=True)
    meta_description = models.CharField(max_length=300, blank=True)

    # Settings / status
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    badge = models.CharField(max_length=20, choices=Badge.choices, default=Badge.WORKING)
    featured = models.BooleanField(default=False, help_text="Featured on home")
    show_in_index = models.BooleanField(default=True, help_text="Show in the work index")
    open_source = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "-year", "title"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @property
    def tech_list(self):
        return _csv_list(self.tech_stack)

    @property
    def highlight_list(self):
        return [line.strip() for line in self.highlights.splitlines() if line.strip()]


class ProjectShot(models.Model):
    """A screenshot in a project's v2 case-study gallery."""

    project = models.ForeignKey(Project, related_name="shots", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="projects/shots/", blank=True)
    image_url = models.URLField(blank=True, help_text="Fallback if no file uploaded")
    caption = models.CharField(max_length=160, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.caption or f"Shot #{self.pk}"

    @property
    def src(self):
        return self.image.url if self.image else self.image_url


class ProjectSection(models.Model):
    """One titled chapter of a case study: a heading, a body and a screenshot.

    The v2 project page renders these in order, alternating the image side, so a
    project can be documented properly instead of collapsing into one blob.
    """

    project = models.ForeignKey(Project, related_name="sections", on_delete=models.CASCADE)
    title = models.CharField(max_length=120)
    body = models.TextField(blank=True, help_text="Markdown: ## headings, - bullets, **bold**, `code`")
    image = models.ImageField(upload_to="projects/sections/", blank=True)
    image_url = models.URLField(blank=True, help_text="Fallback if no file uploaded")
    caption = models.CharField(max_length=160, blank=True, help_text="Shown under the screenshot")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.project.title} — {self.title}"

    @property
    def src(self):
        return self.image.url if self.image else self.image_url


class SectionMedia(models.Model):
    """An extra screenshot, diagram or downloadable document inside a section.

    A section keeps its single lead image for the two-column layout; anything
    added here is rendered below it — images as a grid, documents as a list of
    download links.
    """

    section = models.ForeignKey(ProjectSection, related_name="media", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="projects/sections/", blank=True)
    image_url = models.URLField(blank=True, help_text="Fallback if no image file uploaded")
    document = models.FileField(
        upload_to="projects/documents/", blank=True,
        help_text="PDF or any file offered for download (takes precedence over the image)",
    )
    caption = models.CharField(max_length=160, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name_plural = "section media"

    def __str__(self):
        return self.caption or os.path.basename(self.src or "") or f"Media #{self.pk}"

    @property
    def kind(self):
        return "document" if self.document else "image"

    @property
    def src(self):
        if self.document:
            return self.document.url
        if self.image:
            return self.image.url
        return self.image_url

    @property
    def name(self):
        """Filename shown on a download link."""
        if self.document:
            return os.path.basename(self.document.name)
        return self.caption

    @property
    def size(self):
        """Human-readable size, empty when the file is gone from disk."""
        f = self.document or self.image
        if not f:
            return ""
        try:
            n = f.size
        except (OSError, ValueError):
            return ""
        for unit in ("o", "ko", "Mo"):
            if n < 1024 or unit == "Mo":
                return f"{n:.0f} {unit}" if unit == "o" else f"{n:.1f} {unit}"
            n /= 1024
        return ""


class ProjectMetric(models.Model):
    """A concrete outcome shown in the case-study hero (e.g. “14 teams”)."""

    project = models.ForeignKey(Project, related_name="metrics", on_delete=models.CASCADE)
    label = models.CharField(max_length=80)
    value = models.CharField(max_length=40)
    unit = models.CharField(max_length=40, blank=True, help_text="Suffix, e.g. ms, teams")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.label}: {self.value}{self.unit}"


class Experience(TimeStamped):
    """A career entry."""

    role = models.CharField(max_length=120)
    company = models.CharField(max_length=120)
    location = models.CharField(max_length=120, blank=True)
    start_year = models.PositiveIntegerField()
    end_year = models.PositiveIntegerField(
        null=True, blank=True, help_text="Leave empty for “Present”"
    )
    description = models.TextField(blank=True)
    highlights = models.TextField(blank=True, help_text="One highlight per line")
    stack = models.CharField(max_length=300, blank=True, help_text="Comma-separated")
    accent = models.CharField(max_length=8, choices=Accent.choices, default=Accent.VIOLET)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "-start_year"]
        verbose_name_plural = "Experience"

    def __str__(self):
        return f"{self.role} · {self.company}"

    @property
    def period(self):
        return f"{self.start_year} — {self.end_year or 'Présent'}"

    @property
    def highlight_list(self):
        return [line.strip() for line in self.highlights.splitlines() if line.strip()]

    @property
    def stack_list(self):
        return _csv_list(self.stack)


class Education(TimeStamped):
    """A formation / diploma entry — drives the home "Formation" section."""

    degree = models.CharField(max_length=160, help_text="e.g. Bachelor — Développement Web")
    school = models.CharField(max_length=120)
    field = models.CharField(
        max_length=160, blank=True,
        help_text="Sub-line, e.g. “Titre RNCP niveau 7 (Bac+5)”",
    )
    location = models.CharField(max_length=120, blank=True)
    start_year = models.PositiveIntegerField()
    end_year = models.PositiveIntegerField(
        null=True, blank=True, help_text="Leave empty for “Present”"
    )
    description = models.TextField(blank=True)
    # v2 "clearance card" fields
    rncp_level = models.CharField(
        max_length=24, blank=True, help_text="e.g. “RNCP 7” — shown as a clearance level"
    )
    status_label = models.CharField(
        max_length=40, blank=True, help_text="e.g. “En cours”, “Visé 2026”"
    )
    accent = models.CharField(max_length=8, choices=Accent.choices, default=Accent.CYAN)
    is_target = models.BooleanField(
        default=False, help_text="Highlight as the formation being targeted"
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "-start_year"]
        verbose_name = "Education"
        verbose_name_plural = "Education"

    def __str__(self):
        return f"{self.degree} · {self.school}"

    @property
    def period(self):
        return f"{self.start_year} — {self.end_year or 'Présent'}"


class Skill(TimeStamped):
    """A single skill/tool, grouped by category and tier."""

    class Category(models.TextChoices):
        BACKEND = "backend", "Backend"
        FRONTEND = "frontend", "Frontend"
        TOOLING = "tooling", "Tooling & infra"

    class Tier(models.TextChoices):
        PRIMARY = "primary", "Au quotidien"
        FREQUENT = "frequent", "Fréquent"
        OCCASIONAL = "occasional", "Occasionnel"

    name = models.CharField(max_length=80)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.BACKEND)
    tier = models.CharField(max_length=20, choices=Tier.choices, default=Tier.FREQUENT)
    favorite = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["category", "order", "name"]

    def __str__(self):
        return self.name


class Testimonial(TimeStamped):
    """A short quote from a collaborator."""

    quote = models.TextField()
    author = models.CharField(max_length=120)
    author_role = models.CharField(max_length=160, blank=True, help_text="Role · company")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.author


class ContactMessage(TimeStamped):
    """A submission from the public contact form."""

    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=160, blank=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} <{self.email}>"


class SiteProfile(TimeStamped):
    """Singleton holding profile, hero copy, contact, branding and resume."""

    class Theme(models.TextChoices):
        DARK = "dark", "Dark"
        LIGHT = "light", "Light"
        SYSTEM = "system", "System"

    class HomeVariant(models.TextChoices):
        ATELIER = "atelier", "Atelier · editorial"
        ETUDES = "etudes", "Études · grid"

    # Profile
    name = models.CharField(max_length=120, default="Rukundo Ronaldo")
    # v2 logo mark "R²" + map telemetry coordinates
    logo_text = models.CharField(max_length=8, default="R")
    logo_super = models.CharField(max_length=4, default="2")
    lat = models.CharField(max_length=16, blank=True, default="45.7640")
    lon = models.CharField(max_length=16, blank=True, default="4.8357")
    photo = models.ImageField(
        upload_to="profile/", blank=True,
        help_text="Portrait shown in the À propos section (uploaded file). Takes priority over Photo URL.",
    )
    photo_url = models.URLField(blank=True, help_text="Fallback portrait URL, used only if no file is uploaded above")
    tagline = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True, help_text="One paragraph per line")
    location = models.CharField(max_length=120, blank=True)
    timezone = models.CharField(max_length=60, blank=True)
    availability = models.CharField(max_length=120, blank=True)

    # Hero copy
    hero_prefix = models.CharField(max_length=120, blank=True)
    hero_heading = models.TextField(blank=True)
    hero_sub = models.TextField(blank=True)

    # Contact & socials
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=32, blank=True, help_text="Display format, e.g. 06 16 20 34 95")
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    dribbble_url = models.URLField(blank=True)

    # Theme & branding
    accent_color = models.CharField(max_length=9, default="#c084fc", help_text="Hex")
    default_theme = models.CharField(max_length=10, choices=Theme.choices, default=Theme.DARK)
    home_variant = models.CharField(
        max_length=10, choices=HomeVariant.choices, default=HomeVariant.ATELIER,
        help_text="Which home layout to serve at /",
    )

    # Resume / CV
    # CharField, not URLField: the CV is served by the frontend from /cv/… as a
    # site-relative path (the intended default), which URLField rejects. Accepts
    # either a relative path (/cv/Rukundo-Ronaldo-CV.pdf) or a full external URL.
    resume_url = models.CharField(
        max_length=300,
        blank=True,
        help_text="Site-relative path (e.g. /cv/Rukundo-Ronaldo-CV.pdf) or a full URL.",
    )

    class Meta:
        verbose_name = "Site profile"
        verbose_name_plural = "Site profile"

    def __str__(self):
        return self.name

    @property
    def photo_src(self):
        """The portrait to render: the uploaded file if present, else the URL fallback."""
        if self.photo:
            return self.photo.url
        return self.photo_url

    def save(self, *args, **kwargs):
        self.pk = 1  # enforce singleton
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class Section(TimeStamped):
    """A v2 home section — drives both the nav pill and the section header.

    The frontend reads ``number``/``nav_label``/``title``/``accent`` to render the
    "NN / SECTION" eyebrow and the sliding-indicator nav, and toggles visibility
    with ``is_enabled``.
    """

    key = models.SlugField(
        unique=True,
        help_text="Stable id, e.g. about, stack, work, log, edu, ai, gallery, contact",
    )
    nav_label = models.CharField(max_length=24)
    number = models.PositiveIntegerField(help_text="Shown as the eyebrow index, e.g. 01")
    title = models.CharField(max_length=120, blank=True)
    accent = models.CharField(max_length=8, choices=Accent.choices, default=Accent.VIOLET)
    is_enabled = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.number:02d} · {self.nav_label}"


class Photo(TimeStamped):
    """A standalone gallery photo (the v2 mosaic + lightbox)."""

    image = models.ImageField(upload_to="gallery/", blank=True)
    image_url = models.URLField(blank=True, help_text="Fallback if no file uploaded")
    caption = models.CharField(max_length=160, blank=True)
    taken = models.CharField(max_length=24, blank=True, help_text="e.g. “Lyon · 2025”")
    span = models.CharField(
        max_length=8, blank=True,
        help_text="Mosaic span: '', 'cw' (col-wide), 'rh' (row-tall), 'cwrh' (both)",
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self):
        return self.caption or f"Photo #{self.pk}"

    @property
    def src(self):
        return self.image.url if self.image else self.image_url
