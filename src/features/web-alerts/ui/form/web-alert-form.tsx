'use client'

// Formulario para crear o editar una alerta del sitio, en tarjetas:
// Texto · Aspecto · Al tocar la alerta · Comportamiento · Cuándo se muestra
// (esta última incluye el interruptor "Activada").

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import {
  AlignCenter, AlignLeft, AlignRight, CalendarClock, Loader2,
  MousePointerClick, Palette, Settings2, Type,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Card, CardContent } from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { FormSkeleton } from '@/shared/ui/form-skeleton'
import { FieldTip } from '@/shared/ui/field-tip'
import { toastSuccess } from '@/shared/lib/toast'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { formatDatetime } from '@/shared/lib/utils'
import { goBackOrFallback } from '@/shared/lib/navigation-history'
import { AlertError } from '@/widgets/alerts_components'
import { ErrorState } from '@/widgets/error/error-state'
import { webAlertsService } from '../../services/web-alerts.service'
import { useWebAlertFormStore } from '../../stores/useWebAlertFormStore'
import { ALERT_ALIGNS, ALERT_SCROLL_BEHAVIORS, ALERT_STYLES, ALERT_TRAILINGS } from '../../data/data'
import { webAlertFormSchema, WEB_ALERT_FORM_DEFAULTS, type WebAlertFormValues } from '../../data/schema'
import type { WebAlertApiItem } from '../../model/webalertget.dto'
import type { WebAlertBodyDto } from '../../model/webalertpost.dto'
import { WebAlertStateSwitch } from '../web-alert-state-switch'

/** Iconos de los botones de alineación. */
const ALIGN_ICONS: Record<string, typeof AlignLeft> = { left: AlignLeft, center: AlignCenter, right: AlignRight }

/** Fecha de la API ("2026-11-15 23:59:00") → valor del input datetime-local ("2026-11-15T23:59"). */
const toInputDate = (value: string | null) => (value ? value.replace(' ', 'T').slice(0, 16) : '')

/** Valor del input datetime-local → fecha para la API ("YYYY-MM-DD HH:mm:ss"). Vacío = null (sin límite). */
const toApiDate = (value: string) => (value ? formatDatetime(new Date(value)) : null)

/** Texto vacío → null. */
const textOrNull = (value: string) => value.trim() || null

/** Alerta de la API → valores del formulario (al editar). */
const toFormValues = (item: WebAlertApiItem): WebAlertFormValues => ({
  webalert_title: item.webalert_title ?? '',
  webalert_subtitle: item.webalert_subtitle ?? '',
  webalert_style: item.webalert_style,
  webalert_align: item.webalert_align,
  webalert_show_icon: Boolean(item.webalert_show_icon),
  link_mode: item.webalert_link_url ? 'link' : 'none',
  webalert_link_url: item.webalert_link_url ?? '',
  webalert_trailing: item.webalert_trailing,
  webalert_trailing_label: item.webalert_trailing_label ?? '',
  webalert_dismissible: Boolean(item.webalert_dismissible),
  webalert_scroll_behavior: item.webalert_scroll_behavior,
  webalert_starts_at: toInputDate(item.webalert_starts_at),
  webalert_ends_at: toInputDate(item.webalert_ends_at),
  webalert_state: item.webalert_state,
})

/** Botón de opción (se ve marcado cuando está elegido). Lo usan Color, Alineación y Botón al final. */
function ChoiceButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
        selected ? 'border-primary bg-primary/10 font-medium ring-2 ring-primary/30' : 'hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}

/** Título de cada tarjeta. `tip` = ayuda opcional en un ícono ⓘ (tooltip). */
function CardTitle({ icon: Icon, title, tip }: { icon: typeof Type; title: string; tip?: string }) {
  return (
    <h3 className="flex items-center gap-2 border-b pb-2 text-sm font-semibold">
      <Icon className="size-4 text-muted-foreground" />
      {tip ? <FieldTip label={title} tip={tip} /> : title}
    </h3>
  )
}

export function WebAlertForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router = useRouter()
  const isEdit = mode === 'edit'
  const { isSubmitting, error, fieldErrors, create, update, reset } = useWebAlertFormStore()

  const [isLoading, setIsLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const form = useForm<WebAlertFormValues>({
    resolver: zodResolver(webAlertFormSchema),
    defaultValues: WEB_ALERT_FORM_DEFAULTS,
  })

  // Valores actuales del formulario (para la vista previa y para mostrar/ocultar campos)
  const values = form.watch()

  // Al salir de la pantalla se limpian los errores
  useEffect(() => () => reset(), [])

  // Al editar: se pide la alerta a la API y se rellena el formulario
  useEffect(() => {
    if (!isEdit || !id) return
    let cancelled = false
    webAlertsService.getById(Number(id))
      .then((res) => {
        if (cancelled) return
        if (!res.success || !res.data) { setLoadError(res.message || 'No se encontró la alerta.'); return }
        form.reset(toFormValues(res.data))
      })
      .catch((e: any) => { if (!cancelled) setLoadError(e?.response?.data?.message ?? 'No se pudo cargar la alerta.') })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [isEdit, id, reloadKey])

  const onSubmit = async (v: WebAlertFormValues) => {
    const body: WebAlertBodyDto = {
      webalert_title: textOrNull(v.webalert_title),
      webalert_subtitle: textOrNull(v.webalert_subtitle),
      webalert_style: v.webalert_style,
      webalert_align: v.webalert_align,
      webalert_show_icon: v.webalert_show_icon,
      // Si eligió "No hace nada", no se guarda enlace
      webalert_link_url: v.link_mode === 'link' ? textOrNull(v.webalert_link_url) : null,
      webalert_trailing: v.webalert_trailing,
      // El texto del botón solo se guarda si al final va un botón
      webalert_trailing_label: v.webalert_trailing === 'button' ? textOrNull(v.webalert_trailing_label) : null,
      webalert_dismissible: v.webalert_dismissible,
      webalert_scroll_behavior: v.webalert_scroll_behavior,
      webalert_starts_at: toApiDate(v.webalert_starts_at),
      webalert_ends_at: toApiDate(v.webalert_ends_at),
      webalert_state: v.webalert_state,
    }

    const success = isEdit
      ? await update(Number(id), { ...body, webalert_updated_at: formatDatetime() })
      : await create({ ...body, webalert_created_at: formatDatetime() })

    if (success) {
      toastSuccess(isEdit ? 'Alerta guardada' : 'Alerta creada', v.webalert_title || v.webalert_subtitle)
      goBackOrFallback(router, '/web-alerts')
    } else {
      applyApiErrors(form, useWebAlertFormStore.getState().fieldErrors)
    }
  }

  if (isLoading) return <FormSkeleton cards={3} />
  if (loadError) {
    return (
      <ErrorState
        title="Error al cargar la alerta"
        message={loadError}
        primaryLabel="Reintentar"
        onPrimaryAction={() => { setIsLoading(true); setLoadError(null); setReloadKey((k) => k + 1) }}
      />
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* Columnas según el espacio REAL del formulario (`@container`), no de la pantalla: así
            se aprovecha el ancho también con el menú lateral o la vista previa abiertos.
            Angosto: 1 · mediano: 2 · grande: 3 · muy grande: 4. Orden fijo (izq. → der.):
            Texto · Aspecto · Al tocar · Comportamiento · Cuándo se muestra (este último se
            estira para ocupar lo que sobra de la última fila y no dejar huecos). */}
        <div className="@container">
        <div className="grid grid-cols-1 items-start gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4">
          {/* ── Texto ── */}
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <CardTitle icon={Type} title="Texto" tip="Escriba al menos uno de los dos. El título va en negrita y el subtítulo debajo, más pequeño." />
              <FormField control={form.control} name="webalert_title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl><Input placeholder="Ej: ¡PROMOCIÓN ESPECIAL!" maxLength={120} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="webalert_subtitle" render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtítulo</FormLabel>
                  <FormControl><Input placeholder="Ej: 15% de descuento en cocinas integrales" maxLength={200} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* ── Aspecto ── */}
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <CardTitle icon={Palette} title="Aspecto" />
              <FormField control={form.control} name="webalert_style" render={({ field }) => (
                <FormItem>
                  <FormLabel><FieldTip label="Color" tip="Elija según el tipo de mensaje: Promoción (ofertas), Información (datos útiles), Aviso (algo importante) o Éxito (buenas noticias)." /></FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {ALERT_STYLES.map((s) => (
                      <ChoiceButton key={s.value} selected={field.value === s.value} onClick={() => field.onChange(s.value)}>
                        <span className={cn('size-4 shrink-0 rounded-full', s.barClass)} />
                        {s.label}
                      </ChoiceButton>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="webalert_align" render={({ field }) => (
                <FormItem>
                  <FormLabel><FieldTip label="Alineación" tip="Dónde se ubica todo el contenido de la barra: icono, textos y botón." /></FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {ALERT_ALIGNS.map((a) => {
                      const Icon = ALIGN_ICONS[a.value]
                      return (
                        <ChoiceButton key={a.value} selected={field.value === a.value} onClick={() => field.onChange(a.value)}>
                          <Icon className="size-4" /> {a.label}
                        </ChoiceButton>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="webalert_show_icon" render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-3 rounded-md border p-3">
                  <FormLabel><FieldTip label="Mostrar icono" tip="El dibujo a la izquierda del texto. Cambia según el color elegido." /></FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* ── Al tocar la alerta ── */}
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <CardTitle icon={MousePointerClick} title="Al tocar la alerta" tip="Si elige un enlace, toda la barra se puede tocar y lleva a esa página." />
              <FormField control={form.control} name="link_mode" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="gap-2">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="none" id="link-none" />
                        <Label htmlFor="link-none" className="font-normal">No hace nada</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="link" id="link-yes" />
                        <Label htmlFor="link-yes" className="font-normal">Lleva a un enlace</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )} />
              {values.link_mode === 'link' && (
                <FormField control={form.control} name="webalert_link_url" render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FieldTip
                        label={<>Enlace <span className="text-destructive">*</span></>}
                        tip="Una página del sitio (/services), WhatsApp (https://wa.me/51…) o una web externa. Las externas se abren en otra pestaña."
                      />
                    </FormLabel>
                    <FormControl><Input placeholder="/services" maxLength={255} {...field} /></FormControl>
                    <FormDescription>Ej: /services</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              <FormField control={form.control} name="webalert_trailing" render={({ field }) => (
                <FormItem>
                  <FormLabel><FieldTip label="Botón al final" tip="Lo que aparece a la derecha del texto: nada, una flecha (→) o un botón con el texto que usted escriba." /></FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {ALERT_TRAILINGS.map((t) => (
                      <ChoiceButton key={t.value} selected={field.value === t.value} onClick={() => field.onChange(t.value)}>
                        {t.label}
                      </ChoiceButton>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              {values.webalert_trailing === 'button' && (
                <FormField control={form.control} name="webalert_trailing_label" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto del botón <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Ej: Ver promoción" maxLength={40} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </CardContent>
          </Card>

          {/* ── Comportamiento ── */}
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <CardTitle icon={Settings2} title="Comportamiento" />
              <FormField control={form.control} name="webalert_dismissible" render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-3 rounded-md border p-3">
                  <FormLabel><FieldTip label="¿El cliente la puede cerrar?" tip="Muestra una ✕ a la derecha. Si la cierra, no la vuelve a ver en esa visita (si usted edita la alerta, vuelve a aparecer)." /></FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="webalert_scroll_behavior" render={({ field }) => (
                <FormItem>
                  <FormLabel><FieldTip label="Al bajar por la página" tip="Se oculta: desaparece cuando el cliente baja. Se queda visible: lo acompaña siempre arriba." /></FormLabel>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="gap-2">
                      {ALERT_SCROLL_BEHAVIORS.map((b) => (
                        <div key={b.value} className="flex items-center gap-2">
                          <RadioGroupItem value={b.value} id={`scroll-${b.value}`} />
                          <Label htmlFor={`scroll-${b.value}`} className="font-normal">{b.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* ── Cuándo se muestra ── (se estira: 2 cols → toda la fila · 3 cols → 2 · 4 cols → toda la fila) */}
          <Card className="@2xl:col-span-2 @5xl:col-span-2 @7xl:col-span-4">
            <CardContent className="flex flex-col gap-4 pt-6">
              <CardTitle
                icon={CalendarClock}
                title="Cuándo se muestra"
                tip="Se muestra si está Activada y dentro de estas fechas. Déjelas vacías si no tiene límite."
              />
              {/* Interruptor "Activada" (una fila). Las alertas nuevas se crean activadas; también
                  se puede cambiar desde la tabla de alertas. */}
              <FormField control={form.control} name="webalert_state" render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-3 rounded-md border p-3">
                  <FormLabel>
                    <FieldTip label="Activada" tip="Apagada: la alerta se guarda, pero no aparece en la web hasta que la active (aquí o desde la tabla)." />
                  </FormLabel>
                  <FormControl>
                    <WebAlertStateSwitch checked={field.value === 1} onCheckedChange={(on) => field.onChange(on ? 1 : 0)} />
                  </FormControl>
                </FormItem>
              )} />
              <div className="grid gap-4 @2xl:grid-cols-2">
                <FormField control={form.control} name="webalert_starts_at" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mostrar desde</FormLabel>
                    <FormControl><Input type="datetime-local" {...field} /></FormControl>
                    <FormDescription>Vacío = desde ya.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="webalert_ends_at" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mostrar hasta</FormLabel>
                    <FormControl><Input type="datetime-local" {...field} /></FormControl>
                    <FormDescription>Vacío = sin fecha de fin.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>
        </div>
        </div>

        {error && <AlertError title={isEdit ? 'Error al guardar' : 'Error al crear'} message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => goBackOrFallback(router, '/web-alerts')} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting ? <><Loader2 className="mr-2 size-4 animate-spin" />Guardando...</> : isEdit ? 'Guardar' : 'Crear alerta'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
