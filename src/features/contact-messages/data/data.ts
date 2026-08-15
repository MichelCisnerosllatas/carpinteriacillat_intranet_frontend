import type { ContactMessageProjectType, ContactMessageStatus } from './schema'

export const CONTACT_MESSAGE_STATUSES: { value: ContactMessageStatus; label: string; badge: string }[] = [
  { value: 'nuevo',      label: 'Nuevo',      badge: 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200' },
  { value: 'atendido',   label: 'Atendido',   badge: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200' },
  { value: 'descartado', label: 'Descartado', badge: 'bg-neutral-300/40 text-neutral-700 dark:text-neutral-300 border-neutral-300' },
]

export const getContactMessageStatusOption = (value: ContactMessageStatus) =>
  CONTACT_MESSAGE_STATUSES.find((s) => s.value === value) ?? CONTACT_MESSAGE_STATUSES[0]

export const CONTACT_MESSAGE_PROJECT_TYPES: { value: ContactMessageProjectType; label: string }[] = [
  { value: 'cocina',            label: 'Cocina' },
  { value: 'closet_dormitorio', label: 'Clóset / Dormitorio' },
  { value: 'oficina',           label: 'Oficina' },
  { value: 'puertas_ventanas',  label: 'Puertas y Ventanas' },
  { value: 'restauracion',      label: 'Restauración' },
  { value: 'otro',              label: 'Otro' },
]

export const getContactMessageProjectTypeLabel = (value: ContactMessageProjectType | null) =>
  CONTACT_MESSAGE_PROJECT_TYPES.find((t) => t.value === value)?.label ?? '—'
