# Zendrive — Premium Car Sales Platform

A modern, full-stack car sales website with three parts:

- **`zendrive_backend`** — FastAPI + SQLAlchemy REST API
- **`zendrive_user`** — React customer-facing storefront
- **`zendrive_admin`** — React admin console

> Tagline: *Drive the Future. Own the Road.*

## Tech Stack

| Layer        | Tech                                                        |
| ------------ | ----------------------------------------------------------- |
| Frontend     | React 18, React Router v6, Tailwind CSS, Axios, React Icons |
| Backend      | FastAPI, SQLAlchemy 2, Postgres / SQLite                    |
| Storage      | Local `uploads/` directory                                  |
| Auth         | Admin JWT (python-jose) + bcrypt                            |
| Deploy       | Docker Compose + Nginx reverse proxy                        |

---

## Quick Start with Docker (Production)

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose installed

### 1. Clone and configure

```bash
git clone <repo-url> && cd Zendrive
cp .env.example .env
```

Edit `.env` — at minimum, change `SECRET_KEY` and `ADMIN_PASSWORD`.

### 2. Build and start

```bash
docker compose up -d --build
```

This starts 4 containers:

| Service   | Internal Port | Exposed Via     |
| --------- | ------------- | --------------- |
| backend   | 8000          | nginx proxy     |
| user      | 80            | nginx :80       |
| admin     | 80            | nginx :8080     |
| nginx     | 80 / 8080     | host :80 / :8080|

### 3. Access

- **User site**: `http://your-server-ip`
- **Admin console**: `http://your-server-ip:8080`
- **API docs**: `http://your-server-ip/docs`

### 4. Default admin credentials

| Field    | Value                |
| -------- | -------------------- |
| Email    | `admin@zendrive.com` |
| Password | `Zendrive@2026`      |

> Change via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` before first run.

### 5. Data persistence

- **Database**: `./data/db/zendrive.db` (SQLite, mounted as Docker volume)
- **Uploads**: `./data/uploads/` (mounted as Docker volume)

To use Postgres instead of SQLite, set `DATABASE_URL` in `.env`:
```
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

### 6. Useful commands

```bash
# View logs
docker compose logs -f

# Restart a single service
docker compose restart backend

# Stop everything
docker compose down

# Rebuild after code changes
docker compose up -d --build

# Backup SQLite database
cp data/db/zendrive.db data/db/zendrive.db.bak
```

---

## Local Development (without Docker)

Open **3 terminals**.

### One-command start

From the repository root, you can start backend, user, and admin together with:

```bash
npm run dev
```

On Windows PowerShell, if `npm` is blocked by the `npm.ps1` execution policy, use:

```powershell
npm.cmd run dev
# or
cmd /c npm run dev
```

This delegates to `dev.ps1 start -Service all`.

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

---

## Project Structure

```
Zendrive/
├── docker-compose.yml          # Docker orchestration
├── nginx/
│   └── nginx.conf              # Reverse proxy config
├── .env.example                # Docker env template
├── zendrive_backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── app/
│   │   ├── main.py             # FastAPI app + endpoints
│   │   ├── models.py           # SQLAlchemy models
│   │   ├── schemas.py          # Pydantic schemas
│   │   ├── auth.py             # JWT + bcrypt helpers
│   │   ├── seed.py             # Idempotent sample-data seeder
│   │   ├── config.py           # Env-driven settings
│   │   └── database.py         # Engine + session
│   ├── requirements.txt
│   └── run.py
├── zendrive_user/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nginx.conf              # SPA routing for user frontend
│   ├── public/
│   ├── src/
│   └── package.json
└── zendrive_admin/
    ├── Dockerfile
    ├── .dockerignore
    ├── nginx.conf              # SPA routing for admin frontend
    ├── src/
    └── package.json
```

## Key API Endpoints

| Method | Path                       | Auth     | Purpose                |
| ------ | -------------------------- | -------- | ---------------------- |
| POST   | `/api/admin/login`         | —        | Admin login (JWT)      |
| GET    | `/api/cars`                | —        | List + filter cars     |
| GET    | `/api/cars/{slug}`         | —        | Car detail             |
| POST   | `/api/cars`                | Admin    | Create car             |
| PUT    | `/api/cars/{id}`           | Admin    | Update car             |
| DELETE | `/api/cars/{id}`           | Admin    | Delete car             |
| GET    | `/api/brands`              | —        | List brands            |
| POST   | `/api/brands`              | Admin    | Create brand           |
| POST   | `/api/upload`              | Admin    | Upload image           |

`GET /api/cars` filters: `q`, `brand_id`, `body_type`, `fuel_type`, `min_price`, `max_price`, `is_featured`, `sort` (`newest|price_asc|price_desc`).

## Design System (Zendrive)

- **Style**: 3D & Hyperrealism inspired, premium dark + action red
- **Primary** `#0F172A` · **Secondary** `#334155` · **Accent** `#DC2626`
- **Background** `#F8FAFC` · **Text** `#0F172A`
- **Headings** `Cormorant` · **Body** `Montserrat`

## Notes

- Sample images come from Unsplash; replace `image` URL when adding real cars or upload via `/api/upload`.
- The customer storefront requires no login; saved vehicles are stored locally in the visitor's browser.
- The seeder is idempotent — it will not overwrite existing rows. To reset locally, delete `zendrive_backend/zendrive.db`.
- For production with heavy traffic, switch to Postgres by setting `DATABASE_URL`.
