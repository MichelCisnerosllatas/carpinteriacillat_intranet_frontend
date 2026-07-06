import type { ProformaTemplateStatus } from './schema'

// module fijo de PdfTemplate para esta feature: las plantillas de proforma son un caso particular
// del módulo genérico pdf_templates (ver pdf-templates.md).
export const PDF_TEMPLATE_MODULE = 'proforma'

export const proformaTemplateStatusBadge = new Map<ProformaTemplateStatus, string>([
  ['active',   'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

export const FONT_FAMILY_SUGGESTIONS = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia']

export const HEADER_LAYOUT_OPTIONS: { value: 'logo_izquierda' | 'logo_derecha'; label: string }[] = [
  { value: 'logo_derecha',   label: 'Logo a la derecha' },
  { value: 'logo_izquierda', label: 'Logo a la izquierda' },
]
