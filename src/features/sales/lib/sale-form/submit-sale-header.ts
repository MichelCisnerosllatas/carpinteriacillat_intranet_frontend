// src/features/sales/lib/sale-form/submit-sale-header.ts
import type { UseFormReturn } from 'react-hook-form'
import { swalConfirmAction } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { useSalePaymentFormStore } from '@/features/sale-payments'
import { useSaleFormStore } from '../../stores/useSaleFormStore'
import { usePendingCartItemsStore } from '../../stores/usePendingCartItemsStore'
import { usePendingPaymentsStore } from '../../stores/usePendingPaymentsStore'
import { uploadPendingItems } from '../sale-cart'
import { formatSaleCurrency } from '../../data/data'
import type { SalePostRequestDto } from '../../model/salepost.dto'
import type { SalePutRequestDto } from '../../model/saleput.dto'
import type { SaleFormValues } from './schema'

/**
 * Convierte los valores del formulario en el body plano que espera el backend al CREAR
 * (`POST /sales`). `is_taxed` NUNCA se incluye a propósito — por decisión de producto, el IGV se
 * controla en un solo lugar (Configuración de Ventas) y no venta por venta; el servidor siempre
 * decide con `igv_enabled_default` (ver schema.ts).
 */
function buildHeaderPayload(values: SaleFormValues): SalePostRequestDto {
  return {
    client_id: values.client_id ?? undefined,
    sale_document_type_id: values.sale_document_type_id!,
    issue_date: values.issue_date,
    payment_method: values.payment_method || undefined,
    currency: values.currency || undefined,
    observation: values.observation || undefined,
  }
}

/**
 * Arma el body para EDITAR (`PATCH /sales/{id}`) incluyendo solo los campos que el usuario
 * realmente tocó (`dirtyFields`, de react-hook-form). PATCH y no PUT porque el backend exige el
 * recurso completo (incluido `status`) en PUT, y este formulario de cabecera nunca edita
 * `status` (eso se hace aparte, con `useSaleDeleteStore.changeStatus` desde la tabla).
 * `is_taxed` NUNCA aparece acá — ni existe como campo en el formulario de edición (inmutable
 * tras crear, ver salepost.dto.ts).
 */
function buildDirtyHeaderPayload(
  values: SaleFormValues,
  dirtyFields: Partial<Record<keyof SaleFormValues, unknown>>
): Partial<SalePutRequestDto> {
  const allFields: Omit<SalePutRequestDto, 'status'> = {
    client_id: values.client_id ?? undefined,
    sale_document_type_id: values.sale_document_type_id!,
    issue_date: values.issue_date,
    payment_method: values.payment_method || undefined,
    currency: values.currency || undefined,
    observation: values.observation || undefined,
  }

  const dirtyKeys = Object.keys(dirtyFields) as (keyof SaleFormValues)[]
  const partial: Partial<SalePutRequestDto> = {}
  for (const key of dirtyKeys) {
    if (key in allFields) {
      ;(partial as any)[key] = allFields[key as keyof typeof allFields]
    }
  }
  return partial
}

/**
 * Sube los pagos/adelantos que el usuario cargó en memoria ANTES de que la venta existiera
 * (`usePendingPaymentsStore` — ver `PendingPaymentsCard`, misma idea que `uploadPendingItems`
 * para el carrito, pero para pagos). Se dispara sola justo DESPUÉS de subir las líneas del
 * carrito, nunca antes: el saldo contra el que el servidor valida un pago (`balance = total -
 * amount_paid`) depende del `total` de la venta, que recién queda calculado una vez que sus
 * líneas ya se guardaron (ver sale-payments.md). Uno por uno, no en paralelo, mismo motivo que
 * `uploadPendingItems` (cada alta recalcula `amount_paid`/`balance` sumando TODOS los pagos
 * vigentes). Llama directo a `useSalePaymentFormStore` — no lo recibe como parámetro.
 */
async function uploadPendingPayments(saleId: number, currency: string): Promise<void> {
  const tempIds = usePendingPaymentsStore.getState().pendingPayments.map((p) => p.tempId)

  for (const tempId of tempIds) {
    const draft = usePendingPaymentsStore.getState().pendingPayments.find((p) => p.tempId === tempId)
    if (!draft) continue // el usuario lo borró mientras esperaba su turno

    usePendingPaymentsStore.getState().setUploadingTempId(tempId)
    const ok = await useSalePaymentFormStore.getState().create({
      sale_id: saleId,
      amount: draft.amount,
      payment_date: draft.paymentDate,
      payment_method: draft.paymentMethod || undefined,
      observation: draft.observation || undefined,
    })

    if (ok) {
      usePendingPaymentsStore.getState().removePendingPayment(tempId)
    } else {
      toastError('Error', `No se pudo registrar el pago de ${formatSaleCurrency(draft.amount, currency)}.`)
    }
  }

  usePendingPaymentsStore.getState().setUploadingTempId(null)
}

interface SubmitSaleHeaderDeps {
  form: UseFormReturn<SaleFormValues>
  saleId: number | null
}

/**
 * ⚠️ Nadie del UI llama esta función directamente — el único que la invoca es `useSaleForm`
 * (dentro de su `onSubmit`). Orquesta el guardado de la CABECERA de una venta (cliente, tipo de
 * comprobante, fechas, moneda — NO los productos/líneas ni los pagos, esos se guardan aparte con
 * `useSaleDetailFormStore`/`useSalePaymentFormStore`, ver `lib/sale-cart` y `uploadPendingPayments`
 * arriba).
 *
 * Pasos: 1) confirma con el usuario (swal), 2) arma el body (`buildHeaderPayload` al crear,
 * `buildDirtyHeaderPayload` al editar), 3) llama a `create`/`update` del store, 4) solo al CREAR:
 * si hay productos pendientes en el carrito, espera a que `uploadPendingItems` termine de
 * subirlos TODOS, y LUEGO (en ese orden) si hay pagos pendientes, `uploadPendingPayments` — así
 * no se cierra mostrando éxito mientras algo todavía se guarda en segundo plano. Devuelve el id
 * de la venta si todo salió bien, o `null` si el usuario canceló o hubo error (ya mostrado en el
 * swal).
 */
export async function submitSaleHeader(
  values: SaleFormValues,
  deps: SubmitSaleHeaderDeps
): Promise<number | null> {
  const { form, saleId } = deps
  const isCreating = !saleId
  let resultId: number | null = null

  await swalConfirmAction({
    title: isCreating ? '¿Registrar esta venta?' : '¿Guardar los cambios?',
    text: isCreating
      ? 'Verifica que los datos sean correctos. Quedará en estado GUARDADA.'
      : values.issue_date,
    confirmText: isCreating ? 'Sí, registrar' : 'Sí, guardar',
    cancelText: 'Cancelar',
    loading: { title: isCreating ? 'Registrando...' : 'Guardando...' },
    action: async ({ close, showError, update }) => {
      if (isCreating) {
        const payload = buildHeaderPayload(values)
        const newId = await useSaleFormStore.getState().create(payload)
        if (!newId) {
          applyApiErrors(form, useSaleFormStore.getState().fieldErrors)
          showError(useSaleFormStore.getState().error ?? 'No se pudo registrar la venta.')
          return
        }

        if (usePendingCartItemsStore.getState().pendingCartItems.length > 0) {
          update({ title: 'Guardando líneas de detalle...' })
          await uploadPendingItems({ saleId: newId })
        }

        if (usePendingPaymentsStore.getState().pendingPayments.length > 0) {
          update({ title: 'Guardando pagos...' })
          await uploadPendingPayments(newId, values.currency || 'PEN')
        }

        resultId = newId
        toastSuccess('Venta registrada', 'Se guardaron la cabecera, las líneas de detalle y los pagos.')
        close()
        return
      }

      const payload = buildDirtyHeaderPayload(values, form.formState.dirtyFields)
      const success = await useSaleFormStore.getState().update(saleId, payload)
      if (success) {
        resultId = saleId
        toastSuccess('Venta guardada', values.issue_date)
        close()
      } else {
        applyApiErrors(form, useSaleFormStore.getState().fieldErrors)
        showError(useSaleFormStore.getState().error ?? 'No se pudo guardar la venta.')
      }
    },
  })

  return resultId
}
