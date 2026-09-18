'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/shared/ui/form'
import { Switch } from '@/shared/ui/switch'
import { cn } from '@/shared/lib/utils'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { AlertError } from '@/widgets/alerts_components'
import { useSectionListStore } from '../../stores/useSectionListStore'
import { useSectionFormStore } from '../../stores/useSectionFormStore'

const schema = z.object({
  tab_info:        z.boolean(),
  tab_images:      z.boolean(),
  tab_buttons:     z.boolean(),
  tab_items:       z.boolean(),
  images_add:      z.boolean(),
  images_reorder:  z.boolean(),
  images_delete:   z.boolean(),
  buttons_add:     z.boolean(),
  buttons_reorder: z.boolean(),
  buttons_delete:  z.boolean(),
  items_add:       z.boolean(),
  items_reorder:   z.boolean(),
  items_delete:    z.boolean(),
})

type FormValues = z.infer<typeof schema>

function SwitchRow({ control, name, label }: { control: any; name: keyof FormValues; label: string }) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem className="flex items-center justify-between gap-2">
        <FormLabel className="font-normal">{label}</FormLabel>
        <FormControl><Switch checked={field.value as boolean} onCheckedChange={field.onChange} /></FormControl>
      </FormItem>
    )} />
  )
}

/** Chip de la vista previa — pinta como quedaría el tab en el detalle real (ver section-detail.tsx: TabsTrigger). Gris/tachado cuando ese tab está oculto. */
function TabPreviewChip({ label, visible }: { label: string; visible: boolean }) {
  return (
    <span className={cn(
      'rounded-md border px-3 py-1.5 text-xs font-medium',
      visible ? 'border-border bg-background text-foreground' : 'border-dashed border-muted-foreground/30 text-muted-foreground/50 line-through'
    )}>
      {label}
    </span>
  )
}

/** Fila "Agregar/Reordenar/Eliminar" de la vista previa, para un tab puntual. */
function ActionsPreviewRow({ label, add, reorder, del, tabVisible }: { label: string; add: boolean; reorder: boolean; del: boolean; tabVisible: boolean }) {
  if (!tabVisible) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground/50">{label}</span>
        <span className="text-xs text-muted-foreground/50">tab oculto — no aplica</span>
      </div>
    )
  }
  const items: [string, boolean][] = [['Agregar', add], ['Reordenar', reorder], ['Eliminar', del]]
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-3">
        {items.map(([actionLabel, on]) => (
          <span key={actionLabel} className={cn('flex items-center gap-1 text-xs', on ? 'text-foreground' : 'text-muted-foreground/60')}>
            {on ? <CheckCircle2 className="size-3.5 text-emerald-600" /> : <XCircle className="size-3.5 text-muted-foreground/50" />}
            {actionLabel}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * Config técnica de UNA sección puntual (`section_web_setting`) — pantalla propia, separada
 * del form de contenido de la Sección (`section-form.tsx`): "Guardar" acá manda un PATCH que
 * SOLO toca estos 13 campos (`sectionsService.patch` es parcial), nunca el título/descripción/
 * etc. de la sección. Se llega acá desde el botón "Configuración" del detalle de la sección.
 */
export function SectionSettingsForm({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, loadById, setCurrentItem } = useSectionListStore()
  const { isSubmitting, error, fieldErrors, update, reset } = useSectionFormStore()
  const resolved = currentItem ?? items.find((i) => String(i.id) === id) ?? null

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tab_info: true, tab_images: true, tab_buttons: true, tab_items: true,
      images_add: true, images_reorder: true, images_delete: true,
      buttons_add: true, buttons_reorder: true, buttons_delete: true,
      items_add: true, items_reorder: true, items_delete: true,
    },
  })

  useEffect(() => { void loadById(Number(id)) }, [id])

  useEffect(() => {
    if (resolved) {
      form.reset({
        tab_info:        resolved.tabInfo,
        tab_images:      resolved.tabImages,
        tab_buttons:     resolved.tabButtons,
        tab_items:       resolved.tabItems,
        images_add:      resolved.imagesAdd,
        images_reorder:  resolved.imagesReorder,
        images_delete:   resolved.imagesDelete,
        buttons_add:     resolved.buttonsAdd,
        buttons_reorder: resolved.buttonsReorder,
        buttons_delete:  resolved.buttonsDelete,
        items_add:       resolved.itemsAdd,
        items_reorder:   resolved.itemsReorder,
        items_delete:    resolved.itemsDelete,
      })
    }
  }, [resolved?.id])

  useEffect(() => () => { reset(); setCurrentItem(null) }, [])

  const watched = form.watch()

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: '¿Guardar configuración?',
      text: resolved?.name,
      confirmText: 'Sí, guardar',
      cancelText: 'Cancelar',
    })
    if (!confirmed || !resolved) return

    const success = await update(resolved.id, values)

    if (success) {
      await swalSuccess('Configuración actualizada', resolved.name)
      router.push(`/sections/${resolved.id}`)
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  if (!resolved) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-3xl">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Pestañas visibles</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <SwitchRow control={form.control} name="tab_info" label="Info general" />
              <SwitchRow control={form.control} name="tab_images" label="Imágenes" />
              <SwitchRow control={form.control} name="tab_buttons" label="Botones" />
              <SwitchRow control={form.control} name="tab_items" label="Items" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Imágenes</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <SwitchRow control={form.control} name="images_add" label="Agregar" />
              <SwitchRow control={form.control} name="images_reorder" label="Reordenar" />
              <SwitchRow control={form.control} name="images_delete" label="Eliminar" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Botones</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <SwitchRow control={form.control} name="buttons_add" label="Agregar" />
              <SwitchRow control={form.control} name="buttons_reorder" label="Reordenar" />
              <SwitchRow control={form.control} name="buttons_delete" label="Eliminar" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <SwitchRow control={form.control} name="items_add" label="Agregar" />
              <SwitchRow control={form.control} name="items_reorder" label="Reordenar" />
              <SwitchRow control={form.control} name="items_delete" label="Eliminar" />
            </CardContent>
          </Card>
        </div>

        {/* Vista previa — así quedaría el detalle de ESTA sección con los valores de arriba,
            sin tener que guardar para verlo. */}
        <Card>
          <CardHeader><CardTitle className="text-base">Vista previa</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <TabPreviewChip label="Info general" visible={watched.tab_info} />
              <TabPreviewChip label="Imágenes" visible={watched.tab_images} />
              <TabPreviewChip label="Botones" visible={watched.tab_buttons} />
              <TabPreviewChip label="Items" visible={watched.tab_items} />
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <ActionsPreviewRow label="Imágenes" add={watched.images_add} reorder={watched.images_reorder} del={watched.images_delete} tabVisible={watched.tab_images} />
              <ActionsPreviewRow label="Botones" add={watched.buttons_add} reorder={watched.buttons_reorder} del={watched.buttons_delete} tabVisible={watched.tab_buttons} />
              <ActionsPreviewRow label="Items" add={watched.items_add} reorder={watched.items_reorder} del={watched.items_delete} tabVisible={watched.tab_items} />
            </div>
          </CardContent>
        </Card>

        <Separator />
        {error && <AlertError title="Error al actualizar" message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push(`/sections/${resolved.id}`)} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
