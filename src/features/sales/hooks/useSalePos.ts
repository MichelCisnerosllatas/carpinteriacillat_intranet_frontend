// src/features/sales/hooks/useSalePos.ts
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { proformasService } from '@/features/proformas'
import { swalConfirm } from '@/shared/lib/swal'
import { toast, toastError, toastSuccess, toastWarning } from '@/shared/lib/toast'
import { SALE_PAYMENT_METHODS } from '@/features/sale-payments'
import { salesService } from '../services/sales.service'
import { mapSaleFromApi } from '../stores/useSaleListStore'
import { useSaleFormStore } from '../stores/useSaleFormStore'
import { useSaleFormDataStore } from '../stores/useSaleFormDataStore'
import { useSalePosStore } from '../stores/useSalePosStore'
import {
  buildCreatePayload,
  buildUpdatePayload,
  calculateTotals,
  formatCorrelative,
  formatMoney,
  validatePosSale,
  type TaxConfig,
} from '../lib/sale-pos'
import type { Sale } from '../data/schema'

type Options = {
  mode: 'create' | 'edit'
  /** Id de la venta a editar (solo en edición). */
  id?: string
  /** `/sales/create?proforma={id}` — se importa sola al entrar. */
  proformaId?: number | null
}

// Código SUNAT de los comprobantes: "01" factura (exige cliente), "03" boleta.
const INVOICE_CODE = '01'
const RECEIPT_CODE = '03'

/**
 * Orquesta la pantalla "Realizar venta": carga los datos de arranque, la venta a editar o la
 * proforma a importar, calcula los totales en vivo, valida y envía TODO en una sola petición.
 * El estado del borrador vive en `useSalePosStore`; este hook solo junta las piezas.
 */
export function useSalePos({ mode, id, proformaId }: Options) {
  const router = useRouter()
  const isEdit = mode === 'edit'
  const pos = useSalePosStore()
  const formData = useSaleFormDataStore()
  const { isSubmitting, error, fieldErrors, createFull, updateFull, reset: resetForm } =
    useSaleFormStore()

  const [editSale, setEditSale] = useState<Sale | null>(null)
  const [isLoadingSale, setIsLoadingSale] = useState(isEdit)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  // Los errores locales solo se muestran después del primer intento de emitir, para no llenar
  // de rojo una pantalla recién abierta.
  const [submitAttempted, setSubmitAttempted] = useState(false)
  // Última venta emitida en esta sesión de caja: se muestra en una tira discreta del resumen
  // (en vez de un modal) mientras la pantalla ya quedó limpia para la siguiente.
  const [lastSale, setLastSale] = useState<Sale | null>(null)
  const importedRef = useRef(false)

  // Al entrar: borrador limpio + datos de arranque frescos (el IGV pudo cambiar).
  useEffect(() => {
    pos.reset()
    resetForm()
    void formData.load(true)
    return () => {
      useSalePosStore.getState().reset()
      useSaleFormStore.getState().reset()
    }
  }, [])

  // Comprobante por defecto al crear: Boleta (code "03") si existe, si no el primero.
  useEffect(() => {
    if (isEdit || pos.documentTypeId || formData.documentTypes.length === 0) return
    const receipt = formData.documentTypes.find((t) => t.code === RECEIPT_CODE)
    pos.setDocumentTypeId((receipt ?? formData.documentTypes[0]).id)
  }, [isEdit, pos.documentTypeId, formData.documentTypes])

  // Edición: se trae la venta fresca del backend (no la de la lista, puede estar desfasada).
  useEffect(() => {
    // `isLoadingSale` ya arranca en true en edición (ver useState), no hace falta setearlo aquí.
    if (!isEdit || !id) return
    salesService
      .getById(Number(id))
      .then((res) => {
        if (!res.success) throw new Error(res.message)
        const sale = mapSaleFromApi(res.data)
        // Solo una venta GUARDADA se puede editar — las demás se ven en su detalle.
        if (sale.status !== 'GUARDADA') {
          toastWarning('No se puede editar', 'Esta venta ya no está en estado Guardada.')
          router.replace(`/sales/${sale.id}`)
          return
        }
        setEditSale(sale)
        useSalePosStore.getState().loadFromSale(sale)
      })
      .catch((err: any) => {
        setLoadError(err?.response?.data?.message ?? err?.message ?? 'No se pudo cargar la venta.')
      })
      .finally(() => setIsLoadingSale(false))
  }, [isEdit, id])

  // Al editar, el IGV queda fijo desde que se creó la venta; al crear manda la configuración.
  const taxConfig: TaxConfig =
    isEdit && editSale
      ? { taxed: editSale.isTaxed, rate: editSale.igvRateApplied ?? 0 }
      : { taxed: formData.igvEnabled, rate: formData.igvRate }

  const totals = calculateTotals(pos.lines, taxConfig)
  const documentType = formData.documentTypes.find((t) => t.id === pos.documentTypeId) ?? null
  const isInvoice = documentType?.code === INVOICE_CODE

  // Serie y N° del comprobante. Al editar ya existen; al crear, el N° es referencial (el backend lo
  // asigna al emitir) y solo se muestra si form-data envía `next_correlative`.
  const documentNumber: { series: string | null; number: string | null } =
    isEdit && editSale
      ? { series: editSale.series, number: formatCorrelative(editSale.correlative) }
      : {
          series: documentType?.series ?? null,
          number:
            documentType?.next_correlative != null
              ? formatCorrelative(documentType.next_correlative)
              : null,
        }

  // En "Completo" se paga el total; en "Adelanto" lo que se escribió; en "Sin pago" nada.
  const paidNow =
    isEdit || pos.paymentMode === 'none'
      ? 0
      : pos.paymentMode === 'full'
        ? totals.total
        : Math.min(pos.paymentAmount, totals.total)
  const balance = Math.max(totals.total - paidNow, 0)

  const localErrors = submitAttempted
    ? validatePosSale({
        isEdit,
        client: pos.client,
        isGenericClient: pos.isGenericClient,
        isInvoice,
        documentTypeId: pos.documentTypeId,
        issueDate: pos.issueDate,
        lines: pos.lines,
        taxConfig,
        totals,
        paymentMode: pos.paymentMode,
        paymentAmount: pos.paymentAmount,
        paymentMethod: pos.paymentMethod,
      })
    : {}

  /** Error de un campo: primero el local (en vivo), si no el que mandó el servidor (422). Con
   * `prefix` también busca claves anidadas (ej. "payments.0.amount" para "payments"). */
  const errorFor = (key: string, prefix = false): string | undefined => {
    if (localErrors[key]) return localErrors[key]
    if (!fieldErrors) return undefined
    if (fieldErrors[key]?.[0]) return fieldErrors[key][0]
    if (!prefix) return undefined
    const nested = Object.keys(fieldErrors).find((k) => k.startsWith(`${key}.`))
    return nested ? fieldErrors[nested][0] : undefined
  }

  // Al cambiar a Factura, "Cliente varios" deja de ser válido: se limpia para que se note.
  const selectDocumentType = (typeId: number) => {
    pos.setDocumentTypeId(typeId)
    const next = formData.documentTypes.find((t) => t.id === typeId)
    if (next?.code === INVOICE_CODE && pos.isGenericClient) pos.setClient(null)
  }

  const importProforma = async (proformaToImport: number) => {
    if (useSalePosStore.getState().lines.length > 0) {
      const ok = await swalConfirm({
        title: '¿Reemplazar el carrito?',
        text: 'Los productos actuales se cambiarán por los de la proforma.',
        confirmText: 'Sí, reemplazar',
      })
      if (!ok) return
    }
    setIsImporting(true)
    try {
      const res = await proformasService.getSaleDraft(proformaToImport)
      if (!res.success) throw new Error(res.message)
      useSalePosStore.getState().loadFromDraft(res.data)
      toastSuccess('Proforma importada', `Se cargó la proforma ${res.data.proforma_code}.`)
    } catch (err: any) {
      // El backend responde 422 si la proforma no está ACEPTADA o ya tiene venta.
      toastError(
        'No se pudo importar la proforma',
        err?.response?.data?.message ?? err?.message ?? 'Intenta de nuevo.'
      )
    } finally {
      setIsImporting(false)
    }
  }

  // `/sales/create?proforma={id}` — se importa una sola vez al entrar.
  useEffect(() => {
    if (isEdit || !proformaId || importedRef.current) return
    importedRef.current = true
    void importProforma(proformaId)
  }, [isEdit, proformaId])

  /** Texto del modal de confirmación: "Cliente · Comprobante · Total · Pago · Saldo". */
  const buildConfirmSummary = (): string => {
    const clientName = pos.client?.name ?? (pos.isGenericClient ? 'Cliente varios' : 'Sin cliente')
    const parts = [
      `Cliente: ${clientName}`,
      `Comprobante: ${documentType?.name ?? '—'}`,
      `Total: ${formatMoney(totals.total, pos.currency)}`,
    ]
    // En edición el pago no se toca desde aquí (va por la sección de pagos).
    if (!isEdit) {
      const methodLabel =
        SALE_PAYMENT_METHODS.find((m) => m.value === pos.paymentMethod)?.label ?? ''
      parts.push(
        paidNow > 0
          ? `Paga: ${formatMoney(paidNow, pos.currency)}${methodLabel ? ` (${methodLabel})` : ''}`
          : 'Sin pago ahora'
      )
      parts.push(`Saldo: ${formatMoney(balance, pos.currency)}`)
    }
    return parts.join(' · ')
  }

  /** emit = true → "Emitir venta"; false → "Guardar cambios" (solo en edición). */
  const submit = async (emit = true) => {
    if (isSubmitting) return
    setSubmitAttempted(true)

    const errors = validatePosSale({
      isEdit,
      client: pos.client,
      isGenericClient: pos.isGenericClient,
      isInvoice,
      documentTypeId: pos.documentTypeId,
      issueDate: pos.issueDate,
      lines: pos.lines,
      taxConfig,
      totals,
      paymentMode: pos.paymentMode,
      paymentAmount: pos.paymentAmount,
      paymentMethod: pos.paymentMethod,
    })
    const firstError = Object.values(errors)[0]
    if (firstError) {
      toastWarning('Revisa los datos de la venta', firstError)
      return
    }

    // Confirmación SIEMPRE antes de enviar (pedido del usuario): un resumen corto para revisar
    // cliente, comprobante y montos antes de que la venta quede registrada.
    const confirmed = await swalConfirm({
      title: emit ? '¿Emitir la venta?' : '¿Guardar los cambios?',
      text: buildConfirmSummary(),
      confirmText: emit ? 'Sí, emitir' : 'Sí, guardar',
      cancelText: 'Revisar',
    })
    if (!confirmed) return

    const input = {
      client: pos.client,
      documentTypeId: pos.documentTypeId as number,
      issueDate: pos.issueDate,
      currency: pos.currency,
      observation: pos.observation,
      proformaId: pos.proforma?.id ?? null,
      lines: pos.lines,
      paymentMode: pos.paymentMode,
      paymentAmount: pos.paymentAmount,
      paymentMethod: pos.paymentMethod,
      total: totals.total,
    }

    const result =
      isEdit && editSale
        ? await updateFull(editSale.id, buildUpdatePayload(input, emit))
        : await createFull(buildCreatePayload(input))

    if (!result) {
      toastError('No se pudo guardar', useSaleFormStore.getState().error ?? 'Revisa los datos.')
      return
    }

    // Al editar se vuelve al detalle de esa venta (no tiene sentido seguir en caja).
    if (isEdit) {
      toastSuccess(emit ? 'Venta emitida' : 'Cambios guardados', result.code)
      router.push(`/sales/${result.id}`)
      return
    }

    // Al crear: toast de éxito (con acción "Ver" para abrir la venta) y pantalla limpia al
    // instante para la siguiente. Se usa `toast` de sonner directo porque el helper toastSuccess
    // no admite botón de acción.
    toast.success('Venta emitida', {
      description:
        `${result.code} · ${formatMoney(result.total, result.currency)}` +
        (result.balance > 0 ? ` · Saldo ${formatMoney(result.balance, result.currency)}` : ''),
      action: { label: 'Ver', onClick: () => router.push(`/sales/${result.id}`) },
    })
    setLastSale(result)
    setSubmitAttempted(false)
    resetForm()
    pos.reset()
    // El correlativo avanzó: se refresca para mostrar el siguiente N°.
    void useSaleFormDataStore.getState().load(true)
    // Si se llegó con ?proforma=..., se limpia la URL para no volver a importarla.
    if (proformaId) router.replace('/sales/create')
  }

  return {
    isEdit,
    editSale,
    isLoadingSale,
    loadError,
    formData,
    taxConfig,
    totals,
    documentType,
    documentNumber,
    isInvoice,
    paidNow,
    balance,
    errorFor,
    selectDocumentType,
    importProforma,
    isImporting,
    submit,
    isSubmitting,
    serverError: error,
    lastSale,
  }
}
