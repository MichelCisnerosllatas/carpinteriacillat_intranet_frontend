'use client'

import { useWatch, type UseFormReturn } from 'react-hook-form'
import { Switch } from '@/shared/ui/switch'
import { Card, CardContent } from '@/shared/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'
import { FormControl, FormField, FormItem, FormLabel } from '@/shared/ui/form'
import { FieldTip } from '@/shared/ui/field-tip'
import { SECTION_GROUPS, type SectionField } from '../../../data/data'
import type { ProformaTemplateFormValues } from '../proforma-template-form.schema'

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
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-xs">
        Estos bloques ya existen en el documento (el diseño se define en la pestaña "Diseño del
        PDF"). Aquí solo decides cuáles se muestran y cuáles se ocultan — no se crean secciones
        nuevas.
      </p>

      {SECTION_GROUPS.map((group) => (
        <Card key={group.key} className="py-2">
          <CardContent className="px-4">
            <Accordion type="single" collapsible defaultValue={group.key} className="w-full">
              <AccordionItem value={group.key} className="border-b-0">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">
                  <span className="flex items-center gap-3 text-left">
                    <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
                      <group.icon className="size-4" />
                    </span>
                    <span className="flex flex-col">
                      <span>{group.label}</span>
                      <span className="text-muted-foreground text-xs font-normal">
                        {group.hint}
                      </span>
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
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
