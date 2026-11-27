# Intranet Carpintería Cillat

Panel administrativo (intranet) de Carpintería Cillat: ventas, proformas, clientes, catálogo, contenido del
sitio web, chatbot, dashboards de gestión y reportes exportables. Consume la API Laravel
(`carpinteriacillat_backend`) y comparte contrato con la app móvil Flutter.

---

## 1. Stack y versiones

| Tecnología | Versión | Para qué se usa |
|---|---|---|
| Next.js (App Router) | ^16.2 | Rutas, layouts, middleware, SSR |
| React | ^19 | UI |
| TypeScript | ^5 | Tipado estricto (`strict: true`) |
| Tailwind CSS | ^4.2 | Estilos (solo utilidades, sin CSS modules) |
| shadcn/ui + Radix UI | — | Componentes base en `src/shared/ui` |
| Zustand | ^5 | Estado del cliente (un store por caso de uso) |
| TanStack Table | ^8.21 | Tablas con paginación en servidor |
| react-hook-form + Zod | ^7.74 / ^4.3 | Formularios y validación |
| Axios | ^1.15 | Cliente HTTP con interceptores de auth |
| Recharts | ^2.15 | Gráficos de los dashboards (vía `shared/ui/chart.tsx`) |
| Sonner / SweetAlert2 | ^2 / ^11 | Toasts y confirmaciones |
| next-themes | ^0.4 | Modo claro / oscuro sin parpadeo |
| lucide-react | ^1.11 | Íconos |
| Firebase | ^12 | Login con Google |

> **Recharts + React 19:** `package.json` incluye `"overrides": { "react-is": "^19.0.0" }`. Recharts 2.x depende
> de `react-is` y sin ese override npm instala la versión de React 18, lo que rompe los gráficos.

---

## 2. Cómo levantar el proyecto

```bash
# 1. Instalar dependencias (desde cero si cambió package.json)
npm install

# 2. Variables de entorno
cp .env.example .env      # y ajustar NEXT_PUBLIC_API_URL, etc.

# 3. Servidor de desarrollo (Turbopack) en http://localhost:3000
npm run dev
```

El backend Laravel debe estar corriendo (por defecto en `http://localhost:8000`). Al abrir `/` la app verifica la
sesión y redirige a `/dashboard` o a `/sign-in`.

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con Turbopack |
| `npm run build` | Build de producción |
| `npm start` | Sirve el build de producción |
| `npm run lint` | ESLint (config flat de `eslint-config-next`) |
| `npm run format` / `npm run format:check` | Prettier (con plugin de Tailwind) |
| `npx tsc --noEmit -p .` | Verificación de tipos sin compilar |

No hay suite de tests configurada.

---

## 3. Variables de entorno

| Variable | Ejemplo | Uso |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Base de la API (si falta, `apiClient` usa `http://localhost:8000/api`) |
| `NEXT_PUBLIC_IMAGE_URL` | `http://localhost:8000/storage/` | Prefijo de imágenes del storage |
| `NEXT_PUBLIC_APP_VERSION` | `1.0.0` | Se envía en la cabecera `X-App-Version` |
| `NEXT_PUBLIC_CLIENT` | `web` | Se envía en la cabecera `X-Client` |
| `NEXT_PUBLIC_WEB_PREVIEW_URL` | `http://localhost:3001` | Sitio público para la vista previa en vivo (`widgets/landing-preview`) |
| `NEXT_PUBLIC_GOOGLE_FONTS_API_KEY` | — | Selector de tipografías |
| `NEXT_PUBLIC_FIREBASE_*` | — | Configuración de Firebase (login con Google) |

Las variables `NEXT_PUBLIC_*` quedan embebidas en el bundle del navegador: **no** pongas ahí secretos del servidor.

---

## 4. Arquitectura: Feature-Sliced Design (FSD)

Dirección de dependencias (solo hacia abajo):

```
app  →  widgets  →  features  →  entities  →  shared
```

- `shared/` **nunca** importa de `features/` ni de `widgets/`.
- Una feature no debería depender de otra; si es inevitable, solo importa lo público de su `index.ts`
  (ej. `ClientSelect` desde `@/features/clients`).
- `app/` solo define rutas y compone componentes: **sin lógica de negocio**.

### Mapa de carpetas

```
src/
├── app/                       # Rutas de Next.js (App Router)
│   ├── (auth)/                # Públicas: /sign-in, /sign-up, /forgot-password
│   ├── (intranet)/            # Protegidas: el layout monta AuthSessionProvider + Sidebar
│   │   ├── dashboard/         # 5 dashboards (ver sección 9)
│   │   ├── reports/           # Una sola página con pestañas (?tab=ventas…) (sección 10)
│   │   └── <modulo>/          # page.tsx, create/, edit/[id]/, [id]/ … por cada CRUD
│   ├── api/download-proxy/    # Route handler para descargar archivos de otro dominio
│   └── page.tsx               # Verifica sesión y redirige
├── features/                  # Un módulo por entidad/caso de uso (sales, proformas, clients, dashboard, reports…)
├── entities/                  # Tipos de dominio compartidos (person/, role/)
├── widgets/                   # Bloques compuestos: sidebar/, header/, command-menu/, landing-preview/
├── middleware.ts              # Protección de rutas por cookie y rol
└── shared/
    ├── api/                   # apiClient.ts, apiError.ts, sessionExpired.ts
    ├── config/                # sidebar-data.ts, nav-types.ts, entity-states.ts, cookie.storage.ts
    ├── device/appInfo.ts      # getClientType / getAppPlatform / getAppVersion (cabeceras X-*)
    ├── hooks/                 # Hooks genéricos (vista previa en vivo)
    ├── lib/                   # cn(), formatDisplayDate(), toast.ts, swal.ts, save-file.ts, api-errors.ts…
    ├── providers/             # Theme, layout y search providers
    ├── stores/                # layout-store, notification-store, search-store, preview-store
    ├── styles/globals.css     # Tokens del tema (claro/oscuro) y paleta de gráficos --chart-1..8
    ├── type/                  # Fragmentos de DTO: paginación (links/meta)
    └── ui/                    # Componentes shadcn/ui + data-table/, chart.tsx, dashboard/
```

### Archivos importantes

| Archivo | Qué hace |
|---|---|
| `src/shared/api/apiClient.ts` | Instancia Axios: `baseURL`, cabeceras `X-Client` / `X-Platform` / `X-App-Version`, inyecta `Authorization: Bearer`, y ante un 401 intenta **un** refresh silencioso; si falla llama a `SessionExpired.execute()` (limpia tokens y va a `/sign-in`). |
| `src/middleware.ts` | `PROTECTED_PREFIXES`: rutas que exigen la cookie `access_token`. `ROUTE_ROLES`: rutas restringidas por rol (cookie `auth_role`). `/dashboard` nunca va en `ROUTE_ROLES` porque es el destino de fallback (provocaría un bucle de redirecciones). |
| `src/shared/config/sidebar-data.ts` | Menú lateral: enlaces simples, acordeones (`items`), `roles` y `badge`. |
| `src/shared/ui/chart.tsx` | Componente `chart` oficial de shadcn para Recharts 2.x (`ChartContainer`, `ChartTooltip`, `ChartLegend`…). |
| `src/shared/ui/dashboard/` | Kit de dashboards: `ChartCard`, `KpiCard`, `DashboardFilters`, gráficos genéricos y formateadores. |
| `src/shared/ui/data-table/` | Paginación, opciones de columnas y acciones masivas para TanStack Table. |
| `src/shared/styles/globals.css` | Tokens de color; `--chart-1` … `--chart-8` para claro y oscuro. |

---

## 5. Patrón de una feature

Todas las features CRUD siguen la misma estructura (ejemplo: `roles`):

```
features/roles/
├── model/                 # DTOs = forma EXACTA del API (snake_case)
│   ├── roleget.dto.ts     #   parámetros del listado + respuesta paginada
│   ├── rolepost.dto.ts    #   crear
│   └── roleput.dto.ts     #   actualizar
├── data/
│   ├── schema.ts          # Esquema Zod + tipo normalizado que usa la UI (camelCase)
│   └── data.ts            # Datos estáticos: opciones de filtros, etiquetas, badges
├── services/
│   ├── roles.endpoint.ts  # { v1: { get, post, put(id), patch(id), delete(id) } }
│   └── roles.service.ts   # Wrappers finos de apiClient (filtra params vacíos en GET)
├── stores/
│   ├── useRoleListStore.ts    # listado paginado + filtros + mapRoleFromApi()
│   ├── useRoleFormStore.ts    # crear/actualizar: isSubmitting, error, fieldErrors
│   ├── useRoleDeleteStore.ts  # eliminar / cambiar estado (individual y masivo)
│   └── useRoleSelectStore.ts  # lista liviana para <Select>
├── ui/                    # Componentes 'use client' (tabla, columnas, form, detalle, select…)
└── index.ts               # Barrel: lo único que deberían importar otras capas
```

Ejemplo mínimo de service y store:

```ts
// services/roles.service.ts
export const rolesService = {
  getList: async (param: RoleListRequestDto) => {
    const params = Object.fromEntries(Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== ''))
    const { data } = await apiClient.get<RoleListResponseDto>(ROLES_ENDPOINTS.v1.get, { params })
    return data
  },
}

// stores/useRoleListStore.ts
load: async (params = {}) => {
  const nextFilters = { ...get().filters, ...params }
  set({ filters: nextFilters, isFetching: true })
  try {
    const response = await rolesService.getList(nextFilters)
    set({ roles: response.data.map(mapRoleFromApi), meta: response.meta, isFetching: false })
  } catch (error: any) {
    set({ isFetching: false, isError: true, message: error?.response?.data?.message })
  }
}
```

Convenciones del store de formulario: `update()` usa `patch` si algún campo viene vacío; devuelve `boolean` y la UI
aplica los errores del backend con `applyApiErrors(form, fieldErrors)`.

---

## 6. Flujo de datos

```
Página (Server Component, app/)
  └─ Componente 'use client' (features/*/ui)
       └─ Store Zustand (features/*/stores)
            └─ Service (features/*/services)
                 └─ apiClient (shared/api/apiClient.ts)  →  API Laravel
```

Todas las respuestas del API tienen la forma `{ success, status, message, data, links?, meta?, errors? }`.
Los montos pueden llegar como número o string decimal (`"120.50"`): convertirlos con `Number()` / `toNumber()`.

---

## 7. Autenticación

- `access_token` y `refresh_token` se guardan en `localStorage`; `access_token` y `auth_role` también en cookies
  para que el `middleware.ts` (que corre en el servidor) pueda leerlos.
- Tras el login se usa `window.location.replace('/dashboard')` (no `router.replace`) para que la primera petición
  al servidor ya lleve las cookies.
- `AuthSessionProvider` (en el layout de `(intranet)`) llama a `authStore.verify()` al montar para hidratar el store;
  no redirige por su cuenta.

---

## 8. Cómo agregar un módulo nuevo (paso a paso)

1. **Contrato:** revisa el endpoint en el backend (ruta, parámetros, respuesta).
2. **DTOs:** crea `features/<modulo>/model/*.dto.ts` copiando la forma exacta del JSON.
3. **Esquema UI:** en `data/schema.ts` define el esquema Zod y el tipo normalizado; en `data/data.ts` las opciones
   estáticas.
4. **Service:** `services/<modulo>.endpoint.ts` con las URLs y `services/<modulo>.service.ts` con los métodos.
5. **Stores:** copia el patrón de `useRoleListStore` / `useRoleFormStore` / `useRoleDeleteStore` y agrega
   `mapXFromApi()`.
6. **UI:** tabla (`*-table.tsx` + `*-columns.tsx` + `*-row-actions.tsx`), formulario, detalle y breadcrumb, todos
   con `'use client'` y textos en español.
7. **Barrel:** exporta lo público en `features/<modulo>/index.ts`.
8. **Rutas:** crea `app/(intranet)/<modulo>/page.tsx` (con `<Header fixed title='…' />`), y si aplica
   `create/page.tsx`, `edit/[id]/page.tsx`, `[id]/page.tsx` y `loading.tsx`.
9. **Protección:** agrega `'/<modulo>'` a `PROTECTED_PREFIXES` en `src/middleware.ts` (y a `ROUTE_ROLES` solo si
   debe restringirse por rol).
10. **Menú:** agrega el enlace en `src/shared/config/sidebar-data.ts` con un ícono de `lucide-react`.
11. **Verifica:** `npx tsc --noEmit -p .` y `npm run lint`.

---

## 9. Módulo Dashboard (`features/dashboard`)

Rutas (acordeón **Dashboard** del sidebar):

| Ruta | Página | Endpoint |
|---|---|---|
| `/dashboard` | Resumen general | `GET /v1/intranet/dashboard/summary` |
| `/dashboard/sales-performance` | Rendimiento de ventas | `GET /v1/intranet/dashboard/sales-performance` |
| `/dashboard/proformas` | Seguimiento de proformas | `GET /v1/intranet/dashboard/proformas` |
| `/dashboard/messages` | Mensajes y opiniones | `GET /v1/intranet/dashboard/messages` |
| `/dashboard/staff-access` | Accesos del personal | `GET /v1/intranet/dashboard/staff-access` |

Parámetros comunes: `date_from`, `date_to` (Y-m-d), `currency` (`PEN` | `USD`) y `user_id` opcional (vendedor, §11).

```
features/dashboard/
├── model/                 # DTOs exactos del contrato (uno por endpoint + common)
├── lib/
│   ├── normalize-amounts.ts   # Convierte montos string → number una sola vez al recibir la respuesta
│   └── use-dashboard-data.ts  # Hook: escucha los filtros compartidos y recarga el store (con debounce)
├── services/              # dashboard.endpoint.ts + dashboard.service.ts
├── stores/
│   ├── useDashboardFiltersStore.ts  # Filtros COMPARTIDOS por las 5 páginas
│   ├── createDashboardStore.ts      # Fábrica de stores (descarta respuestas viejas si el filtro cambia rápido)
│   └── useDashboardStores.ts        # Un store por página
└── ui/
    ├── common/            # Toolbar de filtros, badges de estado, títulos de sección
    ├── summary/           # Un archivo por KPI / gráfico / tabla
    ├── sales-performance/
    ├── proformas/
    ├── messages/
    ├── sellers/           # Sección "Vendedores" de Rendimiento de ventas (ranking, meta vs logrado, top 5)
    └── staff-access/
```

### Vendedores y permisos (§11)

- **Filtro "Vendedor"** (`SellerSelect` de `features/sellers`) en los dashboards de Resumen, Rendimiento de ventas y
  Proformas, y en Reportes. Solo aparece con `sales.view_all`; se guarda en `useDashboardFiltersStore.sellerId` /
  `useReportStore.sellerId` y se envía como `user_id`. Sin ese permiso el backend devuelve solo lo propio.
- Bajo los filtros se indica de quién son las cifras: **"Mostrando: Juan Pérez"**, "Mostrando: todos los
  vendedores" o **"Mis ventas"** (sin `sales.view_all`). El nombre sale de `period.seller_name` (o de la lista del
  selector mientras carga).
- **Rendimiento de ventas › Vendedores** (`by_seller`, solo con `sales.view_all`): ranking por monto (se oculta si
  hay un vendedor filtrado), meta vs logrado (el tooltip muestra el % de avance) y tabla top 5 con ventas, ticket
  promedio y conversión de proformas.
- **Resumen**: KPI "Vendedores activos" (solo con `sales.view_all`). La tarjeta de meta (y "Meta del mes" de
  Rendimiento) tiene un botón ⚙ "Configurar metas" → `/sale-goals`, visible solo con `sale_goals.update`.

### Kit reutilizable `shared/ui/dashboard`

| Pieza | Uso |
|---|---|
| `ChartCard` | Tarjeta con título, descripción, acción, pie y estados *cargando / vacío / error* |
| `KpiCard` | Ícono, valor formateado, variación % con flecha y color, barra de progreso opcional |
| `DashboardFilters` | Rango rápido (Este mes, Mes anterior, Últimos 7/30/90 días, Este año, Personalizado) + moneda |
| `DonutChart`, `BarListChart`, `ColumnChart`, `GaugeChart` | Gráficos genéricos que reciben `{ label, value }` |
| `SeriesChart` | Líneas o columnas de varias series (`series: [{ key, label, format, unit }]`), con leyenda y segundo eje si cambia la unidad |
| `formatMoney`, `formatNumber`, `formatPercent`, `formatShortDate`, `toNumber` | Formateadores `Intl` es-PE |
| `chartColor(i)` | Color de serie `var(--chart-N)` en orden fijo (más de 8 categorías se agrupan en "Otros") |

Para un gráfico nuevo: envuélvelo en `ChartCard`, usa `ChartContainer` con un `ChartConfig` cuyos colores salgan de
`chartColor()`, y formatea el tooltip con `tooltipFormatter(...)` para mostrar valores ya formateados.

---

### Dashboard vs Reportes

El dashboard es una **vista rápida**: no repite lo que hay en Reportes.

- Las tablas muestran como máximo el **top 5** (y los rankings en gráfico, también top 5).
- Cada `ChartCard` con un reporte relacionado tiene un botón-ícono **↗ "Ver en reportes"** (`href`), que abre
  `/reports?tab=…` con el **mismo periodo, moneda y vendedor** (`lib/use-report-href.ts` los pasa por la URL).
- `ChartCard` **no se pinta** si `isEmpty` es true (prop `hideWhenEmpty`, por defecto `true`), así no quedan
  tarjetas vacías grandes. "Meta del mes" usa `hideWhenEmpty={false}` para recordar registrar la meta.

### Botones solo ícono

En Dashboard y Reportes las acciones (Actualizar, Exportar Excel/PDF, Ver, Expandir, Reintentar) son solo ícono,
siempre con tooltip y `aria-label`:

| Componente | Uso |
|---|---|
| `shared/ui/icon-button.tsx` → `IconButton` | Acción con `onClick`: `<IconButton label='Exportar Excel' icon={<FileSpreadsheet />} onClick={…} />` |
| `shared/ui/icon-link-button.tsx` → `IconLinkButton` | Navegación (es un `<a>` real): `<IconLinkButton href='/sales/15' label='Ver venta' icon={<Eye />} />` |

---

## 10. Módulo Reportes (`features/reports`)

Una sola página **`/reports`** (grupo **Reportes**, al final del sidebar) con pestañas:

| Pestaña (`?tab=`) | Reporte del backend |
|---|---|
| `ventas` | `sales-register` |
| `clientes` | `sales-by-client` |
| `productos` | `sales-by-product` |
| `pagos` | `payments` (toggle **Pagos recibidos**, `&vista=recibidos`) o `receivables` (**Saldos pendientes**, `&vista=saldos`) |
| `proformas` | `proformas` |
| `mensajes` | `contact-messages` |
| `vendedores` | `sales-by-seller` (solo con `sales.view_all`) |

La URL también acepta `preset`, `date_from`, `date_to`, `currency` y `user_id` (los usa el botón ↗ del dashboard;
`user_id` solo se aplica con `sales.view_all`). Cada pestaña además exige el permiso de su reporte
(`report_<reporte>.view`, ver `ROLES_Y_PERMISOS.md`); la pestaña Vendedores pide también `sales.view_all`.

- Endpoints (contrato §10):
  - `GET /v1/intranet/reports/{report}?date_from&date_to&currency&client_id&status&user_id&format=json|xlsx|pdf`
    → `kpis`, `charts`, `columns`, `rows` (con `id` y `link`), `totals`, `has_detail`.
  - `GET /v1/intranet/reports/{report}/detail/{id}` → `title`, `subtitle`, `fields`, `sections`.
- `data/reports.config.ts`: por reporte, título, descripción, si usa moneda/cliente/vendedor (`usesSeller`) y qué
  estados filtra; además
  `REPORT_TABS`, `PAYMENTS_VIEWS` y `getTabReport()`. **Agregar un reporte = sumar una entrada aquí** (y su
  implementación en el backend).
- Pantalla (`ui/reports-view.tsx`): filtros compartidos arriba → **KPIs** (`report-kpis.tsx`) → **gráficos**
  (`report-charts.tsx`) → **tabla** (`report-table.tsx`). Se consulta sola al cambiar pestaña o filtro (debounce
  400 ms); el botón ↻ fuerza la recarga.
- **Gráficos genéricos** según `charts[].type`: `line` / `bar` → `SeriesChart` (varias series; si mezclan
  monto y cantidad, la segunda unidad va al eje derecho), `bar_horizontal` → `BarListChart`, `donut` →
  `DonutChart`, `funnel` → barras ordenadas con % sobre la primera etapa. Un gráfico con `data` vacío **no se
  pinta**; si no hay filas ni gráficos con datos se muestra un aviso compacto.
- **Tabla**: si `has_detail`, cada fila tiene ▸/▾ que carga el detalle **al expandir**
  (`useReportDetailStore`, cacheado por `reporte:id`) y muestra `fields` en grilla y `sections` como mini tablas
  con totales. El botón 👁 abre el registro según `row.link` (`lib/report-links.ts`: venta → `/sales/{id}`,
  proforma → `/proformas/{id}`, mensaje → `/contact-messages/{id}`, cliente → `/clients/{id}`, usuario/vendedor → `/users/{id}`). La columna "Vendedor" llega sola en `columns`. En el celular
  la tabla se muestra como **tarjetas apiladas** y las pestañas se desplazan horizontalmente. Se pintan 100
  filas por vez (botón "Mostrar más").
- **Exportar Excel / PDF** descarga el archivo con `responseType: 'blob'`. El nombre sale de la cabecera
  `Content-Disposition` o, si no está disponible, de `{report}_{date_from}_{date_to}.{ext}`.
  Para que el navegador pueda leer esa cabecera, el backend debe exponerla por CORS
  (`Access-Control-Expose-Headers: Content-Disposition`).

---

## 11. Ventas, vendedores y metas

### Realizar venta (`/sales/create`, `/sales/edit/[id]`)

Pantalla tipo caja (`features/sales/ui/pos/*`). Todo el borrador vive en **un solo store**
(`stores/useSalePosStore.ts`) y se envía en **una sola petición**: `POST /v1/intranet/sales/full`
(crear y emitir) o `PUT /v1/intranet/sales/{id}/full` (editar una venta GUARDADA). Los cálculos (descuento por
línea, IGV, redondeo a 2 decimales por línea) están en `lib/sale-pos/calculate.ts` y replican al backend.

- Atajos: **F2** producto, **F3** cliente, **F4** importar proforma, **Ctrl+Enter** emitir, **Supr** quitar línea.
- "Emitir venta" siempre pide confirmación (resumen de cliente, comprobante, total y pago) y al terminar muestra un
  toast con la acción "Ver" y deja la pantalla limpia para la siguiente venta.
- Proforma → venta: desde la proforma ACEPTADA ("Convertir en venta") se abre `/sales/create?proforma={id}`, que usa
  `GET /v1/intranet/proformas/{id}/sale-draft`.
- Métodos de pago: lista fija `SALE_PAYMENT_METHODS` en `features/sale-payments/data/data.ts`.

### Vendedores (`features/sellers`)

Cada venta y proforma guarda su vendedor (`user_id`, y el API devuelve `seller_name`).

| Permiso | Qué habilita |
|---|---|
| `sales.view_all` | Ver ventas de todos, columna + filtro "Vendedor" en el listado, y en el POS el selector "Vendedor" (por defecto el usuario de la sesión; se envía `user_id`) |
| `proformas.view_all` | Igual para proformas (filtro por vendedor) |

Sin `*.view_all` el backend solo devuelve los registros propios. El selector reutilizable es
`<SellerSelect value onValueChange showAll? />` de `@/features/sellers` (datos: `GET /v1/intranet/sellers`, cacheados
en `useSellerSelectStore`). Muéstralo solo con `useCan('sales.view_all')`, porque ese endpoint exige el permiso.

### Metas de venta (`/sale-goals`, `features/sale-goals`)

Página propia en el grupo **Ventas** del sidebar (ya no está dentro de Configuración de Ventas). Se elige año y
moneda; la card **Meta general del negocio** edita los 12 meses de `user_id = null` y **Metas por vendedor** permite
elegir un vendedor y editar su grilla. Cada card guarda con `PUT /v1/intranet/sale-goals` (`user_id` null o el del
vendedor); un mes vacío o en 0 borra la meta de ese mes. Se cargan todas con
`GET /v1/intranet/sale-goals?year=&currency=&user_id=all`.

Permisos: `sale_goals.view` (entrar; lo pide el guard por la URL del sidebar) y `sale_goals.update` (guardar; sin él
la página queda en solo lectura). Las metas por vendedor además necesitan `sales.view_all` (lista de vendedores).

---

## 12. Convenciones

- Componentes de feature con `'use client'`; páginas de `app/` como Server Components.
- Textos de UI en español; identificadores de código en inglés.
- Solo utilidades de Tailwind; alias `@/*` → `src/*`.
- Sin `any`, salvo en `catch (error: any)` y en el acceso a errores de Axios.
- Comentarios en español explicando el **por qué** de las decisiones.
