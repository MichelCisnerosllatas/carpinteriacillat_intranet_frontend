// src/features/proformas/ui/form/proforma-form/proforma-form.tsx
'use client'

import { Loader2 } from 'lucide-react'
import { Separator } from '@/shared/ui/separator'
import { Form } from '@/shared/ui/form'
import { AlertError } from '@/widgets/alerts_components'
import { useProformaForm } from '../../../hooks'
import { HeaderSection } from './header-section'
import { LinesSection } from './lines-section'
import { ActionsSection } from './actions-section'

export function ProformaForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const {
    form,
    isEdit,
    proformaId,
    isManualSaving,
    setLineCount,
    cartError,
    error,
    fieldErrors,
    onSubmit,
    onInvalid,
    goToList,
    isLoadingProforma,
    proformaLoadError,
  } = useProformaForm(mode, id)

  if (isLoadingProforma) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        <p className="text-sm">Cargando proforma...</p>
      </div>
    )
  }

  if (proformaLoadError) {
    return (
      <AlertError
        title="No se pudo cargar la proforma"
        message={proformaLoadError}
      />
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-4">
        <HeaderSection form={form} isEdit={isEdit} proformaId={proformaId} isManualSaving={isManualSaving} />

        <LinesSection
          proformaId={proformaId}
          currency={form.watch('currency') || 'PEN'}
          onCountChange={setLineCount}
          cartError={cartError}
        />

        <Separator />
        {error && (
          <AlertError
            title={isEdit ? 'Error al actualizar' : 'Error al crear'}
            message={error}
            apiError={fieldErrors ? { errors: fieldErrors } : undefined}
          />
        )}

        <ActionsSection proformaId={proformaId} isManualSaving={isManualSaving} goToList={goToList} />
      </form>
    </Form>
  )
}
