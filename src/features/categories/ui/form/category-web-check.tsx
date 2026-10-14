'use client'

// Atajo "Mostrar en la web" del formulario de Categoría.
// Marca/desmarca la tarjeta de la categoría en el carrusel «Muebles a medida» (página Servicios).
// El backend crea/reactiva (true) u oculta (false) esa tarjeta al guardar (campo show_on_web).

import Link from 'next/link'
import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'

interface CategoryWebCheckProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** Sección del carrusel (viene en `web.id_section`). Sin ella no se muestra el enlace. */
  idSection?: number | null
  disabled?: boolean
}

/** Checkbox "Mostrar en la web" + texto corto + enlace "Ver sección →". */
export function CategoryWebCheck({ checked, onCheckedChange, idSection, disabled = false }: CategoryWebCheckProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <Checkbox
        id="category-show-on-web"
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <div className="flex flex-col gap-1">
        <Label htmlFor="category-show-on-web" className="cursor-pointer">Mostrar en la web</Label>
        <p className="text-xs text-muted-foreground">Tarjeta en «Muebles a medida» (página Servicios).</p>
        {/* Enlace a la pestaña Categorías de esa sección (solo si el backend mandó la sección) */}
        {idSection != null && (
          <Link href={`/sections/${idSection}?tab=items`} className="w-fit text-xs font-medium text-primary hover:underline">
            Ver sección →
          </Link>
        )}
      </div>
    </div>
  )
}
