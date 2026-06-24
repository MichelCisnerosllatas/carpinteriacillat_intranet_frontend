# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Dev server with Turbopack on localhost:3000
npm run build         # Production build
npm start             # Start production server
npm run lint          # ESLint via Next.js config
npm run format        # Prettier write
npm run format:check  # Prettier check
```

No test suite configured — there is no `npm test` command.

## Architecture

**Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui (Radix), Zustand 5, TanStack Table 8, react-hook-form + Zod 4, Axios, Sonner, SweetAlert2.

**Pattern:** Feature-Sliced Design (FSD). Dependency direction: `app → features → entities → shared`. Nothing in `shared/` may import from `features/`.

```
src/
├── app/              # Next.js routes only — no business logic here
│   ├── (auth)/       # Public routes: /sign-in, /forgot-password
│   └── (intranet)/   # Protected routes — layout wraps all in AuthSessionProvider + Sidebar
├── features/         # Domain modules (one per entity/concern)
├── entities/         # Shared domain types: person/, role/
├── widgets/          # Composed layout blocks: sidebar/, header/, command-menu/
└── shared/
    ├── api/          # apiClient.ts — Axios instance with auth interceptors
    ├── config/       # sidebar-data.ts, entity-states.ts, nav-types.ts, cookie.storage.ts
    ├── device/       # appInfo.ts — getClientType/getAppPlatform/getAppVersion
    ├── lib/          # cn(), formatDatetime(), toast.ts, swal.ts, api-errors.ts, utils.ts
    ├── stores/       # layout-store (sidebar variant), notification-store, search-store
    ├── type/         # Shared DTO fragments: LinksPaginationType, MetaPaginationType
    └── ui/           # All shadcn/ui components + data-table/pagination, bulk-actions
```

## Feature Module Pattern

Every feature under `src/features/<name>/` follows this exact structure — all existing CRUD features (`roles`, `users`, `categories`, `furnitures`, `images`, `sections`, `navigations`, `sectionimages`, `typecolors`, `typedocs`, `typesections`, `typewoods`) use it. New features must match it.

```
features/roles/
├── model/
│   ├── roleget.dto.ts    # List request params + paginated response types
│   ├── rolepost.dto.ts   # Create request + response types
│   └── roleput.dto.ts    # Update request + response types
├── data/
│   ├── schema.ts         # Zod schema + inferred TS type used by stores and UI
│   └── data.ts           # Static display data (filter options, labels)
├── services/
│   ├── roles.endpoint.ts # URL constants: { v1: { get, post, put(id), patch(id), delete(id) } }
│   └── roles.service.ts  # Thin Axios wrappers; filters out undefined/null/empty params on GET
├── stores/
│   ├── useRoleListStore.ts    # Paginated list: hasLoaded, isFetching, isError, roles[], links, meta, filters
│   ├── useRoleFormStore.ts    # Mutations: isSubmitting, error, fieldErrors; create/update/reset
│   ├── useRoleDeleteStore.ts  # Single + bulk delete/toggle-state
│   └── useRoleSelectStore.ts  # Lightweight list for <Select> dropdowns
├── ui/                   # All 'use client' React components
│   ├── roles-table.tsx        # Main view: TanStack Table + filter inputs + DataTableBulkActions
│   ├── roles-columns.tsx      # ColumnDef<Role>[] — checkbox, data cells, row actions
│   ├── roles-row-actions.tsx
│   ├── role-form.tsx          # react-hook-form + zodResolver
│   ├── role-detail.tsx
│   ├── role-select.tsx
│   ├── roles-breadcrumb.tsx
│   ├── roles-primary-buttons.tsx
│   └── roles-error.tsx
└── index.ts              # Public barrel export
```

## Data Flow

```
Page (Server Component, app/)
  └─ Table/Form component ('use client', features/*/ui/)
       └─ Zustand store (features/*/stores/)
            └─ Service (features/*/services/)
                 └─ apiClient (shared/api/apiClient.ts)
```

## API Client — `src/shared/api/apiClient.ts`

Axios instance configured with:
- `baseURL`: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000/api`)
- Default headers: `X-Client`, `X-Platform`, `X-App-Version` sourced from `shared/device/appInfo.ts`
- **Request interceptor:** injects `Authorization: Bearer <token>` from `localStorage` (skipped for login/refresh endpoints)
- **Response interceptor:** on 401 attempts one silent token refresh; on failure calls `SessionExpired.execute()` which redirects to `/sign-in` and clears tokens

All API responses: `{ success: boolean, status: number, message: string, data: T, links?, meta?, errors? }`.

## Store Patterns

**List store** (`useRoleListStore` is the canonical example):
- State: `hasLoaded`, `isInitialLoading`, `isFetching`, `isError`, `message`, `data[]`, `links`, `meta`, `filters`, `currentItem`
- `load(params?)` merges params into `get().filters` before fetching; sets `isFetching` before and clears after
- Filter debounce: table components use `window.setTimeout(..., 500)` inside `useEffect` watching filter state

**Form store** (`useRoleFormStore`):
- State: `isSubmitting`, `error` (string), `fieldErrors` (Record<string, string[]>)
- `update()` uses `patch` instead of `put` when any field value is empty/null
- Returns `boolean`; UI calls `applyApiErrors(form, fieldErrors)` on failure

**API → UI mapping:** `model/*.dto.ts` mirrors the API shape. `data/schema.ts` defines the normalized UI type via Zod. List stores contain a `mapXFromApi()` function converting raw DTO fields (e.g., `id_role`) to schema fields (e.g., `id`).

## Auth Flow

- **Storage:** `access_token` and `refresh_token` in `localStorage`; `access_token` and `auth_role` also written to `document.cookie` (for Next.js middleware)
- **Middleware** (`src/middleware.ts`): reads `access_token` cookie to gate `PROTECTED_PREFIXES`; reads `auth_role` to enforce `ROUTE_ROLES` per path
- **Post-login redirect:** use `window.location.replace('/dashboard')` — **not** `router.replace()` — to guarantee cookies are included in the first server request
- **`AuthSessionProvider`** (mounted in `(intranet)` layout): calls `authStore.verify()` on mount to populate the Zustand store from `localStorage`; does NOT redirect

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000       # Backend base (no /api suffix — routes include it)
NEXT_PUBLIC_IMAGE_URL=http://localhost:8000/storage/
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_CLIENT=web
```

## Shared Utilities

| Import | What it does |
|--------|--------------|
| `cn(...classes)` from `@/shared/lib/utils` | clsx + tailwind-merge |
| `formatDatetime(date?)` from `@/shared/lib/utils` | → `"YYYY-MM-DD HH:mm:ss"` for backend |
| `toastSuccess/toastError/toastWarning/toastInfo` from `@/shared/lib/toast` | Sonner wrapper |
| `swalDeleteConfirm(title?, text?)` from `@/shared/lib/swal` | Danger confirmation (dark-mode aware) |
| `swalConfirm({ title, text, danger? })` | Generic SweetAlert2 confirm |
| `ENTITY_STATES` / `getStateOption(value)` from `@/shared/config/entity-states` | Badge classes by numeric state (0=inactive, 1=active, 2=pending…) |

## Sidebar Navigation

Defined in `src/shared/config/sidebar-data.ts`. Supports:
- Simple links: `{ title, url, icon }`
- Collapsible groups: `{ title, icon, items: [...] }`
- Role-based visibility: add `roles: string[]` to any item
- Badge chips: add `badge: string`

All icons are from `lucide-react`. `filterNavByRole(navGroups, role)` is available in `shared/config/nav-types.ts` for filtering by role.

## Tables

TanStack Table v8 with server-side pagination:
- `manualPagination: true`, `pageCount: meta?.last_page`
- `onPaginationChange` calls `store.load({ page, per_page })`
- Bulk actions use `<DataTableBulkActions>` from `@/shared/ui/data-table/bulk-actions`
- Column visibility toggle via `<DataTableViewOptions>`
- Confirmations before destructive bulk ops use `swalDeleteConfirm`

## Conventions

- All feature UI components are `'use client'` — pages in `app/` are Server Components by default
- Spanish UI text, English code identifiers
- Tailwind utilities only — no CSS modules or inline styles
- Path alias `@/*` → `src/*`
- No `any` except in `catch (error: any)` blocks and Axios response error access
