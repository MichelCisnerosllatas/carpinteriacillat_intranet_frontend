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
import { Switch } from '@/shared/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { AlertError } from '@/widgets/alerts_components'
import { ProformaTypeSelect } from '@/features/proforma-types'
import { TemplateTextsManager } from '@/features/proforma-template-texts'
import { useProformaTemplateListStore } from '../../stores/useProformaTemplateListStore'
import { useProformaTemplateFormStore } from '../../stores/useProformaTemplateFormStore'
import { FONT_FAMILY_SUGGESTIONS } from '../../data/data'
import { ColorInputField } from './color-input-field'

const schema = z.object({
  proformaTypeId: z.number().nullable(),
  name: z.string().min(1, 'El nombre es requerido.').max(150),
  colorPrimary: z.string().min(1, 'El color primario es requerido.'),
  colorSecondary: z.string().optional(),
  colorText: z.string().min(1, 'El color de texto es requerido.'),
  colorBorder: z.string().min(1, 'El color de borde es requerido.'),
  fontFamily: z.string().min(1, 'La tipografía es requerida.'),
  titleSize: z.number().min(1),
  subtitleSize: z.number().min(1),
  textSize: z.number().min(1),
  tableSize: z.number().min(1),
  headerHeight: z.number().min(1),
  logoWidth: z.number().min(1),
  logoHeight: z.number().min(1),
  showLogo: z.boolean(),
  showDate: z.boolean(),
  showCompanyData: z.boolean(),
  showBranches: z.boolean(),
  showPaymentMethod: z.boolean(),
  showBankAccounts: z.boolean(),
  showSignature: z.boolean(),
  showFooter: z.boolean(),
  footerText: z.string().max(255).optional(),
  status: z.number(),
})

type FormValues = z.infer<typeof schema>

const defaultValues: FormValues = {
  proformaTypeId: null,
  name: '',
  colorPrimary: '#243FC4',
  colorSecondary: '',
  colorText: '#1F2937',
  colorBorder: '#D1D5DB',
  fontFamily: 'Arial',
  titleSize: 28,
  subtitleSize: 12,
  textSize: 11,
  tableSize: 10,
  headerHeight: 110,
  logoWidth: 80,
  logoHeight: 70,
  showLogo: true,
  showDate: true,
  showCompanyData: true,
  showBranches: true,
  showPaymentMethod: true,
  showBankAccounts: true,
  showSignature: true,
  showFooter: true,
  footerText: '',
  status: 1,
}

const SHOW_FIELDS: { name: keyof FormValues; label: string }[] = [
  { name: 'showLogo', label: 'Mostrar logo' },
  { name: 'showDate', label: 'Mostrar fecha' },
  { name: 'showCompanyData', label: 'Mostrar datos de la empresa' },
  { name: 'showBranches', label: 'Mostrar sucursales' },
  { name: 'showPaymentMethod', label: 'Mostrar método de pago' },
  { name: 'showBankAccounts', label: 'Mostrar cuentas bancarias' },
  { name: 'showSignature', label: 'Mostrar firma' },
  { name: 'showFooter', label: 'Mostrar pie de página' },
]

export function ProformaTemplateForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router = useRouter()
  const { currentItem, items, loadById }                             = useProformaTemplateListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset }  = useProformaTemplateFormStore()
  const isEdit = mode === 'edit'
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

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
        proformaTypeId: resolved.proformaTypeId,
        name: resolved.name,
        colorPrimary: resolved.colorPrimary,
        colorSecondary: resolved.colorSecondary ?? '',
        colorText: resolved.colorText,
        colorBorder: resolved.colorBorder,
        fontFamily: resolved.fontFamily,
        titleSize: resolved.titleSize,
        subtitleSize: resolved.subtitleSize,
        textSize: resolved.textSize,
        tableSize: resolved.tableSize,
        headerHeight: resolved.headerHeight,
        logoWidth: resolved.logoWidth,
        logoHeight: resolved.logoHeight,
        showLogo: resolved.showLogo,
        showDate: resolved.showDate,
        showCompanyData: resolved.showCompanyData,
        showBranches: resolved.showBranches,
        showPaymentMethod: resolved.showPaymentMethod,
        showBankAccounts: resolved.showBankAccounts,
        showSignature: resolved.showSignature,
        showFooter: resolved.showFooter,
        footerText: resolved.footerText ?? '',
        status: resolved.stateValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => reset(), [])

  const watched = form.watch()

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear plantilla de proforma?',
      text: values.name, confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear', cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const payload = {
      proforma_type_id: values.proformaTypeId,
      name: values.name,
      color_primary: values.colorPrimary,
      color_secondary: values.colorSecondary || undefined,
      color_text: values.colorText,
      color_border: values.colorBorder,
      font_family: values.fontFamily,
      title_size: values.titleSize,
      subtitle_size: values.subtitleSize,
      text_size: values.textSize,
      table_size: values.tableSize,
      header_height: values.headerHeight,
      logo_width: values.logoWidth,
      logo_height: values.logoHeight,
      show_logo: values.showLogo ? 1 : 0,
      show_date: values.showDate ? 1 : 0,
      show_company_data: values.showCompanyData ? 1 : 0,
      show_branches: values.showBranches ? 1 : 0,
      show_payment_method: values.showPaymentMethod ? 1 : 0,
      show_bank_accounts: values.showBankAccounts ? 1 : 0,
      show_signature: values.showSignature ? 1 : 0,
      show_footer: values.showFooter ? 1 : 0,
      footer_text: values.footerText || undefined,
      status: values.status,
    }

    if (isEdit) {
      const success = await update(resolved!.id, payload)
      if (success) {
        await swalSuccess('Actualizado', values.name)
        router.push('/proforma-templates')
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
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-4">
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
                <FormField control={form.control} name="proformaTypeId" render={({ field }) => (
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

            <Card>
              <CardHeader><CardTitle className="text-sm">Colores</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="colorPrimary" render={({ field }) => (
                  <FormItem>
                    <FormControl><ColorInputField label="Primario" value={field.value} onChange={field.onChange} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="colorSecondary" render={({ field }) => (
                  <FormItem>
                    <FormControl><ColorInputField label="Secundario" value={field.value ?? ''} onChange={field.onChange} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="colorText" render={({ field }) => (
                  <FormItem>
                    <FormControl><ColorInputField label="Texto" value={field.value} onChange={field.onChange} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="colorBorder" render={({ field }) => (
                  <FormItem>
                    <FormControl><ColorInputField label="Borde" value={field.value} onChange={field.onChange} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Tipografía y tamaños</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FormField control={form.control} name="fontFamily" render={({ field }) => (
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
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <FormField control={form.control} name="titleSize" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Título</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="subtitleSize" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Subtítulo</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="textSize" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Texto</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="tableSize" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Tabla</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Dimensiones del encabezado</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField control={form.control} name="headerHeight" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Alto del encabezado</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="logoWidth" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Ancho del logo</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="logoHeight" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Alto del logo</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Secciones visibles</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {SHOW_FIELDS.map(({ name, label }) => (
                  <FormField key={name} control={form.control} name={name} render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between gap-2 rounded-md border p-3">
                      <FormLabel className="text-sm font-normal">{label}</FormLabel>
                      <FormControl>
                        <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )} />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Pie de página</CardTitle></CardHeader>
              <CardContent>
                <FormField control={form.control} name="footerText" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto del pie de página</FormLabel>
                    <FormControl><Textarea placeholder="Ej: Gracias por su preferencia." rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {isEdit && resolved ? (
              <Card>
                <CardHeader><CardTitle className="text-sm">Textos de la plantilla</CardTitle></CardHeader>
                <CardContent>
                  <TemplateTextsManager templateId={resolved.id} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader><CardTitle className="text-sm">Textos de la plantilla</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Guarda la plantilla primero para poder agregar textos.</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex flex-col gap-4 xl:sticky xl:top-4 xl:self-start">
            <Card>
              <CardHeader><CardTitle className="text-sm">Vista previa</CardTitle></CardHeader>
              <CardContent>
                <div
                  className="overflow-hidden rounded-md border"
                  style={{ borderColor: watched.colorBorder || '#D1D5DB', fontFamily: watched.fontFamily || 'Arial' }}
                >
                  <div
                    className="flex items-center justify-between gap-3 px-4"
                    style={{
                      height: `${watched.headerHeight || 110}px`,
                      borderBottom: `1px solid ${watched.colorBorder || '#D1D5DB'}`,
                    }}
                  >
                    {watched.showLogo && (
                      <div
                        className="flex shrink-0 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground"
                        style={{ width: `${watched.logoWidth || 80}px`, height: `${watched.logoHeight || 70}px` }}
                      >
                        LOGO
                      </div>
                    )}
                    <div className="flex flex-1 flex-col items-end gap-1">
                      <span style={{ color: watched.colorPrimary || '#243FC4', fontSize: `${watched.titleSize || 28}px`, fontWeight: 700, lineHeight: 1 }}>
                        PROFORMA
                      </span>
                      <span style={{ color: watched.colorText || '#1F2937', fontSize: `${watched.subtitleSize || 12}px` }}>
                        {watched.name || 'Nombre de plantilla'}
                      </span>
                      {watched.showDate && (
                        <span style={{ color: watched.colorText || '#1F2937', fontSize: `${watched.textSize || 11}px` }}>
                          Fecha: 01/01/2026
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 p-4" style={{ color: watched.colorText || '#1F2937' }}>
                    {watched.showCompanyData && (
                      <p style={{ fontSize: `${watched.textSize || 11}px` }}>Carpintería Cillat S.A.C. — RUC 20123456789</p>
                    )}
                    {watched.showBranches && (
                      <p style={{ fontSize: `${watched.textSize || 11}px` }}>Sucursal: Av. Principal 123</p>
                    )}
                    <div
                      className="mt-1 flex items-center justify-between border-t pt-1"
                      style={{ borderColor: watched.colorSecondary || watched.colorBorder || '#D1D5DB', fontSize: `${watched.tableSize || 10}px` }}
                    >
                      <span>Descripción</span>
                      <span>Total</span>
                    </div>
                    {watched.showPaymentMethod && (
                      <p style={{ fontSize: `${watched.textSize || 11}px` }}>Método de pago: Transferencia bancaria</p>
                    )}
                    {watched.showBankAccounts && (
                      <p style={{ fontSize: `${watched.textSize || 11}px` }}>Cuenta bancaria: BCP 123-456789-0-12</p>
                    )}
                    {watched.showSignature && (
                      <p style={{ fontSize: `${watched.textSize || 11}px` }}>_______________________ Firma</p>
                    )}
                  </div>

                  {watched.showFooter && (
                    <div
                      className="border-t px-4 py-2 text-center"
                      style={{ borderColor: watched.colorBorder || '#D1D5DB', color: watched.colorText || '#1F2937', fontSize: `${watched.textSize || 11}px` }}
                    >
                      {watched.footerText || 'Texto del pie de página'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />
        {error && <AlertError title={isEdit ? 'Error al actualizar' : 'Error al crear'} message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/proforma-templates')} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</> : isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
