#!/usr/bin/env bash
# Start the portfolio in Docker (detached). Builds the image on first run.
set -euo pipefail
cd "$(dirname "$0")/.."

docker compose up -d
echo "▸ Portfolio running at http://localhost:8000"
docker compose ps
