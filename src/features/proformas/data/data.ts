import type { ProformaStatus } from './schema'

export type ProformaStatusOption = {
  value: ProformaStatus
  label: string
  badge: string
}

export const PROFORMA_STATUS_OPTIONS: ProformaStatusOption[] = [
  {
    value: 'PENDIENTE',
    label: 'Pendiente',
    badge: 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200',
  },
  {
    value: 'ACEPTADA',
    label: 'Aceptada',
    badge: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
  },
  {
    value: 'RECHAZADA',
    label: 'Rechazada',
    badge: 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-300',
  },
  {
    value: 'ANULADA',
    label: 'Anulada',
    badge: 'bg-neutral-300/40 text-neutral-700 dark:text-neutral-300 border-neutral-300',
  },
  {
    value: 'VENCIDA',
    label: 'Vencida',
    badge: 'bg-orange-100/30 text-orange-900 dark:text-orange-200 border-orange-300',
  },
  {
    value: 'CONVERTIDA',
    label: 'Convertida',
    badge: 'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200',
  },
]

export const getProformaStatusOption = (value: ProformaStatus): ProformaStatusOption =>
  PROFORMA_STATUS_OPTIONS.find((s) => s.value === value) ?? PROFORMA_STATUS_OPTIONS[0]

// Máquina de estados validada en el servidor — la UI solo debe ofrecer transiciones válidas.
const STATUS_TRANSITIONS: Record<ProformaStatus, ProformaStatus[]> = {
  PENDIENTE: ['ACEPTADA', 'RECHAZADA', 'ANULADA', 'VENCIDA'],
  VENCIDA: ['ACEPTADA', 'RECHAZADA', 'ANULADA'],
  ACEPTADA: ['CONVERTIDA', 'ANULADA'],
  RECHAZADA: [],
  ANULADA: [],
  CONVERTIDA: [],
}

export const getValidStatusTransitions = (currentStatus: ProformaStatus): ProformaStatusOption[] =>
  STATUS_TRANSITIONS[currentStatus].map((s) => getProformaStatusOption(s))

export const PROFORMA_CURRENCIES = [
  { value: 'PEN', label: 'PEN — Soles' },
  { value: 'USD', label: 'USD — Dólares' },
]
