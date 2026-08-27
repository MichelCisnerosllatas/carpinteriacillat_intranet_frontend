// src/features/proforma-templates/lib/getTemplateDefaultText.ts
import { proformaTemplatesService } from '../services/proforma-templates.service'

/**
 * Devuelve el texto por defecto de una plantilla para una key dada (ej. `'forma_pago'`),
 * replicando exactamente la lógica de `PdfTemplateText::firstActiveContentByKey` del backend:
 * de los textos de la plantilla, filtra por `key` y `visible`, ordena por `order` ascendente y
 * toma el `content` del primero.
 *
 * Se usa para autocompletar "Forma de pago" en el formulario de proforma al elegir plantilla —
 * ver `HeaderSection`. Devuelve `null` si no hay match o si la petición falla (no debe romper el
 * flujo del formulario por esto).
 */
export async function getTemplateDefaultText(
  templateId: number,
  key: string
): Promise<string | null> {
  try {
    const res = await proformaTemplatesService.getById(templateId)
    if (!res.success) return null

    const match = res.data.texts
      .filter((text) => text.key === key && text.visible)
      .sort((a, b) => a.order - b.order)[0]

    return match?.content ?? null
  } catch {
    return null
  }
}
