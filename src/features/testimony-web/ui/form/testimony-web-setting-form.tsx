'use client'

import { useEffect } from 'react'
import { useForm, type Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import {
  Loader2, Image as ImageIcon, Star, MapPin, Mail, CheckCircle2, ShieldCheck, ListOrdered,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/shared/ui/form'
import { Switch } from '@/shared/ui/switch'
import { cn } from '@/shared/lib/utils'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { AlertError } from '@/widgets/alerts_components'
import { goBackOrFallback } from '@/shared/lib/navigation-history'
import { useTestimonyWebSettingStore } from '../../stores/useTestimonyWebSettingStore'

const schema = z.object({
  testimony_limit: z.number().int().min(1).nullable(),
  show_photo:     z.boolean(),
  show_rating:    z.boolean(),
  show_city:      z.boolean(),
  show_email:     z.boolean(),
  show_delivered: z.boolean(),
  show_verified:  z.boolean(),
})

type FormValues = z.infer<typeof schema>

function SwitchRow({ control, name, label, icon: Icon }: { control: Control<FormValues>; name: 'show_photo' | 'show_rating' | 'show_city' | 'show_email' | 'show_delivered' | 'show_verified'; label: string; icon: LucideIcon }) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem className="flex items-center justify-between gap-2">
        <FormLabel className="flex items-center gap-1.5 font-normal"><Icon className="size-3.5 text-muted-foreground" />{label}</FormLabel>
        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
      </FormItem>
    )} />
  )
}

/**
 * Config de visualización de `testimony_web_setting` — SINGLETON, una única fila GLOBAL (no por
 * sección: en la práctica solo existe una sección de testimonios en todo el sitio). "Guardar"
 * acá manda un PATCH que solo toca estos campos (`testimonyWebSettingService.update`), nunca los
 * datos de un testimonio puntual — mismo patrón que `SectionSettingsForm`, pero sin id/sección:
 * no hay nada que elegir, solo existe esta configuración.
 */
export function TestimonyWebSettingForm() {
  const router = useRouter()
  const { isLoading, isSubmitting, isError, error, fieldErrors, setting, get, update, reset } = useTestimonyWebSettingStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      testimony_limit: null,
      show_photo: true, show_rating: true, show_city: true,
      show_email: false, show_delivered: true, show_verified: true,
    },
  })

  useEffect(() => { void get() }, [])

  useEffect(() => {
    if (setting) {
      form.reset({
        testimony_limit: setting.testimony_limit,
        show_photo:     setting.show_photo,
        show_rating:    setting.show_rating,
        show_city:      setting.show_city,
        show_email:     setting.show_email,
        show_delivered: setting.show_delivered,
        show_verified:  setting.show_verified,
      })
    }
  }, [setting])

  useEffect(() => () => reset(), [])

  const watched = form.watch()

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: '¿Guardar configuración?',
      text: 'Se aplicará a la tarjeta de testimonios de todo el sitio web.',
      confirmText: 'Sí, guardar',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const success = await update(values)
    if (success) {
      await swalSuccess('Configuración actualizada', 'Los cambios se aplicaron al sitio web.')
      goBackOrFallback(router, '/testimony')
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  if (isLoading && !setting) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>
  if (isError) return <div className="flex h-40 items-center justify-center text-sm text-destructive">Error al cargar la configuración.</div>

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-2xl">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Datos visibles en la tarjeta</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <SwitchRow control={form.control} name="show_photo" label="Mostrar foto" icon={ImageIcon} />
              <SwitchRow control={form.control} name="show_rating" label="Mostrar estrellas" icon={Star} />
              <SwitchRow control={form.control} name="show_city" label="Mostrar ciudad" icon={MapPin} />
              <SwitchRow control={form.control} name="show_email" label="Mostrar correo" icon={Mail} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Insignias del pie</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <SwitchRow control={form.control} name="show_delivered" label='Mostrar "Proyecto entregado"' icon={CheckCircle2} />
              <SwitchRow control={form.control} name="show_verified" label='Mostrar "Cliente verificado"' icon={ShieldCheck} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Cantidad en el sitio web</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <FormField control={form.control} name="testimony_limit" render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel className="flex items-center gap-1.5 font-normal"><ListOrdered className="size-3.5 text-muted-foreground" />Máximo a mostrar</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Todos"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Solo aplica al sitio web público (el listado del intranet siempre muestra todos). Vacío = mostrar todos. Se toman los primeros según su orden y estado activo.
                  </p>
                </FormItem>
              )} />
            </CardContent>
          </Card>
        </div>

        {/* Vista previa — cómo quedaría la tarjeta de un testimonio con los valores de arriba,
            sin tener que guardar para verlo. */}
        <Card>
          <CardHeader><CardTitle className="text-base">Vista previa</CardTitle></CardHeader>
          <CardContent>
            <div className="mx-auto flex max-w-sm flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                {watched.show_photo && (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">MG</div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">María Gómez</span>
                  <span className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                    <span>Cliente</span>
                    {watched.show_city && <span>· Lima</span>}
                  </span>
                </div>
              </div>
              {watched.show_rating && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('size-3.5', i < 4 ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')} />
                  ))}
                </div>
              )}
              <p className="text-xs italic text-muted-foreground">&ldquo;Excelente trabajo, muy conformes con el resultado.&rdquo;</p>
              {watched.show_email && <span className="text-[11px] text-muted-foreground">maria@correo.com</span>}
              <div className="flex flex-wrap gap-1.5">
                {watched.show_delivered && <Badge variant="secondary" className="text-[10px] font-normal">Proyecto entregado</Badge>}
                {watched.show_verified && <Badge variant="secondary" className="text-[10px] font-normal">Cliente verificado</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />
        {error && <AlertError title="Error al actualizar" message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => goBackOrFallback(router, '/testimony')} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
