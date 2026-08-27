// src/features/proformas/lib/proforma-form/get-proforma-form-defaults.ts
import type { ProformaFormValues } from './schema'

// `new Date().toISOString()` convierte a UTC antes de formatear — con Perú en UTC-5, entre
// las ~19:00 y la medianoche (hora local) UTC ya pasó a "mañana", así que ese default mostraba el
// día siguiente al que el usuario tenía en su calendario. Se arma el string a mano con los
// componentes LOCALES (getFullYear/getMonth/getDate) para que "hoy" sea siempre el día del
// navegador del usuario, no el de UTC.
function todayAsLocalIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Función en vez de constante: `issue_date` debe ser HOY en el momento en que se abre el
// formulario, no cuando este módulo se evaluó por primera vez (que en una SPA puede haber sido
// horas/días antes si el usuario navega sin recargar la página).
export function getProformaFormDefaults(): ProformaFormValues {
  return {
    client_id: null,
    client_name: '',
    proforma_type_id: null,
    template_id: null,
    signature_id: null,
    series: '',
    issue_date: todayAsLocalIsoDate(),
    due_date: '',
    place_of_issue: 'Iquitos',
    client_attention: '',
    delivery_time: '15 días hábiles',
    currency: 'S/.',
    observation: '',
    // Vacío a propósito — NO hardcodear un texto genérico acá: header-section.tsx ya rellena
    // "Forma de pago" con el texto real configurado en la plantilla elegida (`forma_pago` de
    // pdf_template_texts) en cuanto el usuario selecciona una. Tener los dos (un default fijo acá
    // + el de la plantilla) causaba justo el bug reportado: como react-hook-form no considera
    // "dirty" un campo que nunca se tocó (aunque su valor inicial no esté vacío), el fetch de la
    // plantilla igual lo pisaba en silencio — el usuario veía el texto de la plantilla en el PDF
    // en vez del default genérico que había visto en pantalla, y parecía "reemplazado con algo".
    payment_method: '',
  }
}
