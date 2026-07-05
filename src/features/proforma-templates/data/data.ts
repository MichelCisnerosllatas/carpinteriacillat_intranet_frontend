import type { ProformaTemplateStatus } from './schema'

export const proformaTemplateStatusBadge = new Map<ProformaTemplateStatus, string>([
  ['active',   'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

export const FONT_FAMILY_SUGGESTIONS = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia']
