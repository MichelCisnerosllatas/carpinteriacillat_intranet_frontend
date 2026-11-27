'use client'

// SOLO para la sección hero de Servicios (service_showcase).
// Enlace guiado del botón del servicio: "¿A dónde lleva el botón?" con opciones fáciles
// + "Opciones avanzadas" para escribir el enlace a mano. Solo escribe el valor de sectionitem_link.

import { useEffect, useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { cn } from '@/shared/lib/utils'
import { useCategorySelectStore } from '@/features/categories/stores/useCategorySelectStore'
import { GALLERY_LINK, buildCategoryLink, detectLinkMode, getLinkCategory, type ShowcaseLinkMode } from './showcase-link'

interface ShowcaseLinkPickerProps {
  /** Enlace actual (valor del campo sectionitem_link). */
  value: string | undefined
  /** Guarda el nuevo enlace en el formulario ('' = sin botón). */
  onChange: (link: string) => void
}

export function ShowcaseLinkPicker({ value, onChange }: ShowcaseLinkPickerProps) {
  const id = useId()
  const link = value ?? ''

  // Categorías activas (el store las carga una sola vez; si falla, queda la lista vacía)
  const categories = useCategorySelectStore((s) => s.options)
  const loadCategories = useCategorySelectStore((s) => s.load)
  useEffect(() => { void loadCategories() }, [loadCategories])
  const categoryNames = categories.map((c) => c.category_name)

  // El admin eligió "solo una categoría" pero todavía no escogió cuál (aún no hay enlace)
  const [pickingCategory, setPickingCategory] = useState(false)
  // "Opciones avanzadas" abierto/cerrado (cerrado por defecto)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  // La opción marcada sale del enlace actual (así al editar se detecta sola)
  const detected = detectLinkMode(link, categoryNames)
  const mode: ShowcaseLinkMode = detected === 'none' && pickingCategory ? 'category' : detected
  const selectedCategory = detected === 'category' ? getLinkCategory(link.trim()) ?? '' : ''
  const isCustom = mode === 'custom'

  /** Al tocar una opción se escribe el enlace que le corresponde. */
  const handleModeChange = (next: string) => {
    setPickingCategory(next === 'category')
    if (next === 'gallery') onChange(GALLERY_LINK)
    if (next === 'category') onChange('') // sin categoría elegida aún = sin enlace
    if (next === 'none') onChange('')
  }

  /** Lo escrito a mano manda sobre las opciones de arriba. */
  const handleCustomChange = (text: string) => {
    setPickingCategory(false)
    onChange(text)
  }

  const options: { value: ShowcaseLinkMode; label: string }[] = [
    { value: 'gallery', label: 'A la galería (todos los trabajos)' },
    { value: 'category', label: 'A la galería, solo una categoría' },
    { value: 'none', label: 'Sin botón' },
  ]

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium">¿A dónde lleva el botón?</span>

      <RadioGroup value={mode} onValueChange={handleModeChange} className="gap-2">
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-2">
            <RadioGroupItem value={opt.value} id={`${id}-${opt.value}`} />
            <Label htmlFor={`${id}-${opt.value}`} className="font-normal">{opt.label}</Label>
          </div>
        ))}

        {/* Solo aparece cuando el enlace se escribió a mano */}
        {isCustom && (
          <div className="flex items-center gap-2">
            <RadioGroupItem value="custom" id={`${id}-custom`} disabled />
            <Label htmlFor={`${id}-custom`} className="font-normal">Personalizado (ver Opciones avanzadas)</Label>
          </div>
        )}
      </RadioGroup>

      {/* Opción b: elegir la categoría */}
      {mode === 'category' && (
        <Select value={selectedCategory} onValueChange={(name) => onChange(buildCategoryLink(name))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={categories.length ? 'Elige una categoría' : 'No hay categorías activas'} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id_category} value={c.category_name}>{c.category_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Enlace a mano (ej. otra página "/we"). Se abre solo si el enlace guardado es personalizado. */}
      <Collapsible open={advancedOpen || isCustom} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ChevronDown className={cn('size-3.5 transition-transform', (advancedOpen || isCustom) && 'rotate-180')} />
          Opciones avanzadas
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 flex flex-col gap-1.5">
          <Label htmlFor={`${id}-manual`} className="text-xs">Enlace escrito a mano</Label>
          <Input
            id={`${id}-manual`}
            placeholder="Ej: /we"
            maxLength={500}
            value={link}
            onChange={(e) => handleCustomChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Si escribes aquí, este enlace manda sobre las opciones de arriba.</p>
        </CollapsibleContent>
      </Collapsible>

      {/* Vista previa: siempre visible */}
      <p className="rounded-md bg-muted px-3 py-2 text-xs">
        {link.trim()
          ? <>Llevará a: <code className="font-mono">{link.trim()}</code></>
          : mode === 'category'
            ? 'Elige una categoría. Mientras tanto no se mostrará el botón.'
            : 'Sin botón: no se mostrará el botón en la web.'}
      </p>
    </div>
  )
}
