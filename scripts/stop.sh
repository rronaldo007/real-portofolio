#!/usr/bin/env bash
# Stop the portfolio container. Pass --wipe to also drop the SQLite volume.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ "${1:-}" == "--wipe" ]]; then
  docker compose down -v
  echo "▸ Stopped and removed the SQLite volume."
else
  docker compose down
  echo "▸ Stopped. (data/ SQLite volume kept — use --wipe to remove it.)"
fi
