from django.db import models
from django.urls import reverse
from django.utils.text import slugify


class TimeStamped(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


def _csv_list(value):
    """Split a comma-separated string into a clean list."""
    return [p.strip() for p in (value or "").split(",") if p.strip()]


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

    def get_absolute_url(self):
        return reverse("pages:project")

    @property
    def tech_list(self):
        return _csv_list(self.tech_stack)


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
    tagline = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=120, blank=True)
    timezone = models.CharField(max_length=60, blank=True)
    availability = models.CharField(max_length=120, blank=True)

    # Hero copy
    hero_prefix = models.CharField(max_length=120, blank=True)
    hero_heading = models.TextField(blank=True)
    hero_sub = models.TextField(blank=True)

    # Contact & socials
    email = models.EmailField(blank=True)
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
    resume_url = models.URLField(blank=True)

    class Meta:
        verbose_name = "Site profile"
        verbose_name_plural = "Site profile"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.pk = 1  # enforce singleton
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
