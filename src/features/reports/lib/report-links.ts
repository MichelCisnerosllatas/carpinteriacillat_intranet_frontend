import type { ReportRowLinkDto } from '../model/report.dto'

// Ruta del módulo donde se abre el registro de una fila (botón "Ver").
// Devuelve null si la fila no tiene enlace (ej. "Cliente varios" con id 0).
export function getRowHref(link: ReportRowLinkDto | undefined): string | null {
  if (!link || !link.id) return null
  switch (link.type) {
    case 'sale':
      return `/sales/${link.id}`
    case 'proforma':
      return `/proformas/${link.id}`
    case 'contact_message':
      return `/contact-messages/${link.id}`
    case 'client':
      return `/clients/${link.id}`
    default:
      return null
  }
}

// Texto del tooltip del botón "Ver" según el tipo de registro.
export function getRowLinkLabel(link: ReportRowLinkDto | undefined): string {
  switch (link?.type) {
    case 'sale':
      return 'Ver venta'
    case 'proforma':
      return 'Ver proforma'
    case 'contact_message':
      return 'Ver mensaje'
    case 'client':
      return 'Ver cliente'
    default:
      return 'Ver registro'
  }
}
