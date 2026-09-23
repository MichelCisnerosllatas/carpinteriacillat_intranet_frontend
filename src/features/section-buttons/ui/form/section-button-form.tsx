'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { VisibilityToggle } from '@/shared/ui/visibility-toggle'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { formatDatetime } from '@/shared/lib/utils'
import { AlertError } from '@/widgets/alerts_components'
import { goBackOrFallback } from '@/shared/lib/navigation-history'
import { SectionSelect } from '@/features/sections/ui/section-select'
import { IconPicker } from '@/shared/ui/icon-picker/icon-picker'
import { FaIcon } from '@/shared/ui/icon-picker/fa-icon'
import { cn } from '@/shared/lib/utils'
import { useSectionButtonListStore } from '../../stores/useSectionButtonListStore'
import { useSectionButtonFormStore } from '../../stores/useSectionButtonFormStore'
import { SECTION_BUTTON_VARIANTS, SECTION_BUTTON_VARIANT_DEFAULT } from '../../data/data'

const schema = z.object({
  id_section:            z.number({ error: 'Seleccione la sección.' }),
  sectionbutton_label:   z.string().min(1, 'La etiqueta es requerida.').max(150),
  sectionbutton_url:     z.string().max(500).optional(),
  sectionbutton_icon:    z.string().max(150).optional(),
  sectionbutton_variant: z.string().max(50).optional(),
  sectionbutton_state:   z.number(),
})

type FormValues = z.infer<typeof schema>

export function SectionButtonForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const isEdit        = mode === 'edit'

  // Creación contextual: si se entra desde el tab de una sección (con `?id_section=`), ese
  // valor se precarga y el <SectionSelect> se deshabilita — no se puede cambiar la sección
  // desde aquí. Solo aplica al crear.
  const contextualIdSection = !isEdit && searchParams.get('id_section') ? Number(searchParams.get('id_section')) : null
  // En edición, la sección SIEMPRE queda bloqueada (ya viene del registro) — mover un botón de
  // una sección a otra no es una acción que este form deba permitir de forma casual.
  const sectionSelectDisabled = isEdit || contextualIdSection !== null

  const { currentItem, items, loadById, setCurrentItem }            = useSectionButtonListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useSectionButtonFormStore()
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  // Botones con `actionKey` (ej. el submit de "Enviar mensaje" en Contacto) ejecutan lógica
  // propia ya cableada en el frontend web — no navegan a una URL, así que ese campo no aplica
  // y se deshabilita. Es un campo solo-lectura sembrado por el backend, nunca se envía en el
  // submit de este form (ver sección-buttons.md, backend).
  const isActionButton = isEdit && !!resolved?.actionKey

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id_section: contextualIdSection ?? undefined,
      sectionbutton_label: '',
      sectionbutton_url: '',
      sectionbutton_icon: '',
      sectionbutton_variant: SECTION_BUTTON_VARIANT_DEFAULT,
      sectionbutton_state: 1,
    },
  })

  // Siempre trae el registro fresco del backend al editar — no depende de que la tabla ya esté cargada en memoria.
  useEffect(() => {
    if (isEdit && id) { void loadById(Number(id)) }
  }, [isEdit, id])

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        id_section:            resolved.idSection,
        sectionbutton_label:   resolved.label,
        sectionbutton_url:     resolved.url ?? '',
        sectionbutton_icon:    resolved.icon ?? '',
        sectionbutton_variant: resolved.variant ?? SECTION_BUTTON_VARIANT_DEFAULT,
        sectionbutton_state:   resolved.stateValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => { reset(); setCurrentItem(null) }, [])

  const watchedLabel   = form.watch('sectionbutton_label')
  const watchedIcon    = form.watch('sectionbutton_icon')
  const watchedVariant = form.watch('sectionbutton_variant')

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear botón?',
      text: values.sectionbutton_label,
      confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const success = isEdit
      ? await update(resolved!.id, {
          id_section:               values.id_section,
          sectionbutton_label:      values.sectionbutton_label,
          sectionbutton_url:        values.sectionbutton_url,
          sectionbutton_icon:       values.sectionbutton_icon,
          sectionbutton_variant:    values.sectionbutton_variant,
          sectionbutton_state:      values.sectionbutton_state,
          sectionbutton_updated_at: formatDatetime(),
        })
      : await create({
          id_section:               values.id_section,
          sectionbutton_label:      values.sectionbutton_label,
          sectionbutton_url:        values.sectionbutton_url,
          sectionbutton_icon:       values.sectionbutton_icon,
          sectionbutton_variant:    values.sectionbutton_variant,
          sectionbutton_state:      values.sectionbutton_state,
          sectionbutton_created_at: formatDatetime(),
        })

    if (success) {
      await swalSuccess(isEdit ? 'Actualizado' : 'Creado', values.sectionbutton_label)
      goBackOrFallback(router, '/section-buttons')
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
                    disabled={sectionSelectDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="sectionbutton_label" render={({ field }) => (
              <FormItem>
                <FormLabel>Etiqueta <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="Ej: Llámanos" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="sectionbutton_url" render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl><Input placeholder="Ej: https://wa.me/51999999999" disabled={isActionButton} {...field} /></FormControl>
                {isActionButton && (
                  <FormDescription>Este botón ejecuta una acción propia del formulario (no navega a una URL) — el campo no aplica.</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="sectionbutton_icon" render={({ field }) => (
              <FormItem>
                <FormLabel>Icono</FormLabel>
                <FormControl>
                  <IconPicker value={field.value || null} onValueChange={(v) => field.onChange(v ?? '')} />
                </FormControl>
                <FormDescription>Icono de Font Awesome que usa el sitio público — elegilo de la lista, no hace falta saber el nombre de memoria.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="sectionbutton_variant" render={({ field }) => (
              <FormItem>
                <FormLabel>Variante</FormLabel>
                <Select value={field.value || SECTION_BUTTON_VARIANT_DEFAULT} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {SECTION_BUTTON_VARIANTS.map((v) => (
                      <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Cómo se pinta el botón en el sitio — cualquier otro valor cae en &quot;Primario&quot;.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            {/* Vista previa en vivo — combina etiqueta/ícono/variante tal como quedarían en el
                sitio, para no tener que adivinar el resultado ni publicar para verlo. */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Vista previa</span>
              <div className="flex items-center rounded-lg border bg-muted/40 p-4">
                <span
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold',
                    watchedVariant === 'secondary'
                      ? 'border-2 border-foreground/20 bg-foreground/5 text-foreground'
                      : 'bg-primary text-primary-foreground'
                  )}
                >
                  {watchedIcon && <FaIcon value={watchedIcon} className="size-4" />}
                  {watchedLabel || 'Etiqueta del botón'}
                </span>
              </div>
            </div>

            <FormField control={form.control} name="sectionbutton_state" render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <FormLabel className="font-normal">Mostrar en el sitio web</FormLabel>
                <FormControl>
                  <VisibilityToggle checked={field.value === 1} onCheckedChange={(v) => field.onChange(v ? 1 : 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Separator />
        {error && <AlertError title={isEdit ? 'Error al actualizar' : 'Error al crear'} message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => goBackOrFallback(router, '/section-buttons')} disabled={isSubmitting}>Cancelar</Button>
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
