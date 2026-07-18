'use client'

import type { ReactNode } from 'react'
import { useWatch, type UseFormReturn } from 'react-hook-form'
import { PanelTop, Table2, PanelBottom } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { FieldTip } from '@/shared/ui/field-tip'
import { TypeFontPickerModal } from '@/features/typefonts'
import { HEADER_LAYOUT_OPTIONS } from '../../../data/data'
import { ColorInputField } from '../color-input-field'
import type { ProformaTemplateFormValues } from '../proforma-template-form.schema'

type FormProps = { form: UseFormReturn<ProformaTemplateFormValues> }

// Encabezado visual de cada acordeón: ícono + nombre en lenguaje simple + una línea que explica
// qué controla, para un usuario que no conoce términos como "header/body/footer".
function AccordionSectionTitle({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof PanelTop
  title: string
  hint: string
}) {
  return (
    <span className="flex items-center gap-3 text-left">
      <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
        <Icon className="size-4" />
      </span>
      <span className="flex flex-col">
        <span>{title}</span>
        <span className="text-muted-foreground text-xs font-normal">{hint}</span>
      </span>
    </span>
  )
}

// Vista instantánea (sin llamar al backend) de cómo quedan los colores y tamaños elegidos.
// Complementa al preview de PDF real (que tarda unos segundos por sección): esto reacciona
// al toque, aunque no use la tipografía exacta del PDF final.
function HeaderLivePreview({ form }: FormProps) {
  const [bg, text, titleSize] = useWatch({
    control: form.control,
    name: ['headerBgColor', 'headerTextColor', 'headerTitleSize'],
  })
  return (
    <div
      className="flex items-center justify-between rounded-md border px-4 py-3"
      style={{ backgroundColor: bg, color: text }}
    >
      <span style={{ fontSize: `${titleSize || 16}px` }} className="leading-none font-semibold">
        PROFORMA N.° 0001
      </span>
      <span
        className="rounded border px-2 py-1 text-[10px] tracking-wide opacity-80"
        style={{ borderColor: text }}
      >
        LOGO
      </span>
    </div>
  )
}

function BodyLivePreview({ form }: FormProps) {
  const [bg, text, border] = useWatch({
    control: form.control,
    name: ['bodyBgColor', 'bodyTextColor', 'bodyBorderColor'],
  })
  const cols = ['Producto', 'Cantidad', 'Precio']
  const row = ['Mueble de melamina', '2', 'S/ 350.00']
  return (
    <div className="overflow-hidden rounded-md border" style={{ borderColor: border }}>
      <div className="grid grid-cols-3 gap-px" style={{ backgroundColor: border }}>
        {cols.map((h) => (
          <div
            key={h}
            className="px-2 py-1.5 text-xs font-semibold"
            style={{ backgroundColor: bg, color: text }}
          >
            {h}
          </div>
        ))}
        {row.map((v) => (
          <div key={v} className="px-2 py-1.5 text-xs" style={{ backgroundColor: bg, color: text }}>
            {v}
          </div>
        ))}
      </div>
    </div>
  )
}

// Subtítulo de agrupación dentro de cada acordeón (Colores / Tipografía y diseño / Medidas):
// separa visualmente campos que antes iban todos seguidos, para que el usuario no tenga que
// leer cada label para saber en qué grupo está.
function StyleGroupLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground shrink-0 text-xs font-semibold tracking-wide uppercase">
        {children}
      </span>
      <Separator className="flex-1" />
    </div>
  )
}

function FooterLivePreview({ form }: FormProps) {
  const [bg, text, size, footerText] = useWatch({
    control: form.control,
    name: ['footerBgColor', 'footerTextColor', 'footerTextSize', 'footerText'],
  })
  return (
    <div
      className="rounded-md px-4 py-3 text-center"
      style={{ backgroundColor: bg, color: text, fontSize: `${size || 9}px` }}
    >
      {footerText || 'Gracias por su preferencia.'}
    </div>
  )
}

export function StylesTab({ form }: { form: UseFormReturn<ProformaTemplateFormValues> }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-xs">
        El recuadro dentro de cada sección es una vista rápida y aproximada — se actualiza al
        instante, pero no usa la tipografía real. La vista previa del PDF de la derecha sí es el
        documento real; por eso tarda unos segundos en actualizarse tras cada cambio.
      </p>

      <Card className="py-2">
        <CardContent className="px-4">
          <Accordion type="single" collapsible defaultValue="header" className="w-full">
            <AccordionItem value="header" className="border-b-0">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                <AccordionSectionTitle
                  icon={PanelTop}
                  title="Encabezado"
                  hint="Logo, título y colores de la parte superior del documento"
                />
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4 pt-1">
                  <HeaderLivePreview form={form} />

                  <StyleGroupLabel>Colores</StyleGroupLabel>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="headerBgColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ColorInputField
                              label="Color de fondo"
                              tip="Color de la franja superior del documento (donde va el logo y el título)."
                              required
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="headerTextColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ColorInputField
                              label="Color de texto"
                              tip="Color del título y el texto dentro del encabezado."
                              required
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <StyleGroupLabel>Tipografía y diseño</StyleGroupLabel>
                  <FormField
                    control={form.control}
                    name="headerLayout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <FieldTip
                            label={
                              <>
                                Distribución del logo <span className="text-destructive">*</span>
                              </>
                            }
                            tip="Ubica el logo de la empresa a la izquierda o a la derecha del título, dentro del encabezado."
                          />
                        </FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {HEADER_LAYOUT_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="headerFontFamily"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <FieldTip
                            label={
                              <>
                                Familia tipográfica <span className="text-destructive">*</span>
                              </>
                            }
                            tip="Letra usada para el título del encabezado en el PDF final."
                          />
                        </FormLabel>
                        <FormControl>
                          <TypeFontPickerModal value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <StyleGroupLabel>Medidas (px)</StyleGroupLabel>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="headerTitleSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            <FieldTip
                              label={
                                <>
                                  Tamaño del título (px) <span className="text-destructive">*</span>
                                </>
                              }
                              tip="Tamaño de letra del título principal del encabezado."
                            />
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="headerHeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            <FieldTip
                              label={
                                <>
                                  Alto del encabezado (px){' '}
                                  <span className="text-destructive">*</span>
                                </>
                              }
                              tip="Alto total de la franja superior del documento."
                            />
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="headerLogoWidth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            <FieldTip
                              label={
                                <>
                                  Ancho del logo (px) <span className="text-destructive">*</span>
                                </>
                              }
                              tip="Ancho con el que se mostrará el logo de la empresa en el encabezado."
                            />
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="headerLogoHeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            <FieldTip
                              label={
                                <>
                                  Alto del logo (px) <span className="text-destructive">*</span>
                                </>
                              }
                              tip="Alto con el que se mostrará el logo de la empresa en el encabezado."
                            />
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="py-2">
        <CardContent className="px-4">
          <Accordion type="single" collapsible defaultValue="body" className="w-full">
            <AccordionItem value="body" className="border-b-0">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                <AccordionSectionTitle
                  icon={Table2}
                  title="Cuerpo del documento"
                  hint="Colores y tamaños de la tabla de productos que verá el cliente"
                />
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4 pt-1">
                  <BodyLivePreview form={form} />

                  <StyleGroupLabel>Colores</StyleGroupLabel>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="bodyBgColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ColorInputField
                              label="Color de fondo"
                              tip="Color de fondo de la tabla de productos y del cuerpo del documento."
                              required
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bodyTextColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ColorInputField
                              label="Color de texto"
                              tip="Color del texto dentro de la tabla de productos."
                              required
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bodyBorderColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ColorInputField
                              label="Color de borde"
                              tip="Color de las líneas que separan las filas y columnas de la tabla."
                              required
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <StyleGroupLabel>Tipografía</StyleGroupLabel>
                  <FormField
                    control={form.control}
                    name="bodyFontFamily"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <FieldTip
                            label={
                              <>
                                Familia tipográfica <span className="text-destructive">*</span>
                              </>
                            }
                            tip="Letra usada en la tabla de productos y el cuerpo del documento."
                          />
                        </FormLabel>
                        <FormControl>
                          <TypeFontPickerModal value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <StyleGroupLabel>Medidas (px)</StyleGroupLabel>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="bodySubtitleSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            <FieldTip
                              label={
                                <>
                                  Tamaño del subtítulo (px){' '}
                                  <span className="text-destructive">*</span>
                                </>
                              }
                              tip="Tamaño de letra de los subtítulos dentro del cuerpo (ej. nombres de sección)."
                            />
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bodyTextSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            <FieldTip
                              label={
                                <>
                                  Tamaño del texto (px) <span className="text-destructive">*</span>
                                </>
                              }
                              tip="Tamaño de letra del texto general dentro del cuerpo del documento."
                            />
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bodyTableSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            <FieldTip
                              label={
                                <>
                                  Tamaño de la tabla (px){' '}
                                  <span className="text-destructive">*</span>
                                </>
                              }
                              tip="Tamaño de letra de los productos, cantidades y precios dentro de la tabla."
                            />
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="py-2">
        <CardContent className="px-4">
          <Accordion type="single" collapsible defaultValue="footer" className="w-full">
            <AccordionItem value="footer" className="border-b-0">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                <AccordionSectionTitle
                  icon={PanelBottom}
                  title="Pie de página"
                  hint="Franja inferior con el texto de cierre, como 'Gracias por su preferencia'"
                />
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4 pt-1">
                  <FooterLivePreview form={form} />

                  <StyleGroupLabel>Colores y medidas</StyleGroupLabel>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="footerBgColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ColorInputField
                              label="Color de fondo"
                              tip="Color de la franja inferior del documento."
                              required
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="footerTextColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ColorInputField
                              label="Color de texto"
                              tip="Color del texto de cierre en el pie de página."
                              required
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="footerTextSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            <FieldTip
                              label={
                                <>
                                  Tamaño del texto (px) <span className="text-destructive">*</span>
                                </>
                              }
                              tip="Tamaño de letra del texto del pie de página."
                            />
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <StyleGroupLabel>Tipografía</StyleGroupLabel>
                  <FormField
                    control={form.control}
                    name="footerFontFamily"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <FieldTip
                            label={
                              <>
                                Familia tipográfica <span className="text-destructive">*</span>
                              </>
                            }
                            tip="Letra usada para el texto del pie de página."
                          />
                        </FormLabel>
                        <FormControl>
                          <TypeFontPickerModal value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <StyleGroupLabel>Texto</StyleGroupLabel>
                  <FormField
                    control={form.control}
                    name="footerText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <FieldTip
                            label="Texto del pie de página"
                            tip="Mensaje que aparece en la franja inferior de cada página del PDF, como un agradecimiento o dato de contacto."
                          />
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ej: Gracias por su preferencia."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
