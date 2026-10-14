'use client'

import { useEffect, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Globe } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { furnituresService } from '../../services/furnitures.service'
import type { FurnitureFormValues } from '../../data/furniture-form.schema'

// id del <datalist> con las sugerencias de estilo (debe ser único en la página).
const STYLES_DATALIST_ID = 'furniture-web-styles'

interface FurnitureWebCardProps {
  form: UseFormReturn<FurnitureFormValues>
  disabled?: boolean
}

/**
 * Datos públicos del mueble en la "Galería de trabajos" del sitio web.
 * Solo se muestra cuando el check "Publicar en la galería web" está marcado (lo decide el padre).
 */
export function FurnitureWebCard({ form, disabled = false }: FurnitureWebCardProps) {
  // Estilos ya usados en otros trabajos: se ofrecen como sugerencia, pero se puede escribir uno nuevo.
  const [styles, setStyles] = useState<string[]>([])

  useEffect(() => {
    furnituresService.getWebStyles()
      .then((res) => { if (res.success) setStyles(res.data ?? []) })
      .catch(() => { /* sin sugerencias no pasa nada: el campo sigue siendo texto libre */ })
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="size-4" />
          Galería web
        </CardTitle>
        <CardDescription>Estos datos se muestran en la tarjeta y el detalle del trabajo en el sitio web. Todos son opcionales.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <FormField control={form.control} name="web.furnitureweb_style" render={({ field }) => (
          <FormItem>
            <FormLabel>Estilo</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Minimalista" maxLength={100} list={STYLES_DATALIST_ID} disabled={disabled} {...field} value={field.value ?? ''} />
            </FormControl>
            {/* <datalist> nativo: el navegador muestra las sugerencias mientras se escribe */}
            <datalist id={STYLES_DATALIST_ID}>
              {styles.map((s) => <option key={s} value={s} />)}
            </datalist>
            <FormDescription>Elige uno sugerido o escribe uno nuevo.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="web.furnitureweb_measures" render={({ field }) => (
          <FormItem>
            <FormLabel>Medidas</FormLabel>
            <FormControl>
              <Input placeholder="Ej: 4.2 × 3.1 m" maxLength={100} disabled={disabled} {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="web.furnitureweb_finish" render={({ field }) => (
          <FormItem>
            <FormLabel>Acabado</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Laca mate" maxLength={150} disabled={disabled} {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="web.furnitureweb_build_time" render={({ field }) => (
          <FormItem>
            <FormLabel>Tiempo de fabricación</FormLabel>
            <FormControl>
              <Input placeholder="Ej: 3 semanas" maxLength={100} disabled={disabled} {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="web.furnitureweb_location" render={({ field }) => (
          <FormItem>
            <FormLabel>Lugar</FormLabel>
            <FormControl>
              <Input placeholder="Ej: San Juan, Iquitos" maxLength={150} disabled={disabled} {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="web.furnitureweb_delivered_at" render={({ field }) => (
          <FormItem>
            <FormLabel>Fecha de entrega</FormLabel>
            <FormControl>
              <Input type="date" disabled={disabled} {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="web.furnitureweb_price_approx" render={({ field }) => (
          <FormItem>
            <FormLabel>Precio aproximado (S/)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 6800"
                disabled={disabled}
                {...field}
                value={field.value ?? ''}
                // Vacío = null (sin precio); si no, se guarda como número.
                onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
              />
            </FormControl>
            <FormDescription>Opcional. Se muestra como referencia en la web.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
      </CardContent>
    </Card>
  )
}
