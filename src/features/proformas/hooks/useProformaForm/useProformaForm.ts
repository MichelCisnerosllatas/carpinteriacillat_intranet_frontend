// src/features/proformas/hooks/useProformaForm/useProformaForm.ts
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useProformaTypeSelectStore } from '@/features/proforma-types'
import { useProformaTemplateSelectStore } from '@/features/proforma-templates'
import { useCompanySignatureSelectStore } from '@/features/company-signatures'
import { useProformaFormStore } from '../../stores/useProformaFormStore'
import {
  proformaFormSchema,
  getProformaFormDefaults,
  assertCartNotEmpty,
  submitProformaHeader,
  warnInvalidFields,
  promptPostSaveAction,
  type ProformaFormValues,
} from '../../lib/proforma-form'
import { useAutoSelectFirstOption } from '../useAutoSelectFirstOption'
import { useResolvedProforma } from './useResolvedProforma'
import { useGuardEditableStatus } from './useGuardEditableStatus'
import { useSyncProformaFormValues } from './useSyncProformaFormValues'

/**
 * Solo estado de React (form, flags) — compone los hooks que resuelven cada preocupación por
 * separado (`useResolvedProforma`, `useGuardEditableStatus`, `useSyncProformaFormValues`) y
 * expone lo que necesita `proforma-form.tsx`. La lógica de negocio del envío vive en
 * `lib/proforma-form/submit-proforma-header/`, que habla directo con `useProformaFormStore`
 * (igual que `saveEditedCartItem`/`uploadPendingItems` en `lib/proforma-cart`). Este hook solo
 * le pasa los datos (`values`, `form`, `proformaId`) y reacciona al id devuelto.
 */
export function useProformaForm(mode: 'create' | 'edit', id?: string) {
  const router = useRouter()
  const { error, fieldErrors, reset } = useProformaFormStore()
  const isEdit = mode === 'edit'

  const { resolved, isLoadingProforma, proformaLoadError } = useResolvedProforma(isEdit, id)
  useGuardEditableStatus(isEdit, resolved)

  // En edición, la proforma ya existe desde el montaje. En creación, nace en null y se queda así
  // hasta que `onSubmit` navega al listado (ver más abajo) — no hace falta actualizarlo en este
  // componente porque ya no se sigue editando en la misma pantalla después de crear.
  const [proformaId] = useState<number | null>(isEdit && id ? Number(id) : null)
  const [isManualSaving, setIsManualSaving] = useState(false)
  // Lo mantiene actualizado `ProformaDetailLines` (persistidas + borrador) — se usa para exigir
  // al menos un producto/servicio antes de poder registrar/guardar.
  const [lineCount, setLineCount] = useState(0)
  // true cuando se intentó registrar/guardar con el carrito vacío — además del swal de
  // `assertCartNotEmpty`, resalta la sección "Líneas de detalle" para que la falla quede visible
  // aunque el usuario ya haya cerrado la alerta. Se limpia solo en cuanto se agrega un producto.
  const [cartError, setCartError] = useState(false)

  const form = useForm<ProformaFormValues>({
    resolver: zodResolver(proformaFormSchema),
    defaultValues: getProformaFormDefaults(),
  })

  useSyncProformaFormValues(form, isEdit, resolved)

  // Al crear, se autoselecciona el primer ítem de cada select para agilizar el llenado — en
  // edición nunca se toca (el efecto de `form.reset` con los datos reales corre después y
  // siempre gana). No se llama a `load()` aquí — cada combobox ya carga sus propias opciones al
  // montarse; el store deduplica, así que hacerlo también acá era 100% redundante.
  // El cliente queda afuera de este auto-select: ahora es texto libre (<ClientNamePickerField />)
  // resuelto recién en el submit, no un combobox — preseleccionar el primer cliente de la lista
  // dejaría `client_id` con un valor "silencioso" sin que el input muestre ningún nombre.
  const { options: typeOptions } = useProformaTypeSelectStore()
  const { options: templateOptions } = useProformaTemplateSelectStore()
  const { options: signatureOptions } = useCompanySignatureSelectStore()

  useAutoSelectFirstOption(form, 'signature_id', !isEdit, signatureOptions)
  useAutoSelectFirstOption(form, 'proforma_type_id', !isEdit, typeOptions)
  useAutoSelectFirstOption(form, 'template_id', !isEdit, templateOptions)

  useEffect(() => () => reset(), [])

  useEffect(() => {
    if (lineCount > 0) setCartError(false)
  }, [lineCount])

  // Única función que llama `proforma-form.tsx` (vía `form.handleSubmit(onSubmit)`) — el
  // componente no conoce `submitProformaHeader` ni le hace falta. Acá solo se resuelve lo que
  // es 100% de React: bloquear el botón mientras guarda, y navegar al listado cuando termina. El
  // guardado real (confirmación, payload, llamada al store, y — al crear — la subida de las
  // líneas de detalle pendientes del carrito) está en submit-proforma-header.ts: no devuelve el
  // id hasta que TODO terminó (cabecera + detalles), así que para cuando llegamos acá ya se puede
  // navegar sin perder nada. Ábrelo si el problema es que no guarda bien; si el botón no
  // reacciona o la navegación falla, el problema está acá.
  const onSubmit = async (values: ProformaFormValues) => {
    if (!assertCartNotEmpty(lineCount)) {
      setCartError(true)
      return
    }

    setIsManualSaving(true)
    try {
      const resultId = await submitProformaHeader(values, { form, proformaId })
      if (resultId == null) return // cancelado o error (ya mostrado en el swal)
      // Todavía no se navegó a ningún lado — el modal decide el destino (ver
      // prompt-post-save-action.ts): listado, detalle, o listado tras descargar el PDF.
      await promptPostSaveAction(resultId, {
        goToDetail: (id) => router.push(`/proformas/${id}`),
        goToList: () => router.push('/proformas'),
      })
    } finally {
      setIsManualSaving(false)
    }
  }

  const goToList = () => router.push('/proformas')

  return {
    form,
    isEdit,
    proformaId,
    isManualSaving,
    setLineCount,
    cartError,
    error,
    fieldErrors,
    onSubmit,
    onInvalid: warnInvalidFields,
    goToList,
    isLoadingProforma,
    proformaLoadError,
  }
}
