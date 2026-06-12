import { CreditCard, Shield, UserCheck, Users } from 'lucide-react'
import type { UserStatus } from './schema'

// Opciones para el selector de tipo de documento en el formulario.
// Los valores deben coincidir con los id_typedoc del backend.
export const typeDocOptions = [
  { label: 'DNI',                 value: 1 },
  { label: 'RUC',                 value: 2 },
  { label: 'Pasaporte',           value: 3 },
  { label: 'Carnet de Extranjería', value: 4 },
] as const

// Opciones para el selector de rol en el formulario.
// Los valores deben coincidir con los id_rol del backend.
export const roleFormOptions = [
  { label: 'Superadmin',    value: 1 },
  { label: 'Administrador', value: 2 },
  { label: 'Manager',       value: 3 },
  { label: 'Cajero',        value: 4 },
] as const

export const callTypes = new Map<UserStatus, string>([
  ['active',    'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive',  'bg-neutral-300/40 border-neutral-300'],
  ['invited',   'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  ['suspended', 'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10'],
])

export const roles = [
  { label: 'Superadmin', value: 'superadmin', icon: Shield },
  { label: 'Admin',      value: 'admin',      icon: UserCheck },
  { label: 'Manager',    value: 'manager',    icon: Users },
  { label: 'Cashier',    value: 'cashier',    icon: CreditCard },
] as const
