from django.db import migrations
from django.utils.text import slugify


PROJECTS = [
    ("Mosaic", 2026, "beta", "published", True,
     "Outil de gestion de projet pour équipes distribuées qui ne vivent pas dans leur boîte mail. Auto-hébergeable, rapide, temps réel.",
     "Lead developer", "Personnel / OSS", "https://mosaic.run", "Django, Postgres, HTMX", "mosaic"),
    ("Ledger", 2025, "live", "published", True,
     "Un tableau de bord personnel pour vos finances, qui ne parle pas à votre banque. Chaque transaction classée à la main.",
     "Lead developer", "Personnel", "", "Django, Chart.js, Tailwind", "ledger"),
    ("Roost", 2025, "oss", "published", False,
     "Un CMS open-source pour les blogs lents et les petites publications. Django + Unfold + un admin qui ne vous déteste pas.",
     "Mainteneur", "Open source", "", "Django, Unfold, OSS", "roost"),
    ("Drift", 2024, "live", "published", False,
     "Éditeur collaboratif en temps réel pour les équipes produit qui écrivent plus qu’elles ne parlent. OT à la dure.",
     "Fullstack", "Acquis en 2024", "", "Node, Socket.io, React", "drift"),
    ("Quill", 2023, "working", "draft", False,
     "Un outil d’écriture assisté par IA qui se fait discret. Les suggestions apparaissent en marge, jamais au milieu de votre phrase.",
     "Fullstack", "Personnel", "", "Next.js, OpenAI, Postgres", "quill"),
    ("Atlas", 2022, "archived", "archived", False,
     "Visualisation de données géographiques pour une ONG environnementale. Livré en sept semaines, toujours en service quatre ans plus tard.",
     "Fullstack", "ONG", "", "Django, PostGIS, Mapbox", "atlas"),
]

EXPERIENCE = [
    ("Sénior Fullstack", "Cobalt Studio", "Remote, UE", 2024, None,
     "Direction de l’équipe plateforme. Architecture, recrutement, et tout le dashboard client de bout en bout.",
     "Livré un backend Django multi-tenant servant 40k MAUs\nRefonte du dashboard en HTMX + Tailwind, JS réduit de 78%\nP50 réduit de 280ms à 42ms\nMentor de deux ingénieurs juniors",
     "Django, Node, HTMX, Postgres, Redis, AWS"),
    ("Développeur Fullstack", "Acre & Co.", "Berlin", 2022, 2024,
     "Construction de deux apps consumer de zéro. De la schéma Postgres jusqu’au déploiement en production.",
     "Conception et lancement d’une marketplace B2C de 0 à 8k users\nIntégration de Stripe Connect pour les paiements partagés\nMentoré deux juniors jusqu’à leurs premières mises en prod",
     "Django, React, Stripe, Postgres, Heroku"),
    ("Développeur Junior", "Studio K", "Lyon", 2020, 2022,
     "Mes premières armes en agence. Une dizaine de petits sites Django pour des ONG et des PME.",
     "Livré 12 sites Django + Wagtail — tous encore en ligne\nPiloté le port open-source d’un CMS interne utilisé par 4 ONG\nDébut de mes écrits publics sur l’artisanat logiciel",
     "Django, Wagtail, Linux, Nginx, jQuery"),
]

# (name, category, tier, favorite)
SKILLS = [
    ("Python", "backend", "primary", True),
    ("Django", "backend", "primary", True),
    ("PostgreSQL", "backend", "primary", True),
    ("Node", "backend", "frequent", False),
    ("FastAPI", "backend", "frequent", False),
    ("Redis", "backend", "frequent", False),
    ("Celery", "backend", "frequent", False),
    ("HTMX", "frontend", "primary", True),
    ("Tailwind", "frontend", "frequent", False),
    ("React", "frontend", "frequent", False),
    ("TypeScript", "frontend", "frequent", False),
    ("Next.js", "frontend", "occasional", False),
    ("Docker", "tooling", "primary", True),
    ("AWS", "tooling", "frequent", False),
    ("Git", "tooling", "primary", False),
    ("Nginx", "tooling", "frequent", False),
    ("GitHub Actions", "tooling", "frequent", False),
    ("Linux", "tooling", "frequent", False),
]

TESTIMONIALS = [
    ("Rukundo livre du logiciel qui semble pensé pour durer — propre, calme, et toujours un cran plus soigné que demandé.",
     "Camille Roy", "CTO · Cobalt Studio"),
    ("Le genre d’ingénieur qui comprend le produit autant que le code. Nos délais ont fondu quand il a rejoint l’équipe.",
     "Jonas Weber", "Head of Product · Acre & Co."),
    ("Il a transformé un admin Django banal en quelque chose dont l’équipe se sert avec plaisir. Rare.",
     "Aïcha Ndiaye", "Lead Designer · Studio K"),
]


def seed(apps, schema_editor):
    Project = apps.get_model("pages", "Project")
    Experience = apps.get_model("pages", "Experience")
    Skill = apps.get_model("pages", "Skill")
    Testimonial = apps.get_model("pages", "Testimonial")
    SiteProfile = apps.get_model("pages", "SiteProfile")

    if Project.objects.exists():
        return  # don't double-seed

    for i, p in enumerate(PROJECTS):
        (title, year, badge, status, featured, desc, role, client, live, stack, card) = p
        Project.objects.create(
            title=title, slug=slugify(title), year=year, badge=badge, status=status,
            featured=featured, short_description=desc, role=role, client=client,
            live_url=live, tech_stack=stack, card_style=card, order=i,
        )

    for i, e in enumerate(EXPERIENCE):
        (role, company, loc, start, end, desc, highlights, stack) = e
        Experience.objects.create(
            role=role, company=company, location=loc, start_year=start, end_year=end,
            description=desc, highlights=highlights, stack=stack, order=i,
        )

    for i, s in enumerate(SKILLS):
        name, category, tier, fav = s
        Skill.objects.create(name=name, category=category, tier=tier, favorite=fav, order=i)

    for i, t in enumerate(TESTIMONIALS):
        quote, author, role = t
        Testimonial.objects.create(quote=quote, author=author, author_role=role, order=i)

    SiteProfile.objects.create(
        id=1,
        name="Rukundo Ronaldo",
        tagline="Je conçois des outils, du backend au pixel — et tout entre les deux.",
        bio="Six ans à construire des produits de bout en bout — surtout en Python avec Django, "
            "le reste en Node, TypeScript et les coins de Tailwind qui rendent les designers heureux.",
        location="Lyon · France",
        timezone="UTC+01:00",
        availability="Disponible · août ’26",
        hero_prefix="— 👋 Salut, c’est Rukundo.",
        hero_heading="Je conçois des outils, du backend au pixel — et tout entre les deux.",
        hero_sub="Backends et interfaces avec Django, Node et un faible pour HTMX.",
        email="hello@rukundo.dev",
        github_url="https://github.com/rukundo",
        linkedin_url="https://linkedin.com/in/rukundo",
        accent_color="#c084fc",
    )


def unseed(apps, schema_editor):
    for model in ("Project", "Experience", "Skill", "Testimonial", "SiteProfile"):
        apps.get_model("pages", model).objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [("pages", "0001_initial")]

    operations = [migrations.RunPython(seed, unseed)]
