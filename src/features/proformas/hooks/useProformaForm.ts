// src/features/proformas/hooks/useProformaForm.ts
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useProformaTypeSelectStore } from '@/features/proforma-types'
import { useProformaTemplateSelectStore } from '@/features/proforma-templates'
import { useClientSelectStore } from '@/features/clients'
import { useCompanySignatureSelectStore } from '@/features/company-signatures'
import { toastWarning } from '@/shared/lib/toast'
import { useProformaListStore } from '../stores/useProformaListStore'
import { useProformaFormStore } from '../stores/useProformaFormStore'
import {
  proformaFormSchema,
  getProformaFormDefaults,
  assertCartNotEmpty,
  submitProformaHeader,
  warnInvalidFields,
  type ProformaFormValues,
} from '../lib/proforma-form'
import { useAutoSelectFirstOption } from './useAutoSelectFirstOption'

/**
 * Solo estado de React (form, flags, efectos de sincronización) — la lógica de negocio del
 * envío vive en `lib/proforma-form/submit-proforma-header.ts` y se le inyecta acá lo que necesita del
 * store. El componente `proforma-form.tsx` solo consume lo que este hook devuelve.
 */
export function useProformaForm(mode: 'create' | 'edit', id?: string) {
  const router = useRouter()
  const { currentItem, items, loadOne } = useProformaListStore()
  const { error, fieldErrors, create, update, reset } = useProformaFormStore()
  const isEdit = mode === 'edit'
  const resolved =
    currentItem && String(currentItem.id) === id
      ? currentItem
      : id
        ? (items.find((i) => String(i.id) === id) ?? null)
        : null

  // En edición, la proforma ya existe desde el montaje. En creación, nace en null y solo pasa a
  // existir cuando el usuario envía el formulario explícitamente — nada se guarda antes de eso.
  const [proformaId, setProformaId] = useState<number | null>(isEdit && id ? Number(id) : null)
  const [isManualSaving, setIsManualSaving] = useState(false)
  // Lo mantiene actualizado `ProformaDetailLines` (persistidas + borrador) — se usa para exigir
  // al menos un producto/servicio antes de poder registrar/guardar.
  const [lineCount, setLineCount] = useState(0)

  const form = useForm<ProformaFormValues>({
    resolver: zodResolver(proformaFormSchema),
    defaultValues: getProformaFormDefaults(),
  })

  useEffect(() => {
    if (isEdit && id && !resolved) {
      void loadOne(Number(id))
    }
  }, [isEdit, id, resolved])

  // Solo se puede editar mientras la proforma sigue Pendiente — cubre a quien entra directo por
  // URL sin pasar por el botón "Editar" (que ya está oculto para los demás estados).
  useEffect(() => {
    if (isEdit && resolved && resolved.status !== 'PENDIENTE') {
      toastWarning('No se puede editar', 'Esta proforma ya no está en estado Pendiente.')
      router.replace(`/proformas/${resolved.id}`)
    }
  }, [isEdit, resolved])

  // Al crear, se autoselecciona el primer ítem de cada select para agilizar el llenado — en
  // edición nunca se toca (el efecto de `form.reset` con los datos reales corre después y
  // siempre gana). No se llama a `load()` aquí — cada combobox ya carga sus propias opciones al
  // montarse; el store deduplica, así que hacerlo también acá era 100% redundante.
  const { options: typeOptions } = useProformaTypeSelectStore()
  const { options: templateOptions } = useProformaTemplateSelectStore()
  const { options: clientOptions } = useClientSelectStore()
  const { options: signatureOptions } = useCompanySignatureSelectStore()

  useAutoSelectFirstOption(form, 'client_id', !isEdit, clientOptions)
  useAutoSelectFirstOption(form, 'signature_id', !isEdit, signatureOptions)
  useAutoSelectFirstOption(form, 'proforma_type_id', !isEdit, typeOptions)
  useAutoSelectFirstOption(form, 'template_id', !isEdit, templateOptions)

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        client_id: resolved.clientId,
        proforma_type_id: resolved.proformaTypeId,
        template_id: resolved.templateId,
        signature_id: resolved.signatureId,
        series: resolved.series,
        issue_date: resolved.issueDate?.slice(0, 10) ?? '',
        due_date: resolved.dueDate?.slice(0, 10) ?? '',
        place_of_issue: resolved.placeOfIssue ?? '',
        client_attention: resolved.clientAttention ?? '',
        delivery_time: resolved.deliveryTime ?? '',
        currency: resolved.currency,
        observation: resolved.observation ?? '',
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => reset(), [])

  const onSubmit = (values: ProformaFormValues) => {
    if (!assertCartNotEmpty(lineCount)) return
    return submitProformaHeader(values, {
      form,
      proformaId,
      fieldErrors,
      create,
      update,
      getStoreError: () => useProformaFormStore.getState().error,
      onSubmittingChange: setIsManualSaving,
      onHeaderCreated: setProformaId,
      onHeaderSaved: () => router.push('/proformas'),
    })
  }

  const goToList = () => router.push('/proformas')

  return {
    form,
    isEdit,
    proformaId,
    isManualSaving,
    setLineCount,
    error,
    fieldErrors,
    onSubmit,
    onInvalid: warnInvalidFields,
    goToList,
  }
}
