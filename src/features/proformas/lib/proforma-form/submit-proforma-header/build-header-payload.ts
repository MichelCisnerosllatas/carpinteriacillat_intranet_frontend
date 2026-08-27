// src/features/proformas/lib/proforma-form/submit-proforma-header/build-header-payload.ts
import type { ProformaPostRequestDto } from '../../../model/proformapost.dto'
import type { ProformaFormValues } from '../schema'

/**
 * Convierte los valores del formulario (los que da react-hook-form, un campo puede venir '' o
 * null) en el body plano que espera el backend al CREAR (`POST /proformas`). Se usa solo en
 * modo creación — para editar existe `buildDirtyHeaderPayload`, que solo manda lo que cambió.
 *
 * Ejemplo de lo que devuelve (para poder leerlo sin necesidad de un debugger):
 * {
 *   client_id: 12,
 *   proforma_type_id: 3,
 *   template_id: 5,
 *   signature_id: 1,
 *   issue_date: '2026-07-15',
 *   currency: 'PEN',
 *   // due_date, place_of_issue, etc. solo aparecen si el usuario los llenó (si no, undefined)
 * }
 */
export function buildHeaderPayload(values: ProformaFormValues): ProformaPostRequestDto {
  const payload: ProformaPostRequestDto = {
    client_id: values.client_id ?? undefined,
    proforma_type_id: values.proforma_type_id ?? undefined,
    template_id: values.template_id ?? undefined,
    signature_id: values.signature_id ?? undefined,
    series: values.series || undefined,
    issue_date: values.issue_date,
    due_date: values.due_date || undefined,
    place_of_issue: values.place_of_issue || undefined,
    client_attention: values.client_attention || undefined,
    delivery_time: values.delivery_time || undefined,
    currency: values.currency || undefined,
    observation: values.observation || undefined,
    // OJO: acá SÍ se manda '' explícito (no undefined) cuando el usuario lo dejó vacío. Si se
    // manda `undefined`, JSON.stringify lo omite del body y el backend interpreta "campo no
    // enviado", aplicando su fallback automático (el texto `forma_pago` de la plantilla) aunque
    // el usuario haya vaciado el campo a propósito. Ver `ProformaServices::buildHeaderData()`.
    payment_method: values.payment_method ?? '',
  }
  // series no debería enviarse si el usuario no la editó — el servidor la genera.
  if (!values.series) delete payload.series
  return payload
}
