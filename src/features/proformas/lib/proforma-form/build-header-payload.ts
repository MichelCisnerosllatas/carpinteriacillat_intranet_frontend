// src/features/proformas/lib/proforma-form/build-header-payload.ts
import type { ProformaPostRequestDto } from '../../model/proformapost.dto'
import type { ProformaFormValues } from './schema'

/** Convierte los valores del formulario (camelCase-ish, tal como los da react-hook-form) en el
 * body plano que espera el backend (`POST`/`PUT /proformas`). Función pura — sin stores, sin
 * React — se puede probar sola con solo pasarle un objeto de valores. */
export function buildHeaderPayload(values: ProformaFormValues, isEdit: boolean): ProformaPostRequestDto {
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
  }
  // En creación, series no debería enviarse si el usuario no la editó — el servidor la genera.
  if (!isEdit && !values.series) delete payload.series
  return payload
}
