#!/usr/bin/env bash
set -euo pipefail
DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DEPLOY_DIR/.." && pwd)"
USE_IMAGES=false
for arg in "$@"; do
  case "$arg" in
    --images) USE_IMAGES=true ;;
  esac
done
cd "$DEPLOY_DIR"
test -f .env || { echo "请先 cp .env.example .env"; exit 1; }
if [[ -d "$ROOT/.git" ]]; then
  (cd "$ROOT" && git pull)
fi
if [[ "$USE_IMAGES" == true ]]; then
  docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.images.yml pull || true
  docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.images.yml up -d --no-build
else
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
fi
sleep 15
curl -sf http://127.0.0.1/api/health
