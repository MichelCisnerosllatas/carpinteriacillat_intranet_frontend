// src/features/proformas/lib/proforma-form/warn-invalid-fields.ts
import { swalWarning } from '@/shared/lib/swal'

/** Si falta completar algún campo requerido, react-hook-form no llama a onSubmit — se avisa
 * explícitamente en vez de dejar que el usuario se quede sin saber por qué el botón no hizo nada. */
export function warnInvalidFields(): void {
  void swalWarning(
    'Faltan campos por completar',
    'Revisa los campos marcados en rojo antes de continuar.'
  )
}
