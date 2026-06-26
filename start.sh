#!/usr/bin/env bash
# Run Django (internal :8001) and Next (public :$PORT) in one container.
# If either process exits, stop so the platform restarts the container.
set -e

# Same-container revalidation: Django pings Next at the real public port, and the
# shared secret defaults from REVALIDATE_SECRET so you only set it once.
export FRONTEND_REVALIDATE_URL="http://127.0.0.1:${PORT:-8000}/revalidate"
export FRONTEND_REVALIDATE_SECRET="${REVALIDATE_SECRET:-change-me}"

# --- Django (API + admin), internal ---
cd /app
python manage.py migrate --noinput
gunicorn config.wsgi:application --bind 127.0.0.1:8001 --workers 2 &

# --- Next.js (the public origin), proxies to BACKEND_ORIGIN=127.0.0.1:8001 ---
cd /opt/web
PORT="${PORT:-8000}" HOSTNAME="0.0.0.0" node server.js &

wait -n
exit 1
