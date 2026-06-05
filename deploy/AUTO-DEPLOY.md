# Auto Deploy Guide — iume-atelier

## Server Setup

1. SSH to `49.235.172.214` as `iume`
2. Clone repo to `/opt/iume-atelier`
3. Copy configs:
   ```bash
   cp deploy/.env.example deploy/.env
   cp deploy/repo.env.example deploy/repo.env
   ```
4. Edit `deploy/.env` — set `JWT_SECRET`, MySQL passwords, `APP_VERSION`
5. First deploy:
   ```bash
   cd /opt/iume-atelier/deploy
   docker compose up -d --build
   ```

## GitHub Secrets (Repository Settings)

| Secret | Value |
|--------|-------|
| `DEPLOY_HOST` | `49.235.172.214` |
| `DEPLOY_USER` | `iume` |
| `DEPLOY_SSH_KEY` | Private SSH key for deploy |
| `DEPLOY_PATH` | `/opt/iume-atelier/deploy` |
| `GHCR_READ_TOKEN` | GitHub PAT with `read:packages` |

## CD Flow

1. Push to `main`
2. GitHub Actions builds & pushes images to GHCR
3. SSH deploy runs `update.sh --images`
4. Verify: `curl http://127.0.0.1/api/health`

## After First Deploy

Every `git push` to `main` = automatic release.

Update `RELEASE.md` and `APP_VERSION` before each release.
