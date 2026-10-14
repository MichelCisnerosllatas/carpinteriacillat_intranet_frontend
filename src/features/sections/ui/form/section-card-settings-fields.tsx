'use client'

// Bloque "Elementos de las tarjetas" de Configuración → Visibilidad.
// Un switch por cada elemento del catálogo que manda el backend (`web_settings.card_settings_schema`).
// El CATÁLOGO NO se escribe aquí: vive en el backend (config/section_card_settings.php, una lista
// por typesection_key). Para agregar un elemento se agrega allá y aparece solo en esta pantalla.
// Ver features/sectionimages/grouped/README.md → "Elementos de las tarjetas".

import { LayoutGrid } from 'lucide-react'
import type { Control } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { FormControl, FormField, FormItem, FormLabel } from '@/shared/ui/form'
import { Switch } from '@/shared/ui/switch'
import type { SectionCardSettingSchemaItem } from '../../model/sectionget.dto'
import type { SectionContentVisibilityFormValues } from './section-content-visibility-form'

interface SectionCardSettingsFieldsProps {
  control: Control<SectionContentVisibilityFormValues>
  /** Catálogo del backend. Si viene vacío, el bloque no se muestra. */
  schema: SectionCardSettingSchemaItem[]
}

/**
 * Valores del bloque: lo guardado o, si falta una clave, el valor por defecto del catálogo.
 * Solo devuelve claves del catálogo (el backend rechaza claves desconocidas con 422).
 */
export function resolveCardSettings(
  schema: SectionCardSettingSchemaItem[],
  saved: Record<string, boolean> | null | undefined,
): Record<string, boolean> {
  return Object.fromEntries(schema.map((item) => [item.key, saved?.[item.key] ?? item.default]))
}

/** Card con un switch por cada elemento de las tarjetas. */
export function SectionCardSettingsFields({ control, schema }: SectionCardSettingsFieldsProps) {
  if (schema.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><LayoutGrid className="size-4" />Elementos de las tarjetas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          Muestra u oculta partes de las tarjetas de esta sección en el sitio web (sin borrar nada).
        </p>
        {schema.map((item) => (
          <FormField key={item.key} control={control} name={`card_settings.${item.key}`} render={({ field }) => (
            <FormItem className="flex items-center justify-between gap-3">
              <FormLabel className="font-normal">{item.label}</FormLabel>
              <FormControl>
                <Switch checked={field.value ?? item.default} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )} />
        ))}
      </CardContent>
    </Card>
  )
}
