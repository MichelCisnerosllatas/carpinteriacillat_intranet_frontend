// src/features/proformas/hooks/useProformaForm/useSyncProformaFormValues.ts
'use client'

import { useEffect } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { Proforma } from '../../data/schema'
import type { ProformaFormValues } from '../../lib/proforma-form'

/**
 * En edición, precarga el formulario con los datos reales de la proforma en cuanto
 * `useResolvedProforma` la resuelve. `form.reset(...)` también fija la baseline contra la que
 * react-hook-form calcula `dirtyFields` — de ahí sale el diff que usa `submitProformaHeader`
 * para mandar solo lo que el usuario tocó al guardar (PATCH).
 */
export function useSyncProformaFormValues(
  form: UseFormReturn<ProformaFormValues>,
  isEdit: boolean,
  resolved: Proforma | null
) {
  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        client_id: resolved.clientId,
        client_name: resolved.clientBusinessName ?? '',
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
        payment_method: resolved.paymentMethod ?? '',
      })
    }
  }, [isEdit, resolved?.id])
}
