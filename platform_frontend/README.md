# Interactive Teaching Platform Frontend

Next.js frontend for the Dynamic EduFlow headless CMS.

## Features

- Public pages:
  - Home article listing with category navigation
  - Category detail pages with nested category tree
  - Article page with rich body content and clickable inline media triggers like `[[media:14]]`
- Interactive UI:
  - Global dynamic media modal (text/image/audio/local video/YouTube)
  - Accordion side-panel for article sections (Introduction, Detailed Explanation, etc.)
  - Route-level skeleton loading states using `react-loading-skeleton`
  - Toast notifications via `react-toastify`
- Creator pages:
  - Register and login flow
  - Protected workspace routes
  - Category CRUD (nested hierarchy)
  - Media upload/library management
  - Article create/edit with TipTap (Word-like toolbar + media trigger insertion)

## Local Development

1. Install dependencies:

```bash
npm install
```

1. Configure environment:

```bash
# platform_frontend/.env.local
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_SITE_NAME=Dynamic EduFlow
```

1. Run development server:

```bash
npm run dev
```

1. Open:

- App: <http://localhost:3000>
- Register: <http://localhost:3000/register>
- Workspace: <http://localhost:3000/admin>

## Production Build

```bash
npm run build
npm run start -- -H 0.0.0.0 -p 3000
```

## Docker

This folder includes a production Dockerfile.

- Build uses multi-stage image
- Exposes port 3000
- Expects `BACKEND_URL` to point to FastAPI service

Use the root `docker-compose.yml` to run full stack.
