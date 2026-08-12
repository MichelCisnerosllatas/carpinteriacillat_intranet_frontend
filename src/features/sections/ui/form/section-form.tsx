'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { formatDatetime } from '@/shared/lib/utils'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { AlertError } from '@/widgets/alerts_components'
import { TypeSectionSelect } from '@/features/typesections/ui/typesection-select'
import { NavigationSelect } from '@/features/navigations/ui/navigation-select'
import { useSectionListStore } from '../../stores/useSectionListStore'
import { useSectionFormStore } from '../../stores/useSectionFormStore'

const schema = z.object({
  section_name:        z.string().min(1, 'El nombre es requerido.').max(255),
  section_title:        z.string().optional(),
  section_description: z.string().optional(),
  section_content:     z.string().optional(),
  section_state:       z.number(),
  id_type_section:     z.number({ error: 'Seleccione el tipo de sección.' }),
  id_navigation:       z.number().nullable().optional(),
})

type FormValues = z.infer<typeof schema>

export function SectionForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router  = useRouter()
  const { currentItem, items, loadById, setCurrentItem }            = useSectionListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useSectionFormStore()
  const isEdit  = mode === 'edit'
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { section_name: '', section_title: '', section_description: '', section_content: '', section_state: 1, id_type_section: undefined, id_navigation: null },
  })

  // Siempre trae el registro fresco del backend al editar — no depende de que la tabla ya esté cargada en memoria.
  useEffect(() => {
    if (isEdit && id) { void loadById(Number(id)) }
  }, [isEdit, id])

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        section_name:        resolved.name,
        section_title:       resolved.title ?? '',
        section_description: resolved.description ?? '',
        section_content:     resolved.content ?? '',
        section_state:       resolved.stateValue,
        id_type_section:     resolved.idTypesection,
        id_navigation:       resolved.idNavigation,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => { reset(); setCurrentItem(null) }, [])

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear sección?',
      text: values.section_name,
      confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const success = isEdit
      ? await update(resolved!.id, {
          section_name:        values.section_name,
          section_title:       values.section_title,
          section_description: values.section_description,
          section_content:     values.section_content,
          section_state:       values.section_state,
          id_type_section:     values.id_type_section,
          id_navigation:       values.id_navigation,
          section_updated_at:  formatDatetime(),
        })
      : await create({
          section_name:        values.section_name,
          section_title:       values.section_title,
          section_description: values.section_description,
          section_content:     values.section_content,
          section_state:       values.section_state,
          id_type_section:     values.id_type_section,
          id_navigation:       values.id_navigation,
          section_created_at:  formatDatetime(),
        })

    if (success) {
      await swalSuccess(isEdit ? 'Actualizado' : 'Creado', values.section_name)
      router.push('/sections')
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-lg">
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <FormField control={form.control} name="section_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="Ej: Sección principal" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="section_title" render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl><Input placeholder="Ej: Bienvenido a Carpintería Cillat" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="id_type_section" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Sección <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <TypeSectionSelect
                    value={field.value ?? null}
                    onValueChange={(v) => field.onChange(v)}
                    placeholder="Seleccionar tipo de sección"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="id_navigation" render={({ field }) => (
              <FormItem>
                <FormLabel>Navegación</FormLabel>
                <FormControl>
                  <NavigationSelect
                    value={field.value ?? null}
                    onValueChange={(v) => field.onChange(v)}
                    placeholder="Sin navegación (opcional)"
                    showAll
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="section_state" render={({ field }) => (
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

            <FormField control={form.control} name="section_description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl><Textarea placeholder="Descripción opcional" className="resize-none" rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="section_content" render={({ field }) => (
              <FormItem>
                <FormLabel>Contenido</FormLabel>
                <FormControl><Textarea placeholder="Contenido opcional" className="resize-none" rows={5} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Separator />
        {error && <AlertError title={isEdit ? 'Error al actualizar' : 'Error al crear'} message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/sections')} disabled={isSubmitting}>Cancelar</Button>
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
