#!/usr/bin/env bash
# Rebuild the image and restart — picks up code/template/static changes.
# (collectstatic runs at build, migrate runs on container start.)
set -euo pipefail
source "$(dirname "$0")/_common.sh"

banner
require_docker

info "Rebuilding the image… ${DIM}(this can take a moment)${RESET}"
docker compose --progress quiet build
info "Recreating the container…"
docker compose up -d

ok "Refreshed — live at ${BOLD}${BASE_URL}${RESET}"
printf '%s\n' "${DIM}  Static files re-collected at build; migrations applied on start.${RESET}"
printf '\n'
print_routes live
hint
