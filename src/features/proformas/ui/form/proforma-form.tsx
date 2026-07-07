'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { swalWarning } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { AlertError } from '@/widgets/alerts_components'
import { ProformaTypeSelect, useProformaTypeSelectStore } from '@/features/proforma-types'
import {
  ProformaTemplateSelect,
  useProformaTemplateSelectStore,
} from '@/features/proforma-templates'
import { ClientSelect, useClientSelectStore } from '@/features/clients'
import { CompanySignatureSelect, useCompanySignatureSelectStore } from '@/features/company-signatures'
import { ProformaDetailLines } from './proforma-detail-lines'
import { useProformaListStore } from '../../stores/useProformaListStore'
import { useProformaFormStore } from '../../stores/useProformaFormStore'
import { PROFORMA_CURRENCIES } from '../../data/data'
import type { ProformaPostRequestDto } from '../../model/proformapost.dto'

const schema = z
  .object({
    client_id: z.number().nullable(),
    proforma_type_id: z.number().nullable(),
    template_id: z.number().nullable(),
    signature_id: z.number().nullable(),
    series: z.string().max(20, 'Máximo 20 caracteres.').optional(),
    issue_date: z.string().min(1, 'La fecha de emisión es requerida.'),
    due_date: z.string().optional(),
    place_of_issue: z.string().optional(),
    client_attention: z.string().optional(),
    delivery_time: z.string().optional(),
    currency: z.string().optional(),
    observation: z.string().optional(),
  })
  // superRefine en vez de .refine() por campo: agrega los issues sin cambiar el tipo
  // inferido de cada campo (sigue siendo `number | null`, como espera el resto del form).
  .superRefine((data, ctx) => {
    const requiredFields: { key: keyof typeof data; label: string }[] = [
      { key: 'client_id', label: 'El cliente' },
      { key: 'proforma_type_id', label: 'El tipo de proforma' },
      { key: 'template_id', label: 'La plantilla' },
      { key: 'signature_id', label: 'La firma' },
    ]
    for (const { key, label } of requiredFields) {
      if (data[key] == null) {
        ctx.addIssue({ code: 'custom', path: [key], message: `${label} es requerido.` })
      }
    }
  })

export type ProformaFormValues = z.infer<typeof schema>

const buildHeaderPayload = (values: ProformaFormValues, isEdit: boolean): ProformaPostRequestDto => {
  const payload: ProformaPostRequestDto = {
    client_id: values.client_id ?? undefined,
    proforma_type_id: values.proforma_type_id ?? undefined,
    template_id: values.template_id ?? undefined,
    signature_id: values.signature_id ?? undefined,
    series: values.series || undefined,
    issue_date: values.issue_date,
    due_date: values.due_date || undefined,
    place_of_issue: values.place_of_issue || undefined,
    client_attention: values.client_attention || undefined,
    delivery_time: values.delivery_time || undefined,
    currency: values.currency || undefined,
    observation: values.observation || undefined,
  }
  // En creación, series no debería enviarse si el usuario no la editó — el servidor la genera.
  if (!isEdit && !values.series) delete payload.series
  return payload
}

export function ProformaForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router = useRouter()
  const { currentItem, items, loadOne } = useProformaListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useProformaFormStore()
  const isEdit = mode === 'edit'
  const resolved =
    currentItem && String(currentItem.id) === id
      ? currentItem
      : id
        ? (items.find((i) => String(i.id) === id) ?? null)
        : null

  // En edición, la proforma ya existe desde el montaje. En creación, nace en null y se
  // completa sola en cuanto la cabecera queda válida (ver efecto de auto-creación abajo) —
  // recién ahí se habilitan las líneas de detalle, que ya viven en su propio CRUD
  // (/proforma-details) y no se envían anidadas en este formulario.
  const [proformaId, setProformaId] = useState<number | null>(isEdit && id ? Number(id) : null)
  const hasAutoCreated = useRef(false)

  const form = useForm<ProformaFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      client_id: null,
      proforma_type_id: null,
      template_id: null,
      signature_id: null,
      series: '',
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: '',
      place_of_issue: 'Iquitos',
      client_attention: '',
      delivery_time: '15 días hábiles',
      currency: 'PEN',
      observation: '',
    },
  })

  useEffect(() => {
    if (isEdit && id && !resolved) {
      void loadOne(Number(id))
    }
  }, [isEdit, id, resolved])

  // Al crear, se autoselecciona el primer ítem de cada select para agilizar el llenado —
  // en edición nunca se toca (el efecto de `form.reset` con los datos reales corre después
  // y siempre gana). El guard `getValues(...) == null` evita pisar una elección manual del
  // usuario si vuelve a dispararse el efecto.
  const { options: typeOptions, load: loadTypes } = useProformaTypeSelectStore()
  const { options: templateOptions, load: loadTemplates } = useProformaTemplateSelectStore()
  const { options: clientOptions, load: loadClients } = useClientSelectStore()
  const { options: signatureOptions, load: loadSignatures } = useCompanySignatureSelectStore()

  useEffect(() => {
    if (isEdit) return
    void loadTypes()
    void loadTemplates()
    void loadClients()
    void loadSignatures()
  }, [isEdit])

  useEffect(() => {
    if (!isEdit && clientOptions.length > 0 && form.getValues('client_id') == null) {
      form.setValue('client_id', clientOptions[0].id)
    }
  }, [isEdit, clientOptions])

  useEffect(() => {
    if (!isEdit && signatureOptions.length > 0 && form.getValues('signature_id') == null) {
      form.setValue('signature_id', signatureOptions[0].id)
    }
  }, [isEdit, signatureOptions])

  useEffect(() => {
    if (!isEdit && typeOptions.length > 0 && form.getValues('proforma_type_id') == null) {
      form.setValue('proforma_type_id', typeOptions[0].id)
    }
  }, [isEdit, typeOptions])

  useEffect(() => {
    if (!isEdit && templateOptions.length > 0 && form.getValues('template_id') == null) {
      form.setValue('template_id', templateOptions[0].id)
    }
  }, [isEdit, templateOptions])

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        client_id: resolved.clientId,
        proforma_type_id: resolved.proformaTypeId,
        template_id: resolved.templateId,
        signature_id: resolved.signatureId,
        series: resolved.series,
        issue_date: resolved.issueDate?.slice(0, 10) ?? '',
        due_date: resolved.dueDate?.slice(0, 10) ?? '',
        place_of_issue: resolved.placeOfIssue ?? '',
        client_attention: resolved.clientAttention ?? '',
        delivery_time: resolved.deliveryTime ?? '',
        currency: resolved.currency,
        observation: resolved.observation ?? '',
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => reset(), [])

  // Auto-creación de la cabecera: en cuanto los 4 selects requeridos + la fecha de emisión
  // son válidos, se crea la proforma en segundo plano (una sola vez) sin que el usuario
  // tenga que enviar el formulario. Recién con el id devuelto se habilitan las líneas.
  const watchedRequired = form.watch(['client_id', 'proforma_type_id', 'template_id', 'signature_id', 'issue_date'])
  const [autoCreateFailed, setAutoCreateFailed] = useState(false)

  const attemptAutoCreate = () => {
    if (isEdit || proformaId !== null || hasAutoCreated.current) return
    const [clientId, proformaTypeId, templateId, signatureId, issueDate] = form.getValues([
      'client_id', 'proforma_type_id', 'template_id', 'signature_id', 'issue_date',
    ])
    if (clientId == null || proformaTypeId == null || templateId == null || signatureId == null || !issueDate) return

    hasAutoCreated.current = true
    setAutoCreateFailed(false)
    const payload = buildHeaderPayload(form.getValues(), false)
    void create(payload).then((newId) => {
      if (newId) {
        setProformaId(newId)
        toastSuccess('Cabecera creada', 'Ya puedes agregar líneas de detalle.')
      } else {
        hasAutoCreated.current = false
        setAutoCreateFailed(true)
        toastError('Error', useProformaFormStore.getState().error ?? 'No se pudo crear la cabecera.')
      }
    })
  }

  useEffect(() => { attemptAutoCreate() }, [isEdit, proformaId, watchedRequired])

  // Una vez creada (o en edición), cualquier cambio en la cabecera se guarda con el botón
  // de abajo — ya no acepta `details`, esas líneas se gestionan aparte y se persisten solas.
  const onSubmit = async (values: ProformaFormValues) => {
    if (!proformaId) return
    const payload = buildHeaderPayload(values, true)
    const success = await update(proformaId, payload)
    if (success) {
      toastSuccess('Proforma guardada', values.series || values.issue_date)
      router.push('/proformas')
    } else {
      applyApiErrors(form, fieldErrors)
      toastError('Error', useProformaFormStore.getState().error ?? 'No se pudo guardar la proforma.')
    }
  }

  // Si falta completar algún campo requerido, react-hook-form no llama a onSubmit —
  // se avisa explícitamente en vez de dejar que el usuario se quede sin saber por qué
  // el botón no hizo nada.
  const onInvalid = () => {
    void swalWarning(
      'Faltan campos por completar',
      'Revisa los campos marcados en rojo antes de continuar.'
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cabecera</CardTitle>
            {!isEdit && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {proformaId ? (
                  <>
                    <CheckCircle2 className="size-3.5 text-teal-600" />
                    Cabecera creada — puedes agregar líneas
                  </>
                ) : autoCreateFailed ? (
                  <>
                    No se pudo crear la cabecera
                    <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs" onClick={attemptAutoCreate}>
                      Reintentar
                    </Button>
                  </>
                ) : (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Completa los campos requeridos para crearla
                  </>
                )}
              </span>
            )}
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Cliente <span className="text-destructive">*</span>
                  </FormLabel>
                  <ClientSelect
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="proforma_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tipo de proforma <span className="text-destructive">*</span>
                  </FormLabel>
                  <ProformaTypeSelect
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="template_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Plantilla <span className="text-destructive">*</span>
                  </FormLabel>
                  <ProformaTemplateSelect
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="signature_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Firma <span className="text-destructive">*</span>
                  </FormLabel>
                  <CompanySignatureSelect
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="series"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serie</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        isEdit ? undefined : 'Ej: PF26, se genera automático si se deja vacío'
                      }
                      disabled={isSubmitting || isEdit || Boolean(proformaId)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issue_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Fecha de emisión <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de vencimiento</FormLabel>
                  <FormControl>
                    <Input type="date" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="place_of_issue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lugar de emisión</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Trujillo" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_attention"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Atención a</FormLabel>
                  <FormControl>
                    <Input placeholder="Persona de contacto" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delivery_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plazo de entrega</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 15 días hábiles" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moneda</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="PEN"
                      className="uppercase"
                      list="proforma-currencies"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <datalist id="proforma-currencies">
                    {PROFORMA_CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value} />
                    ))}
                  </datalist>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observation"
              render={({ field }) => (
                <FormItem className="sm:col-span-2 lg:col-span-3">
                  <FormLabel>Observación</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones opcionales"
                      className="resize-none"
                      rows={3}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Líneas de detalle</CardTitle>
          </CardHeader>
          <CardContent>
            <ProformaDetailLines
              proformaId={proformaId}
              currency={form.watch('currency') || 'PEN'}
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>

        <Separator />
        {error && (
          <AlertError
            title={isEdit ? 'Error al actualizar' : 'Error al crear'}
            message={error}
            apiError={fieldErrors ? { errors: fieldErrors } : undefined}
          />
        )}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/proformas')}
            disabled={isSubmitting}
          >
            {proformaId ? 'Finalizar' : 'Cancelar'}
          </Button>
          {proformaId && (
            <Button type="submit" disabled={isSubmitting} className="min-w-28">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cabecera'
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
