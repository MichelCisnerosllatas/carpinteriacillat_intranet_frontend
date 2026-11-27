'use client'

// Carrusel «Muebles a medida» (category_coverflow).
// Origen de la imagen: "Banco de imágenes" (ImageSelect de siempre) | "Foto de un trabajo" (Galería).
// Solo dibuja las dos pestañas; el contenido de cada una lo pone el formulario.

import { Hammer, Images } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

/** De dónde sale la imagen de la foto. */
export type ImageSource = 'bank' | 'work'

interface ImageSourceTabsProps {
  value: ImageSource
  onChange: (value: ImageSource) => void
}

/**
 * Pestañas "Imágenes" (banco de imágenes) | "Trabajos" (foto de un trabajo de la Galería).
 * Textos cortos a propósito: el formulario usa columnas angostas y los textos largos se cortaban.
 * El `title` muestra el texto completo al pasar el mouse.
 */
export function ImageSourceTabs({ value, onChange }: ImageSourceTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as ImageSource)}>
      <TabsList className="w-full">
        <TabsTrigger value="bank" className="flex-1" title="Banco de imágenes"><Images className="mr-1.5 size-4" />Imágenes</TabsTrigger>
        <TabsTrigger value="work" className="flex-1" title="Foto de un trabajo"><Hammer className="mr-1.5 size-4" />Trabajos</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
