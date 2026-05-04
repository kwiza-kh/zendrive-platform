# AGENTS.md — Zendrive

## Architecture

Three-package monorepo for a premium car sales platform, deployed via Docker Compose:

| Package | Kind | Port (dev) | Port (Docker) |
|---|---|---|---|
| `zendrive_backend` | FastAPI + SQLAlchemy | 8000 | 8000 (internal) |
| `zendrive_user` | React 18 (CRA) + Tailwind | 3000 | 80 (internal) |
| `zendrive_admin` | React 18 (CRA) + Tailwind | 3001 | 80 (internal) |

**Deployment**: Docker Compose with Nginx reverse proxy. User site on port 80, admin console on port 8080.

**Frontend env vars** (build-time baked by CRA): `REACT_APP_API_BASE_URL`, `REACT_APP_STATIC_BASE_URL`.

## Dev Commands

```powershell
# Local dev orchestrator (from repo root)
.\dev.ps1 start -Service all           # Launch all 3 services in background windows
.\dev.ps1 start -Service backend -Foreground  # Single service, current terminal
.\dev.ps1 status -Output json          # Machine-readable port/pid status
.\dev.ps1 stop -Service all -Yes       # Kill services by known ports
.\dev.ps1 install -Service all         # Idempotent: venv + pip / npm install

# Docker production (from repo root)
docker compose up -d --build           # Build and start all services
docker compose down                    # Stop all services
docker compose logs -f                 # View logs
```

Backend local dev uses SQLite (`zendrive_backend/zendrive.db`) and `uploads/`. On first run the idempotent seeder creates an admin account, brands, body types, 8 sample cars, and default contact info.

## Key Gotchas

### Auth / token storage
- **User frontend** uses localStorage key `token` (and `user`)
- **Admin frontend** uses localStorage key `admin_token` (and `admin_user`)
- Admin API routes require the `require_admin` dependency — `is_admin=True` on the user row
- bcrypt truncates passwords to 72 chars in `auth.py:hash_password()`

### Database
- `config.py:_normalize_db_url()` converts `postgres://` → `postgresql://` and strips `channel_binding=` from the query string (Neon/Supabase URLs)
- Pool sized for long-running server: `pool_size=10`, `max_overflow=20`, `pool_recycle=300`
- SQLite uses `check_same_thread=False`

### Seeder (idempotent)
- `seed.py:init_db()` runs on every cold start. It creates tables via `Base.metadata.create_all()`, then inserts missing rows only (checks by email/name/count). To reset locally, delete `zendrive.db` and restart.
- Admin email/password are configurable via env vars but **only respected on first creation** (when the admin row doesn't exist yet).

### CORS
- Static allowlist: `localhost:3000`, `localhost:3001` (127.0.0.1 variants too) plus `EXTRA_ALLOWED_ORIGINS` env var

### Upload
- Writes to `uploads/` directory and serves via FastAPI StaticFiles
- In Docker, uploads are persisted in `./data/uploads/` via Docker volume mount

### Frontends
- Both use Create React App (`react-scripts` 5.0.1), Tailwind 3, PostCSS, React Router v6
- `zendrive_admin` package.json has no `"test"` script
- SPA routing handled by nginx `try_files` in each frontend's `nginx.conf`

## Testing

No tests exist in this repo. No lint/CI/pre-commit config either.

## Deployment

Docker Compose orchestrates 4 services: backend (gunicorn), user (nginx), admin (nginx), nginx (reverse proxy). User site on port 80, admin on port 8080. Required env vars in root `.env`: `SECRET_KEY`, `DATABASE_URL` (optional, defaults to SQLite), `REACT_APP_API_BASE_URL`. Data persists in `./data/` (uploads + database).
