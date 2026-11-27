'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { sectionItemsService } from '@/features/section-items/services/sectionitems.service'
import type { SectionItemApiItem } from '@/features/section-items/model/sectionitemget.dto'

// El <Select> de shadcn (Radix) no acepta value="", por eso "none" representa "sin item".
const NONE = 'none'

/** Texto a mostrar de un item: título > label > key > "Item #id". */
const itemLabel = (o: SectionItemApiItem) =>
  o.sectionitem_title || o.sectionitem_label || o.sectionitem_key || `Item #${o.id_section_item}`

interface SectionImageItemSelectProps {
  /** Sección elegida en el formulario: solo se listan SUS items. */
  idSection: number | null | undefined
  value: number | null
  onValueChange: (value: number | null) => void
  disabled?: boolean
  /** true = lista también los items ocultos (ej. servicios del hero, que nacen ocultos). */
  includeHidden?: boolean
  /** Opcional: avisa el item elegido completo (o null). Ej. el carrusel usa su clave para saber la categoría. */
  onSelectedItemChange?: (item: SectionItemApiItem | null) => void
  /** Cambiarlo vuelve a pedir los items (ej. después de crear uno con el botón "+ Nuevo"). */
  reloadKey?: number
}

/**
 * Selector opcional del item de la sección al que pertenece la foto
 * (ej. en el hero de servicios, cada servicio tiene sus propias fotos).
 *
 * No se reutiliza <SectionItemSelect /> de section-items porque su store guarda las opciones
 * una sola vez (caché) y aquí la lista debe cambiar cada vez que cambia la sección.
 */
export function SectionImageItemSelect({
  idSection, value, onValueChange, disabled = false, includeHidden = false, onSelectedItemChange, reloadKey = 0,
}: SectionImageItemSelectProps) {
  const [options, setOptions] = useState<SectionItemApiItem[]>([])
  const [loading, setLoading] = useState(false)

  // Cada vez que cambia la sección (o reloadKey) se vuelven a pedir sus items
  useEffect(() => {
    if (!idSection) { setOptions([]); return }
    setLoading(true)
    // Con includeHidden se piden todos (sin filtro de estado); si no, solo los activos
    const request = includeHidden
      ? sectionItemsService.getList({ id_section: idSection, per_page: 100, page: 1 })
      : sectionItemsService.getForSelect(idSection)
    request
      .then((res) => setOptions(res.success ? res.data : []))
      .catch(() => setOptions([]))
      .finally(() => setLoading(false))
  }, [idSection, includeHidden, reloadKey])

  // Avisa el item elegido cuando cambia el valor o llegan las opciones
  // (sin onSelectedItemChange en las dependencias: el padre suele pasarlo inline)
  useEffect(() => {
    onSelectedItemChange?.(options.find((o) => o.id_section_item === value) ?? null)
  }, [value, options])

  if (loading) {
    return (
      <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Cargando items...
      </div>
    )
  }

  return (
    <Select
      value={value != null ? String(value) : NONE}
      onValueChange={(v) => {
        // Radix avisa '' cuando el valor actual todavía no está entre las opciones (ej. justo
        // después de crear un item con "+ Nuevo": el formulario ya tiene su id pero la lista
        // aún se está recargando). Si no se ignora, Number('') = 0 pisa el item recién elegido.
        if (v === '') return
        onValueChange(v === NONE ? null : Number(v))
      }}
      disabled={disabled || !idSection}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={idSection ? 'Sin item' : 'Primero elige la sección'} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>Ninguno (foto general de la sección)</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.id_section_item} value={String(o.id_section_item)}>
            {itemLabel(o)}{o.sectionitem_state !== 1 && ' (oculto)'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
