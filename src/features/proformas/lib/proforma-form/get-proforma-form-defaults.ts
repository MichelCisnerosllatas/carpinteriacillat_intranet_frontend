// src/features/proformas/lib/proforma-form/get-proforma-form-defaults.ts
import type { ProformaFormValues } from './schema'

// Función en vez de constante: `issue_date` debe ser HOY en el momento en que se abre el
// formulario, no cuando este módulo se evaluó por primera vez (que en una SPA puede haber sido
// horas/días antes si el usuario navega sin recargar la página).
export function getProformaFormDefaults(): ProformaFormValues {
  return {
    client_id: null,
    proforma_type_id: null,
    template_id: null,
    signature_id: null,
    series: '',
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: '',
    place_of_issue: 'Iquitos',
    client_attention: '',
    delivery_time: '15 días hábiles',
    currency: 'S/.',
    observation: '',
  }
}
