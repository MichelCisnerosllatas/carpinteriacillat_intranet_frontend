'use client'

// SOLO para «Restauración» de Servicios (restoration_compare, "02").
// Campos del formulario de item cuando la sección es Restauración: cada item es la tarjeta de UN trabajo.
// Un trabajo NO tiene que ser un mueble. Al guardar se envían:
//   sectionitem_title = "Nombre del trabajo" (obligatorio y libre; es lo que se ve en la web)
//   sectionitem_key   = 'furniture-<id_furniture>' si se eligió "Mueble relacionado", o vacío (null) si no
//   sectionitem_type  = 'restoration'  (lo pone section-item-form.tsx)
// El nombre NO se sincroniza con el mueble: al elegir un mueble solo se sugiere su título si el nombre está vacío.
// Ver features/sectionimages/grouped/README.md → "Restauración".

import { useEffect, type ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Activity, Hammer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { VisibilityToggle } from '@/shared/ui/visibility-toggle'
import { buildImageUrl } from '@/shared/lib/images'
import type { FurnitureJoinApiItem } from '@/features/furnitures/model/furniture-api-item.dto'
import {
  buildRestorationItemKey, getFurnitureIdFromRestorationKey,
  useFurnitureJoinList, getFurnitureDisplayTitle, RESTORATION_PHOTO_VARIANTS, type RestorationPhotoVariant,
} from '@/features/sectionimages/grouped'
import type { SectionItemFormValues } from '../section-item-form'
import { useUsedItemKeyIds } from '../use-used-item-key-ids'
import { RestorationFurnitureSelect } from './restoration-furniture-select'

interface RestorationItemFieldsProps {
  form: UseFormReturn<SectionItemFormValues>
  /** Campo "Sección" ya armado por el formulario padre (igual que en el formulario general). */
  sectionField: ReactNode
  isEdit: boolean
  /** Sección elegida e item que se edita (para no repetir muebles). */
  idSection: number | null | undefined
  idSectionItem: number | null | undefined
}

/** URL de la 1ª foto visible de la galería del mueble con esa variante (para la vista previa). */
function getVariantPhotoUrl(f: FurnitureJoinApiItem, variant: RestorationPhotoVariant): string | null {
  const photo = (f.gallery_images ?? []).find(
    (g) => g.furnitureimage_state === 1 && g.web?.furnitureimageweb_variant === variant && g.image,
  )
  return photo?.image ? buildImageUrl(photo.image.image_patch) : null
}

/**
 * Formulario de una tarjeta (trabajo) de Restauración (a todo el ancho).
 * Celular: 1 columna. Desde md: 2 columnas (Datos | Estado).
 */
export function RestorationItemFields({ form, sectionField, isEdit, idSection, idSectionItem }: RestorationItemFieldsProps) {
  // Muebles con su galería (se filtran en el navegador)
  const { furnitures, isLoading, isError } = useFurnitureJoinList()

  // Muebles que ya usa otro trabajo de esta sección (no se pueden repetir)
  const usedIds = useUsedItemKeyIds(idSection, idSectionItem, getFurnitureIdFromRestorationKey)

  // Mueble elegido: sale de la clave ('furniture-7' → 7; vacía → sin mueble)
  const key = form.watch('sectionitem_key')
  const selectedId = getFurnitureIdFromRestorationKey(key)
  const selected = furnitures.find((f) => f.id_furniture === selectedId) ?? null

  // Crear: si se cambia a otra sección (sale de este modo), se limpia la clave puesta aquí.
  // El nombre se deja: lo escribió el usuario.
  useEffect(() => {
    if (isEdit) return
    return () => {
      if (getFurnitureIdFromRestorationKey(form.getValues('sectionitem_key')) != null) {
        form.setValue('sectionitem_key', '')
      }
    }
  }, [isEdit])

  /** Al elegir un mueble (o "Sin mueble") se escribe la clave. Si el nombre está vacío, se sugiere el del mueble. */
  const handleFurnitureChange = (idFurniture: number | null, furniture: FurnitureJoinApiItem | null) => {
    form.setValue('sectionitem_key', idFurniture != null ? buildRestorationItemKey(idFurniture) : '', { shouldDirty: true })
    // No se pisa un nombre ya escrito
    if (furniture && !form.getValues('sectionitem_title')?.trim()) {
      form.setValue('sectionitem_title', getFurnitureDisplayTitle(furniture), { shouldDirty: true, shouldValidate: true })
    }
  }

  // Vista previa: 1ª foto Antes y 1ª Después del mueble elegido
  const previews = selected
    ? RESTORATION_PHOTO_VARIANTS.map((v) => ({ ...v, url: getVariantPhotoUrl(selected, v.value) }))
    : []

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* ── Datos de la tarjeta ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Hammer className="size-4" />Trabajo de restauración</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Tipo fijo: siempre "restoration", no se puede cambiar */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Tipo</span>
            <code className="w-fit rounded bg-muted px-2 py-1 text-xs text-muted-foreground">Trabajo de restauración</code>
          </div>

          {sectionField}

          {/* Nombre del trabajo (obligatorio): es lo que se ve en la web */}
          <FormField control={form.control} name="sectionitem_title" render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del trabajo <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} placeholder="Ej. Restauración de cómoda antigua" />
              </FormControl>
              <FormDescription>Es el nombre que se ve en la web.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          {/* Mueble relacionado (opcional) → sectionitem_key */}
          <RestorationFurnitureSelect
            furnitures={furnitures}
            isLoading={isLoading}
            isError={isError}
            usedIds={usedIds}
            value={selectedId}
            onChange={handleFurnitureChange}
          />

          {/* Vista previa de las fotos del mueble que usará la web (si el trabajo no tiene fotos propias) */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {previews.map((p) => (
                <div key={p.value} className="relative aspect-[4/3] overflow-hidden rounded-md border bg-muted/40">
                  {p.url
                    ? <img src={p.url} alt={p.label} className="h-full w-full object-cover" />
                    : <span className="flex h-full items-center justify-center text-xs text-muted-foreground">Sin foto</span>}
                  <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 text-[10px] font-medium text-white">{p.label}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Estado ── */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Activity className="size-4" />Estado</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          <FormField control={form.control} name="sectionitem_state" render={({ field }) => (
            <FormItem className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <FormLabel className="font-normal">Mostrar en el sitio web</FormLabel>
              <FormControl>
                <VisibilityToggle checked={field.value === 1} onCheckedChange={(v) => field.onChange(v ? 1 : 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <p className="text-xs text-muted-foreground">
            La web necesita una foto «Antes» y una «Después» (pestaña Imágenes). Si faltan y el trabajo tiene
            mueble relacionado, usa las del mueble; si no, la tarjeta no se muestra.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
