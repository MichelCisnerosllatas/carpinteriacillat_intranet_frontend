'use client'

import { useEffect } from 'react'
import { useForm, type Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2, Heading, Type, AlignLeft, type LucideIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/shared/ui/form'
import { Switch } from '@/shared/ui/switch'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { AlertError } from '@/widgets/alerts_components'
import { useSectionContentVisibilityStore } from '../../stores/useSectionContentVisibilityStore'

const schema = z.object({
  show_title: z.boolean(),
  show_subtitle: z.boolean(),
  show_description: z.boolean(),
})

type FormValues = z.infer<typeof schema>

function VisibilityRow({
  control, name, label, icon: Icon, value,
}: {
  control: Control<FormValues>
  name: keyof FormValues
  label: string
  icon: LucideIcon
  value: string | null
}) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <FormLabel className="flex items-center gap-1.5 font-normal">
            <Icon className="size-3.5 text-muted-foreground" />{label}
          </FormLabel>
          <span className="truncate text-xs text-muted-foreground">
            {value ? `"${value}"` : 'Sin texto — ya no se muestra en el sitio, con o sin este interruptor.'}
          </span>
        </div>
        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={!value} /></FormControl>
      </FormItem>
    )} />
  )
}

/**
 * Tab "Visibilidad" de Configuración de Sección — separado del tab "Estructura"
 * (`section-settings-form.tsx`, tabs/permisos de Imágenes/Botones/Items): acá se oculta título/
 * subtítulo/descripción del sitio público SIN borrar el texto (`section_web_setting.show_title`,
 * etc.). Si el campo ya está vacío, el interruptor queda deshabilitado — no hay nada que ocultar,
 * `SectionHeading` (frontend público) ya no pinta líneas vacías por su cuenta.
 */
export function SectionContentVisibilityForm({ id }: { id: string }) {
  const router = useRouter()
  const { section, isLoading, isSubmitting, error, fieldErrors, get, update, reset } = useSectionContentVisibilityStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { show_title: true, show_subtitle: true, show_description: true },
  })

  useEffect(() => { void get(Number(id)) }, [id])

  useEffect(() => {
    if (section) {
      form.reset({
        show_title: section.showTitle,
        show_subtitle: section.showSubtitle,
        show_description: section.showDescription,
      })
    }
  }, [section])

  useEffect(() => () => reset(), [])

  const watched = form.watch()

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: '¿Guardar visibilidad?',
      text: section?.name,
      confirmText: 'Sí, guardar',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const success = await update(Number(id), values)
    if (success) {
      await swalSuccess('Visibilidad actualizada', section?.name)
      router.push(`/sections/${id}`)
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  if (isLoading && !section) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>
  if (!section) return null

  const previewShowSubtitle = watched.show_subtitle && !!section.subtitle
  const previewShowTitle = watched.show_title && !!section.title
  const previewShowDescription = watched.show_description && !!section.description

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Propiedades visibles en el sitio web</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground">
              Oculta título, subtítulo o descripción de esta sección en el sitio público sin borrar el texto — para
              volver a mostrarlo más adelante sin tener que escribirlo de nuevo.
            </p>
            <VisibilityRow control={form.control} name="show_subtitle" label="Mostrar subtítulo" icon={Type} value={section.subtitle} />
            <Separator />
            <VisibilityRow control={form.control} name="show_title" label="Mostrar título" icon={Heading} value={section.title} />
            <Separator />
            <VisibilityRow control={form.control} name="show_description" label="Mostrar descripción" icon={AlignLeft} value={section.description} />
          </CardContent>
        </Card>

        {/* Vista previa — mismo criterio que `SectionHeading` en el sitio público: si no hay
            texto o el interruptor está apagado, esa línea no se pinta. */}
        <Card>
          <CardHeader><CardTitle className="text-base">Vista previa</CardTitle></CardHeader>
          <CardContent>
            {!previewShowSubtitle && !previewShowTitle && !previewShowDescription ? (
              <p className="text-center text-xs text-muted-foreground">
                Nada que mostrar — el encabezado de esta sección no se pintaría en el sitio.
              </p>
            ) : (
              <div className="mx-auto max-w-md text-center">
                {previewShowSubtitle && (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{section.subtitle}</p>
                )}
                {previewShowTitle && (
                  <h3 className="mt-2 text-xl font-extrabold">{section.title}</h3>
                )}
                {previewShowDescription && (
                  <p className="mt-3 text-sm text-muted-foreground">{section.description}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />
        {error && <AlertError title="Error al actualizar" message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push(`/sections/${id}`)} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
