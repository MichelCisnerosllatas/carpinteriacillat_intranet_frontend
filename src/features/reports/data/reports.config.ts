import type { ReportKey } from '../model/report.dto'

// Configuración de cada reporte: la pantalla de Reportes (<ReportsView>) se adapta leyendo esto.
// Para agregar un reporte nuevo basta con sumar una entrada aquí (y su ruta en el backend).

export type ReportStatusOption = { value: string; label: string }

export type ReportConfig = {
  title: string
  description: string
  /** Muestra el selector de moneda (los reportes sin montos no lo necesitan). */
  usesCurrency: boolean
  /** Muestra el filtro de cliente (envía client_id). */
  usesClient: boolean
  /**
   * Muestra el filtro de vendedor (envía user_id). El filtro solo aparece si además el usuario
   * tiene `sales.view_all`; sin ese permiso el backend ya devuelve solo lo propio.
   */
  usesSeller: boolean
  /** Si existe, muestra un filtro de estado con estas opciones (envía status). */
  statusOptions?: ReportStatusOption[]
  /** Aclaración que se muestra bajo los filtros (ej. cómo se usa el rango de fechas). */
  note?: string
}

const SALE_STATUSES: ReportStatusOption[] = [
  { value: 'GUARDADA', label: 'Guardada' },
  { value: 'EMITIDA', label: 'Emitida' },
  { value: 'ANULADA', label: 'Anulada' },
]

const PROFORMA_STATUSES: ReportStatusOption[] = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'ACEPTADA', label: 'Aceptada' },
  { value: 'RECHAZADA', label: 'Rechazada' },
  { value: 'VENCIDA', label: 'Vencida' },
  { value: 'CONVERTIDA', label: 'Convertida' },
  { value: 'ANULADA', label: 'Anulada' },
]

const CONTACT_STATUSES: ReportStatusOption[] = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'atendido', label: 'Atendido' },
  { value: 'descartado', label: 'Descartado' },
]

export const REPORTS: Record<ReportKey, ReportConfig> = {
  'sales-register': {
    title: 'Registro de ventas',
    description: 'Todas las ventas del periodo con su comprobante, base imponible, IGV y total.',
    usesCurrency: true,
    usesClient: true,
    usesSeller: true,
    statusOptions: SALE_STATUSES,
    note: 'Incluye las ventas anuladas, pero sus montos no suman en los totales.',
  },
  'sales-by-client': {
    title: 'Ventas por cliente',
    description: 'Cuánto compró cada cliente en el periodo, cuánto pagó y cuánto debe.',
    usesCurrency: true,
    usesClient: true,
    usesSeller: true,
  },
  'sales-by-product': {
    title: 'Ventas por producto o servicio',
    description: 'Cantidades y montos vendidos de cada producto, servicio o ítem libre.',
    usesCurrency: true,
    usesClient: true,
    usesSeller: true,
  },
  receivables: {
    title: 'Cuentas por cobrar',
    description: 'Ventas con saldo pendiente y los días que llevan sin pagarse.',
    usesCurrency: true,
    usesClient: true,
    usesSeller: true,
    note: 'Es un reporte histórico: la fecha "Hasta" se usa como fecha de corte.',
  },
  payments: {
    title: 'Pagos recibidos',
    description: 'Pagos registrados en el periodo, con su método y la venta asociada.',
    usesCurrency: true,
    usesClient: true,
    usesSeller: true,
  },
  proformas: {
    title: 'Proformas',
    description: 'Proformas emitidas en el periodo, su estado y la venta generada (si la hay).',
    usesCurrency: true,
    usesClient: true,
    usesSeller: true,
    statusOptions: PROFORMA_STATUSES,
  },
  'contact-messages': {
    title: 'Mensajes de contacto',
    description: 'Mensajes recibidos desde el formulario del sitio web.',
    usesCurrency: false,
    usesClient: false,
    // Los mensajes de contacto no pertenecen a un vendedor.
    usesSeller: false,
    statusOptions: CONTACT_STATUSES,
  },
  'sales-by-seller': {
    title: 'Ventas por vendedor',
    description: 'Cuánto vendió cada vendedor, su ticket promedio y el avance de su meta.',
    usesCurrency: true,
    usesClient: false,
    usesSeller: true,
  },
}

export const REPORT_KEYS = Object.keys(REPORTS) as ReportKey[]

export function isReportKey(value: string): value is ReportKey {
  return value in REPORTS
}

// ── Pestañas de la página /reports ──
// El valor de cada pestaña es el que va en la URL: /reports?tab=ventas

export type ReportTab =
  | 'ventas'
  | 'clientes'
  | 'productos'
  | 'pagos'
  | 'proformas'
  | 'mensajes'
  | 'vendedores'

/** Sub-vista de la pestaña Pagos: /reports?tab=pagos&vista=saldos */
export type PaymentsView = 'recibidos' | 'saldos'

export type ReportTabConfig = {
  value: ReportTab
  label: string
  report: ReportKey
  /** Permiso EXTRA para ver la pestaña, además de report_<slug>.view (opcional). */
  permission?: string
}

export const REPORT_TABS: ReportTabConfig[] = [
  { value: 'ventas', label: 'Ventas', report: 'sales-register' },
  { value: 'clientes', label: 'Clientes', report: 'sales-by-client' },
  { value: 'productos', label: 'Productos', report: 'sales-by-product' },
  // En Pagos el reporte depende del toggle "Pagos recibidos / Saldos pendientes" (ver getTabReport).
  { value: 'pagos', label: 'Pagos', report: 'payments' },
  { value: 'proformas', label: 'Proformas', report: 'proformas' },
  { value: 'mensajes', label: 'Mensajes', report: 'contact-messages' },
  // Solo pide report_sales_by_seller.view (el admin decide en Roles quién compara vendedores).
  { value: 'vendedores', label: 'Vendedores', report: 'sales-by-seller' },
]

export const PAYMENTS_VIEWS: { value: PaymentsView; label: string; report: ReportKey }[] = [
  { value: 'recibidos', label: 'Pagos recibidos', report: 'payments' },
  { value: 'saldos', label: 'Saldos pendientes', report: 'receivables' },
]

export function isReportTab(value: string | null | undefined): value is ReportTab {
  return REPORT_TABS.some((tab) => tab.value === value)
}

export function isPaymentsView(value: string | null | undefined): value is PaymentsView {
  return value === 'recibidos' || value === 'saldos'
}

// Qué reporte del backend corresponde a la pestaña (y al toggle, si es Pagos).
export function getTabReport(tab: ReportTab, paymentsView: PaymentsView): ReportKey {
  if (tab === 'pagos') return paymentsView === 'saldos' ? 'receivables' : 'payments'
  return REPORT_TABS.find((t) => t.value === tab)?.report ?? 'sales-register'
}
