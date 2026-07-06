'use client'

import { useWatch, type UseFormReturn } from 'react-hook-form'
import { Switch } from '@/shared/ui/switch'
import { Card, CardContent } from '@/shared/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'
import { FormControl, FormField, FormItem, FormLabel } from '@/shared/ui/form'
import type { ProformaTemplateFormValues } from '../proforma-template-form.schema'

type SectionField = { name: keyof ProformaTemplateFormValues; label: string }

// Los 8 toggles que expone pdf_templates.sections (ver "Esquema del objeto" en pdf-templates.md).
// No hay control por-cuenta/por-sucursal: show_bank_accounts y show_branches son un único
// interruptor que muestra u oculta TODA la lista (el backend aún no soporta seleccionar
// cuentas/sucursales individuales por plantilla).
const SECTION_GROUPS: { key: string; label: string; fields: SectionField[] }[] = [
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
    fields: [{ name: 'showFooter', label: 'Mostrar pie de página' }],
  },
]

function SectionGroupToggleAll({
  form,
  fields,
}: {
  form: UseFormReturn<ProformaTemplateFormValues>
  fields: SectionField[]
}) {
  const values = useWatch({ control: form.control, name: fields.map((f) => f.name) }) as boolean[]
  const allOn = values.every(Boolean)
  return (
    <div className="bg-muted/40 flex items-center justify-between rounded-md border p-3">
      <span className="text-sm font-medium">Activar/desactivar todo</span>
      <Switch
        checked={allOn}
        onCheckedChange={(checked) =>
          fields.forEach((f) => form.setValue(f.name, checked as never))
        }
      />
    </div>
  )
}

export function SectionsTab({ form }: { form: UseFormReturn<ProformaTemplateFormValues> }) {
  return (
    <Card className="py-2">
      <CardContent className="px-4">
        <Accordion type="multiple" defaultValue={['header', 'body', 'footer']} className="w-full">
          {SECTION_GROUPS.map((group, i) => (
            <AccordionItem
              key={group.key}
              value={group.key}
              className={i === SECTION_GROUPS.length - 1 ? 'border-b-0' : undefined}
            >
              <AccordionTrigger className="text-sm font-medium">{group.label}</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-3 pt-1">
                  <SectionGroupToggleAll form={form} fields={group.fields} />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {group.fields.map(({ name, label }) => (
                      <FormField
                        key={name}
                        control={form.control}
                        name={name}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between gap-2 rounded-md border p-3">
                            <FormLabel className="text-sm font-normal">{label}</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
