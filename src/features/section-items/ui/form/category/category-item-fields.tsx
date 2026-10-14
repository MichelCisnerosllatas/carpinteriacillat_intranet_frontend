'use client'

// SOLO para el carrusel «Muebles a medida» (category_coverflow).
// Campos del formulario de item cuando la sección es el carrusel: cada item es la tarjeta de UNA categoría.
// Solo se elige la categoría; al guardar se envían:
//   sectionitem_title = nombre de la categoría
//   sectionitem_key   = 'category-<id_category>'  (así la tarjeta sigue enlazada aunque se renombre)
//   sectionitem_type  = 'category'  (lo pone section-item-form.tsx)
// Ver features/sectionimages/grouped/README.md → "Carrusel de categorías".

import { useEffect, type ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Activity, LayoutGrid, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { VisibilityToggle } from '@/shared/ui/visibility-toggle'
import { useCategorySelectStore } from '@/features/categories/stores/useCategorySelectStore'
import { buildCategoryItemKey, getCategoryIdFromKey } from '@/features/sectionimages/grouped'
import type { SectionItemFormValues } from '../section-item-form'
import { useUsedItemKeyIds } from '../use-used-item-key-ids'

interface CategoryItemFieldsProps {
  form: UseFormReturn<SectionItemFormValues>
  /** Campo "Sección" ya armado por el formulario padre (igual que en el formulario general). */
  sectionField: ReactNode
  isEdit: boolean
  /** Sección elegida e item que se edita (para no repetir categorías). */
  idSection: number | null | undefined
  idSectionItem: number | null | undefined
}

/** Compara nombres sin importar mayúsculas ni espacios de más. */
const sameName = (a?: string | null, b?: string | null) =>
  (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase()

/**
 * Formulario de una tarjeta del carrusel de categorías (a todo el ancho).
 * Celular: 1 columna. Desde md: 2 columnas (Datos | Estado).
 */
export function CategoryItemFields({ form, sectionField, isEdit, idSection, idSectionItem }: CategoryItemFieldsProps) {
  // Categorías activas (el store las carga una sola vez)
  const categories = useCategorySelectStore((s) => s.options)
  const isLoadingCategories = useCategorySelectStore((s) => s.isLoading)
  const loadCategories = useCategorySelectStore((s) => s.load)
  useEffect(() => { void loadCategories() }, [loadCategories])

  // Categorías que ya tienen tarjeta en esta sección (no se pueden repetir)
  const usedIds = useUsedItemKeyIds(idSection, idSectionItem, getCategoryIdFromKey)

  // Categoría elegida: sale de la clave ('category-12' → 12).
  // Si la clave no trae id (items viejos), se busca por el nombre guardado.
  const key = form.watch('sectionitem_key')
  const title = form.watch('sectionitem_title')
  const idFromKey = getCategoryIdFromKey(key)
  const idFromName = idFromKey == null ? categories.find((c) => sameName(c.category_name, title))?.id_category ?? null : null
  const selectedId = idFromKey ?? idFromName

  // Al editar un item viejo (clave sin id) que coincide por nombre, se completa la clave
  useEffect(() => {
    if (idFromKey == null && idFromName != null) {
      form.setValue('sectionitem_key', buildCategoryItemKey(idFromName), { shouldDirty: true })
    }
  }, [idFromKey, idFromName])

  // Crear: si se cambia a otra sección (sale de este modo), se limpian la clave y el nombre puestos aquí
  useEffect(() => {
    if (isEdit) return
    return () => {
      if (getCategoryIdFromKey(form.getValues('sectionitem_key')) != null) {
        form.setValue('sectionitem_key', '')
        form.setValue('sectionitem_title', '')
      }
    }
  }, [isEdit])

  /** Al elegir una categoría se escriben la clave y el nombre del item. */
  const handleSelect = (value: string) => {
    const category = categories.find((c) => String(c.id_category) === value)
    if (!category) return
    form.setValue('sectionitem_key', buildCategoryItemKey(category.id_category), { shouldDirty: true, shouldValidate: true })
    form.setValue('sectionitem_title', category.category_name, { shouldDirty: true })
    form.clearErrors('sectionitem_key')
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* ── Datos de la tarjeta ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><LayoutGrid className="size-4" />Tarjeta del carrusel</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Tipo fijo: siempre "category", no se puede cambiar */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Tipo</span>
            <code className="w-fit rounded bg-muted px-2 py-1 text-xs text-muted-foreground">Categoría del carrusel</code>
          </div>

          {sectionField}

          {/* La categoría se guarda en sectionitem_key (+ el nombre en sectionitem_title) */}
          <FormField control={form.control} name="sectionitem_key" render={() => (
            <FormItem>
              <FormLabel>Categoría <span className="text-destructive">*</span></FormLabel>
              {isLoadingCategories ? (
                <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />Cargando categorías...
                </div>
              ) : (
                <Select key={`category-${selectedId ?? 'none'}`} value={selectedId != null ? String(selectedId) : undefined} onValueChange={handleSelect}>
                  <FormControl>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Elegir categoría" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((c) => {
                      // Ya tiene tarjeta en esta sección (y no es la que se edita)
                      const isUsed = usedIds.includes(c.id_category)
                      return (
                        <SelectItem key={c.id_category} value={String(c.id_category)} disabled={isUsed}>
                          {c.category_name}{isUsed && ' (ya está en el carrusel)'}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              )}
              <FormDescription>
                {isEdit && selectedId == null && title
                  ? `«${title}» no coincide con ninguna categoría activa. Elige una.`
                  : 'La tarjeta usa el nombre de la categoría y cuenta sus trabajos publicados.'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />
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
            Las fotos de la tarjeta se eligen en la pestaña Imágenes. Si no tiene, la web usa las de sus últimos trabajos.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
