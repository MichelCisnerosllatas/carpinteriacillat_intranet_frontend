'use client'

import type { UseFormReturn } from 'react-hook-form'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent } from '@/shared/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { FONT_FAMILY_SUGGESTIONS, HEADER_LAYOUT_OPTIONS } from '../../../data/data'
import { ColorInputField } from '../color-input-field'
import type { ProformaTemplateFormValues } from '../proforma-template-form.schema'

export function StylesTab({ form }: { form: UseFormReturn<ProformaTemplateFormValues> }) {
  return (
    <Card className="py-2">
      <CardContent className="px-4">
        <Accordion type="multiple" defaultValue={['header', 'body', 'footer']} className="w-full">
          <AccordionItem value="header">
            <AccordionTrigger className="text-sm font-medium">Header</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4 pt-1">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="headerBgColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ColorInputField
                            label="Color de fondo"
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
                <FormField
                  control={form.control}
                  name="headerLayout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Distribución del logo <span className="text-destructive">*</span>
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
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <FormField
                    control={form.control}
                    name="headerTitleSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Tamaño del título (px) <span className="text-destructive">*</span>
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
                          Alto del header (px) <span className="text-destructive">*</span>
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
                          Ancho del logo (px) <span className="text-destructive">*</span>
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
                          Alto del logo (px) <span className="text-destructive">*</span>
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

          <AccordionItem value="body">
            <AccordionTrigger className="text-sm font-medium">Cuerpo</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4 pt-1">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="bodyBgColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ColorInputField
                            label="Color de fondo"
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
                <FormField
                  control={form.control}
                  name="bodyFontFamily"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Familia tipográfica <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div>
                          <Input
                            list="font-family-suggestions"
                            placeholder="Ej: Arial"
                            {...field}
                          />
                          <datalist id="font-family-suggestions">
                            {FONT_FAMILY_SUGGESTIONS.map((f) => (
                              <option key={f} value={f} />
                            ))}
                          </datalist>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="bodySubtitleSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Tamaño del subtítulo (px) <span className="text-destructive">*</span>
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
                          Tamaño del texto (px) <span className="text-destructive">*</span>
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
                          Tamaño de la tabla (px) <span className="text-destructive">*</span>
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

          <AccordionItem value="footer" className="border-b-0">
            <AccordionTrigger className="text-sm font-medium">Footer</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4 pt-1">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="footerBgColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ColorInputField
                            label="Color de fondo"
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
                          Tamaño del texto (px) <span className="text-destructive">*</span>
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
                <FormField
                  control={form.control}
                  name="footerText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto del pie de página</FormLabel>
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
  )
}
