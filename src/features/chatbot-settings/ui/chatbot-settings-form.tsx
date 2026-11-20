'use client'

// Configuración del chatbot del sitio público (DISEÑO + COMPORTAMIENTO, singleton
// `chatbot_setting`). Un solo formulario repartido en 3 pestañas y un solo botón "Guardar":
//   - Visibilidad y posición · Apariencia · Comportamiento
// A la derecha, una mini vista de cómo se vería (además del panel de vista previa del sitio,
// que recibe cada cambio por `useLiveSitePreview` con entity 'chatbot').
//
// La DATA que generan los clientes (conversaciones/visitantes) NO se administra aquí: ver
// /chatbot/conversations y /chatbot/visitors.

import { useEffect } from 'react'
import { useForm, type Control, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft, Bot, Eye, Loader2, MessageSquareText, Mic, MonitorSmartphone, Palette, Settings2,
  Smartphone, Timer, UserRoundCheck, X,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Switch } from '@/shared/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { VisibilityToggle } from '@/shared/ui/visibility-toggle'
import { IconPicker } from '@/shared/ui/icon-picker/icon-picker'
import { FaIcon } from '@/shared/ui/icon-picker/fa-icon'
import { parseFaIconValue } from '@/shared/ui/icon-picker/fontawesome-icons'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { FLOATING_ANIMATION_OPTIONS, isFloatingAnimation } from '@/shared/config/floating-animations'
import { cn } from '@/shared/lib/utils'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { AlertError } from '@/widgets/alerts_components'
import { ErrorState } from '@/widgets/error/error-state'
import { useLiveSitePreview } from '@/shared/hooks/use-live-site-preview'
import type { PreviewPayload } from '@/widgets/landing-preview/landing-preview.types'
import { useChatbotSettingStore } from '../stores/useChatbotSettingStore'
import { chatbotSettingFormSchema, CHATBOT_SETTING_FORM_DEFAULTS, type ChatbotSettingFormValues } from '../data/schema'
import type { ChatbotSettingApiItem } from '../model/chatbotsetting.dto'

const toFormValues = (s: ChatbotSettingApiItem): ChatbotSettingFormValues => ({
  chatbot_state: Boolean(s.chatbot_state),
  show_on_mobile: Boolean(s.show_on_mobile),
  position: s.position === 'bottom-left' ? 'bottom-left' : 'bottom-right',
  offset_x: s.offset_x ?? 24,
  offset_y: s.offset_y ?? 24,
  primary_color: s.primary_color || '#2563eb',
  header_title: s.header_title ?? '',
  header_subtitle: s.header_subtitle ?? '',
  launcher_icon: s.launcher_icon ?? 'fa-solid fa-comments',
  launcher_animation: isFloatingAnimation(s.launcher_animation) ? s.launcher_animation : 'pulse',
  welcome_message: s.welcome_message ?? '',
  input_placeholder: s.input_placeholder ?? '',
  allow_voice: Boolean(s.allow_voice),
  auto_open_seconds: s.auto_open_seconds ?? null,
  require_contact_data: Boolean(s.require_contact_data),
})

/** Valores del form → body del PATCH (texto vacío → null donde la columna lo permite). */
const toBody = (v: ChatbotSettingFormValues) => ({
  ...v,
  header_subtitle: v.header_subtitle.trim() || null,
})

type BoolField = 'show_on_mobile' | 'allow_voice' | 'require_contact_data'

/** Fila con interruptor + texto explicativo. */
function SwitchRow({
  control, name, label, description, icon: Icon,
}: {
  control: Control<ChatbotSettingFormValues>
  name: BoolField
  label: string
  description: string
  icon: typeof Bot
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
          <Switch checked={field.value} onCheckedChange={field.onChange} />
        </FormControl>
      </FormItem>
    )} />
  )
}

/** Input de texto simple enlazado al form. */
function TextField({
  control, name, label, placeholder, description, maxLength,
}: {
  control: Control<ChatbotSettingFormValues>
  name: FieldPath<ChatbotSettingFormValues>
  label: string
  placeholder?: string
  description?: string
  maxLength?: number
}) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel className="font-normal">{label}</FormLabel>
        <FormControl>
          <Input placeholder={placeholder} maxLength={maxLength} value={(field.value as string) ?? ''} onChange={field.onChange} onBlur={field.onBlur} />
        </FormControl>
        {description && <FormDescription className="text-xs">{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )} />
  )
}

/** Mini maqueta del chatbot (pantalla inicial + botón flotante) con los valores actuales. */
function ChatbotMiniPreview({ values }: { values: ChatbotSettingFormValues }) {
  const isLeft = values.position === 'bottom-left'
  return (
    <div className="relative h-[360px] overflow-hidden rounded-lg border bg-muted/40">
      {!values.chatbot_state && (
        <div className="absolute inset-x-0 top-0 z-10 bg-amber-100 px-2 py-1 text-center text-[11px] text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Oculto en la web — solo se ve aquí
        </div>
      )}
      <div className={cn('absolute bottom-16 w-[230px] overflow-hidden rounded-xl border bg-background shadow-lg', isLeft ? 'left-3' : 'right-3')}>
        <div className="flex items-center gap-2 px-3 py-2 text-white" style={{ backgroundColor: values.primary_color }}>
          <ArrowLeft className="size-3.5 opacity-40" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{values.header_title || 'Título'}</p>
            {values.header_subtitle && <p className="truncate text-[10px] opacity-80">{values.header_subtitle}</p>}
          </div>
          <X className="size-3.5" />
        </div>
        <div className="flex flex-col gap-2 p-3">
          <p className="rounded-lg bg-muted px-2 py-1.5 text-[11px]">{values.welcome_message || '...'}</p>
          {['Opción 1', 'Opción 2'].map((o) => (
            <div key={o} className="flex items-center gap-2 rounded-md border px-2 py-1.5">
              <span className="size-5 rounded-full" style={{ backgroundColor: `${values.primary_color}33` }} />
              <span className="flex-1 text-[11px]">{o}</span>
              <span className="text-[11px] text-muted-foreground">›</span>
            </div>
          ))}
          <div className="mt-1 flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] text-muted-foreground">
            <span className="flex-1 truncate">{values.input_placeholder}</span>
            {values.allow_voice && <Mic className="size-3" />}
          </div>
        </div>
      </div>
      <div
        className="absolute flex size-11 items-center justify-center rounded-full text-white shadow-lg"
        style={{
          backgroundColor: values.primary_color,
          bottom: Math.min(values.offset_y, 40) / 2 + 4,
          [isLeft ? 'left' : 'right']: Math.min(values.offset_x, 40) / 2 + 4,
        }}
        title={values.launcher_icon}
      >
        {parseFaIconValue(values.launcher_icon)
          ? <FaIcon value={values.launcher_icon} className="size-5" />
          : <MessageSquareText className="size-5" />}
      </div>
    </div>
  )
}

export function ChatbotSettingsForm() {
  const { setting, hasLoaded, isLoading, isError, isSubmitting, error, fieldErrors, get, update } = useChatbotSettingStore()

  const form = useForm<ChatbotSettingFormValues>({
    resolver: zodResolver(chatbotSettingFormSchema),
    defaultValues: CHATBOT_SETTING_FORM_DEFAULTS,
  })

  useEffect(() => { if (!hasLoaded) void get() }, [])
  useEffect(() => { if (setting) form.reset(toFormValues(setting)) }, [setting])

  const values = form.watch()

  // Vista previa en vivo: los nombres de `fields` son los mismos que `site.chatbot.settings`.
  const toPreviewPayload = (v: ChatbotSettingFormValues): PreviewPayload => ({
    entity: 'chatbot',
    id: null,
    fields: { ...toBody(v) },
  })
  useLiveSitePreview(form, toPreviewPayload, !!setting)

  const onSubmit = async (v: ChatbotSettingFormValues) => {
    const confirmed = await swalConfirm({
      title: '¿Guardar configuración del chatbot?',
      text: v.chatbot_state ? 'Se aplicará al chatbot de todo el sitio web.' : 'El chatbot se ocultará en todo el sitio web.',
      confirmText: 'Sí, guardar',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const ok = await update(toBody(v))
    if (ok) await swalSuccess('Configuración actualizada', 'Los cambios se aplicaron al chatbot del sitio web.')
    else applyApiErrors(form, useChatbotSettingStore.getState().fieldErrors)
  }

  if (isLoading && !setting) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>

  if (isError && !setting) {
    return (
      <ErrorState
        title="No se pudo cargar la configuración"
        message={error ?? 'Ocurrió un problema al cargar la configuración del chatbot.'}
        primaryLabel="Reintentar"
        isPrimaryLoading={isLoading}
        onPrimaryAction={() => { void get() }}
      />
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <Tabs defaultValue="visibility">
              <TabsList className="flex-wrap">
                <TabsTrigger value="visibility" className="gap-1.5"><Eye className="size-4" />Visibilidad y posición</TabsTrigger>
                <TabsTrigger value="appearance" className="gap-1.5"><Palette className="size-4" />Apariencia</TabsTrigger>
                <TabsTrigger value="behavior" className="gap-1.5"><Settings2 className="size-4" />Comportamiento</TabsTrigger>
              </TabsList>

              {/* ── Visibilidad y posición ── */}
              <TabsContent value="visibility" className="flex flex-col gap-4 pt-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Chatbot en el sitio web</CardTitle></CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <FormField control={form.control} name="chatbot_state" render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-3 rounded-lg border border-dashed p-3">
                        <div className="flex items-start gap-2.5">
                          <Bot className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <div>
                            <FormLabel className="font-normal">Mostrar chatbot en el sitio web</FormLabel>
                            <p className="text-xs text-muted-foreground">Apagarlo lo oculta en TODAS las páginas, sin borrar conversaciones ni opciones.</p>
                          </div>
                        </div>
                        <FormControl>
                          <VisibilityToggle checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )} />
                    <SwitchRow
                      control={form.control} name="show_on_mobile" icon={Smartphone}
                      label="Mostrar en celulares" description="Apagado = solo aparece en computadoras y tablets grandes."
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">Posición del botón flotante</CardTitle></CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <FormField control={form.control} name="position" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-normal">Esquina</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {([['bottom-left', 'Abajo a la izquierda'], ['bottom-right', 'Abajo a la derecha']] as const).map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => field.onChange(value)}
                              aria-pressed={field.value === value}
                              className={cn(
                                'rounded-md border px-3 py-2 text-sm transition-colors',
                                field.value === value ? 'border-primary bg-primary/10 font-medium ring-2 ring-primary/30' : 'hover:bg-muted',
                              )}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        <FormDescription className="text-xs">
                          Si cae en la misma esquina que el botón de WhatsApp, la web los apila (chat arriba, WhatsApp abajo) usando esta separación.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {(['offset_x', 'offset_y'] as const).map((name) => (
                        <FormField key={name} control={form.control} name={name} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal">{name === 'offset_x' ? 'Separación del borde lateral (px)' : 'Separación del borde inferior (px)'}</FormLabel>
                            <FormControl>
                              <Input
                                type="number" min={0} max={200}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Apariencia ── */}
              <TabsContent value="appearance" className="flex flex-col gap-4 pt-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Colores e ícono</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField control={form.control} name="primary_color" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-normal">Color principal</FormLabel>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            aria-label="Elegir color"
                            value={/^#[0-9a-fA-F]{6}$/.test(field.value) ? field.value : '#2563eb'}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="h-9 w-12 cursor-pointer rounded border bg-transparent p-0.5"
                          />
                          <FormControl>
                            <Input value={field.value} onChange={field.onChange} maxLength={7} className="font-mono" />
                          </FormControl>
                        </div>
                        <FormDescription className="text-xs">Botón flotante, header del chat y burbujas del cliente.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="launcher_icon" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-normal">Ícono del botón flotante</FormLabel>
                        <FormControl>
                          <IconPicker value={field.value} onValueChange={(v) => field.onChange(v ?? '')} />
                        </FormControl>
                        <FormDescription className="text-xs">Se ve en el círculo flotante que abre el chat.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="launcher_animation" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-normal">Animación del botón flotante</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {FLOATING_ANIMATION_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          Llama la atención del visitante. Se detiene al pasar el mouse y mientras el chat está abierto. Mírala en la vista previa del sitio.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Header del chat</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextField control={form.control} name="header_title" label="Título" maxLength={80} placeholder="Asistente virtual" />
                    <TextField control={form.control} name="header_subtitle" label="Subtítulo (opcional)" maxLength={120} placeholder="Te respondemos al instante" />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Comportamiento ── */}
              <TabsContent value="behavior" className="flex flex-col gap-4 pt-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Textos del chat</CardTitle></CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <FormField control={form.control} name="welcome_message" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-normal">Mensaje de bienvenida</FormLabel>
                        <FormControl>
                          <Textarea rows={3} maxLength={500} value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormDescription className="text-xs">Aparece en la pantalla inicial y como primer mensaje de cada conversación.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <TextField control={form.control} name="input_placeholder" label="Texto del campo de escritura" maxLength={120} placeholder="Escribe tu mensaje..." />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">Comportamiento</CardTitle></CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <SwitchRow
                      control={form.control} name="allow_voice" icon={Mic}
                      label="Permitir mensajes por voz"
                      description="Muestra un micrófono: el navegador convierte la voz a texto (Chrome/Edge). En navegadores sin soporte no aparece."
                    />
                    <SwitchRow
                      control={form.control} name="require_contact_data" icon={UserRoundCheck}
                      label="Pedir nombre y teléfono antes de chatear"
                      description="Apagado = el cliente chatea de forma anónima. Encendido = antes del primer mensaje se le pide nombre y teléfono (se guardan en Visitantes)."
                    />
                    <FormField control={form.control} name="auto_open_seconds" render={({ field }) => (
                      <FormItem className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-2.5">
                          <Timer className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <div>
                            <FormLabel className="font-normal">Abrir solo después de (segundos)</FormLabel>
                            <p className="text-xs text-muted-foreground">Vacío = nunca se abre solo. Solo la primera visita de cada cliente.</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <FormControl>
                            <Input
                              type="number" min={1} max={600} placeholder="Nunca" className="w-full sm:w-28"
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <Card className="h-fit xl:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><MonitorSmartphone className="size-4" />Así se vería</CardTitle>
            </CardHeader>
            <CardContent>
              <ChatbotMiniPreview values={values} />
              <p className="mt-2 text-xs text-muted-foreground">
                Maqueta aproximada. Las opciones reales se editan en «Opciones de inicio».
              </p>
            </CardContent>
          </Card>
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
