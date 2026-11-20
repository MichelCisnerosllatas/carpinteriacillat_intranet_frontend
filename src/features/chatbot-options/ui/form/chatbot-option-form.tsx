'use client'

// Crear / editar una "Opción de inicio" del chatbot (un ListTile de la primera pantalla).

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { ChevronRight, Loader2, MousePointerClick, Type } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Card, CardContent } from '@/shared/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { FormSkeleton } from '@/shared/ui/form-skeleton'
import { IconPicker } from '@/shared/ui/icon-picker/icon-picker'
import { FaIcon } from '@/shared/ui/icon-picker/fa-icon'
import { toastSuccess } from '@/shared/lib/toast'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { goBackOrFallback } from '@/shared/lib/navigation-history'
import { AlertError } from '@/widgets/alerts_components'
import { ErrorState } from '@/widgets/error/error-state'
import { chatbotOptionsService } from '../../services/chatbot-options.service'
import { useChatbotOptionFormStore } from '../../stores/useChatbotOptionFormStore'
import { CHATBOT_OPTION_ACTIONS } from '../../data/data'
import { chatbotOptionFormSchema, CHATBOT_OPTION_FORM_DEFAULTS, type ChatbotOptionFormValues } from '../../data/schema'
import type { ChatbotOptionApiItem } from '../../model/chatbotoptionget.dto'
import type { ChatbotOptionBodyDto } from '../../model/chatbotoptionpost.dto'
import { ChatbotOptionStateSwitch } from '../chatbot-option-state-switch'

const toFormValues = (item: ChatbotOptionApiItem): ChatbotOptionFormValues => ({
  option_key: item.option_key,
  title: item.title,
  subtitle: item.subtitle ?? '',
  icon: item.icon,
  action: item.action,
  value: item.value ?? '',
  state: Boolean(item.state),
})

function SectionTitle({ icon: Icon, title }: { icon: typeof Type; title: string }) {
  return (
    <h3 className="flex items-center gap-2 border-b pb-2 text-sm font-semibold">
      <Icon className="size-4 text-muted-foreground" />{title}
    </h3>
  )
}

export function ChatbotOptionForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router = useRouter()
  const isEdit = mode === 'edit'
  const { isSubmitting, error, fieldErrors, create, update, reset } = useChatbotOptionFormStore()

  const [isLoading, setIsLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const form = useForm<ChatbotOptionFormValues>({
    resolver: zodResolver(chatbotOptionFormSchema),
    defaultValues: CHATBOT_OPTION_FORM_DEFAULTS,
  })
  const values = form.watch()

  useEffect(() => () => reset(), [])

  useEffect(() => {
    if (!isEdit || !id) return
    let cancelled = false
    chatbotOptionsService.getById(Number(id))
      .then((res) => {
        if (cancelled) return
        if (!res.success || !res.data) { setLoadError(res.message || 'No se encontró la opción.'); return }
        form.reset(toFormValues(res.data))
      })
      .catch((e: any) => { if (!cancelled) setLoadError(e?.response?.data?.message ?? 'No se pudo cargar la opción.') })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [isEdit, id, reloadKey])

  const onSubmit = async (v: ChatbotOptionFormValues) => {
    const body: ChatbotOptionBodyDto = {
      option_key: v.option_key.trim(),
      title: v.title.trim(),
      subtitle: v.subtitle.trim() || null,
      icon: v.icon,
      action: v.action,
      // "Abrir chat" no usa valor
      value: v.action === 'chat' ? null : v.value.trim() || null,
      state: v.state,
    }
    const ok = isEdit && id ? await update(Number(id), body) : await create(body)
    if (ok) {
      toastSuccess(isEdit ? 'Opción actualizada' : 'Opción creada', body.title)
      goBackOrFallback(router, '/chatbot/options')
    } else {
      applyApiErrors(form, useChatbotOptionFormStore.getState().fieldErrors)
    }
  }

  if (isLoading) return <FormSkeleton />
  if (loadError) {
    return (
      <ErrorState
        title="No se pudo cargar la opción"
        message={loadError}
        primaryLabel="Reintentar"
        onPrimaryAction={() => { setLoadError(null); setIsLoading(true); setReloadKey((k) => k + 1) }}
      />
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <SectionTitle icon={Type} title="Contenido" />
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl><Input maxLength={80} placeholder="Hablar con el asistente" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="subtitle" render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtítulo (opcional)</FormLabel>
                  <FormControl><Input maxLength={150} placeholder="Resuelve tus dudas al instante" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="icon" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícono</FormLabel>
                  <FormControl><IconPicker value={field.value} onValueChange={(v) => field.onChange(v ?? '')} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="option_key" render={({ field }) => (
                <FormItem>
                  <FormLabel>Clave</FormLabel>
                  <FormControl><Input maxLength={50} placeholder="cotizacion" className="font-mono" {...field} /></FormControl>
                  <FormDescription className="text-xs">
                    Identificador interno (no lo ve el cliente). El asistente lo usa para saber de qué trata la conversación. Ej.: assistant, quote.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <CardContent className="flex flex-col gap-4 pt-6">
                <SectionTitle icon={MousePointerClick} title="Al tocar la opción" />
                <FormField control={form.control} name="action" render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {CHATBOT_OPTION_ACTIONS.map((a) => {
                        const Icon = a.icon
                        return (
                          <button
                            key={a.value}
                            type="button"
                            onClick={() => field.onChange(a.value)}
                            aria-pressed={field.value === a.value}
                            className={cn(
                              'flex flex-col items-center gap-1 rounded-md border px-3 py-2 text-sm transition-colors',
                              field.value === a.value ? 'border-primary bg-primary/10 font-medium ring-2 ring-primary/30' : 'hover:bg-muted',
                            )}
                          >
                            <Icon className="size-4" />{a.label}
                          </button>
                        )
                      })}
                    </div>
                    <FormDescription className="text-xs">
                      {CHATBOT_OPTION_ACTIONS.find((a) => a.value === field.value)?.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                {values.action !== 'chat' && (
                  <FormField control={form.control} name="value" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{values.action === 'whatsapp' ? 'Número de WhatsApp' : 'Enlace'}</FormLabel>
                      <FormControl>
                        <Input
                          maxLength={255}
                          placeholder={values.action === 'whatsapp' ? '51987654321' : '/contacto o https://...'}
                          {...field}
                        />
                      </FormControl>
                      {values.action === 'whatsapp' && <FormDescription className="text-xs">Con código de país, sin espacios ni «+».</FormDescription>}
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <FormLabel className="font-normal">Mostrar en el chatbot</FormLabel>
                    <FormControl><ChatbotOptionStateSwitch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-3 pt-6">
                <h3 className="border-b pb-2 text-sm font-semibold">Así se verá en la pantalla inicial</h3>
                <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FaIcon value={values.icon} className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{values.title || 'Título'}</p>
                    {values.subtitle && <p className="truncate text-xs text-muted-foreground">{values.subtitle}</p>}
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {error && <AlertError title="Error al guardar" message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button type="button" variant="outline" onClick={() => goBackOrFallback(router, '/chatbot/options')} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : isEdit ? 'Guardar cambios' : 'Crear opción'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
