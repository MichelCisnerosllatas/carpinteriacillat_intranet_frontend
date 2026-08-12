// src/features/sales/hooks/useSaleForm.ts
'use client'

import { useEffect, useState } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useClientSelectStore } from '@/features/clients'
import { useSaleDocumentTypeSelectStore } from '@/features/sale-document-types'
import { toastWarning } from '@/shared/lib/toast'
import { useSaleFormStore } from '../stores/useSaleFormStore'
import { useSaleListStore } from '../stores/useSaleListStore'
import { usePendingPaymentsStore } from '../stores/usePendingPaymentsStore'
import {
  saleFormSchema,
  getSaleFormDefaults,
  assertCartNotEmpty,
  submitSaleHeader,
  warnInvalidFields,
  type SaleFormValues,
} from '../lib/sale-form'
import type { Sale } from '../data/schema'

// Los 4 hooks privados de abajo (`useAutoSelectFirstOption`, `useResolvedSale`,
// `useGuardEditableStatus`, `useSyncSaleFormValues`) solo los usa `useSaleForm`, el único
// exportado — antes vivían cada uno en su propio archivo bajo `useSaleForm/`, pero ninguno tiene
// sentido por separado del formulario que orquestan.

type SelectableField = 'client_id' | 'sale_document_type_id'

/** Autoselecciona el primer ítem de un combobox en cuanto sus opciones cargan — agiliza el
 * llenado al crear. El guard `getValues(field) == null` evita pisar una elección manual del
 * usuario si el efecto vuelve a dispararse. */
function useAutoSelectFirstOption(
  form: UseFormReturn<SaleFormValues>,
  field: SelectableField,
  enabled: boolean,
  options: { id: number }[]
) {
  useEffect(() => {
    if (enabled && options.length > 0 && form.getValues(field) == null) {
      form.setValue(field, options[0].id)
    }
  }, [enabled, options])
}

/** Resuelve la venta que se está editando: primero `currentItem` (la que dejó seteada la tabla
 * al hacer clic en "Editar"); si no coincide, la lista ya cargada (`items`); si tampoco está
 * ahí, dispara `loadOne` para traerla del backend — cubre a quien entra directo por URL sin
 * pasar por la tabla. */
function useResolvedSale(isEdit: boolean, id?: string) {
  const { currentItem, items, loadOne, isFetching, isError, message } = useSaleListStore()

  const resolved =
    currentItem && String(currentItem.id) === id
      ? currentItem
      : id
        ? (items.find((i) => String(i.id) === id) ?? null)
        : null

  useEffect(() => {
    if (isEdit && id && !resolved) {
      void loadOne(Number(id))
    }
  }, [isEdit, id, resolved])

  const isLoadingSale = isEdit && !resolved && isFetching
  const saleLoadError = isEdit && !resolved && isError ? message : null

  return { resolved, isLoadingSale, saleLoadError }
}

/** Solo se puede editar la cabecera/líneas mientras la venta sigue Guardada (ver «Conceptos
 * clave» punto 6 en sales.md). Si no está Guardada, avisa y redirige al detalle (de solo
 * lectura) — cubre a quien entra directo por URL, donde el botón "Editar" ya está oculto para
 * los demás estados. */
function useGuardEditableStatus(isEdit: boolean, resolved: Sale | null) {
  const router = useRouter()

  useEffect(() => {
    if (isEdit && resolved && resolved.status !== 'GUARDADA') {
      toastWarning('No se puede editar', 'Esta venta ya no está en estado Guardada.')
      router.replace(`/sales/${resolved.id}`)
    }
  }, [isEdit, resolved])
}

/** En edición, precarga el formulario con los datos reales de la venta en cuanto
 * `useResolvedSale` la resuelve. `form.reset(...)` también fija la baseline contra la que
 * react-hook-form calcula `dirtyFields`, de donde sale el diff que usa `submitSaleHeader` para
 * mandar solo lo tocado al guardar (PATCH). A propósito NO incluye `is_taxed` — ese campo ni
 * existe en el formulario de edición (inmutable tras crear). */
function useSyncSaleFormValues(form: UseFormReturn<SaleFormValues>, isEdit: boolean, resolved: Sale | null) {
  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        client_id: resolved.clientId,
        sale_document_type_id: resolved.saleDocumentTypeId,
        issue_date: resolved.issueDate?.slice(0, 10) ?? '',
        payment_method: resolved.paymentMethod ?? '',
        currency: resolved.currency,
        observation: resolved.observation ?? '',
      })
    }
  }, [isEdit, resolved?.id])
}

/**
 * Único hook que expone esta feature para el formulario de cabecera de una venta — compone los
 * 4 hooks privados de arriba y expone lo que necesita `sale-form.tsx`. La lógica de negocio del
 * envío vive en `lib/sale-form/submit-sale-header.ts`, que habla directo con `useSaleFormStore`.
 * Este hook solo le pasa los datos (`values`, `form`, `saleId`) y reacciona al id devuelto.
 */
export function useSaleForm(mode: 'create' | 'edit', id?: string) {
  const router = useRouter()
  const { error, fieldErrors, reset } = useSaleFormStore()
  const isEdit = mode === 'edit'

  const { resolved, isLoadingSale, saleLoadError } = useResolvedSale(isEdit, id)
  useGuardEditableStatus(isEdit, resolved)

  // En edición, la venta ya existe desde el montaje. En creación, nace en null y se queda así
  // hasta que `onSubmit` navega al listado — no hace falta actualizarlo en este componente
  // porque ya no se sigue editando en la misma pantalla después de crear.
  const [saleId] = useState<number | null>(isEdit && id ? Number(id) : null)
  const [isManualSaving, setIsManualSaving] = useState(false)
  // Lo mantiene actualizado `SaleDetailLines` (persistidas + borrador) — exige al menos un
  // producto/servicio antes de poder registrar/guardar.
  const [lineCount, setLineCount] = useState(0)
  // true cuando se intentó registrar/guardar con el carrito vacío — resalta la sección aunque el
  // usuario ya haya cerrado la alerta. Se limpia solo en cuanto se agrega un producto.
  const [cartError, setCartError] = useState(false)

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: getSaleFormDefaults(),
  })

  useSyncSaleFormValues(form, isEdit, resolved)

  // Al crear, se autoselecciona el primer ítem de cada select para agilizar el llenado — en
  // edición nunca se toca (el efecto de `form.reset` con los datos reales corre después y
  // siempre gana).
  const { options: clientOptions } = useClientSelectStore()
  const { options: saleDocumentTypeOptions } = useSaleDocumentTypeSelectStore()

  useAutoSelectFirstOption(form, 'client_id', !isEdit, clientOptions)
  useAutoSelectFirstOption(form, 'sale_document_type_id', !isEdit, saleDocumentTypeOptions)

  // Limpia también los pagos que hayan quedado en memoria sin subir (ver
  // usePendingPaymentsStore) si el usuario cierra el formulario sin llegar a registrar nada.
  useEffect(() => () => {
    reset()
    usePendingPaymentsStore.getState().clearPendingPayments()
  }, [])

  useEffect(() => {
    if (lineCount > 0) setCartError(false)
  }, [lineCount])

  // Única función que llama `sale-form.tsx` (vía `form.handleSubmit(onSubmit)`) — el componente
  // no conoce `submitSaleHeader` ni le hace falta. Acá solo se resuelve lo 100% de React:
  // bloquear el botón mientras guarda, y navegar cuando termina.
  const onSubmit = async (values: SaleFormValues) => {
    if (!assertCartNotEmpty(lineCount)) {
      setCartError(true)
      return
    }

    setIsManualSaving(true)
    try {
      const resultId = await submitSaleHeader(values, { form, saleId })
      if (resultId == null) return // cancelado o error (ya mostrado en el swal)
      // Al EDITAR, vuelve al listado (comportamiento de siempre). Al CREAR, en vez de volver al
      // listado, se navega a la edición de la venta recién creada — ahí la sección "Cobros" ya
      // queda habilitada (necesita un `sale_id` real, ver sale-payments.md) y el usuario puede
      // registrar de una vez el primer pago/adelanto sin tener que volver a buscar la venta.
      router.push(saleId ? '/sales' : `/sales/edit/${resultId}`)
    } finally {
      setIsManualSaving(false)
    }
  }

  const goToList = () => router.push('/sales')

  return {
    form,
    isEdit,
    saleId,
    resolved,
    isManualSaving,
    setLineCount,
    cartError,
    error,
    fieldErrors,
    onSubmit,
    onInvalid: warnInvalidFields,
    goToList,
    isLoadingSale,
    saleLoadError,
  }
}
