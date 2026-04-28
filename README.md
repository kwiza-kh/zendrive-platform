# Zendrive — Premium Car Sales Platform

A modern, full-stack car sales website with three parts:

- **`zendrive_backend`** — FastAPI + SQLAlchemy REST API (deployed as a single Vercel Python Serverless Function)
- **`zendrive_user`** — React customer-facing storefront
- **`zendrive_admin`** — React admin console

> Tagline: *Drive the Future. Own the Road.*

## Tech Stack

| Layer        | Tech                                                        |
| ------------ | ----------------------------------------------------------- |
| Frontend     | React 18, React Router v6, Tailwind CSS, Axios, React Icons |
| Backend      | FastAPI, SQLAlchemy 2, Postgres (Neon) / SQLite (local)     |
| Storage      | Vercel Blob (production) / local `uploads/` (dev)           |
| Auth         | JWT (python-jose) + bcrypt                                  |

## Local Development (Windows PowerShell)

Open **3 terminals**.

### 1) Backend — `http://localhost:8000`

```powershell
cd zendrive_backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```

Local dev uses SQLite (`zendrive.db`) and the local `uploads/` folder. The first run auto-creates an admin account, brands, body types and 8 sample cars.

API docs: <http://localhost:8000/docs>

### 2) User Frontend — `http://localhost:3000`

```powershell
cd zendrive_user
npm install
npm start
```

### 3) Admin Frontend — `http://localhost:3001`

```powershell
cd zendrive_admin
npm install
npm start
```

## Default Admin Credentials

| Field    | Value                |
| -------- | -------------------- |
| Email    | `admin@zendrive.com` |
| Password | `Zendrive@2026`      |

> Change them via `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars **before the first deploy** — the seeder only respects them on first run, when the admin row is created.

---

## Deploying to Vercel

This repo is structured as **three independent Vercel projects** (one per directory). They share a single GitHub repo. Recommended setup:

| Project                | Root directory       | Framework preset   | Build / output         |
| ---------------------- | -------------------- | ------------------ | ---------------------- |
| `zendrive-api`         | `zendrive_backend`   | Other              | (auto, Python)         |
| `zendrive-user`        | `zendrive_user`      | Create React App   | `npm run build` → `build` |
| `zendrive-admin`       | `zendrive_admin`     | Create React App   | `npm run build` → `build` |

### Step 1 — Create the GitHub repo

```powershell
cd c:\Users\b1783\OneDrive\桌面\新建文件夹\Zendrive
git init
git add .
git commit -m "Initial commit: Zendrive monorepo"
gh repo create zendrive --public --source . --remote origin --push
```

### Step 2 — Provision a Postgres database

Anywhere that gives you a `postgresql://` URL works (Neon, Supabase, Railway, RDS).
Easiest path on Vercel:

1. Open your Vercel dashboard → **Storage** → **Create Database** → choose **Neon** (Postgres).
2. Attach it to the `zendrive-api` project. Vercel auto-injects `DATABASE_URL`.

### Step 3 — Provision Vercel Blob (image uploads)

1. Vercel dashboard → **Storage** → **Create** → **Blob**.
2. Attach it to `zendrive-api`. Vercel auto-injects `BLOB_READ_WRITE_TOKEN`.

> `/api/upload` automatically uses Vercel Blob whenever `BLOB_READ_WRITE_TOKEN` is set or the function is running on Vercel. Locally it falls back to `uploads/`.

### Step 4 — Deploy the backend (`zendrive-api`)

In Vercel → **Add New… → Project** → import the GitHub repo, then:

- **Root Directory**: `zendrive_backend`
- **Framework Preset**: *Other*
- **Environment Variables**:

  | Key                          | Value                                         |
  | ---------------------------- | --------------------------------------------- |
  | `SECRET_KEY`                 | a long random string                          |
  | `ADMIN_EMAIL`                | `admin@zendrive.com` (or your own)            |
  | `ADMIN_PASSWORD`             | a strong password                             |
  | `ACCESS_TOKEN_EXPIRE_MINUTES`| `1440`                                        |
  | `DATABASE_URL`               | auto-injected by the Postgres integration     |
  | `BLOB_READ_WRITE_TOKEN`      | auto-injected by the Blob integration         |
  | `EXTRA_ALLOWED_ORIGINS`      | (optional) custom domains, comma-separated    |

Deploy. After the first request, the seeder creates the admin user, brands, body types and sample cars in Postgres.

Note your API URL — e.g. `https://zendrive-api.vercel.app`.

### Step 5 — Deploy the user frontend (`zendrive-user`)

Add another Vercel project from the same repo:

- **Root Directory**: `zendrive_user`
- **Framework Preset**: *Create React App*
- **Environment Variables**:

  | Key                            | Value                                |
  | ------------------------------ | ------------------------------------ |
  | `REACT_APP_API_BASE_URL`       | `https://zendrive-api.vercel.app`    |
  | `REACT_APP_STATIC_BASE_URL`    | `https://zendrive-api.vercel.app`    |

### Step 6 — Deploy the admin frontend (`zendrive-admin`)

Same as Step 5, but with **Root Directory** `zendrive_admin`.

### Step 7 — Lock down CORS (optional)

`zendrive_backend/app/main.py` already allows any `*.vercel.app` origin. If you put the frontends on custom domains, add them to `EXTRA_ALLOWED_ORIGINS` (comma-separated) on the API project and redeploy.

---

## Vercel CLI alternative (no GitHub UI)

```powershell
npm i -g vercel
vercel login

# Backend
cd zendrive_backend
vercel link
vercel env add DATABASE_URL          # paste Neon URL
vercel env add BLOB_READ_WRITE_TOKEN # paste token
vercel env add SECRET_KEY
vercel env add ADMIN_PASSWORD
vercel --prod

# User frontend
cd ..\zendrive_user
vercel link
vercel env add REACT_APP_API_BASE_URL
vercel env add REACT_APP_STATIC_BASE_URL
vercel --prod

# Admin frontend
cd ..\zendrive_admin
vercel link
vercel env add REACT_APP_API_BASE_URL
vercel env add REACT_APP_STATIC_BASE_URL
vercel --prod
```

---

## Project Structure

```
Zendrive/
├── zendrive_backend/
│   ├── api/index.py         # Vercel Serverless entry → re-exports FastAPI app
│   ├── vercel.json          # Routes /api/* and /docs to the function
│   ├── app/
│   │   ├── main.py          # FastAPI app + endpoints (CORS, Blob upload)
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── auth.py          # JWT + bcrypt helpers
│   │   ├── seed.py          # Idempotent sample-data seeder
│   │   ├── config.py        # Env-driven settings (Postgres URL normalizer)
│   │   └── database.py      # Engine + session (pool tuned for serverless)
│   ├── requirements.txt
│   └── run.py
├── zendrive_user/
│   ├── vercel.json          # SPA fallback rewrite to /index.html
│   ├── public/
│   ├── src/
│   └── package.json
└── zendrive_admin/
    ├── vercel.json
    ├── src/
    └── package.json
```

## Key API Endpoints

| Method | Path                       | Auth     | Purpose                |
| ------ | -------------------------- | -------- | ---------------------- |
| POST   | `/api/auth/register`       | —        | Create user            |
| POST   | `/api/auth/login`          | —        | Login (JWT)            |
| GET    | `/api/auth/me`             | User     | Current profile        |
| GET    | `/api/cars`                | —        | List + filter cars     |
| GET    | `/api/cars/{slug}`         | —        | Car detail             |
| POST   | `/api/cars`                | Admin    | Create car             |
| PUT    | `/api/cars/{id}`           | Admin    | Update car             |
| DELETE | `/api/cars/{id}`           | Admin    | Delete car             |
| GET    | `/api/brands`              | —        | List brands            |
| POST   | `/api/brands`              | Admin    | Create brand           |
| POST   | `/api/inquiries`           | —        | Public inquiry submit  |
| GET    | `/api/inquiries`           | Admin    | List inquiries         |
| PUT    | `/api/inquiries/{id}`      | Admin    | Update status          |
| POST   | `/api/upload`              | Admin    | Upload image (→ Blob)  |

`GET /api/cars` filters: `q`, `brand_id`, `body_type`, `fuel_type`, `min_price`, `max_price`, `is_featured`, `sort` (`newest|price_asc|price_desc`).

## Design System (Zendrive)

- **Style**: 3D & Hyperrealism inspired, premium dark + action red
- **Primary** `#0F172A` · **Secondary** `#334155` · **Accent** `#DC2626`
- **Background** `#F8FAFC` · **Text** `#0F172A`
- **Headings** `Cormorant` · **Body** `Montserrat`

## Notes

- Sample images come from Unsplash; replace `image` URL when adding real cars or upload via `/api/upload`.
- SQLite is local-dev only; Vercel's filesystem is read-only, so production must use Postgres.
- The seeder is idempotent — it will not overwrite existing rows. To reset locally, delete `zendrive_backend/zendrive.db`.
