#!/usr/bin/env bash
# Start the portfolio in Docker (detached). Builds the image on first run.
set -euo pipefail
source "$(dirname "$0")/_common.sh"

banner
require_docker

info "Starting the portfolio container…"
docker compose up -d

ok "Up and running at ${BOLD}${BASE_URL}${RESET}"
printf '\n'
print_routes live
hint
