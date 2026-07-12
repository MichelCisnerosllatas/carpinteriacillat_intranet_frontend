// src/features/proformas/ui/form/proforma-form/proforma-form.tsx
'use client'

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
    error,
    fieldErrors,
    onSubmit,
    onInvalid,
    goToList,
  } = useProformaForm(mode, id)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-4">
        <HeaderSection form={form} isEdit={isEdit} proformaId={proformaId} isManualSaving={isManualSaving} />

        <LinesSection
          proformaId={proformaId}
          currency={form.watch('currency') || 'PEN'}
          onCountChange={setLineCount}
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
