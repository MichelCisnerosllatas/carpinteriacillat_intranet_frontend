// src/features/proformas/lib/proforma-form/submit-proforma-header.ts
import type { UseFormReturn } from 'react-hook-form'
import { swalConfirmAction } from '@/shared/lib/swal'
import { toastSuccess } from '@/shared/lib/toast'
import { applyApiErrors } from '@/shared/lib/api-errors'
import type { ProformaPostRequestDto } from '../../model/proformapost.dto'
import { buildHeaderPayload } from './build-header-payload'
import type { ProformaFormValues } from './schema'

/**
 * Todas las dependencias vienen inyectadas (form, acciones del store, callbacks) — esta función
 * no importa ningún store ni usa hooks de React; el hook que la llama (`useProformaForm`) es
 * quien lee del store y le pasa acá lo que necesita. Así queda una función de negocio plana,
 * fácil de leer de punta a punta y de probar sola.
 */
interface SubmitHeaderDeps {
  form: UseFormReturn<ProformaFormValues>
  proformaId: number | null
  fieldErrors: Record<string, string[]> | null
  create: (payload: ProformaPostRequestDto) => Promise<number | null>
  update: (id: number, payload: ProformaPostRequestDto) => Promise<boolean>
  getStoreError: () => string | null
  onSubmittingChange: (submitting: boolean) => void
  onHeaderCreated: (newId: number) => void
  onHeaderSaved: () => void
}

export async function submitProformaHeader(values: ProformaFormValues, deps: SubmitHeaderDeps): Promise<void> {
  const {
    form, proformaId, fieldErrors, create, update, getStoreError,
    onSubmittingChange, onHeaderCreated, onHeaderSaved,
  } = deps

  const isCreating = !proformaId

  await swalConfirmAction({
    title: isCreating ? '¿Registrar esta proforma?' : '¿Guardar los cambios?',
    text: isCreating
      ? 'Verifica que los datos sean correctos. Quedará en estado PENDIENTE y deberá ser aceptada más adelante.'
      : values.series || values.issue_date,
    confirmText: isCreating ? 'Sí, registrar' : 'Sí, guardar',
    cancelText: 'Cancelar',
    loading: { title: isCreating ? 'Registrando...' : 'Guardando...' },
    action: async ({ close, showError }) => {
      onSubmittingChange(true)
      try {
        if (proformaId) {
          const payload = buildHeaderPayload(values, true)
          const success = await update(proformaId, payload)
          if (success) {
            toastSuccess('Proforma guardada', values.series || values.issue_date)
            close()
            onHeaderSaved()
          } else {
            applyApiErrors(form, fieldErrors)
            showError(getStoreError() ?? 'No se pudo guardar la proforma.')
          }
        } else {
          const payload = buildHeaderPayload(values, false)
          const newId = await create(payload)
          if (newId) {
            onHeaderCreated(newId)
            toastSuccess('Proforma registrada', 'Guardando las líneas de detalle...')
            close()
          } else {
            applyApiErrors(form, fieldErrors)
            showError(getStoreError() ?? 'No se pudo registrar la proforma.')
          }
        }
      } finally {
        onSubmittingChange(false)
      }
    },
  })
}
