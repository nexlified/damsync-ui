# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server at http://localhost:5173
npm run build    # tsc type-check + vite production build
npm run lint     # eslint (typescript-eslint + react-hooks rules)
npm run preview  # serve the production build locally
```

No test runner is configured yet.

## Environment

Copy `.env.local` and set:
```
VITE_API_URL=http://localhost:8080   # DAM backend
VITE_CDN_URL=http://localhost:8080   # CDN base (same host in dev)
```

The backend lives at `/Users/credevator/workspace/apps/dam` and must be running for any API calls to work (`make dev` in that repo).

## Architecture

### Request flow

`main.tsx` → `App.tsx` mounts `QueryClientProvider` + `RouterProvider` + `Toaster`. The router (`src/router.tsx`) wraps all authenticated routes in `RequireAuth`, which reads `isAuthenticated` from the Zustand auth store. Authenticated routes render inside `AppShell` (sidebar + header + `<Outlet>`).

### Auth

`src/store/auth.ts` — Zustand store persisted to `localStorage` under the key `dam-auth`. `setTokens()` decodes the JWT (client-side, no verify) to extract `org_id`, `org_slug`, `role`, `email` into the store. The `role` field drives RBAC in the UI via `src/hooks/useRole.ts`.

`src/api/client.ts` — single Axios instance used by all API modules. Two interceptors:
1. **Request**: reads `dam-auth` from localStorage and attaches `Authorization: Bearer`.
2. **Response**: on 401, attempts a token refresh once via `POST /api/v1/auth/refresh`, queuing concurrent requests during the refresh. On second 401 or missing refresh token, calls `clearAuth()` which wipes the store and redirects to `/login`. The interceptors mutate localStorage directly (not via Zustand) to avoid circular imports.

### API layer

`src/api/` contains one thin module per resource (e.g. `assets.ts`, `styles.ts`). Each module exports a plain object of functions that call `client` and unwrap `.data`. They do not handle errors — callers handle errors through TanStack Query's `isError` / `onError`.

### Server state

TanStack Query v5 is the only server-state manager. Query keys follow `[resource, ...params]` (e.g. `['assets', params]`, `['styles']`). Mutations call `qc.invalidateQueries` on success to refresh affected lists. `useAssets` uses `useInfiniteQuery` with cursor-based pagination; `getNextPageParam` returns `last.next_cursor`.

### Component conventions

`src/components/ui/` — hand-rolled Radix UI primitives styled with Tailwind (Button, Input, Label, Card, Badge, Dialog, Sheet, Select, Tabs, Separator, Toast). These follow the shadcn/ui pattern but are written directly, not generated. The `cn()` helper (`src/lib/utils.ts`) merges Tailwind classes via `clsx` + `tailwind-merge`.

`src/components/asset/` — feature components for asset management. `AssetGrid` and `AssetList` both implement infinite scroll via `IntersectionObserver` on a sentinel `div`. `AssetDetail` is a `Sheet` (slide-over) that holds the metadata edit form, signed URL generation, and delete action.

`src/components/layout/` — `AppShell` composes `Sidebar` + `Header` + `<Outlet>`. `Sidebar` filters settings nav items by `isAdmin` from `useRole`.

### Styling

Tailwind CSS v4 via `@tailwindcss/vite` (not PostCSS). No `tailwind.config.ts` is needed. Design tokens are defined in the `@theme {}` block in `src/index.css`. The `@` path alias resolves to `src/`.

### Toast

`src/hooks/useToast.ts` is a minimal module-level event bus (no Context). Import `toast` directly and call `toast({ title, description, variant })` from anywhere — including outside React components. `<Toaster>` in `App.tsx` subscribes to it.

### CDN helpers

`src/lib/cdn.ts` builds asset URLs from `VITE_CDN_URL`. Use `originalUrl(storage_key)` for direct asset display and `styledUrl(style_slug, storage_key)` for transformed variants. These produce URLs served by the Go backend, not the React app.
