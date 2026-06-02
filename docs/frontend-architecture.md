# Frontend Architecture

## Overview

The frontend is a Next.js 16 application for managing robot fleets, tasks, and teleoperation episodes. It uses type-safe API clients generated from the OpenAPI specification.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI Components | Radix UI, Tailwind CSS 4 |
| State Management | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| API Client | Zodios (auto-generated from OpenAPI) |
| URL State | nuqs |
| Notifications | Sonner |

## Directory Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/              # Main application routes
│   │   │   ├── dashboard/      # Dashboard page
│   │   │   ├── episodes/       # Episodes management
│   │   │   ├── robots/         # Robots management
│   │   │   ├── tasks/          # Tasks management
│   │   │   ├── users/          # Users management
│   │   │   └── profile/        # User profile
│   │   └── api/                # API route handlers (proxy to backend)
│   │
│   ├── features/               # Feature modules (domain-driven)
│   │   ├── episodes/           # Episode CRUD, hooks, components
│   │   ├── locations/          # Location management
│   │   ├── organizations/      # Organization management
│   │   ├── robots/             # Robot CRUD, status, camera viewer
│   │   ├── tasks/              # Task management
│   │   └── users/              # User CRUD, roles
│   │
│   ├── lib/                    # Core libraries
│   │   ├── api/                # API client configuration
│   │   │   ├── client.ts       # Zodios client with interceptors
│   │   │   ├── backend-client.ts # Server-side fetch (sends X-User-ID)
│   │   │   ├── config.ts       # API URL configuration
│   │   │   └── generated/      # Auto-generated Zodios client
│   │   └── auth/               # Session management
│   │       └── session.ts      # getUserId(), getUserSession()
│   │
│   └── shared/                 # Shared code across features
│       ├── components/         # Layout components (TopNav, UserMenu)
│       ├── hooks/              # Shared hooks (status labels, etc.)
│       ├── lib/                # Utilities (date, status constants)
│       ├── providers/          # React providers (QueryProvider)
│       └── ui/                 # UI primitives (Button, Dialog, Table)
│
├── public/                     # Static assets
├── next.config.ts              # Next.js configuration
├── Dockerfile                  # Production image
├── Dockerfile.dev              # Development image
└── package.json
```

## API Client Architecture

```
Browser
    │
    ▼
React Component (Client Component)
    │
    ▼
TanStack Query Hook (e.g., useEpisodesQuery)
    │
    ▼
Next.js API Route (/web/api/*)
    │
    ▼
backend-client.ts (adds X-User-ID header)
    │
    ▼
Backend API (http://backend:8000)
```

### Server Components vs Client Components

- **Server Components** (`backend-client.ts`): Fetch data directly from backend with `X-User-ID` header. Used in layouts and initial page loads.
- **Client Components**: Use TanStack Query hooks that call `/web/api/*` routes. These routes proxy requests to the backend via `backend-client.ts`.
- **SSE Streams**: Proxied through `sse-proxy.ts` with `X-User-ID` header for real-time updates.

### API Code Generation

The API client is auto-generated from the OpenAPI spec:

```bash
make fe-generate-api
```

This generates `src/lib/api/generated/api.ts` containing the following.

- Zod schemas for all request/response types
- Zodios API client with typed endpoints

**Never edit generated files directly.** Modify `openapi/openapi.yaml` and regenerate.

## Feature Module Pattern

Each feature in `src/features/` is self-contained:

```
features/episodes/
├── components/          # Feature-specific React components
│   ├── episode-columns.tsx
│   ├── episode-detail.tsx
│   └── create-episode-dialog.tsx
├── hooks/               # Data fetching and mutation hooks
│   ├── use-episodes-query.ts
│   └── use-create-episode-mutation.ts
├── schemas/             # Zod validation schemas (for forms)
└── index.ts             # Public API (re-exports)
```

## Authentication

The frontend identifies the active user via a cookie, falling back to the `DEFAULT_USER_ID` environment variable.

- `session.ts` provides `getUserId()` which reads the `active_user_id` cookie first, then falls back to `process.env.DEFAULT_USER_ID`
- `switch-user.ts` is a Server Action that sets the cookie when a user switches accounts
- `backend-client.ts` attaches `X-User-ID` header to all backend requests using `getUserId()`
- `SessionProvider` wraps the app and provides session context to components

## Robot Camera Configuration

MJPEG stream settings are configured per-robot via the `robot_config` field:

```json
{
  "host": "192.168.1.101",
  "port": 9090,
  "cameras": [
    { "namespace": "camera_0", "name": "Front Camera" },
    { "namespace": "camera_1", "name": "Top Camera" }
  ]
}
```

## Environment Variables

Configure in `frontend/.env` (copy from `.env.sample`).

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `/web/api` | Base URL for client-side API calls |
| `NEXT_PUBLIC_API_TIMEOUT` | `30000` | Request timeout (ms) |
| `BACKEND_API_URL` | `http://localhost:8000` | Backend URL for server-side requests |
| `DEFAULT_USER_ID` | (required) | User UUID for X-User-ID header |

## Key Conventions

- Base path is `/web` (configured in `next.config.ts`)
- Dark mode supported via `next-themes`
- URL state managed with `nuqs` for bookmarkable filters
- i18n via `react-i18next` (en/ja)
