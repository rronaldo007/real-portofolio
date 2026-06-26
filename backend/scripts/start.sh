#!/usr/bin/env bash
# Start the portfolio in Docker (detached). Builds the image on first run.
set -euo pipefail
source "$(dirname "$0")/_common.sh"

# Provision the admin inside the running container. Idempotent: only creates
# when DJANGO_SUPERUSER_PASSWORD is set (.env) and the user doesn't yet exist —
# never touches an existing user, so it's safe to run on every start.
ensure_admin() {
  info "Ensuring the admin user…"

  # The container runs `migrate` on start; wait for the auth tables to appear
  # before we poke the DB (avoids a race on a fresh volume).
  local ready="" i
  for i in $(seq 1 30); do
    if docker compose exec -T web python manage.py shell -c \
        "from django.db import connection; connection.cursor().execute('SELECT 1 FROM auth_user LIMIT 1')" \
        >/dev/null 2>&1; then
      ready=1; break
    fi
    sleep 1
  done
  if [[ -z "$ready" ]]; then
    warn "Database not ready in time — skipping admin creation."
    return 0
  fi

  docker compose exec -T web python manage.py shell <<'PY'
import os
from django.contrib.auth import get_user_model

User = get_user_model()
username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "")
email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "")

if not (username and password):
    print("Skipped: set DJANGO_SUPERUSER_PASSWORD in .env to auto-create an admin.")
elif User.objects.filter(username=username).exists():
    print(f"Superuser '{username}' already exists — left untouched.")
else:
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"Superuser '{username}' created.")
PY
}

banner
require_docker

info "Starting the portfolio container…"
docker compose up -d

ensure_admin

ok "Up and running at ${BOLD}${BASE_URL}${RESET}"
printf '\n'
print_routes live
hint
