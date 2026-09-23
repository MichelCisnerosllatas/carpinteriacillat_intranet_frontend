'use client'

import { useEffect, useRef } from 'react'
import { useForm, type Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Building2, Navigation2, LayoutList, Link2, PanelBottom, Ruler } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Badge } from '@/shared/ui/badge'
import { LogoField } from '@/shared/ui/logo-field'
import { cn } from '@/shared/lib/utils'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { toastError } from '@/shared/lib/toast'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { AlertError } from '@/widgets/alerts_components'
import { storageFilesService } from '@/features/storage-files/services/storage-files.service'
import { useFooterSettingStore } from '../../stores/useFooterSettingStore'
import { VisibilityToggle } from '@/shared/ui/visibility-toggle'
import type { LogoFieldHandle } from '@/shared/lib/logo-field.types'

const schema = z.object({
  logo: z.string().nullable(),
  logo_height: z.number().min(16).max(400),
  logo_width: z.number().min(16).max(800).nullable(),
  logo_object_fit: z.union([z.literal('contain'), z.literal('cover')]),
  footer_state: z.boolean(),
  show_brand: z.boolean(),
  show_quick_links: z.boolean(),
  show_services: z.boolean(),
  show_access: z.boolean(),
})

type FormValues = z.infer<typeof schema>
type ColumnField = 'show_brand' | 'show_quick_links' | 'show_services' | 'show_access'

function ColumnRow({
  control, name, label, icon: Icon, description, disabled,
}: {
  control: Control<FormValues>
  name: ColumnField
  label: string
  icon: typeof Building2
  description: string
  disabled: boolean
}) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem className="flex items-center justify-between gap-3 rounded-lg border p-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <FormLabel className="font-normal">{label}</FormLabel>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <FormControl>
          <VisibilityToggle checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
        </FormControl>
      </FormItem>
    )} />
  )
}

/**
 * Tab "Visibilidad" de `/footer` — controla `footer_setting` (backend), separado de
 * `FooterGuide` (que solo son links a otros módulos, no un formulario). `footer_state` en
 * `false` deshabilita los 4 interruptores de columna: si el footer completo está apagado, no
 * tiene sentido decidir qué columna se vería.
 */
export function FooterVisibilityForm() {
  const { setting, isLoading, isSubmitting, error, fieldErrors, get, update, reset } = useFooterSettingStore()
  const logoFieldRef = useRef<LogoFieldHandle>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      logo: null, logo_height: 64, logo_width: null, logo_object_fit: 'contain',
      footer_state: true, show_brand: true, show_quick_links: true, show_services: true, show_access: true,
    },
  })

  useEffect(() => { void get() }, [])

  useEffect(() => {
    if (setting) {
      form.reset({
        logo: setting.logo,
        logo_height: setting.logo_height,
        logo_width: setting.logo_width,
        logo_object_fit: setting.logo_object_fit,
        footer_state: setting.footer_state,
        show_brand: setting.show_brand,
        show_quick_links: setting.show_quick_links,
        show_services: setting.show_services,
        show_access: setting.show_access,
      })
    }
  }, [setting])

  useEffect(() => () => reset(), [])

  const watched = form.watch()
  const columnsDisabled = !watched.footer_state

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: '¿Guardar visibilidad del footer?',
      text: values.footer_state ? 'Se aplicará a todo el sitio web.' : 'El footer se ocultará en todo el sitio web.',
      confirmText: 'Sí, guardar',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    let logo = values.logo
    const pendingFile = logoFieldRef.current?.getPendingFile()
    const logoWasRemoved = logoFieldRef.current?.wasRemoved() ?? false

    if (pendingFile) {
      const formData = new FormData()
      formData.append('file', pendingFile)
      formData.append('folder', 'sistema')
      const uploadResponse = await storageFilesService.upload(formData)
      if (!uploadResponse.success) {
        toastError('Error', 'No se pudo subir el logo del footer.')
        return
      }
      logo = uploadResponse.data.path
    } else if (logoWasRemoved) {
      logo = null
    }

    const success = await update({ ...values, logo })
    if (success) {
      await swalSuccess('Visibilidad actualizada', 'Los cambios se aplicaron al sitio web.')
      form.setValue('logo', logo, { shouldDirty: false, shouldValidate: false })
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  if (isLoading && !setting) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* A todo el ancho en desktop: logo a la izquierda, el resto de la config a la derecha —
            en vez de una sola columna angosta que deja medio ancho de pantalla vacío. */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <Card className="xl:col-span-5">
            <CardHeader><CardTitle className="text-base">Logo del footer</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* Una sola imagen: el mismo recuadro sirve para subir/cambiar/quitar Y para ver
                  cómo se vería a tamaño real (usa el alto/ancho/ajuste elegidos abajo). Antes
                  había 2 cajas separadas — confundía cuál era la que se podía tocar. */}
              <FormField control={form.control} name="logo" render={({ field }) => (
                <FormItem className="flex flex-col items-center gap-3 text-center">
                  <FormControl>
                    <LogoField
                      ref={logoFieldRef}
                      value={field.value}
                      disabled={isSubmitting}
                      alt="Logo del footer"
                      previewHeight={watched.logo_height}
                      previewWidth={watched.logo_width}
                      previewObjectFit={watched.logo_object_fit}
                    />
                  </FormControl>
                  <p className="max-w-sm text-xs text-muted-foreground">
                    Distinto al logo del header. Si no subes uno, el footer usa el mismo de{' '}
                    <span className="font-medium text-foreground">Configuración de Empresa</span>.
                  </p>
                  <FormMessage />
                </FormItem>
              )} />

              <Separator />

              <div className="flex items-center gap-2 text-sm font-medium">
                <Ruler className="size-4 text-muted-foreground" />
                Tamaño en el sitio web
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="logo_height" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal">Alto (px)</FormLabel>
                    <FormControl>
                      <Input
                        type="number" min={16} max={400}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value === '' ? 64 : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="logo_width" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal">Ancho (px)</FormLabel>
                    <FormControl>
                      <Input
                        type="number" min={16} max={800}
                        placeholder="Automático"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Vacío = según su proporción real.</p>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="logo_object_fit" render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="font-normal">Ajuste de imagen</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="contain">Contener</SelectItem>
                        <SelectItem value="cover">Cubrir</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {field.value === 'cover'
                        ? 'Llena el ancho y alto exactos — puede recortar los bordes del logo.'
                        : 'Se ve el logo completo, nunca se recorta.'}
                    </p>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4 xl:col-span-7">
            <Card>
              <CardHeader><CardTitle className="text-base">Footer completo</CardTitle></CardHeader>
              <CardContent>
                <FormField control={form.control} name="footer_state" render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-3 rounded-lg border border-dashed p-3">
                    <div className="flex items-start gap-2.5">
                      <PanelBottom className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <FormLabel className="font-normal">Mostrar footer en el sitio web</FormLabel>
                        <p className="text-xs text-muted-foreground">Apagarlo lo oculta en TODAS las páginas del sitio público, sin borrar ningún dato.</p>
                      </div>
                    </div>
                    <FormControl>
                      <VisibilityToggle checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Columnas del footer</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {columnsDisabled && (
                  <p className="text-xs text-muted-foreground sm:col-span-2">
                    El footer completo está oculto — estos interruptores no tienen efecto hasta que lo vuelvas a mostrar arriba.
                  </p>
                )}
                <ColumnRow
                  control={form.control} name="show_brand" label="Marca y redes sociales" icon={Building2}
                  description="Logo, nombre y los íconos de redes sociales activas." disabled={columnsDisabled}
                />
                <ColumnRow
                  control={form.control} name="show_quick_links" label="Enlaces rápidos" icon={Navigation2}
                  description="Los mismos enlaces del menú principal." disabled={columnsDisabled}
                />
                <ColumnRow
                  control={form.control} name="show_services" label="Servicios" icon={LayoutList}
                  description="Items de la sección &quot;Servicios Destacados&quot;." disabled={columnsDisabled}
                />
                <ColumnRow
                  control={form.control} name="show_access" label="Accesos" icon={Link2}
                  description="El link a la Intranet." disabled={columnsDisabled}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Vista previa</CardTitle></CardHeader>
              <CardContent>
                {!watched.footer_state ? (
                  <p className="text-center text-xs text-muted-foreground">El footer no se pintaría en el sitio web.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {[
                      ['Marca y redes', watched.show_brand],
                      ['Enlaces rápidos', watched.show_quick_links],
                      ['Servicios', watched.show_services],
                      ['Accesos', watched.show_access],
                    ].map(([label, visible]) => (
                      <Badge
                        key={label as string}
                        variant="outline"
                        className={cn('text-xs', visible ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-dashed text-muted-foreground/60 line-through')}
                      >
                        {label as string}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />
        {error && <AlertError title="Error al actualizar" message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
