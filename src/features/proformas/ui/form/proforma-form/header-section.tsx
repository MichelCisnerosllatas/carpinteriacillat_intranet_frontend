// src/features/proformas/ui/form/proforma-form/header-section.tsx
'use client'

import { CheckCircle2, Info } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { ProformaTypeSelect } from '@/features/proforma-types'
import { ProformaTemplateSelect, getTemplateDefaultText } from '@/features/proforma-templates'
import { ClientNamePickerField } from '@/features/clients'
import { CompanySignatureSelect } from '@/features/company-signatures'
import { TEMPLATE_TEXT_KEYS } from '@/features/proforma-template-texts'
import { PROFORMA_CURRENCIES } from '../../../data/data'
import type { UseFormReturn } from 'react-hook-form'
import type { ProformaFormValues } from '../../../lib/proforma-form'

// Key fija que el generador de PDF busca para la fila "Forma de pago" (ver
// `TEMPLATE_TEXT_KEYS` en @/features/proforma-template-texts — replica
// `PdfTemplateText::firstActiveContentByKey` del backend).
const FORMA_PAGO_KEY = TEMPLATE_TEXT_KEYS.find((k) => k.key === 'forma_pago')?.key ?? 'forma_pago'

interface HeaderSectionProps {
  form: UseFormReturn<ProformaFormValues>
  isEdit: boolean
  proformaId: number | null
  isManualSaving: boolean
}

/** Card "Cabecera" — todos los campos generales del documento (cliente, plantilla, firma, fechas). */
export function HeaderSection({ form, isEdit, proformaId, isManualSaving }: HeaderSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-1.5">
          Cabecera
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground size-3.5" />
            </TooltipTrigger>
            <TooltipContent>
              Datos generales del documento — cliente, plantilla, firma y fechas.
            </TooltipContent>
          </Tooltip>
        </CardTitle>
        {!isEdit && proformaId && (
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="size-3.5 text-teal-600" />
            Proforma registrada — puedes seguir agregando líneas
          </span>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <FormField
          control={form.control}
          name="client_name"
          render={() => (
            <FormItem>
              <FormLabel>
                Cliente <span className="text-destructive">*</span>
              </FormLabel>
              <ClientNamePickerField
                clientId={form.watch('client_id')}
                clientName={form.watch('client_name') ?? ''}
                onChange={({ clientId, clientName }) => {
                  // Ambos campos se marcan dirty juntos: aunque `clientId` venga null (el usuario
                  // escribió a mano, todavía sin resolver), el submit lo resuelve recién ahí — si
                  // no queda dirty acá, `buildDirtyHeaderPayload` no lo incluiría en el PATCH.
                  form.setValue('client_id', clientId, { shouldDirty: true })
                  form.setValue('client_name', clientName, { shouldDirty: true })
                }}
                disabled={isManualSaving}
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
                disabled={isManualSaving}
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
                onValueChange={async (value) => {
                  field.onChange(value)
                  // Solo autocompleta "Forma de pago" si el usuario todavía no la tocó a mano —
                  // si ya la editó, cambiar de plantilla no debe pisarle lo que escribió.
                  if (value && !form.formState.dirtyFields.payment_method) {
                    const defaultText = await getTemplateDefaultText(value, FORMA_PAGO_KEY)
                    if (defaultText && !form.formState.dirtyFields.payment_method) {
                      form.setValue('payment_method', defaultText, { shouldDirty: true })
                    }
                  }
                }}
                disabled={isManualSaving}
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
                disabled={isManualSaving}
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
              <FormLabel className="flex items-center gap-1.5">
                Serie
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="text-muted-foreground size-3.5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Si la dejas vacía, el servidor genera una automática (ej: PF26). Ya no se puede
                    cambiar después de registrar.
                  </TooltipContent>
                </Tooltip>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    isEdit ? undefined : 'Ej: PF26, se genera automático si se deja vacío'
                  }
                  disabled={isManualSaving || isEdit || Boolean(proformaId)}
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
                <Input type="date" disabled={isManualSaving} {...field} />
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
              <FormLabel className="flex items-center gap-1.5">
                Fecha de vencimiento
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="text-muted-foreground size-3.5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Opcional. Pasada esta fecha, la proforma puede marcarse como Vencida.
                  </TooltipContent>
                </Tooltip>
              </FormLabel>
              <FormControl>
                <Input type="date" disabled={isManualSaving} {...field} />
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
                <Input placeholder="Ej: Trujillo" disabled={isManualSaving} {...field} />
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
                <Input placeholder="Persona de contacto" disabled={isManualSaving} {...field} />
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
                <Input placeholder="Ej: 15 días hábiles" disabled={isManualSaving} {...field} />
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
              <FormLabel className="flex items-center gap-1.5">
                Moneda
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="text-muted-foreground size-3.5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Texto libre — escribe el código o elige una sugerencia (PEN, USD).
                  </TooltipContent>
                </Tooltip>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="S/."
                  className="uppercase"
                  list="proforma-currencies"
                  disabled={isManualSaving}
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
            <FormItem className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-5">
              <FormLabel>Observación</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observaciones opcionales"
                  className="resize-none"
                  rows={3}
                  disabled={isManualSaving}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_method"
          render={({ field }) => (
            <FormItem className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-5">
              <FormLabel className="flex items-center gap-1.5">
                Forma de pago
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="text-muted-foreground size-3.5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Se autocompleta con el texto de la plantilla elegida — puedes editarlo o
                    vaciarlo (si lo dejas vacío, esa sección no aparece en el PDF).
                  </TooltipContent>
                </Tooltip>
              </FormLabel>
              <FormControl>
                {/* rows=5 + resize-y (no resize-none): el texto por defecto de la plantilla suele
                 * ser más largo de lo que parece a simple vista — con 3 filas fijas y sin poder
                 * agrandar, quedaba contenido real oculto/scrolleado dentro del textarea aunque
                 * ya estuviera correctamente cargado (y luego "aparecía de la nada" en el PDF). */}
                <Textarea
                  placeholder="Ej: 50% adelanto, 50% contra entrega"
                  className="resize-y"
                  rows={5}
                  disabled={isManualSaving}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
