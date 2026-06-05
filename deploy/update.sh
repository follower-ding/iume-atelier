#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

SKIP_PULL=false
USE_IMAGES=false

for arg in "$@"; do
  case $arg in
    --skip-pull) SKIP_PULL=true ;;
    --images) USE_IMAGES=true ;;
  esac
done

if [ "$SKIP_PULL" = false ]; then
  git pull
fi

./scripts/apply-migrations.sh

COMPOSE_FILES="-f docker-compose.yml -f docker-compose.prod.yml"
if [ "$USE_IMAGES" = true ]; then
  COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.images.yml"
  docker compose $COMPOSE_FILES pull
fi

docker compose $COMPOSE_FILES up -d --no-build
curl -sf http://127.0.0.1/api/health
echo "Deploy complete."
