#!/usr/bin/env bash
# Rebuild the image and restart — picks up code/template/static changes.
# (collectstatic runs at build, migrate runs on container start.)
set -euo pipefail
cd "$(dirname "$0")/.."

docker compose up -d --build
echo "▸ Refreshed — portfolio running at http://localhost:8000"
docker compose ps
