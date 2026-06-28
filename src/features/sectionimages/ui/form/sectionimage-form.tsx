'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { formatDatetime } from '@/shared/lib/utils'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { AlertError } from '@/widgets/alerts_components'
import { SectionSelect } from '@/features/sections/ui/section-select'
import { ImageSelect } from '@/features/images/ui/image-select'
import { useSectionImageListStore } from '../../stores/useSectionImageListStore'
import { useSectionImageFormStore } from '../../stores/useSectionImageFormStore'

const schema = z.object({
  id_section:         z.number({ required_error: 'Seleccione la sección.' }),
  id_image:           z.number({ required_error: 'Seleccione la imagen.' }),
  sectionimage_state: z.number(),
})

type FormValues = z.infer<typeof schema>

export function SectionImageForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router   = useRouter()
  const { currentItem, items }                                      = useSectionImageListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useSectionImageFormStore()
  const isEdit   = mode === 'edit'
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { id_section: undefined, id_image: undefined, sectionimage_state: 1 },
  })

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        id_section:         resolved.idSection,
        id_image:           resolved.idImage,
        sectionimage_state: resolved.stateValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => reset(), [])

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear asignación?',
      text: 'Sección — Imagen',
      confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const success = isEdit
      ? await update(resolved!.id, {
          id_section:              values.id_section,
          id_image:                values.id_image,
          sectionimage_state:      values.sectionimage_state,
          sectionimage_updated_at: formatDatetime(),
        })
      : await create({
          id_section:              values.id_section,
          id_image:                values.id_image,
          sectionimage_state:      values.sectionimage_state,
          sectionimage_created_at: formatDatetime(),
        })

    if (success) {
      await swalSuccess(isEdit ? 'Actualizado' : 'Creado', 'Asignación de imagen a sección')
      router.push('/section-images')
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-lg">
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <FormField control={form.control} name="id_section" render={({ field }) => (
              <FormItem>
                <FormLabel>Sección <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <SectionSelect
                    value={field.value ?? null}
                    onValueChange={(v) => field.onChange(v)}
                    placeholder="Seleccionar sección"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="id_image" render={({ field }) => (
              <FormItem>
                <FormLabel>Imagen <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <ImageSelect
                    value={field.value ?? null}
                    onValueChange={(v) => field.onChange(v)}
                    placeholder="Seleccionar imagen"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="sectionimage_state" render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select key={`state-${field.value}`} value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {ENTITY_STATES.map((s) => (
                      <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Separator />
        {error && <AlertError title={isEdit ? 'Error al actualizar' : 'Error al crear'} message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/section-images')} disabled={isSubmitting}>Cancelar</Button>
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
