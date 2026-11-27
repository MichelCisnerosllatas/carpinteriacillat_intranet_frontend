'use client'

import type { Control } from 'react-hook-form'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import type { SectionImageFormValues } from './sectionimage-form'
import type { ImageFieldsConfig, ImageTextFieldName } from './image-fields-by-section'
import { FieldLabel } from './field-label'

interface SectionImageTextFieldsProps {
  control: Control<SectionImageFormValues>
  /**
   * true = sección agrupada (hero de Servicios o carrusel de categorías): la web solo usa el título
   * (como pie de foto), así que solo se muestra ese campo. Los demás no se ven, pero se envían como estén.
   */
  captionOnly: boolean
  /**
   * Etiquetas, ayudas y campos ocultos según el tipo de sección (ver image-fields-by-section.ts).
   * null/undefined = el formulario de siempre.
   */
  config?: ImageFieldsConfig | null
}

/** Textos opcionales que acompañan a la foto en el sitio web. */
export function SectionImageTextFields({ control, captionOnly, config }: SectionImageTextFieldsProps) {
  // Hero de Servicios / carrusel de categorías: solo "Pie de foto"
  if (captionOnly) {
    return (
      <FormField control={control} name="sectionimage_title" render={({ field }) => (
        <FormItem>
          <FormLabel>Pie de foto</FormLabel>
          <FormControl><Input placeholder="Ej: Cocina en melamina" maxLength={255} {...field} /></FormControl>
          <FormDescription>Se muestra al ver la foto en grande.</FormDescription>
          <FormMessage />
        </FormItem>
      )} />
    )
  }

  // ¿Se muestra el campo? (si el tipo de sección no lo oculta)
  const isVisible = (name: ImageTextFieldName) => !config?.hidden?.includes(name)
  // Textos propios del tipo de sección para un campo (vacío = los de siempre)
  const custom = (name: ImageTextFieldName) => config?.fields?.[name] ?? {}

  const title       = custom('title')
  const description = custom('description')
  const label       = custom('label')

  // Resto de secciones: todos los textos (menos los que oculte el tipo de sección)
  return (
    <>
      {isVisible('title') && (
        <FormField control={control} name="sectionimage_title" render={({ field }) => (
          <FormItem>
            <FieldLabel label={title.label ?? 'Título'} tip={title.tip} />
            <FormControl><Input placeholder={title.placeholder ?? 'Ej: Cocina en melamina'} maxLength={255} {...field} /></FormControl>
            {/* La nota del hero de servicios solo tiene sentido en el formulario de siempre */}
            {!config && <FormDescription>Opcional. En el hero de servicios se usa como pie de foto.</FormDescription>}
            <FormMessage />
          </FormItem>
        )} />
      )}

      {isVisible('description') && (
        <FormField control={control} name="sectionimage_description" render={({ field }) => (
          <FormItem>
            <FieldLabel label={description.label ?? 'Descripción'} tip={description.tip} />
            <FormControl>
              <Textarea placeholder={description.placeholder ?? 'Descripción opcional de la foto'} className="resize-y" rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      )}

      {isVisible('label') && (
        <FormField control={control} name="sectionimage_label" render={({ field }) => (
          <FormItem>
            <FieldLabel label={label.label ?? 'Categoría / etiqueta'} tip={label.tip} />
            <FormControl><Input placeholder={label.placeholder ?? 'Ej: Cocinas'} maxLength={150} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      )}

      {/* Enlace y Texto del enlace van juntos: se muestran o se ocultan los dos */}
      {isVisible('link') && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField control={control} name="sectionimage_link" render={({ field }) => (
            <FormItem>
              <FormLabel>Enlace</FormLabel>
              <FormControl><Input placeholder="Ej: /gallery" maxLength={255} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name="sectionimage_link_label" render={({ field }) => (
            <FormItem>
              <FormLabel>Texto del enlace</FormLabel>
              <FormControl><Input placeholder="Ej: Ver más" maxLength={150} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
      )}

      {isVisible('variant') && (
        <FormField control={control} name="sectionimage_variant" render={({ field }) => (
          <FormItem>
            <FormLabel>Variante</FormLabel>
            <FormControl><Input placeholder="Ej: wide..." maxLength={50} {...field} /></FormControl>
            <FormDescription>Opcional. Texto libre que algunas secciones usan para mostrar la foto de otra forma.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
      )}
    </>
  )
}
