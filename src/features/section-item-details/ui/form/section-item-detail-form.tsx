'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { VisibilityToggle } from '@/shared/ui/visibility-toggle'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { formatDatetime } from '@/shared/lib/utils'
import { AlertError } from '@/widgets/alerts_components'
import { goBackOrFallback } from '@/shared/lib/navigation-history'
import { SectionItemSelect } from '@/features/section-items/ui/section-item-select'
import { useSectionItemDetailListStore } from '../../stores/useSectionItemDetailListStore'
import { useSectionItemDetailFormStore } from '../../stores/useSectionItemDetailFormStore'

const schema = z.object({
  id_section_item:               z.number({ error: 'Seleccione el item de sección.' }),
  sectionitemdetail_title:       z.string().max(255).optional(),
  sectionitemdetail_description: z.string().optional(),
  sectionitemdetail_state:       z.number(),
})

type FormValues = z.infer<typeof schema>

export function SectionItemDetailForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const isEdit        = mode === 'edit'

  // Creación contextual: si se entra desde el tab de un item de sección (con
  // `?id_section_item=`), ese valor se precarga y el <SectionItemSelect> se deshabilita — no se
  // puede cambiar el item desde aquí. Solo aplica al crear; en edición el item viene del registro.
  const contextualIdSectionItem = !isEdit && searchParams.get('id_section_item') ? Number(searchParams.get('id_section_item')) : null
  // En edición, el item SIEMPRE queda bloqueado (ya viene del registro) — mover un detalle de
  // un item a otro no es una acción que este form deba permitir de forma casual.
  const sectionItemSelectDisabled = isEdit || contextualIdSectionItem !== null

  const { currentItem, items, loadById, setCurrentItem }            = useSectionItemDetailListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useSectionItemDetailFormStore()
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id_section_item: contextualIdSectionItem ?? undefined,
      sectionitemdetail_title: '',
      sectionitemdetail_description: '',
      sectionitemdetail_state: 1,
    },
  })

  // Siempre trae el registro fresco del backend al editar — no depende de que la tabla ya esté cargada en memoria.
  useEffect(() => {
    if (isEdit && id) { void loadById(Number(id)) }
  }, [isEdit, id])

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        id_section_item:               resolved.idSectionItem,
        sectionitemdetail_title:       resolved.title ?? '',
        sectionitemdetail_description: resolved.description ?? '',
        sectionitemdetail_state:       resolved.stateValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => { reset(); setCurrentItem(null) }, [])

  const onSubmit = async (values: FormValues) => {
    const label = values.sectionitemdetail_title || 'este detalle'
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear detalle?',
      text: label,
      confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const success = isEdit
      ? await update(resolved!.id, {
          id_section_item:               values.id_section_item,
          sectionitemdetail_title:       values.sectionitemdetail_title,
          sectionitemdetail_description: values.sectionitemdetail_description,
          sectionitemdetail_state:       values.sectionitemdetail_state,
          sectionitemdetail_updated_at:  formatDatetime(),
        })
      : await create({
          id_section_item:               values.id_section_item,
          sectionitemdetail_title:       values.sectionitemdetail_title,
          sectionitemdetail_description: values.sectionitemdetail_description,
          sectionitemdetail_state:       values.sectionitemdetail_state,
          sectionitemdetail_created_at:  formatDatetime(),
        })

    if (success) {
      await swalSuccess(isEdit ? 'Actualizado' : 'Creado', label)
      goBackOrFallback(router, '/section-item-details')
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-lg">
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <FormField control={form.control} name="id_section_item" render={({ field }) => (
              <FormItem>
                <FormLabel>Item de sección <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <SectionItemSelect
                    value={field.value ?? null}
                    onValueChange={(v) => field.onChange(v)}
                    placeholder="Seleccionar item de sección"
                    disabled={sectionItemSelectDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="sectionitemdetail_title" render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl><Input placeholder="Ej: Garantía de 5 años" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="sectionitemdetail_description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl><Textarea placeholder="Descripción del detalle" className="resize-none" rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="sectionitemdetail_state" render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <FormLabel className="font-normal">Mostrar en el sitio web</FormLabel>
                <FormControl>
                  <VisibilityToggle checked={field.value === 1} onCheckedChange={(v) => field.onChange(v ? 1 : 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <p className="text-xs text-muted-foreground">
              El orden del detalle (<code className="rounded bg-muted px-1 py-0.5">sectionitemdetail_order</code>) no se edita aquí — se gestiona desde &quot;Reordenar&quot;.
            </p>
          </CardContent>
        </Card>

        <Separator />
        {error && <AlertError title={isEdit ? 'Error al actualizar' : 'Error al crear'} message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => goBackOrFallback(router, '/section-item-details')} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</>
              : isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
