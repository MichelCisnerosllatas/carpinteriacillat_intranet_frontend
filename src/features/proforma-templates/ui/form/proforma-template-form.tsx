'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Switch } from '@/shared/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { AlertError } from '@/widgets/alerts_components'
import { ProformaTypeSelect } from '@/features/proforma-types'
import { proformasService } from '@/features/proformas'
import { TemplateTextsManager } from '@/features/proforma-template-texts'
import { useProformaTemplateListStore } from '../../stores/useProformaTemplateListStore'
import { useProformaTemplateFormStore } from '../../stores/useProformaTemplateFormStore'
import { FONT_FAMILY_SUGGESTIONS, HEADER_LAYOUT_OPTIONS, PDF_TEMPLATE_MODULE } from '../../data/data'
import { headerLayoutSchema } from '../../data/schema'
import { ColorInputField } from './color-input-field'
import type { ProformaTemplatePostRequestDto } from '../../model/proformatemplatepost.dto'

const schema = z.object({
  moduleTypeId: z.number().nullable(),
  name: z.string().min(1, 'El nombre es requerido.').max(150),

  headerBgColor: z.string().min(1, 'El color de fondo del header es requerido.'),
  headerTextColor: z.string().min(1, 'El color de texto del header es requerido.'),
  headerTitleSize: z.number().min(1),
  headerHeight: z.number().min(1),
  headerLogoWidth: z.number().min(1),
  headerLogoHeight: z.number().min(1),
  headerLayout: headerLayoutSchema,

  bodyBgColor: z.string().min(1, 'El color de fondo del cuerpo es requerido.'),
  bodyTextColor: z.string().min(1, 'El color de texto del cuerpo es requerido.'),
  bodyBorderColor: z.string().min(1, 'El color de borde es requerido.'),
  bodyFontFamily: z.string().min(1, 'La tipografía es requerida.'),
  bodySubtitleSize: z.number().min(1),
  bodyTextSize: z.number().min(1),
  bodyTableSize: z.number().min(1),

  footerBgColor: z.string().min(1, 'El color de fondo del footer es requerido.'),
  footerTextColor: z.string().min(1, 'El color de texto del footer es requerido.'),
  footerTextSize: z.number().min(1),
  footerText: z.string().max(255).optional(),

  showLogo: z.boolean(),
  showDate: z.boolean(),
  showCompanyData: z.boolean(),
  showBranches: z.boolean(),
  showPaymentMethod: z.boolean(),
  showBankAccounts: z.boolean(),
  showSignature: z.boolean(),
  showFooter: z.boolean(),

  status: z.number(),
})

type FormValues = z.infer<typeof schema>

const defaultValues: FormValues = {
  moduleTypeId: null,
  name: '',

  headerBgColor: '#243FC4',
  headerTextColor: '#FFFFFF',
  headerTitleSize: 28,
  headerHeight: 110,
  headerLogoWidth: 80,
  headerLogoHeight: 70,
  headerLayout: 'logo_derecha',

  bodyBgColor: '#FFFFFF',
  bodyTextColor: '#1F2937',
  bodyBorderColor: '#D1D5DB',
  bodyFontFamily: 'Arial',
  bodySubtitleSize: 12,
  bodyTextSize: 11,
  bodyTableSize: 10,

  footerBgColor: '#243FC4',
  footerTextColor: '#FFFFFF',
  footerTextSize: 9,
  footerText: '',

  showLogo: true,
  showDate: true,
  showCompanyData: true,
  showBranches: true,
  showPaymentMethod: true,
  showBankAccounts: true,
  showSignature: true,
  showFooter: true,

  status: 1,
}

// Los 8 toggles que expone pdf_templates.sections (ver "Esquema del objeto" en pdf-templates.md).
// No hay control por-cuenta/por-sucursal: show_bank_accounts y show_branches son un único
// interruptor que muestra u oculta TODA la lista (el backend aún no soporta seleccionar
// cuentas/sucursales individuales por plantilla).
const SECTION_GROUPS: { key: string; label: string; fields: { name: keyof FormValues; label: string }[] }[] = [
  {
    key: 'header',
    label: 'Header',
    fields: [
      { name: 'showLogo', label: 'Mostrar logo' },
      { name: 'showDate', label: 'Mostrar fecha' },
    ],
  },
  {
    key: 'body',
    label: 'Cuerpo',
    fields: [
      { name: 'showCompanyData', label: 'Mostrar datos de la empresa' },
      { name: 'showBranches', label: 'Mostrar sucursales' },
      { name: 'showPaymentMethod', label: 'Mostrar método de pago' },
      { name: 'showBankAccounts', label: 'Mostrar cuentas bancarias' },
      { name: 'showSignature', label: 'Mostrar firma' },
    ],
  },
  {
    key: 'footer',
    label: 'Footer',
    fields: [
      { name: 'showFooter', label: 'Mostrar pie de página' },
    ],
  },
]

function SectionGroupToggleAll({ form, fields }: { form: UseFormReturn<FormValues>; fields: { name: keyof FormValues; label: string }[] }) {
  const values = useWatch({ control: form.control, name: fields.map((f) => f.name) }) as boolean[]
  const allOn = values.every(Boolean)
  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/40 p-3">
      <span className="text-sm font-medium">Activar/desactivar todo</span>
      <Switch
        checked={allOn}
        onCheckedChange={(checked) => fields.forEach((f) => form.setValue(f.name, checked as never))}
      />
    </div>
  )
}

const toPayload = (values: FormValues): ProformaTemplatePostRequestDto => ({
  module: PDF_TEMPLATE_MODULE,
  module_type_id: values.moduleTypeId,
  name: values.name,
  header_bg_color: values.headerBgColor,
  header_text_color: values.headerTextColor,
  header_title_size: values.headerTitleSize,
  header_height: values.headerHeight,
  header_logo_width: values.headerLogoWidth,
  header_logo_height: values.headerLogoHeight,
  header_layout: values.headerLayout,
  body_bg_color: values.bodyBgColor,
  body_text_color: values.bodyTextColor,
  body_border_color: values.bodyBorderColor,
  body_font_family: values.bodyFontFamily,
  body_subtitle_size: values.bodySubtitleSize,
  body_text_size: values.bodyTextSize,
  body_table_size: values.bodyTableSize,
  footer_bg_color: values.footerBgColor,
  footer_text_color: values.footerTextColor,
  footer_text_size: values.footerTextSize,
  footer_text: values.footerText || undefined,
  sections: {
    show_logo: values.showLogo,
    show_date: values.showDate,
    show_company_data: values.showCompanyData,
    show_branches: values.showBranches,
    show_payment_method: values.showPaymentMethod,
    show_bank_accounts: values.showBankAccounts,
    show_signature: values.showSignature,
    show_footer: values.showFooter,
  },
  status: values.status,
})

// Para POST /proformas/preview-style: mismos campos de estilo, sin module/module_type_id/name/status
// (ese endpoint no identifica ni crea ninguna plantilla, ver proformas.md).
const toStylePayload = (values: FormValues) => {
  const { module, module_type_id, name, status, ...style } = toPayload(values)
  return style
}

export function ProformaTemplateForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router = useRouter()
  const { currentItem, items, loadById } = useProformaTemplateListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useProformaTemplateFormStore()
  const isEdit = mode === 'edit'
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const previewBlobUrlRef = useRef<string | null>(null)
  const previewSeqRef = useRef(0)
  const previewAbortRef = useRef<AbortController | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useEffect(() => {
    if (isEdit && id && (!resolved || String(resolved.id) !== id)) {
      void loadById(Number(id))
    }
  }, [isEdit, id])

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        moduleTypeId: resolved.moduleTypeId,
        name: resolved.name,
        headerBgColor: resolved.headerBgColor,
        headerTextColor: resolved.headerTextColor,
        headerTitleSize: resolved.headerTitleSize,
        headerHeight: resolved.headerHeight,
        headerLogoWidth: resolved.headerLogoWidth,
        headerLogoHeight: resolved.headerLogoHeight,
        headerLayout: resolved.headerLayout,
        bodyBgColor: resolved.bodyBgColor,
        bodyTextColor: resolved.bodyTextColor,
        bodyBorderColor: resolved.bodyBorderColor,
        bodyFontFamily: resolved.bodyFontFamily,
        bodySubtitleSize: resolved.bodySubtitleSize,
        bodyTextSize: resolved.bodyTextSize,
        bodyTableSize: resolved.bodyTableSize,
        footerBgColor: resolved.footerBgColor,
        footerTextColor: resolved.footerTextColor,
        footerTextSize: resolved.footerTextSize,
        footerText: resolved.footerText ?? '',
        showLogo: resolved.sections.showLogo,
        showDate: resolved.sections.showDate,
        showCompanyData: resolved.sections.showCompanyData,
        showBranches: resolved.sections.showBranches,
        showPaymentMethod: resolved.sections.showPaymentMethod,
        showBankAccounts: resolved.sections.showBankAccounts,
        showSignature: resolved.sections.showSignature,
        showFooter: resolved.sections.showFooter,
        status: resolved.stateValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => reset(), [])

  // Vista previa en vivo: POST /proformas/preview-style con los estilos actuales del
  // formulario (sin guardar nada). Se puede usar desde el primer render, con o sin
  // plantilla guardada — no depende de tener un id.
  //
  // Guard de secuencia: si el usuario cambia varios valores rápido (o le da "Refrescar"
  // mientras aún hay un debounce pendiente), pueden quedar dos peticiones en vuelo a la vez.
  // Sin esto, una respuesta más lenta con datos VIEJOS puede llegar después y sobrescribir
  // el preview que ya mostraba los datos correctos — se descarta cualquier respuesta que no
  // sea la de la última petición emitida.
  const refreshPreview = async (values: FormValues) => {
    // Cancela cualquier preview anterior todavía en curso — nunca debe haber más de una
    // request en vuelo a la vez (el backend local procesa una por una y se apilan).
    previewAbortRef.current?.abort()
    const controller = new AbortController()
    previewAbortRef.current = controller

    const seq = ++previewSeqRef.current
    setIsLoadingPreview(true)
    try {
      const blob = await proformasService.getPreviewStylePdf(toStylePayload(values), controller.signal)
      if (seq !== previewSeqRef.current) return
      const nextUrl = URL.createObjectURL(blob)
      if (previewBlobUrlRef.current) URL.revokeObjectURL(previewBlobUrlRef.current)
      previewBlobUrlRef.current = nextUrl
      setPreviewUrl(nextUrl)
    } catch (err: any) {
      if (err?.code === 'ERR_CANCELED') return // cancelado a propósito por un cambio más reciente
      // TEMP: log para diagnosticar por qué no carga la vista previa.
      console.error('[preview-style] error al generar la vista previa:', err)
    } finally {
      if (seq === previewSeqRef.current) setIsLoadingPreview(false)
    }
  }

  useEffect(() => {
    if (!isEdit) void refreshPreview(form.getValues())
  }, [])

  useEffect(() => {
    if (isEdit && resolved) void refreshPreview(form.getValues())
  }, [isEdit, resolved?.id])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const subscription = form.watch((values) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => void refreshPreview(values as FormValues), 600)
    })
    return () => {
      if (timer) clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => () => {
    previewAbortRef.current?.abort()
    if (previewBlobUrlRef.current) URL.revokeObjectURL(previewBlobUrlRef.current)
  }, [])

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear plantilla de proforma?',
      text: values.name, confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear', cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const payload = toPayload(values)

    if (isEdit) {
      const success = await update(resolved!.id, payload)
      if (success) {
        await swalSuccess('Actualizado', values.name)
      } else {
        applyApiErrors(form, fieldErrors)
      }
    } else {
      const created = await create(payload)
      if (created) {
        await swalSuccess('Creado', values.name)
        router.push(`/proforma-templates/edit/${created.id}`)
      } else {
        applyApiErrors(form, fieldErrors)
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <Tabs defaultValue="general" className="flex flex-col gap-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="estilos">Estilos</TabsTrigger>
              <TabsTrigger value="secciones">Secciones</TabsTrigger>
              <TabsTrigger value="textos">Textos {resolved ? `(${resolved.textsCount})` : ''}</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader><CardTitle className="text-sm">Información general</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="Ej: Plantilla estándar" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="moduleTypeId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de proforma</FormLabel>
                      <FormControl>
                        <ProformaTypeSelect value={field.value} onValueChange={field.onChange} showAll />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select key={`status-${field.value}`} value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
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
            </TabsContent>

            <TabsContent value="estilos">
              <Card className="py-2">
                <CardContent className="px-4">
                  <Accordion type="multiple" defaultValue={['header', 'body', 'footer']} className="w-full">
                    <AccordionItem value="header">
                      <AccordionTrigger className="text-sm font-medium">Header</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-4 pt-1">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormField control={form.control} name="headerBgColor" render={({ field }) => (
                              <FormItem>
                                <FormControl><ColorInputField label="Color de fondo" value={field.value} onChange={field.onChange} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="headerTextColor" render={({ field }) => (
                              <FormItem>
                                <FormControl><ColorInputField label="Color de texto" value={field.value} onChange={field.onChange} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          <FormField control={form.control} name="headerLayout" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Distribución del logo</FormLabel>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {HEADER_LAYOUT_OPTIONS.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <FormField control={form.control} name="headerTitleSize" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Tamaño del título (px)</FormLabel>
                                <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="headerHeight" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Alto del header (px)</FormLabel>
                                <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="headerLogoWidth" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Ancho del logo (px)</FormLabel>
                                <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="headerLogoHeight" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Alto del logo (px)</FormLabel>
                                <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="body">
                      <AccordionTrigger className="text-sm font-medium">Cuerpo</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-4 pt-1">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <FormField control={form.control} name="bodyBgColor" render={({ field }) => (
                              <FormItem>
                                <FormControl><ColorInputField label="Color de fondo" value={field.value} onChange={field.onChange} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="bodyTextColor" render={({ field }) => (
                              <FormItem>
                                <FormControl><ColorInputField label="Color de texto" value={field.value} onChange={field.onChange} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="bodyBorderColor" render={({ field }) => (
                              <FormItem>
                                <FormControl><ColorInputField label="Color de borde" value={field.value} onChange={field.onChange} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          <FormField control={form.control} name="bodyFontFamily" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Familia tipográfica</FormLabel>
                              <FormControl>
                                <div>
                                  <Input list="font-family-suggestions" placeholder="Ej: Arial" {...field} />
                                  <datalist id="font-family-suggestions">
                                    {FONT_FAMILY_SUGGESTIONS.map((f) => <option key={f} value={f} />)}
                                  </datalist>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <div className="grid grid-cols-3 gap-4">
                            <FormField control={form.control} name="bodySubtitleSize" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Tamaño del subtítulo (px)</FormLabel>
                                <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="bodyTextSize" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Tamaño del texto (px)</FormLabel>
                                <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="bodyTableSize" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Tamaño de la tabla (px)</FormLabel>
                                <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="footer" className="border-b-0">
                      <AccordionTrigger className="text-sm font-medium">Footer</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-4 pt-1">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <FormField control={form.control} name="footerBgColor" render={({ field }) => (
                              <FormItem>
                                <FormControl><ColorInputField label="Color de fondo" value={field.value} onChange={field.onChange} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="footerTextColor" render={({ field }) => (
                              <FormItem>
                                <FormControl><ColorInputField label="Color de texto" value={field.value} onChange={field.onChange} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="footerTextSize" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Tamaño del texto (px)</FormLabel>
                                <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          <FormField control={form.control} name="footerText" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Texto del pie de página</FormLabel>
                              <FormControl><Textarea placeholder="Ej: Gracias por su preferencia." rows={3} {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="secciones">
              <Card className="py-2">
                <CardContent className="px-4">
                  <Accordion type="multiple" defaultValue={['header', 'body', 'footer']} className="w-full">
                    {SECTION_GROUPS.map((group, i) => (
                      <AccordionItem key={group.key} value={group.key} className={i === SECTION_GROUPS.length - 1 ? 'border-b-0' : undefined}>
                        <AccordionTrigger className="text-sm font-medium">{group.label}</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col gap-3 pt-1">
                            <SectionGroupToggleAll form={form} fields={group.fields} />
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {group.fields.map(({ name, label }) => (
                                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between gap-2 rounded-md border p-3">
                                    <FormLabel className="text-sm font-normal">{label}</FormLabel>
                                    <FormControl>
                                      <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
                                    </FormControl>
                                  </FormItem>
                                )} />
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="textos">
              <Card>
                <CardHeader><CardTitle className="text-sm">Textos de la plantilla</CardTitle></CardHeader>
                <CardContent>
                  {isEdit && resolved ? (
                    <TemplateTextsManager templateId={resolved.id} />
                  ) : (
                    <p className="text-sm text-muted-foreground">Guarda la plantilla primero para poder agregar textos.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col gap-4 xl:sticky xl:top-4 xl:self-start">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Vista previa</CardTitle>
                <Button
                  type="button" variant="ghost" size="sm"
                  disabled={isLoadingPreview}
                  onClick={() => void refreshPreview(form.getValues())}
                >
                  <RefreshCw className={isLoadingPreview ? 'size-3.5 animate-spin' : 'size-3.5'} />
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingPreview && !previewUrl ? (
                  <div className="flex h-[500px] items-center justify-center">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : previewUrl ? (
                  <iframe src={previewUrl} className="h-[500px] w-full rounded-md border" title="Vista previa de la plantilla" />
                ) : (
                  <p className="text-sm text-muted-foreground">No se pudo cargar la vista previa.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />
        {error && <AlertError title={isEdit ? 'Error al actualizar' : 'Error al crear'} message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/proforma-templates')} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-36">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</> : isEdit ? 'Guardar estilos' : 'Crear plantilla'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
