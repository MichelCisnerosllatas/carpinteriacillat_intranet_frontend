'use client'

import { useWatch, type UseFormReturn } from 'react-hook-form'
import { PanelTop, Table2, PanelBottom } from 'lucide-react'
import { Switch } from '@/shared/ui/switch'
import { Card, CardContent } from '@/shared/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'
import { FormControl, FormField, FormItem, FormLabel } from '@/shared/ui/form'
import { FieldTip } from '@/shared/ui/field-tip'
import type { ProformaTemplateFormValues } from '../proforma-template-form.schema'

type SectionField = { name: keyof ProformaTemplateFormValues; label: string; tip: string }

// Los 8 toggles que expone pdf_templates.sections (ver "Esquema del objeto" en pdf-templates.md).
// No hay control por-cuenta/por-sucursal: show_bank_accounts y show_branches son un único
// interruptor que muestra u oculta TODA la lista (el backend aún no soporta seleccionar
// cuentas/sucursales individuales por plantilla).
const SECTION_GROUPS: {
  key: string
  label: string
  hint: string
  icon: typeof PanelTop
  fields: SectionField[]
}[] = [
  {
    key: 'header',
    label: 'Encabezado',
    hint: 'Qué se muestra en la parte superior del documento',
    icon: PanelTop,
    fields: [
      {
        name: 'showLogo',
        label: 'Mostrar logo',
        tip: 'Muestra el logo de la empresa en el encabezado.',
      },
      {
        name: 'showDate',
        label: 'Mostrar fecha',
        tip: 'Muestra la fecha de emisión en el encabezado.',
      },
    ],
  },
  {
    key: 'body',
    label: 'Cuerpo del documento',
    hint: 'Datos de la empresa y de pago junto a la tabla de productos',
    icon: Table2,
    fields: [
      {
        name: 'showCompanyData',
        label: 'Mostrar datos de la empresa',
        tip: 'Muestra el RUC, la razón social y otros datos generales de la empresa.',
      },
      {
        name: 'showBranches',
        label: 'Mostrar sucursales',
        tip: 'Muestra la lista completa de sucursales. No se puede elegir sucursales individuales.',
      },
      {
        name: 'showPaymentMethod',
        label: 'Mostrar método de pago',
        tip: 'Muestra la forma de pago aceptada (efectivo, transferencia, etc.).',
      },
      {
        name: 'showBankAccounts',
        label: 'Mostrar cuentas bancarias',
        tip: 'Muestra la lista completa de cuentas bancarias registradas. No se puede elegir cuentas individuales.',
      },
      {
        name: 'showCompanySocialNetworks',
        label: 'Mostrar redes sociales',
        tip: 'Muestra los enlaces a las redes sociales de la empresa.',
      },
      {
        name: 'showCompanyContacts',
        label: 'Mostrar contactos',
        tip: 'Muestra los teléfonos y correos de contacto de la empresa.',
      },
      {
        name: 'showSignature',
        label: 'Mostrar firma',
        tip: 'Muestra un espacio con la firma registrada al final del documento.',
      },
    ],
  },
  {
    key: 'footer',
    label: 'Pie de página',
    hint: 'Franja inferior del documento',
    icon: PanelBottom,
    fields: [
      {
        name: 'showFooter',
        label: 'Mostrar pie de página',
        tip: 'Muestra la franja inferior con el texto de cierre configurado en el tab Estilos.',
      },
    ],
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
      <span className="text-sm font-medium">
        <FieldTip
          label="Activar/desactivar todo"
          tip="Enciende o apaga de un solo golpe todos los elementos de esta sección."
        />
      </span>
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
        <p className="text-muted-foreground mb-3 text-xs">
          Estos bloques ya existen en el documento (el diseño se define en la pestaña "Diseño del
          PDF"). Aquí solo decides cuáles se muestran y cuáles se ocultan — no se crean secciones
          nuevas.
        </p>
        <Accordion type="multiple" defaultValue={['header', 'body', 'footer']} className="w-full">
          {SECTION_GROUPS.map((group, i) => (
            <AccordionItem
              key={group.key}
              value={group.key}
              className={i === SECTION_GROUPS.length - 1 ? 'border-b-0' : undefined}
            >
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                <span className="flex items-center gap-3 text-left">
                  <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
                    <group.icon className="size-4" />
                  </span>
                  <span className="flex flex-col">
                    <span>{group.label}</span>
                    <span className="text-muted-foreground text-xs font-normal">{group.hint}</span>
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-3 pt-1">
                  <SectionGroupToggleAll form={form} fields={group.fields} />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {group.fields.map(({ name, label, tip }) => (
                      <FormField
                        key={name}
                        control={form.control}
                        name={name}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between gap-2 rounded-md border p-3">
                            <FormLabel className="text-sm font-normal">
                              <FieldTip label={label} tip={tip} />
                            </FormLabel>
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
