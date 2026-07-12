// src/features/proformas/lib/proforma-form/assert-cart-not-empty.ts
import { swalWarning } from '@/shared/lib/swal'

/** Corta el registro/guardado si el carrito no tiene ninguna línea. Devuelve `true` si puede
 * continuar, `false` si debe abortar (ya mostró el aviso). */
export function assertCartNotEmpty(lineCount: number): boolean {
  if (lineCount > 0) return true
  void swalWarning(
    'Agrega al menos un producto o servicio',
    'El carrito está vacío — no se puede registrar una proforma sin líneas de detalle.'
  )
  return false
}
