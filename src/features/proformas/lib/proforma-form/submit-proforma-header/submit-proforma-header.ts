// src/features/proformas/lib/proforma-form/submit-proforma-header/submit-proforma-header.ts
import type { UseFormReturn } from 'react-hook-form'
import { swalConfirmAction } from '@/shared/lib/swal'
import { toastSuccess } from '@/shared/lib/toast'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { useProformaFormStore } from '../../../stores/useProformaFormStore'
import { usePendingCartItemsStore } from '../../../stores/usePendingCartItemsStore'
import { uploadPendingItems } from '../../proforma-cart'
import type { ProformaFormValues } from '../schema'
import { buildHeaderPayload } from './build-header-payload'
import { buildDirtyHeaderPayload } from './build-dirty-header-payload'

interface SubmitProformaHeaderDeps {
  form: UseFormReturn<ProformaFormValues>
  proformaId: number | null
}

/**
 * ⚠️ Nadie del UI llama esta función directamente — el único que la invoca es
 * `useProformaForm.ts` (dentro de su `onSubmit`). Ábrela cuando el problema sea "no guarda bien"
 * (payload mal armado, PUT/PATCH incorrecto, el backend rechaza el body). Si en cambio el botón
 * no reacciona o la navegación después de guardar está mal, el problema está en `useProformaForm.ts`,
 * no acá.
 *
 * Orquesta el guardado de la CABECERA de una proforma (cliente, fechas, moneda, plantilla,
 * firma, etc. — NO los productos/líneas, esos son otro recurso y se guardan aparte con
 * `useProformaDetailFormStore`, ver `lib/proforma-cart/row-actions`).
 *
 * Llama directo a `useProformaFormStore` — no lo recibe como parámetro, igual que
 * `saveEditedCartItem`/`uploadPendingItems` en `lib/proforma-cart/row-actions`.
 *
 * Pasos, en orden:
 *   1. Confirma con el usuario (swal) — título/texto distintos si crea o edita.
 *   2. Arma el body: completo con `buildHeaderPayload` si crea (POST), o solo los campos
 *      tocados con `buildDirtyHeaderPayload` si edita (PATCH).
 *   3. Llama a `create`/`update` del store.
 *   4. Solo al CREAR: si hay productos pendientes en el carrito (`usePendingCartItemsStore`),
 *      espera a que `uploadPendingItems` termine de subirlos TODOS antes de seguir — el modal
 *      se queda abierto (con el título actualizado) durante esa subida.
 *   5. Si sale bien: toast de éxito y cierra el swal. Si sale mal: pinta los errores de campo
 *      en el propio `form` y muestra el mensaje dentro del swal (no navega, el usuario se queda
 *      corrigiendo).
 *
 * Devuelve el id de la proforma si todo salió bien (el nuevo id al crear, el mismo id al
 * editar), o `null` si el usuario canceló el swal o hubo error (el error ya se mostró ahí mismo,
 * quien llama no necesita hacer nada más con el error).
 */
export async function submitProformaHeader(
  values: ProformaFormValues,
  deps: SubmitProformaHeaderDeps
): Promise<number | null> {
  const { form, proformaId } = deps
  const isCreating = !proformaId
  let resultId: number | null = null

  await swalConfirmAction({
    title: isCreating ? '¿Registrar esta proforma?' : '¿Guardar los cambios?',
    text: isCreating
      ? 'Verifica que los datos sean correctos. Quedará en estado PENDIENTE y deberá ser aceptada más adelante.'
      : values.series || values.issue_date,
    confirmText: isCreating ? 'Sí, registrar' : 'Sí, guardar',
    cancelText: 'Cancelar',
    loading: { title: isCreating ? 'Registrando...' : 'Guardando...' },
    action: async ({ close, showError, update }) => {
      if (isCreating) {
        const payload = buildHeaderPayload(values)
        const newId = await useProformaFormStore.getState().create(payload)
        if (!newId) {
          applyApiErrors(form, useProformaFormStore.getState().fieldErrors)
          showError(useProformaFormStore.getState().error ?? 'No se pudo registrar la proforma.')
          return
        }

        // La cabecera ya se creó — el modal NO se cierra todavía. Faltan los productos del
        // carrito, que hasta este momento solo existen en memoria (`usePendingCartItemsStore`).
        // Cerrar acá antes de subirlos es el bug que se reportó: el modal se cerraba mostrando
        // éxito mientras las líneas todavía se estaban guardando en segundo plano.
        if (usePendingCartItemsStore.getState().pendingCartItems.length > 0) {
          update({ title: 'Guardando líneas de detalle...' })
          await uploadPendingItems({ proformaId: newId })
        }

        resultId = newId
        toastSuccess('Proforma registrada', 'Se guardaron la cabecera y las líneas de detalle.')
        close()
        return
      }

      const payload = buildDirtyHeaderPayload(values, form.formState.dirtyFields)
      const success = await useProformaFormStore.getState().update(proformaId, payload)
      if (success) {
        resultId = proformaId
        toastSuccess('Proforma guardada', values.series || values.issue_date)
        close()
      } else {
        applyApiErrors(form, useProformaFormStore.getState().fieldErrors)
        showError(useProformaFormStore.getState().error ?? 'No se pudo guardar la proforma.')
      }
    },
  })

  return resultId
}
