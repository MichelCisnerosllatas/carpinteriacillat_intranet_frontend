# Next.js Admin — FSD Architecture

Admin dashboard built with **Next.js 16**, **Tailwind CSS v4**, **shadcn/ui**, and **Feature-Sliced Design (FSD)**.

---

## Stack

| Tech | Version | Purpose |
|------|---------|---------|
| Next.js | ^16 | App Router, SSR, routing |
| React | ^19 | UI framework |
| Tailwind CSS | ^4 | Utility-first styling |
| shadcn/ui | latest | UI component library (Radix UI) |
| next-themes | ^0.4 | Dark mode — **no flash on reload** |
| Zustand | ^5 | Client state (layout, notifications, search) |
| lucide-react | ^1 | Icons |
| TypeScript | ^5 | Type safety |

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (Turbopack)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects automatically to `/dashboard`.

```bash
# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint

# Format with Prettier
npm run format
```

---

## Project structure (FSD)

```
src/
├── app/                          # Next.js App Router — routing only
│   ├── layout.tsx                # Root layout: fonts, next-themes ThemeProvider
│   ├── page.tsx                  # Redirect → /dashboard
│   ├── not-found.tsx             # Global 404
│   │
│   ├── (auth)/                   # Auth routes — NO sidebar
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   │
│   ├── (dashboard)/              # Authenticated routes — WITH sidebar
│   │   ├── layout.tsx            # Server Component: reads sidebar cookie
│   │   ├── layout-client.tsx     # Client Component: SidebarProvider wrapper
│   │   ├── dashboard/page.tsx
│   │   ├── tasks/page.tsx
│   │   ├── apps/page.tsx
│   │   ├── chats/page.tsx
│   │   ├── users/page.tsx
│   │   ├── help-center/page.tsx
│   │   ├── ui-components/page.tsx  ← Reference for all UI components
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── account/page.tsx
│   │       ├── appearance/page.tsx
│   │       ├── notifications/page.tsx
│   │       └── display/page.tsx
│   │
│   └── errors/
│       ├── 401/page.tsx
│       ├── 403/page.tsx
│       ├── 404/page.tsx
│       ├── 500/page.tsx
│       └── 503/page.tsx
│
├── widgets/                      # Composed UI blocks
│   ├── sidebar/
│   │   ├── app-sidebar.tsx       # Main sidebar
│   │   ├── nav-group.tsx         # Nav group with collapsible support
│   │   └── team-switcher.tsx     # Workspace switcher
│   ├── header/
│   │   ├── header.tsx            # Sticky header with blur on scroll
│   │   ├── search-button.tsx     # Cmd+K trigger
│   │   ├── notification-dropdown.tsx
│   │   ├── user-menu.tsx         # Avatar + dropdown (top-right)
│   │   └── appearance-drawer.tsx # Theme/layout settings sheet
│   └── command-menu/
│       └── command-menu.tsx      # Global Cmd+K search
│
└── shared/                       # Pure base layer — no app dependencies
    ├── ui/                       # shadcn/ui components
    ├── lib/
    │   ├── utils.ts              # cn() helper
    │   ├── cookies.ts            # getCookie / setCookie / removeCookie
    │   └── use-mobile.ts         # useIsMobile hook
    ├── config/
    │   ├── sidebar-data.ts       # ← EDIT THIS to change the nav menu
    │   └── nav-types.ts          # Types + filterNavByRole() utility
    ├── styles/
    │   └── globals.css           # Tailwind v4 + full theme (oklch tokens)
    └── stores/
        ├── layout-store.ts       # Zustand: sidebar variant + collapsible
        ├── notification-store.ts # Zustand: notifications list + unread count
        └── search-store.ts       # Zustand: Cmd+K open state
```

---

## Navigation — how to modify

All navigation is in **`src/shared/config/sidebar-data.ts`**.

### 1. Simple link

```ts
{
  title: 'Dashboard',
  url: '/dashboard',
  icon: LayoutDashboard,
}
```

### 2. Menu with children (collapsible)

```ts
{
  title: 'Reports',
  icon: BarChart,
  items: [
    { title: 'Monthly', url: '/reports/monthly' },
    { title: 'Annual',  url: '/reports/annual',  icon: CalendarDays },
  ],
}
```

### 3. Menu with badge (notification count)

```ts
{
  title: 'Chats',
  url: '/chats',
  icon: MessagesSquare,
  badge: '3',
}
```

### 4. How to change icons

All icons come from **[lucide-react](https://lucide.dev/icons)**.

1. Go to https://lucide.dev/icons and search for the icon you want.
2. Copy the name (e.g., `Rocket`, `Globe`, `TrendingUp`).
3. Import it at the top of `sidebar-data.ts`:

```ts
import { Rocket, Globe, TrendingUp } from 'lucide-react'
```

4. Use it in any nav item:

```ts
{ title: 'Launch', url: '/launch', icon: Rocket }
```

### 5. Add a new route group (section)

```ts
navGroups: [
  // ... existing groups ...
  {
    title: 'Analytics',          // Group label shown above items
    items: [
      { title: 'Overview',  url: '/analytics',         icon: BarChart },
      { title: 'Revenue',   url: '/analytics/revenue', icon: DollarSign },
      { title: 'Traffic',   url: '/analytics/traffic', icon: Globe },
    ],
  },
]
```

---

## Role-based navigation

The navigation system is **already prepared** for role-based filtering.

### How it works

Each nav item, sub-item, or group can declare a `roles` array:

```ts
// Only admins see this item
{ title: 'User Management', url: '/admin/users', icon: Users, roles: ['admin'] }

// Admins and editors see this group
{
  title: 'Content',
  roles: ['admin', 'editor'],
  items: [
    { title: 'Posts',    url: '/content/posts' },
    { title: 'Media',    url: '/content/media' },
  ],
}

// No roles = visible to everyone
{ title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard }
```

### Applying the filter

When you have auth implemented, use `filterNavByRole()` in `app-sidebar.tsx`:

```tsx
// src/widgets/sidebar/app-sidebar.tsx
import { filterNavByRole } from '@/shared/config/nav-types'

// Get the current user role from your auth solution
const userRole = useCurrentUserRole() // e.g. 'admin' | 'editor' | 'viewer'

const groups = filterNavByRole(sidebarData.navGroups, userRole)
// Pass `groups` instead of `sidebarData.navGroups` to NavGroup
```

### Role types

Roles are typed as `string` with suggested values defined in `nav-types.ts`:

```ts
export type UserRole = 'admin' | 'editor' | 'viewer' | string
```

Extend this union to add custom roles:

```ts
export type UserRole = 'admin' | 'editor' | 'viewer' | 'manager' | 'support' | string
```

---

## Adding a new page

1. Create the file:

```bash
# Example: /analytics page
src/app/(dashboard)/analytics/page.tsx
```

2. Page template:

```tsx
import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'

export const metadata: Metadata = { title: 'Analytics' }

export default function AnalyticsPage() {
  return (
    <>
      <Header fixed title="Analytics" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Your content here */}
      </main>
    </>
  )
}
```

3. Add it to the navigation in `src/shared/config/sidebar-data.ts`.

---

## Theme system (next-themes)

Dark mode is handled by **[next-themes](https://github.com/pacocoursey/next-themes)** — it injects a script before React hydrates, which **eliminates the light-flash on page reload**.

```tsx
// Use the theme hook in any Client Component:
'use client'
import { useTheme } from 'next-themes'

function MyComponent() {
  const { theme, setTheme } = useTheme()
  // theme: 'light' | 'dark' | 'system'
  // setTheme('dark')
}
```

The **Appearance & Layout** drawer (accessible from the user menu top-right → "Appearance & Layout") lets you change:
- Theme (Light / Dark / System)
- Sidebar style (Inset / Floating / Sidebar)
- Layout mode (Default / Compact / Full)
- Text direction (LTR / RTL)

---

## Zustand stores

All client state lives in `src/shared/stores/`.

```ts
// Layout (sidebar variant + collapsible mode)
import { useLayoutStore } from '@/shared/stores/layout-stores'
const { variant, collapsible, setVariant, setCollapsible, reset } = useLayoutStore()

// Notifications
import { useNotificationStore } from '@/shared/stores/notification-stores'
const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore()

// Search (Cmd+K)
import { useSearchStore } from '@/shared/stores/search-stores'
const { open, setOpen, toggle } = useSearchStore()
```

---

## UI Components reference

Visit **`/ui-components`** in the running app for a live interactive showcase of every shadcn/ui component available in this project, with import paths shown for each one.

All components are in `src/shared/ui/` and are imported as:

```ts
import { Button } from '@/shared/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
// ... etc
```

---

## Adding new shadcn/ui components

```bash
npx shadcn@latest add [component-name]
```

After running, **move** the generated file from `src/components/ui/` to `src/shared/ui/` and update the import path in the file from `@/lib/utils` to `@/shared/lib/utils`.

---

## Key differences from the original Vite template

| Concept | Original (Vite + TanStack) | This project (Next.js 16) |
|---------|---------------------------|--------------------------|
| Router | TanStack Router | App Router |
| `<Link>` | `@tanstack/react-router` | `next/link` |
| Navigate | `useNavigate()` | `useRouter()` from `next/navigation` |
| Active route | `useLocation()` | `usePathname()` from `next/navigation` |
| Dark mode | Custom provider (flash bug) | `next-themes` (no flash) |
| State | Custom React context | Zustand stores |
| Cookies (SSR) | Client only | `cookies()` in Server Components |
| Client boundary | All components are client | Add `'use client'` to interactive ones |
| Route groups | `_authenticated/` prefix | `(dashboard)/` parentheses syntax |
