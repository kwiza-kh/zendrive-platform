# AGENTS.md — Zendrive

## Architecture

Three-package monorepo for a premium car sales platform:

| Package | Kind | Port (dev) |
|---|---|---|
| `zendrive_backend` | FastAPI + SQLAlchemy | 8000 |
| `zendrive_user` | React 18 (CRA) + Tailwind | 3000 |
| `zendrive_admin` | React 18 (CRA) + Tailwind | 3001 |

**Vercel Serverless entry**: `zendrive_backend/api/index.py` re-exports the FastAPI `app` from `app.main`. All routes are prefixed `/api/`. The `vercel.json` rewrite rules route `/api/*`, `/docs`, and `/openapi.json` to the function.

**Frontend env vars** (build-time baked by CRA): `REACT_APP_API_BASE_URL`, `REACT_APP_STATIC_BASE_URL`.

## Dev Commands

```powershell
# Orchestrator (from repo root)
.\dev.ps1 start -Service all           # Launch all 3 services in background windows
.\dev.ps1 start -Service backend -Foreground  # Single service, current terminal
.\dev.ps1 status -Output json          # Machine-readable port/pid status
.\dev.ps1 stop -Service all -Yes       # Kill services by known ports
.\dev.ps1 install -Service all         # Idempotent: venv + pip / npm install
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
- Pool tuned for serverless: `pool_size=2`, `max_overflow=3`, `pool_recycle=300`
- SQLite uses `check_same_thread=False`

### Seeder (idempotent)
- `seed.py:init_db()` runs on every cold start. It creates tables via `Base.metadata.create_all()`, then inserts missing rows only (checks by email/name/count). To reset locally, delete `zendrive.db` and restart.
- Admin email/password are configurable via env vars but **only respected on first creation** (when the admin row doesn't exist yet).

### CORS
- Static allowlist: `localhost:3000`, `localhost:3001` (127.0.0.1 variants too) plus `EXTRA_ALLOWED_ORIGINS` env var
- Regex: `https://.*\.vercel\.app` — any Vercel preview/production domain is auto-allowed

### Upload / Blob
- Local dev writes to `uploads/` and serves via StaticFiles
- On Vercel (read-only FS), uploads go to Vercel Blob via direct HTTP PUT to `https://blob.vercel-storage.com/` (raw REST, no SDK)

### Frontends
- Both use Create React App (`react-scripts` 5.0.1), Tailwind 3, PostCSS, React Router v6
- `zendrive_admin` package.json has no `"test"` script
- `vercel.json` SPA rewrite: all paths → `/index.html`

## Testing

No tests exist in this repo. No lint/CI/pre-commit config either.

## Deployment

Three independent Vercel projects from the same repo, each with a different Root Directory. Required env vars for the backend: `SECRET_KEY`, `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`. Frontends need `REACT_APP_API_BASE_URL` and `REACT_APP_STATIC_BASE_URL`.
