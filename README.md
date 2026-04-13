# Interactive Teaching Platform (Dynamic EduFlow)

Full-stack multimedia CMS:

- Backend: FastAPI + SQLAlchemy
- Database: PostgreSQL
- Frontend: Next.js App Router + TipTap + Zustand + React Query
- Deployment: Docker Compose (dev and production variants)

## Services

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:8000>
- Swagger: <http://localhost:8000/docs>
- PostgreSQL: localhost:5432

## Quick Start (Docker Compose - Development)

1. From project root, copy env template:

```bash
cp .env.example .env
```

2. Start all services:

```bash
docker compose up --build -d
```

3. Check status:

```bash
docker compose ps
```

4. (Optional) Rerun seed manually:

```bash
docker compose exec backend python seed.py
```

Stop services:

```bash
docker compose down
```

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

## Production (Single Host / AWS EC2)

Use the production override file to disable dev behaviors (such as auto-seeding) and apply restart/health policies.

1. Create `.env` with production values (never commit this file):

- Strong `SECRET_KEY` (32+ chars)
- Public `BASE_URL` (HTTPS)
- Strong DB password
- Proper `ALLOWED_ORIGINS`

2. Start production stack:

```bash
docker compose --env-file .env -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

3. Verify health:

```bash
docker compose ps
curl http://localhost:8000/api/health
```

### Recommended AWS Setup

- Deploy on EC2 with Docker installed.
- Keep ports 3000/8000 private if using ALB or reverse proxy.
- Attach an Application Load Balancer with HTTPS (ACM certificate).
- Point DNS to ALB.
- Persist DB and uploads using Docker volumes or external managed services.
- For production scale, move DB to Amazon RDS and object files to S3.

## Accounts

- Anyone can register from `/register` and access creator workspace at `/admin`.
- Seed creates a default admin account only when `RUN_SEED=true`:
  - Username: `admin`
  - Password: `admin123`

## Important Behavior

- Inline media tags are stored as `[[media:N]]` and rendered client-side as clickable triggers.
- One global modal dynamically renders media type content.
- Creator routes are middleware-protected and checked in client auth state.
