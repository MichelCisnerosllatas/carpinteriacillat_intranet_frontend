'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form } from '@/shared/ui/form'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { AlertError } from '@/widgets/alerts_components/alert-error'
import { useSectionItemListStore } from '../../../stores/useSectionItemListStore'
import { useSectionItemSettingsFormStore } from '../../../stores/useSectionItemSettingsFormStore'
import { useCan } from '@/features/auth/hooks/usePermission'
import type { FormValues } from './types'
import { schema } from './constants'
import { SwitchRow } from './switch-row'
import { TabPreviewChip } from './tab-preview-chip'
import { ActionsPreviewRow } from './actions-preview-row'

/**
 * Config técnica de UN item puntual (`section_web_setting`) — pantalla propia, separada del
 * form de contenido del item (`section-item-form.tsx`): "Guardar" acá manda un PATCH que SOLO
 * toca estos 5 campos (`sectionItemsService.patch` vía `useSectionItemSettingsFormStore`),
 * nunca el título/valor/etc. del item. Se llega acá desde el botón "Configuración" del detalle
 * del item.
 */
export function SectionItemSettingsForm({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, loadById, setCurrentItem } = useSectionItemListStore()
  const { isSubmitting, error, fieldErrors, update, reset } = useSectionItemSettingsFormStore()
  const resolved = currentItem ?? items.find((i) => String(i.id) === id) ?? null
  // Sin permiso de editar items, el formulario queda en solo lectura (ver ROLES_Y_PERMISOS.md)
  const canEdit = useCan('section_items.update')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tab_info: true, tab_details: false,
      details_add: false, details_reorder: false, details_delete: false,
    },
  })

  useEffect(() => { void loadById(Number(id)) }, [id])

  useEffect(() => {
    if (resolved) {
      form.reset({
        tab_info:        resolved.tabInfo,
        tab_details:     resolved.tabDetails,
        details_add:     resolved.detailsAdd,
        details_reorder: resolved.detailsReorder,
        details_delete:  resolved.detailsDelete,
      })
    }
  }, [resolved?.id])

  useEffect(() => () => { reset(); setCurrentItem(null) }, [])

  const watched = form.watch()

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: '¿Guardar configuración?',
      text: resolved?.title || resolved?.label || `Item #${resolved?.id}`,
      confirmText: 'Sí, guardar',
      cancelText: 'Cancelar',
    })
    if (!confirmed || !resolved) return

    const success = await update(resolved.id, values)

    if (success) {
      await swalSuccess('Configuración actualizada', resolved.title || resolved.label || `Item #${resolved.id}`)
      router.push(`/section-items/${resolved.id}`)
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  if (!resolved) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-3xl">
        {!canEdit && (
          <p className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
            Solo lectura: no tienes permiso para editar
          </p>
        )}
        {/* fieldset disabled: deshabilita todos los switches de una vez */}
        <fieldset disabled={!canEdit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Pestañas visibles</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <SwitchRow control={form.control} name="tab_info" label="Info del item" />
              <SwitchRow control={form.control} name="tab_details" label="Detalles" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Detalles</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <SwitchRow control={form.control} name="details_add" label="Agregar" />
              <SwitchRow control={form.control} name="details_reorder" label="Reordenar" />
              <SwitchRow control={form.control} name="details_delete" label="Eliminar" />
            </CardContent>
          </Card>
        </fieldset>

        {/* Vista previa — así quedaría el detalle de ESTE item con los valores de arriba,
            sin tener que guardar para verlo. */}
        <Card>
          <CardHeader><CardTitle className="text-base">Vista previa</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <TabPreviewChip label="Info del item" visible={watched.tab_info} />
              <TabPreviewChip label="Detalles" visible={watched.tab_details} />
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <ActionsPreviewRow label="Detalles" add={watched.details_add} reorder={watched.details_reorder} del={watched.details_delete} tabVisible={watched.tab_details} />
            </div>
          </CardContent>
        </Card>

        <Separator />
        {error && <AlertError title="Error al actualizar" message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push(`/section-items/${resolved.id}`)} disabled={isSubmitting}>Cancelar</Button>
          {canEdit && (
            <Button type="submit" disabled={isSubmitting} className="min-w-28">
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : 'Guardar'}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
