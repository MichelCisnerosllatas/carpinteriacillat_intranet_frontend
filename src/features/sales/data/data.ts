import type { SaleStatus, SalePaymentStatus } from './schema'

// ─── Estado del documento (GUARDADA → EMITIDA/ANULADA → ANULADA) ──────────────────────────────
// Ciclo de vida editable por el usuario vía cambio de estado explícito (nunca desde el
// formulario general de cabecera) — análogo 1:1 a PROFORMA_STATUS_OPTIONS.
export type SaleStatusOption = {
  value: SaleStatus
  label: string
  badge: string
}

export const SALE_STATUS_OPTIONS: SaleStatusOption[] = [
  {
    value: 'GUARDADA',
    label: 'Guardada',
    badge: 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200',
  },
  {
    value: 'EMITIDA',
    label: 'Emitida',
    badge: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
  },
  {
    value: 'ANULADA',
    label: 'Anulada',
    badge: 'bg-neutral-300/40 text-neutral-700 dark:text-neutral-300 border-neutral-300',
  },
]

export const getSaleStatusOption = (value: SaleStatus): SaleStatusOption => SALE_STATUS_OPTIONS.find((s) => s.value === value) ?? SALE_STATUS_OPTIONS[0]

// Máquina de estados validada en el servidor — la UI solo debe ofrecer transiciones válidas.
const STATUS_TRANSITIONS: Record<SaleStatus, SaleStatus[]> = {
  GUARDADA: ['EMITIDA', 'ANULADA'],
  EMITIDA: ['ANULADA'],
  ANULADA: [],
}

export const getValidStatusTransitions = (currentStatus: SaleStatus): SaleStatusOption[] => STATUS_TRANSITIONS[currentStatus].map((s) => getSaleStatusOption(s))

// ─── Estado de cobro (PENDIENTE|PARCIAL|PAGADO) ───────────────────────────────────────────────
// 100% de solo lectura — nunca se envía ni tiene transiciones editables por el usuario, solo se
// pinta como badge informativo (a diferencia de SALE_STATUS_OPTIONS, no tiene STATUS_TRANSITIONS
// ni getValidStatusTransitions).
export type SalePaymentStatusOption = {
  value: SalePaymentStatus
  label: string
  badge: string
}

export const SALE_PAYMENT_STATUS_OPTIONS: SalePaymentStatusOption[] = [
  {
    value: 'PENDIENTE',
    label: 'Pendiente',
    badge: 'bg-neutral-300/40 text-neutral-700 dark:text-neutral-300 border-neutral-300',
  },
  {
    value: 'PARCIAL',
    label: 'Parcial',
    badge: 'bg-orange-100/30 text-orange-900 dark:text-orange-200 border-orange-300',
  },
  {
    value: 'PAGADO',
    label: 'Pagado',
    badge: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
  },
]

export const getSalePaymentStatusOption = (value: SalePaymentStatus): SalePaymentStatusOption => SALE_PAYMENT_STATUS_OPTIONS.find((s) => s.value === value) ?? SALE_PAYMENT_STATUS_OPTIONS[0]

export const SALE_CURRENCIES = [
  { value: 'PEN', label: 'PEN — Soles' },
  { value: 'USD', label: 'USD — Dólares' },
]

export const formatSaleCurrency = (value: number, currency: string) => `${currency} ${value.toFixed(2)}`
