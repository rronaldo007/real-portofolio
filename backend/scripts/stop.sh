#!/usr/bin/env bash
# Stop the portfolio container. Pass --wipe to also drop the SQLite volume.
set -euo pipefail
source "$(dirname "$0")/_common.sh"

banner
require_docker

if [[ "${1:-}" == "--wipe" ]]; then
  warn "Stopping and removing the SQLite volume (all DB data will be lost)…"
  docker compose down -v
  ok "Stopped. Volume ${BOLD}sqlite_data${RESET} removed."
else
  info "Stopping the portfolio container…"
  docker compose down
  ok "Stopped. SQLite data kept in the ${BOLD}sqlite_data${RESET} volume."
  printf '%s\n' "${DIM}  Run with --wipe to also drop the database volume.${RESET}"
fi

printf '\n'
printf '%s\n' "${BOLD}  Next${RESET}"
printf '    %sscripts/start.sh%s    start it again\n\n' "$DIM" "$RESET"
