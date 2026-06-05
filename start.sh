#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
echo "Starting iume-atelier..."
(cd "$ROOT/iume-atelier-backend" && mvn spring-boot:run) &
sleep 5
(cd "$ROOT/iume-atelier-frontend" && npm run dev) &
echo "Backend: http://localhost:8080/api"
echo "Frontend: http://localhost:5173"
echo "Admin: admin / admin123"
