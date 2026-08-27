// src/features/proformas/lib/proforma-form/submit-proforma-header/build-dirty-header-payload.ts
import type { ProformaPostRequestDto } from '../../../model/proformapost.dto'
import type { ProformaFormValues } from '../schema'

/**
 * Arma el body para EDITAR (`PATCH /proformas/{id}`) incluyendo solo los campos que el usuario
 * realmente tocó — `dirtyFields` lo da react-hook-form (`form.formState.dirtyFields`) comparando
 * contra la baseline que se cargó con `form.reset(...)` al abrir el formulario de edición.
 *
 * Por qué PATCH y no PUT: el backend tiene dos reglas de validación distintas para el mismo
 * endpoint según el verbo (ver `UpdateProformaPutRequest` vs `UpdateProformaPatchRequest` en el
 * backend). PUT exige el recurso completo, incluyendo `status` (obligatorio ahí). Este formulario
 * de cabecera NUNCA edita `status` — eso se hace aparte, con `useProformaDeleteStore.changeStatus`
 * desde la tabla — así que mandar PUT rompía con "El estado es obligatorio". PATCH no exige nada
 * que no se haya tocado.
 *
 * Ejemplo: si el usuario edita SOLO el campo "Observación", `dirtyFields` es
 * `{ observation: true }` y esta función devuelve `{ observation: '...' }` — nada más.
 */
export function buildDirtyHeaderPayload(
  values: ProformaFormValues,
  dirtyFields: Partial<Record<keyof ProformaFormValues, unknown>>
): Partial<ProformaPostRequestDto> {
  // Mismos campos editables que buildHeaderPayload, pero sin filtrar valores vacíos: acá el
  // filtro real es "¿está en dirtyFields?", no "¿tiene valor?" — un campo dirty puede haberse
  // vaciado a propósito.
  const allFields: ProformaPostRequestDto = {
    client_id: values.client_id ?? undefined,
    proforma_type_id: values.proforma_type_id ?? undefined,
    template_id: values.template_id ?? undefined,
    signature_id: values.signature_id ?? undefined,
    issue_date: values.issue_date,
    due_date: values.due_date || undefined,
    place_of_issue: values.place_of_issue || undefined,
    client_attention: values.client_attention || undefined,
    delivery_time: values.delivery_time || undefined,
    currency: values.currency || undefined,
    observation: values.observation || undefined,
    payment_method: values.payment_method || undefined,
  }

  const dirtyKeys = Object.keys(dirtyFields) as (keyof ProformaFormValues)[]
  const partial: Partial<ProformaPostRequestDto> = {}
  for (const key of dirtyKeys) {
    if (key in allFields) {
      ;(partial as any)[key] = allFields[key as keyof ProformaPostRequestDto]
    }
  }
  return partial
}
