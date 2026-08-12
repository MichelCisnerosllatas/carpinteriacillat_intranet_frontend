// src/features/sales/lib/sale-form/form-helpers.ts
import { swalWarning } from '@/shared/lib/swal'
import type { SaleFormValues } from './schema'

// Función en vez de constante: `issue_date` debe ser HOY en el momento en que se abre el
// formulario, no cuando este módulo se evaluó por primera vez (mismo criterio que proformas).
export function getSaleFormDefaults(): SaleFormValues {
  return {
    client_id: null,
    sale_document_type_id: null,
    issue_date: new Date().toISOString().slice(0, 10),
    payment_method: '',
    currency: 'PEN',
    observation: '',
  }
}

/** Corta el registro/guardado si el carrito no tiene ninguna línea. Devuelve `true` si puede
 * continuar, `false` si debe abortar (ya mostró el aviso). */
export function assertCartNotEmpty(lineCount: number): boolean {
  if (lineCount > 0) return true
  void swalWarning(
    'Agrega al menos un producto o servicio',
    'El carrito está vacío — no se puede registrar una venta sin líneas de detalle.'
  )
  return false
}

/** Si falta completar algún campo requerido, react-hook-form no llama a onSubmit — se avisa
 * explícitamente en vez de dejar que el usuario se quede sin saber por qué el botón no hizo nada. */
export function warnInvalidFields(): void {
  void swalWarning(
    'Faltan campos por completar',
    'Revisa los campos marcados en rojo antes de continuar.'
  )
}
