# syntax=docker/dockerfile:1

FROM python:3.13-slim AS base

# - no .pyc files, unbuffered stdout/stderr for clean container logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install dependencies first so the layer caches across code changes.
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the project.
COPY . .

# Collect static files into STATIC_ROOT (WhiteNoise serves them at runtime).
# A dummy key is fine here — collectstatic touches no secrets or the DB.
RUN DJANGO_SECRET_KEY=build-only DJANGO_DEBUG=False \
    python manage.py collectstatic --noinput

# Run as an unprivileged user. Create the data/ dir (SQLite + volume mount point)
# and hand /app to that user so a named volume inherits the right ownership.
RUN useradd --create-home --uid 1000 appuser \
    && mkdir -p /app/data \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Apply migrations, then serve with Gunicorn.
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3"]
