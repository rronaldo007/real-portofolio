# syntax=docker/dockerfile:1
# Combined production image: the Next.js frontend (public, $PORT) and the Django
# backend (internal, 127.0.0.1:8001) in one container, so the whole v2 app runs
# as a single Sevalla service. Next proxies /api /admin /static /media to Django.

# --- 1. Build the Next.js frontend (standalone output) ---
FROM node:20-slim AS frontend
WORKDIR /fe
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- 2. Runtime: Python (Django + Gunicorn) + the node binary (Next) ---
FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    BACKEND_ORIGIN=http://127.0.0.1:8001

# node runtime for the standalone server (npm isn't needed at runtime)
COPY --from=node:20-slim /usr/local/bin/node /usr/local/bin/node

# Django at /app so the DB stays at /app/data (the existing persistent disk).
WORKDIR /app
COPY backend/requirements.txt ./requirements.txt
RUN pip install -r requirements.txt
COPY backend/ ./
RUN DJANGO_SECRET_KEY=build-only DJANGO_DEBUG=False python manage.py collectstatic --noinput

# Next standalone bundle at /opt/web (static + public copied alongside the server)
COPY --from=frontend /fe/.next/standalone /opt/web
COPY --from=frontend /fe/.next/static /opt/web/.next/static
COPY --from=frontend /fe/public /opt/web/public

COPY start.sh /start.sh

RUN useradd --uid 1000 --create-home appuser \
    && mkdir -p /app/data \
    && chown -R appuser:appuser /app /opt/web
USER appuser

EXPOSE 8000
CMD ["bash", "/start.sh"]
