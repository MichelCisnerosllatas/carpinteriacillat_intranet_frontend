'use client'

// Check genérico de los "atajos" del formulario de Mueble hacia secciones de la web
// (checkbox + título + texto corto + aviso opcional + enlace "Ver sección →").
// Lo usan:
//   furniture-category-card-check.tsx    -> portada en la tarjeta de su categoría («Muebles a medida»)
//   furniture-restoration-card-check.tsx -> trabajo en «Restauración»

import Link from 'next/link'
import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'

interface FurnitureShortcutCheckProps {
  /** id del checkbox (para que el texto lo active al tocarlo). */
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** Título del check (ej. "Mostrar en «Restauración» (página Servicios)"). */
  label: string
  /** Texto corto debajo del título. */
  description: string
  /** Aviso en ámbar (ej. falta una foto). Si no viene, no se muestra. */
  warning?: string | null
  /** Enlace "Ver sección →". Si no viene, no se muestra. */
  sectionHref?: string | null
  disabled?: boolean
}

/** Checkbox + textos + enlace "Ver sección →". */
export function FurnitureShortcutCheck({
  id, checked, onCheckedChange, label, description, warning, sectionHref, disabled = false,
}: FurnitureShortcutCheckProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <div className="flex flex-col gap-1">
        <Label htmlFor={id} className="cursor-pointer">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
        {warning && <p className="text-xs text-amber-600 dark:text-amber-400">{warning}</p>}
        {sectionHref && (
          <Link href={sectionHref} className="w-fit text-xs font-medium text-primary hover:underline">
            Ver sección →
          </Link>
        )}
      </div>
    </div>
  )
}
