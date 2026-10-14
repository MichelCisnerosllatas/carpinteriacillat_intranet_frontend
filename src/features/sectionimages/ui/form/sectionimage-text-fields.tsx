'use client'

import type { Control } from 'react-hook-form'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import type { SectionImageFormValues } from './sectionimage-form'

interface SectionImageTextFieldsProps {
  control: Control<SectionImageFormValues>
  /**
   * true = sección agrupada (hero de Servicios o carrusel de categorías): la web solo usa el título
   * (como pie de foto), así que solo se muestra ese campo. Los demás no se ven, pero se envían como estén.
   */
  captionOnly: boolean
}

/** Textos opcionales que acompañan a la foto en el sitio web. */
export function SectionImageTextFields({ control, captionOnly }: SectionImageTextFieldsProps) {
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

  // Resto de secciones: todos los textos
  return (
    <>
      <FormField control={control} name="sectionimage_title" render={({ field }) => (
        <FormItem>
          <FormLabel>Título</FormLabel>
          <FormControl><Input placeholder="Ej: Cocina en melamina" maxLength={255} {...field} /></FormControl>
          <FormDescription>Opcional. En el hero de servicios se usa como pie de foto.</FormDescription>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="sectionimage_description" render={({ field }) => (
        <FormItem>
          <FormLabel>Descripción</FormLabel>
          <FormControl><Textarea placeholder="Descripción opcional de la foto" className="resize-y" rows={3} {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="sectionimage_label" render={({ field }) => (
        <FormItem>
          <FormLabel>Categoría / etiqueta</FormLabel>
          <FormControl><Input placeholder="Ej: Cocinas" maxLength={150} {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

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

      <FormField control={control} name="sectionimage_variant" render={({ field }) => (
        <FormItem>
          <FormLabel>Variante</FormLabel>
          <FormControl><Input placeholder="Ej: before, after, wide..." maxLength={50} {...field} /></FormControl>
          <FormDescription>Opcional. Texto libre que algunas secciones usan para mostrar la foto de otra forma.</FormDescription>
          <FormMessage />
        </FormItem>
      )} />
    </>
  )
}
