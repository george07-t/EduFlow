# Interactive Teaching Platform (Dynamic EduFlow)

Full-stack multimedia CMS:

- Backend: FastAPI + SQLAlchemy
- Database: PostgreSQL
- Frontend: Next.js App Router + TipTap + Zustand + React Query
- Deployment: Docker Compose

## Services

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:8000>
- Swagger: <http://localhost:8000/docs>
- PostgreSQL: localhost:5432

## Quick Start (Docker Compose)

From project root:

```bash
docker compose up --build -d
```

Check status:

```bash
docker compose ps
```

Run enriched seed data inside Docker:

```bash
docker compose exec backend python seed.py
```

Re-run seed anytime after changes:

```bash
docker compose exec backend python seed.py
```

This starts:

- `db` (PostgreSQL 18)
- `backend` (FastAPI)
- `frontend` (Next.js)

Stop services:

```bash
docker compose down
```

The compose file is preconfigured with:

- DB user: `postgres`
- DB password: `george07`
- DB name: `eduflow`

## Local Non-Docker Run

### Backend

```bash
cd platform_backend
python -m venv .venv
# Windows
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd platform_frontend
npm install
npm run dev
```

## Accounts

- Anyone can register from `/register` and access creator workspace at `/admin`.
- Seed also creates a default admin account:
  - Username: `admin`
  - Password: `admin123`

## Important Behavior

- Inline media tags are stored as `[[media:N]]` and rendered client-side as clickable triggers.
- One global modal dynamically renders media type content.
- Creator routes are middleware-protected and checked in client auth state.
