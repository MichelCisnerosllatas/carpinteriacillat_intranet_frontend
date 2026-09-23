'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Globe } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/shared/ui/form'
import { VisibilityToggle } from '@/shared/ui/visibility-toggle'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { formatDatetime } from '@/shared/lib/utils'
import { AlertError } from '@/widgets/alerts_components'
import { TypeSectionSelect } from '@/features/typesections/ui/typesection-select'
import { TypeSectionQuickCreateDialog } from '@/features/typesections/ui/typesection-quick-create-dialog'
import { NavigationSelect } from '@/features/navigations/ui/navigation-select'
import { NavigationQuickCreateDialog } from '@/features/navigations/ui/navigation-quick-create-dialog'
import { useSectionListStore } from '../../stores/useSectionListStore'
import { useSectionFormStore } from '../../stores/useSectionFormStore'

const schema = z.object({
  section_name:        z.string().max(255).optional(),
  section_title:        z.string().optional(),
  section_subtitle:    z.string().optional(),
  section_description: z.string().optional(),
  section_content:     z.string().optional(),
  section_variant:     z.string().max(50).optional(),
  section_state:       z.number(),
  id_type_section:     z.number({ error: 'Seleccione el tipo de sección.' }),
  id_navigation:       z.number({ error: 'Seleccione la navegación.' }),
})

type FormValues = z.infer<typeof schema>

/** Estos campos viajan tal cual a `/v1/public/site` y los renderiza el sitio web público —
 * a diferencia de "Nombre" (uso interno del intranet, nunca sale de acá). */
function PublicSiteBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-400">
      <Globe className="size-3" />Se muestra en el sitio web
    </span>
  )
}

export function SectionForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router  = useRouter()
  const { currentItem, items, loadById, setCurrentItem }            = useSectionListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useSectionFormStore()
  const isEdit  = mode === 'edit'
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  const [showTypeSectionCreate, setShowTypeSectionCreate] = useState(false)
  const [showNavigationCreate, setShowNavigationCreate]   = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { section_name: '', section_title: '', section_subtitle: '', section_description: '', section_content: '', section_variant: '', section_state: 1, id_type_section: undefined, id_navigation: undefined },
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
        section_subtitle:    resolved.subtitle ?? '',
        section_description: resolved.description ?? '',
        section_content:     resolved.content ?? '',
        section_variant:     resolved.variant ?? '',
        section_state:       resolved.stateValue,
        id_type_section:     resolved.idTypesection,
        id_navigation:       resolved.idNavigation ?? undefined,
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
          section_subtitle:    values.section_subtitle,
          section_description: values.section_description,
          section_content:     values.section_content,
          section_variant:     values.section_variant,
          section_state:       values.section_state,
          id_type_section:     values.id_type_section,
          id_navigation:       values.id_navigation,
          section_updated_at:  formatDatetime(),
        })
      : await create({
          section_name:        values.section_name,
          section_title:       values.section_title,
          section_subtitle:    values.section_subtitle,
          section_description: values.section_description,
          section_content:     values.section_content,
          section_variant:     values.section_variant,
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
                <FormLabel>Nombre</FormLabel>
                <FormControl><Input placeholder="Ej: Sección principal" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="section_title" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Título</FormLabel>
                  <PublicSiteBadge />
                </div>
                <FormControl><Input placeholder="Ej: Bienvenido a Carpintería Cillat" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="section_subtitle" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Subtítulo</FormLabel>
                  <PublicSiteBadge />
                </div>
                <FormControl><Input placeholder="Ej: Contáctanos" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="id_type_section" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Tipo de Sección <span className="text-destructive">*</span></FormLabel>
                  <button
                    type="button"
                    onClick={() => setShowTypeSectionCreate(true)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="size-3.5" />Nuevo
                  </button>
                </div>
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
                <div className="flex items-center justify-between">
                  <FormLabel>Navegación <span className="text-destructive">*</span></FormLabel>
                  <button
                    type="button"
                    onClick={() => setShowNavigationCreate(true)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="size-3.5" />Nuevo
                  </button>
                </div>
                <FormControl>
                  <NavigationSelect
                    value={field.value ?? null}
                    onValueChange={(v) => field.onChange(v)}
                    placeholder="Seleccionar navegación"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="section_state" render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <FormLabel className="font-normal">Mostrar en el sitio web</FormLabel>
                <FormControl>
                  <VisibilityToggle checked={field.value === 1} onCheckedChange={(v) => field.onChange(v ? 1 : 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="section_description" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Descripción</FormLabel>
                  <PublicSiteBadge />
                </div>
                <FormControl><Textarea placeholder="Descripción opcional" className="resize-none" rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="section_content" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Contenido</FormLabel>
                  <PublicSiteBadge />
                </div>
                <FormControl><Textarea placeholder="Contenido opcional" className="resize-none" rows={5} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="section_variant" render={({ field }) => (
              <FormItem>
                <FormLabel>Variante</FormLabel>
                <FormControl><Input placeholder="Ej: home" maxLength={50} {...field} /></FormControl>
                <FormDescription>Campo reservado — hoy ningún componente del sitio web lo usa todavía, no cambia nada visualmente.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            {resolved?.key && (
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Clave interna</span>
                <code className="w-fit rounded bg-muted px-2 py-1 text-xs text-muted-foreground">{resolved.key}</code>
                <p className="text-xs text-muted-foreground">Identifica esta sección en el código del sitio web — no es editable.</p>
              </div>
            )}
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

      <TypeSectionQuickCreateDialog
        open={showTypeSectionCreate}
        onOpenChange={setShowTypeSectionCreate}
        onCreated={(item) => form.setValue('id_type_section', item.id_typesection, { shouldValidate: true, shouldDirty: true })}
      />
      <NavigationQuickCreateDialog
        open={showNavigationCreate}
        onOpenChange={setShowNavigationCreate}
        onCreated={(item) => form.setValue('id_navigation', item.id_navigation, { shouldValidate: true, shouldDirty: true })}
      />
    </Form>
  )
}
