#!/usr/bin/env bash
# Shared helpers for the portfolio scripts: colors, URLs, banners, checks.

# Always operate from the repo root (parent of scripts/).
cd "$(dirname "${BASH_SOURCE[0]}")/.."

PORT="${PORT:-8000}"
BASE_URL="http://localhost:${PORT}"

# Colors — only when stdout is a terminal.
if [[ -t 1 ]]; then
  BOLD=$'\033[1m'; DIM=$'\033[2m'; RESET=$'\033[0m'
  GREEN=$'\033[32m'; CYAN=$'\033[36m'; YELLOW=$'\033[33m'; RED=$'\033[31m'; MAGENTA=$'\033[35m'
else
  BOLD=""; DIM=""; RESET=""; GREEN=""; CYAN=""; YELLOW=""; RED=""; MAGENTA=""
fi

info()  { printf '%s\n' "${CYAN}▸${RESET} $*"; }
ok()    { printf '%s\n' "${GREEN}✔${RESET} $*"; }
warn()  { printf '%s\n' "${YELLOW}!${RESET} $*"; }
err()   { printf '%s\n' "${RED}✖${RESET} $*" >&2; }

banner() {
  printf '\n%s\n' "${MAGENTA}${BOLD}  Rukundo Ronaldo — Portfolio${RESET}  ${DIM}· Django + Docker${RESET}"
  printf '%s\n\n' "${DIM}  ──────────────────────────────────────────${RESET}"
}

# Fail early with a clear message if Docker isn't usable.
require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    err "Docker is not installed or not on PATH."
    exit 1
  fi
  if ! docker info >/dev/null 2>&1; then
    err "Docker daemon isn't running. Start Docker Desktop and try again."
    exit 1
  fi
}

# Print the route map. Pass "live" to print clickable full URLs.
print_routes() {
  local mode="${1:-paths}"
  local rows=(
    "/|Home — Atelier (primary)"
    "/etudes/|Home — Études (alternate)"
    "/project/|Project detail"
    "/dashboard/|Dashboard mockup"
    "/design-system/|Style guide"
    "/nav-options/|Nav explorations"
    "/admin/|Django admin"
  )
  printf '%s\n' "${BOLD}  Routes${RESET}"
  local path label
  for row in "${rows[@]}"; do
    path="${row%%|*}"; label="${row#*|}"
    if [[ "$mode" == "live" ]]; then
      printf '    %s%-38s%s %s%s%s\n' "$CYAN" "${BASE_URL}${path}" "$RESET" "$DIM" "$label" "$RESET"
    else
      printf '    %s%-16s%s %s%s%s\n' "$CYAN" "$path" "$RESET" "$DIM" "$label" "$RESET"
    fi
  done
  printf '\n'
}

hint() {
  printf '%s\n' "${BOLD}  Next${RESET}"
  printf '    %sscripts/refresh.sh%s  rebuild & restart after changes\n' "$DIM" "$RESET"
  printf '    %sscripts/stop.sh%s     stop the container\n' "$DIM" "$RESET"
  printf '    %sdocker compose logs -f%s   follow logs\n\n' "$DIM" "$RESET"
}
