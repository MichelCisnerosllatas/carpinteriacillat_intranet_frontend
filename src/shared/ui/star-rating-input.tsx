'use client'

import { Rating } from 'react-simple-star-rating'
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface StarRatingInputProps {
  value: number | null
  onChange: (value: number | null) => void
  disabled?: boolean
  /** Paso de la fracción — 0.5 habilita medias estrellas (click en la mitad del ícono). */
  allowFraction?: boolean
  className?: string
}

const RATING_LABELS = ['Muy malo', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente']

/** Redondea al entero más cercano (las medias estrellas son ajuste fino, la etiqueta solo
 * necesita 1 de 6 niveles) y cae al índice 0 si todavía no hay valoración. */
function ratingLabel(value: number | null): string {
  if (value === null) return 'Sin valorar'
  const idx = Math.min(5, Math.max(0, Math.round(value)))
  return RATING_LABELS[idx]
}

/** Envuelve `react-simple-star-rating` — 1 a 5 estrellas animadas al hover/click, con fracción
 * opcional, una etiqueta de texto (Malo/Regular/Bueno/...) y un botón para volver a "sin
 * valoración" (la librería no soporta deseleccionar). Más grandes en desktop, más chicas en
 * mobile — vía `scale` de Tailwind, sin JS, para no arriesgar un mismatch de hidratación. */
export function StarRatingInput({ value, onChange, disabled = false, allowFraction = true, className }: StarRatingInputProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {/* `key` fuerza el remount cuando el valor cambia desde afuera (ej. `form.reset()` al
          cargar un registro para editar) — la librería solo lee `initialValue` al montar. */}
      <span className="inline-flex origin-left scale-75 sm:scale-100 md:scale-125">
        <Rating
          key={value ?? 0}
          initialValue={value ?? 0}
          onClick={(v) => onChange(v)}
          allowFraction={allowFraction}
          readonly={disabled}
          size={30}
          transition
          fillColor="#fbbf24"
          emptyColor="#d4d4d8"
          SVGstorkeWidth={0}
        />
      </span>

      <span className="text-sm font-medium text-muted-foreground">{ratingLabel(value)}</span>

      {value !== null && !disabled && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-3.5" />Sin valoración
        </button>
      )}
    </div>
  )
}
