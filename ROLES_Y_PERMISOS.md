# Roles y permisos en el intranet

Guía rápida para entender (y extender) cómo el intranet decide qué puede ver y hacer cada usuario.

> Regla de oro: **el frontend solo oculta cosas**. La seguridad real está en el backend
> (middleware `permission:` de Laravel), que responde **403** si el usuario no tiene el permiso.

---

## Guía rápida

**Dos documentos, dos usos:**

| Archivo | Qué es | Cuándo abrirlo |
|---|---|---|
| `ROLES_Y_PERMISOS.md` (este) | El manual: cómo funciona y cómo extenderlo | Para **entender** o **agregar** algo |
| [PERMISOS_INDICE.md](PERMISOS_INDICE.md) | Índice generado del código: cada permiso → archivo:línea donde se usa | Para **buscar** rápido (ej. "¿dónde se usa `clients.delete`?") |

**El recorrido de un permiso:**

```
Backend: config/permissions.php → BD (role_permissions, users.id_rol)
   │ 1) POST /v1/intranet/auth/login  → solo tokens
   │ 2) GET  /v1/intranet/auth/verify → { user: { role: { role_slug, permissions: ['clients.view', ...] } }, ... }
   ▼
Intranet: auth.store (session) → localStorage 'auth_user' → useCan('clients.create') → muestra / oculta
   │ el usuario llama a la API
   ▼
Backend: PermissionMiddleware → 200 o 403 (toast global en apiClient)
```

**¿Qué endpoint trae qué?** (el rol y los permisos NO tienen un endpoint propio: vienen dentro de verify)

| Endpoint | Cuándo se llama | Qué trae en `data` | Tipo (DTO) |
|---|---|---|---|
| `POST /v1/intranet/auth/login` | Al iniciar sesión con correo | **Solo tokens**: `access_token`, `refresh_token`, `token_type`, `expires_in`, `device_id` | [login.dto.ts](src/features/auth/model/login.dto.ts) |
| `POST /v1/intranet/auth/google` | Al iniciar sesión con Google | Igual que login pero `refresh_token = null` (o los datos de Google si fue rechazado) | [login-google.dto.ts](src/features/auth/model/login-google.dto.ts) |
| `GET /v1/intranet/auth/verify` | Justo después del login y al abrir/recargar el intranet | **La sesión**: `platform`, `expires_at`, `user` (con `person`, `role` + `permissions`, `all_branches`, `branches`), `company`, `branch_filter` | [verify.dto.ts](src/features/auth/model/verify.dto.ts) |
| `POST /v1/intranet/auth/refresh` | Cuando el token vence (solo `apiClient`) | Solo tokens nuevos | [refresh.dto.ts](src/features/auth/model/refresh.dto.ts) |

La respuesta de verify va **anidada** (sigue las llaves foráneas):

```
data
├── platform, expires_at
├── user ── id, email, registration_provider, user_state, all_branches
│   ├── person ── nombre, apellido, correo, photo_url        (null si no tiene)
│   ├── role ──── id_rol, role_name, role_slug, role_is_system
│   │   └── permissions: ['clients.view', ...]
│   └── branches: [{ id, name, address, is_default }]         (donde REGISTRA)
├── company ── business_name, trade_name, tax_id, logo_url   (null si no hay)
└── branch_filter ── can_view_all, default_branch_id, options: [{ id, name, status }]  (qué puede VER)
```

Los tipos (`VerifyDataDTO`, `SessionUserDTO`, `SessionRoleDTO`, `SessionBranchDTO`, `SessionCompanyDTO`,
`SessionBranchFilterDTO`…) están en [verify.dto.ts](src/features/auth/model/verify.dto.ts).
"La sesión" es `AuthSession` = `VerifyDataDTO` ([session.type.ts](src/features/auth/model/session.type.ts)).
**Superadmin** = `session.user.role.role_slug === 'superadmin'` (ya no existe `is_superadmin`).

Endpoints de la **pantalla de administración** (Roles → Permisos), no del usuario que inicia sesión:
`GET /v1/intranet/permissions/tree` (árbol para los switches), `GET` y `PUT /v1/intranet/role/{id}/permissions`
(leer y guardar los permisos de un rol) y el CRUD `/v1/intranet/role`. Están en `src/features/permissions/` y `src/features/roles/`.

| Pregunta | Archivo |
|---|---|
| ¿Qué API trae los permisos? | [auth.endpoints.ts](src/features/auth/services/auth.endpoints.ts): `verify` (login solo da los tokens) |
| ¿Quién recibe la respuesta? | [auth.store.ts](src/features/auth/stores/auth.store.ts): `login()` / `loginWithGoogle()` (login → verify) y `syncAccess()` |
| ¿Dónde se guardan? | La sesión en localStorage `auth_user` ([session.storage.ts](src/features/auth/storage/session.storage.ts)) y en `useAuthStore` → `session`; los tokens aparte en `access_token` / `refresh_token` ([token.storage.ts](src/features/auth/storage/token.storage.ts)) |
| ¿Cuándo se refrescan? | Al abrir el intranet: [auth-session-provider.tsx](src/features/auth/ui/auth-session-provider.tsx) llama a verify y **reemplaza** la sesión guardada |
| ¿Dónde está la lógica "¿puede?"? | [usePermission.ts](src/features/auth/hooks/usePermission.ts) (`useCan`, `hasPermission`) y [can.tsx](src/features/auth/ui/can.tsx) (`<Can>`) |
| ¿Dónde está la condición de cada botón? | **Dentro de cada componente**: busca `useCan(` o `<Can` (Ctrl+Shift+F) o mira el índice |
| ¿Y el menú? | [sidebar-data.ts](src/shared/config/sidebar-data.ts) → `permission: 'clients.view'` |
| ¿Y entrar por URL? | [route-permission-guard.tsx](src/features/auth/ui/route-permission-guard.tsx) + [route-permissions.ts](src/shared/config/route-permissions.ts) |
| ¿Y el 403 del backend? | [apiClient.ts](src/shared/api/apiClient.ts) muestra un toast |
| ¿A qué pantalla entra al iniciar sesión? | [home-url.ts](src/features/auth/lib/home-url.ts) → `getHomeUrl()`: el dashboard si su rol lo tiene; si no, el **primer módulo permitido del menú**; si no tiene ninguno, su perfil. Todos los "Ir al inicio" y los breadcrumbs "Inicio" apuntan a `/`, que usa esta función |
| ¿Y si el rol no tiene ningún permiso del intranet? | El backend no lo deja iniciar sesión: "Tu rol no tiene acceso al intranet" |
| ¿Dónde se configuran los permisos de un rol? | **Roles → menú "…" → Permisos** (`/roles/{id}/permissions`), feature `src/features/permissions/` |

**Agregar un módulo nuevo (ej. "Inventario"):**

1. **Backend** — `config/permissions.php`: `['key' => 'inventory', 'name' => 'Inventario', 'actions' => $crud]` y `php artisan db:seed --class=PermissionsSeeder`.
2. **Backend** — rutas con `permission:inventory.view`, `permission:inventory.create`…
3. **Intranet** — en `sidebar-data.ts`: `{ title: 'Inventario', url: '/inventory', permission: 'inventory.view' }` (protege menú y URL).
4. **Intranet** — botones con `<Can permission="inventory.create">` / `useCan('inventory.delete')`.
5. **Asignar** — Roles → Permisos → activa el módulo en los roles que correspondan.

¿Solo un botón nuevo en un módulo existente? Paso 4 con una acción que ya exista (si es nueva, agrégala en el paso 1).

---

## 0. ¿Dónde está la condición? (léelo primero)

No hay un archivo central que diga "si tiene X, muestra el botón Y". **Cada componente
pregunta por su permiso justo donde dibuja el botón.** Por eso, para entender un módulo,
abres su componente y buscas `useCan(` o `<Can`.

### Las 3 capas

```
 1. MENÚ        ¿Aparece el módulo en el sidebar?      → sidebar-data.ts   (permission: 'clients.view')
 2. PÁGINA      ¿Puede entrar escribiendo la URL?      → RoutePermissionGuard (automático, según la URL)
 3. BOTONES     ¿Ve "Nuevo", "Editar", "Eliminar"...?  → dentro de cada componente (useCan / <Can>)
 ─────────────────────────────────────────────────────────────────────────────────────────────
 4. BACKEND     Aunque alguien "fuerce" el botón, la API responde 403 → toast global en apiClient
```

### Recorrido completo de un módulo: Clientes

| Capa | Qué se controla | Archivo | Cómo se ve la condición |
|---|---|---|---|
| 1. Menú | Item "Clientes" del sidebar | [src/shared/config/sidebar-data.ts:252](src/shared/config/sidebar-data.ts#L252) | `{ title: 'Clientes', url: '/clients', permission: 'clients.view' }` |
| 2. Página | Entrar a `/clients`, `/clients/create`, `/clients/edit/5` | [src/features/auth/ui/route-permission-guard.tsx:31](src/features/auth/ui/route-permission-guard.tsx#L31) usando [route-permissions.ts:89](src/shared/config/route-permissions.ts#L89) | La URL `/clients/create` pide `clients.create`, `/clients/edit/…` pide `clients.update`, el resto `clients.view`. **No hay que escribir nada**: sale del sidebar. |
| 3. Botón "Nuevo cliente" | Encabezado de la página | [src/app/(intranet)/clients/page.tsx:22](src/app/(intranet)/clients/page.tsx#L22) | `<Can permission="clients.create"> <Button>Nuevo</Button> </Can>` |
| 3. Menú "…" de cada fila | Ver / Editar / Activar / Eliminar | [src/features/clients/ui/list/clients-row-actions.tsx:26](src/features/clients/ui/list/clients-row-actions.tsx#L26) | `const canDelete = useCan('clients.delete')` … `{canDelete && <DropdownMenuItem>Eliminar</DropdownMenuItem>}` |
| 3. Acciones masivas | Activar / desactivar / eliminar varios | [src/features/clients/ui/list/clients-table.tsx:267](src/features/clients/ui/list/clients-table.tsx#L267) | `onDelete={canDelete ? handleBulkDelete : undefined}` (si es `undefined`, el botón no aparece) |
| 3. Botón "Editar" del detalle | Pantalla de detalle | [src/features/clients/ui/detail/client-detail.tsx:51](src/features/clients/ui/detail/client-detail.tsx#L51) | `<Can permission="clients.update">…</Can>` |
| 3. "Crear cliente" dentro de otro formulario | Selector de cliente en proforma/venta | [src/features/clients/ui/client-picker-modal.tsx:34](src/features/clients/ui/client-picker-modal.tsx#L34) | `const canCreate = useCan('clients.create')` |
| 4. Backend | La API | `carpinteriacillat_backend/routes/api/v1/intranet/client/client_router.php` | `->middlewareFor('destroy', 'permission:clients.delete')` |

Todos los módulos siguen **el mismo patrón**. Si entiendes Clientes, entiendes los demás.

### Cómo encontrar cualquier condición

En VS Code, **Ctrl+Shift+F** (buscar en todos los archivos):

| Quiero saber… | Busca |
|---|---|
| Qué botones dependen de un permiso | `clients.delete` (la key exacta) |
| Todos los botones protegidos de un módulo | `useCan('clients.` y `<Can permission="clients.` |
| Qué permiso pide un item del menú | `permission:` dentro de `src/shared/config/sidebar-data.ts` |
| Qué permiso pide una página por URL | `src/shared/config/route-permissions.ts` (`getRouteRequirement`) |
| Todas las condiciones del proyecto | `useCan(` y `<Can ` |

Además está **[PERMISOS_INDICE.md](PERMISOS_INDICE.md)**: un índice generado del código con cada
permiso y los archivos (con línea) donde se usa.

### Las 2 formas de escribir una condición

```tsx
// A) <Can> — para envolver un trozo de JSX (lo más legible)
<Can permission="clients.create">
  <Button>Nuevo cliente</Button>
</Can>

// B) useCan — cuando necesitas el valor en una variable (props, callbacks, varias condiciones)
const canDelete = useCan('clients.delete')        // true / false
<DataTableBulkActions onDelete={canDelete ? handleBulkDelete : undefined} />
```

Ambas leen los permisos del usuario guardados en `useAuthStore` (`session.user.role.permissions`, vienen de verify).
El superadmin siempre da `true`.

---

## 1. De dónde salen los permisos

El login (correo o Google) **solo entrega tokens**. Los permisos llegan siempre en `GET /v1/intranet/auth/verify`,
que se llama en dos momentos:

| Momento | Quién lo llama |
|---|---|
| Justo después del login (correo o Google) | `login()` / `loginWithGoogle()` en `auth.store.ts` |
| Cada vez que se entra o recarga el intranet (permisos actualizados) | `AuthSessionProvider` → `syncAccess()` |

Dentro de `data.user.role` (ver `SessionRoleDTO` en `src/features/auth/model/verify.dto.ts`):

```ts
role: {
  id_rol: number
  role_name: string
  role_slug: string        // 'superadmin' = acceso total
  role_is_system: number
  permissions: string[]    // keys cortas 'modulo.accion', ej: ['clients.view', 'clients.create']
} | null
```

- Las keys son **cortas** (`clients.view`). En la BD se guardan **completas** (`intranet.clients.view`),
  pero el backend ya quita el prefijo de la plataforma antes de enviarlas.
- El **superadmin** recibe todas las keys. Se reconoce por `role_slug === 'superadmin'`
  (`isSuperAdminSession(session)` en `usePermission.ts`).
- Si el rol no tiene permisos del intranet, o el usuario/rol está inactivo, login y verify responden **401** con `message`.
- La lista de módulos y acciones está en el backend: `config/permissions.php`.

## 2. Cómo se guardan

**Flujo de login** (`login()` y `loginWithGoogle()` en `auth.store.ts`):

1. `POST login` (o `google`) → `AuthStorage.saveTokens()` guarda los tokens (y la cookie `access_token` para el middleware).
2. `GET verify` → `AuthStorage.saveSession()` guarda la respuesta completa (`AuthSession`) en `localStorage` (`auth_user`)
   y el store la tiene en `session`. **Si verify falla**, se borran los tokens y se muestra su `message`.
3. Se redirige con `getHomeUrl(session)`.

**Al entrar al intranet**, `AuthSessionProvider`:

  1. Lee la sesión local (`loadLocalSession`) → la pantalla se pinta al instante.
  2. En segundo plano llama a `GET verify` (`syncAccess`) y **reemplaza** la sesión entera en el store y en `localStorage`.
     **Así, si un admin cambia los permisos de tu rol, lo ves al recargar, sin volver a iniciar sesión.**
  3. Si verify responde 401 (token antiguo, usuario o rol desactivado) se borra la sesión y se va a `/sign-in`.
     Si falla por otra cosa (sin internet, 500) se siguen usando los permisos guardados.

- Una sesión guardada con el **formato viejo** (sin `user.role.permissions`) se considera inválida:
  `session.storage.ts` la descarta y `loadLocalSession` limpia todo y manda a `/sign-in`.
- `authStore.verify()` hace los dos pasos seguidos (se usa tras guardar permisos del propio rol).
- La cookie `auth_role` ya **no** se usa (antes guardaba el id del rol para el middleware).

## 3. Cómo preguntar por un permiso

Todo vive en `src/features/auth/hooks/usePermission.ts` y `src/features/auth/ui/can.tsx`.

### `useCan(perm)` — hook para componentes

```tsx
import { useCan } from '@/features/auth/hooks/usePermission'

const canCreate = useCan('clients.create')
const canChange = useCan(['clients.update', 'clients.state']) // basta con UNO (OR)

{canCreate && <Button>Nuevo cliente</Button>}
```

### `<Can>` — componente

```tsx
import { Can } from '@/features/auth/ui/can'

<Can permission="clients.delete" fallback={<span>Sin acceso</span>}>
  <Button variant="destructive">Eliminar</Button>
</Can>
```

### `hasPermission(session, perm)` — función normal (fuera de componentes)

```ts
import { hasPermission } from '@/features/auth/hooks/usePermission'
import { useAuthStore } from '@/features/auth/stores/auth.store'

const session = useAuthStore.getState().session
if (hasPermission(session, 'sales.payments')) { /* ... */ }
```

### `useIsSuperAdmin()`

```ts
const isSuperAdmin = useIsSuperAdmin()
```

### Tablas con acciones masivas

`DataTableBulkActions` oculta un botón si su callback es `undefined`:

```tsx
const canDelete = useCan('roles.delete')
<DataTableBulkActions onDelete={canDelete ? handleBulkDelete : undefined} ... />
```

## 4. Sidebar y buscador (Ctrl/⌘+K)

En `src/shared/config/sidebar-data.ts` cada item puede tener:

```ts
{ title: 'Clientes', url: '/clients', permission: 'clients.view', icon: Users2 }   // necesita el permiso
{ title: 'Tasks', url: '/tasks', superadminOnly: true, icon: ListTodo }            // solo superadmin (demos)
{ title: 'Apariencia', url: '/settings/appearance', icon: Palette }                 // sin reglas → todos
```

`permission` puede ser un array (basta con tener uno). Los grupos y collapsibles también aceptan
`permission` / `superadminOnly`.

El filtro es `filterNavByPermission(groups, can, isSuperAdmin)` en `src/shared/config/nav-types.ts`
(recibe una función `can` porque `shared/` no puede importar de `features/`). Reglas:

- Item con `permission` → visible si `can(permission)`.
- `superadminOnly` → solo el superadmin.
- Sin `permission` ni `superadminOnly` → visible para todos.
- Collapsible → visible si le queda algún hijo visible.
- Grupo → visible si le queda algún item.

Lo usan `src/widgets/sidebar/app-sidebar.tsx` y `src/widgets/command-menu/command-menu.tsx`.

## 5. Protección de rutas (guard)

- `src/middleware.ts` **solo** revisa que exista el token (si no, manda a `/sign-in`). Ya no mira roles.
- `RoutePermissionGuard` (`src/features/auth/ui/route-permission-guard.tsx`) está montado en
  `src/app/(intranet)/layout-client.tsx` y envuelve a todas las páginas del intranet.
- El permiso de cada ruta lo calcula `getRouteRequirement(pathname)` en
  `src/shared/config/route-permissions.ts`, usando `sidebar-data.ts`:
  1. Busca el item del sidebar cuya `url` sea el **prefijo más largo** del pathname.
  2. Cambia la acción según la ruta:

| Ruta | Permiso pedido |
|---|---|
| `/clients` | `clients.view` |
| `/clients/5` (detalle), `/clients/reorder`... | `clients.view` |
| `/clients/create` | `clients.create` |
| `/clients/edit/5` | `clients.update` |
| `/images/upload` | `images.create` |

  3. Si ninguna url coincide (`/profile`, `/settings/...`, `/help-center`) la página es **libre**.
- Páginas que no están en el menú pero pertenecen a un módulo (ej. `/furniture-images`) van en
  `EXTRA_ROUTES` dentro de `route-permissions.ts`.
- Sin permiso se muestra "No tienes permiso para ver esta página" con un botón al dashboard
  (o a la primera página permitida si tampoco puede ver el dashboard → sin bucles de redirección).
- Mientras se sabe qué permisos tiene el usuario se muestra "Verificando permisos..." (no el aviso).

## 6. Pantalla de permisos de un rol (`/roles/{id}/permissions`)

Se entra desde **Roles → menú "…" de la fila → Permisos** (o el botón **Permisos** del detalle del rol).
No está en el sidebar: los permisos siempre pertenecen a un rol.
Al **crear un rol nuevo**, el formulario te trae aquí automáticamente (un rol nuevo empieza sin permisos).
El superadmin no tiene ese botón (tiene acceso total y no se edita).

```
← Volver   Permisos de «vendedor»
[🖥 Intranet 12/40 | 📱 Móvil 5/30]   Buscar…   [Todos|Con acceso|Sin acceso]   [⚡ Acciones rápidas ▾]

▼ 🧾 Ventas  2/3                                                    [  ●]  ← switch del grupo
  ┌ Ventas ───── ☑ Todo ┐ ┌ Tipos de comprobante ☐ ┐ ┌ Configuración ─ ☐ ┐
  │ Ver          [  ●]  │ │ Ver            [  ●]   │ │ Ver        [●  ]  │
  │ Crear        [  ●]  │ │ Crear          [●  ]   │ │ Editar     [●  ]  │
  │ Eliminar     [●  ]  │ │ ...                    │ └───────────────────┘
  └─────────────────────┘ └────────────────────────┘
▶ 🌐 Sitio Web  0/14                                                 [●  ]
                                                          [Cancelar] [Guardar 3]
```

| Elemento | Qué hace | Componente |
|---|---|---|
| Pestañas **Intranet / Móvil** | Qué plataforma configuras. Son independientes | `ui/role-permissions-view.tsx` |
| Buscador y filtro | Encontrar un módulo; ver solo los que tienen o no tienen acceso | `ui/role-permissions-view.tsx` |
| **Acciones rápidas ▾** (menú) | Activar todo, solo ver, quitar todo, copiar de la otra plataforma, expandir/contraer grupos | `ui/role-permissions-view.tsx` |
| Grupo (acordeón) + su switch | El switch **oculta o muestra el grupo entero** (apagado = quita todo el grupo; encendido = activa «Ver» en todos sus módulos) | `ui/permission-group.tsx` |
| Card de módulo | Un switch por acción. **☑ Todo** marca o quita todas. Los submódulos (ej. cada reporte) son filas con sangría. Las acciones con `is_widget: true` (widgets del dashboard) van al final bajo el subtítulo **Widgets** | `ui/module-card.tsx` + `ui/permission-row.tsx` |
| Cancelar / Guardar | Guardar muestra cuántos cambios hay. Cancelar pregunta si hay cambios y vuelve a Roles | `ui/role-permissions-view.tsx` |

Reglas:

- **Activar cualquier acción activa también «Ver»**, y **apagar «Ver» apaga las demás acciones**
  del módulo (no tiene sentido poder «Editar» algo que no ves). Está en `applyToggle()` de
  `lib/permission-tree.ts`.
- Guardar envía `PUT /v1/intranet/role/{id}/permissions` con **todas** las keys completas
  de las dos plataformas. Solo aparece con `roles.permissions`. Ver la pantalla requiere `roles.view`.
- Si editas tu propio rol, se llama a `authStore.verify()` y el sidebar se actualiza al momento.

Archivos:

```
src/app/(intranet)/roles/[id]/permissions/page.tsx   → la ruta (Server Component)
src/features/permissions/
  data/data.ts                       → iconos de acciones, plataformas y grupos
  lib/permission-tree.ts             → funciones puras: contar módulos, filtros, copiar, regla de «Ver»
  stores/usePermissionTreeStore.ts   → el árbol (GET /permissions/tree)
  stores/useRolePermissionsStore.ts  → permisos del rol, cambios sin guardar, guardar
  ui/role-permissions-view.tsx       → la pantalla (barra de herramientas + grupos + guardar)
  ui/filter-tabs.tsx                 → filtro Todos / Con acceso / Sin acceso
  ui/permission-group.tsx            → un grupo (acordeón + switch)
  ui/group-switch.tsx                → switch que muestra u oculta un grupo entero
  ui/group-grid.tsx                  → cuadrícula de cards de un grupo
  ui/sub-group.tsx                   → sub-grupo (título + switch + su cuadrícula)
  ui/module-card.tsx                 → la card de un módulo: acciones arriba y "Widgets" debajo
  ui/permission-row.tsx              → una fila (acción o widget) con su switch
```

Endpoints usados:

```
GET /v1/intranet/permissions/tree          → árbol de módulos y acciones (keys completas).
                                             Cada acción trae label (en widgets, su nombre) e is_widget
GET /v1/intranet/role/{id}/permissions     → keys completas del rol
PUT /v1/intranet/role/{id}/permissions     → body { permissions: string[] }
```

## 7. Widgets del dashboard y bloques de reportes

### Widgets del dashboard

Cada pantalla del dashboard es un módulo (`dashboard_summary`, `dashboard_sales`, `dashboard_proformas`,
`dashboard_messages`, `dashboard_staff`) con su acción `view` (entrar a la pantalla, protege menú y URL)
y una acción más **por widget**: `<pantalla>.<widget>`. El `<widget>` es la **misma key del bloque en el
JSON** del endpoint (ej. `dashboard_sales.goal` → bloque `goal`). El backend **omite** del JSON los bloques
que el rol no tiene. En la pantalla de permisos se ven bajo el subtítulo **Widgets** de cada card.

Cada página hace lo mismo: un objeto `show` con un `useCan` por widget + `hasBlock()`
([has-block.ts](src/features/dashboard/lib/has-block.ts)) para no pintar un bloque que el backend no mandó
(así ningún widget se queda "cargando"). Una fila o sección sin widgets se oculta (con su título) y si
queda un solo widget en una fila ocupa todo el ancho. Sin ningún widget se muestra
`<DashboardNoWidgets>` ("No tienes widgets habilitados en esta pantalla").

| Pantalla | Archivo con los `useCan` | Widgets |
|---|---|---|
| Resumen general | [summary-dashboard.tsx](src/features/dashboard/ui/summary/summary-dashboard.tsx) | `kpis`, `goal` (tarjeta "Meta del mes", campos `goal_*` de kpis), `monthly`, `payment_status`, `latest_sales`, `top_debtors` (`top_products` aún no se pinta en el intranet). "Vendedores activos" sigue pidiendo `sales.view_all` |
| Rendimiento de ventas | [sales-performance-dashboard.tsx](src/features/dashboard/ui/sales-performance/sales-performance-dashboard.tsx) | `kpis`, `goal`, `monthly`, `by_document_type`, `by_payment_method`, `by_type`, `top_clients`, `top_products`, `by_category`, `weekday_heatmap`, `by_seller` (además pide `sales.view_all`), `receivables` (antigüedad + tabla de clientes) |
| Seguimiento de proformas | [proformas-dashboard.tsx](src/features/dashboard/ui/proformas/proformas-dashboard.tsx) | `kpis`, `funnel`, `by_status`, `by_type`, `monthly`, `top_clients` |
| Mensajes y opiniones | [messages-dashboard.tsx](src/features/dashboard/ui/messages/messages-dashboard.tsx) | `kpis`, `contact_by_project_type`, `contact_by_status`, `contact_monthly`, `testimonies_by_rating`, `chatbot_daily`, `chatbot_by_option`, `chatbot_input_type`, `chatbot_by_status` |
| Accesos del personal | [staff-access-dashboard.tsx](src/features/dashboard/ui/staff-access/staff-access-dashboard.tsx) | `kpis`, `daily`, `by_platform`, `by_app_version`, `by_browser`, `google_requests_by_status` |

**Botón ↗ "Ver en reportes"** de cada gráfico: [use-report-href.ts](src/features/dashboard/lib/use-report-href.ts)
devuelve `undefined` si el usuario no tiene `reports.view` + `report_<slug>.view` del reporte destino, y
`<ChartCard>` (`src/shared/ui/dashboard`) no pinta el botón cuando `href` es `undefined`.

**Agregar un widget nuevo (ej. `dashboard_sales.by_branch`):**

1. **Backend** — en `config/permissions.php`, en `'widgets'` de la pantalla: `'by_branch' => 'Ventas por sucursal'`
   y `php artisan db:seed --class=PermissionsSeeder`. El endpoint debe devolver el bloque con esa misma key
   (y omitirlo si el rol no lo tiene).
2. **DTO** — en `src/features/dashboard/model/dashboard-*.dto.ts` agrega `by_branch?: ...` (opcional).
3. **Componente** — crea el gráfico en su propio archivo (`ui/sales-performance/branch-chart.tsx`) usando `<ChartCard>`.
4. **Página** — en el objeto `show`: `byBranch: useCan('dashboard_sales.by_branch') && hasBlock(data, 'by_branch')`
   y pinta `{show.byBranch && <BranchChart data={data?.by_branch} />}` dentro de su fila (ajusta las columnas
   de la grilla si cambia la cantidad de widgets de esa fila).
5. **Asignar** — Roles → Permisos → card de la pantalla → subtítulo **Widgets**.

### Bloques de reportes

Cada reporte es un módulo `report_<slug con _>` (ej. `report_sales_register`) con las acciones
`view`, `kpis`, `charts`, `table`, `detail` y `export`. **Ya no existe `reports.export`**: exportar es
por reporte. La key se arma con [report-permission.ts](src/features/reports/lib/report-permission.ts):
`reportPermission('sales-register', 'export')` → `'report_sales_register.export'`.

| Bloque | Qué controla | Dónde está el `useCan` |
|---|---|---|
| `view` | La pestaña del reporte (Pagos: cada vista del toggle). **Vendedores** solo pide `report_sales_by_seller.view` | [reports-view.tsx](src/features/reports/ui/reports-view.tsx) (`hasPermission`) |
| `kpis` / `charts` / `table` | Tarjetas, gráficos y tabla del reporte activo. Sin ninguno de los tres se muestra un aviso amable | [report-panel.tsx](src/features/reports/ui/report-panel.tsx) |
| `detail` | Expandir el detalle de una fila (además el backend manda `has_detail`) | [report-table.tsx](src/features/reports/ui/report-table.tsx) |
| `export` | Botones Excel / PDF del reporte activo | [report-export-buttons.tsx](src/features/reports/ui/report-export-buttons.tsx) |

El backend también recorta la respuesta: `kpis: []`, `charts: []`, `columns: [] / rows: [] / totals: null` y
`has_detail: false` según los permisos. Para un reporte nuevo: agrégalo en `$reportChildren` del backend y
en `REPORTS` / `REPORT_TABS` de [reports.config.ts](src/features/reports/data/reports.config.ts): los
bloques usan `reportPermission()` automáticamente.

## 8. Error 403 global

En `src/shared/api/apiClient.ts`, si cualquier petición responde **403** se muestra un toast
"Sin permiso" con el `message` del backend (el mismo mensaje no se repite antes de 3 segundos).
El error se sigue propagando normal, así que cada store puede manejarlo además si lo necesita.

El flujo de 401 (refresh del token) no cambia; solo se mejoró para que, si varias peticiones
reciben 401 a la vez, todas esperen el mismo refresh.

## 9. Checklist: cómo proteger un módulo nuevo

1. **Backend**: agrega el módulo en `config/permissions.php` (key, nombre y acciones) y corre
   `php artisan db:seed --class=PermissionsSeeder`. Protege sus rutas con `permission:<key>.<accion>`.
2. **Sidebar**: en `src/shared/config/sidebar-data.ts` agrega el item con
   `permission: '<key>.view'`. Con eso ya se filtran el menú, el buscador y el guard de rutas
   (`/x/create` → `<key>.create`, `/x/edit/...` → `<key>.update`).
   Si la página no va en el menú, agrégala a `EXTRA_ROUTES` en `src/shared/config/route-permissions.ts`.
3. **Botones**: en la feature usa `useCan('<key>.create' | '<key>.update' | '<key>.delete' | '<key>.state' ...)`
   o `<Can>` para ocultar "Nuevo", "Editar", "Eliminar", "Cambiar estado" y las acciones masivas.
4. **Asignar**: en **Roles → menú "…" → Permisos**, activa los switches del módulo nuevo para cada rol.
