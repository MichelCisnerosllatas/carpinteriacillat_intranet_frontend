// src/features/proformas/ui/form/quantity-input.tsx
'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

interface QuantityInputProps {
  value: number
  disabled?: boolean
  onChange: (value: number) => void
}

/** Cantidad de un producto del carrito — solo enteros. Botones +/- al costado, y el input
 * manual también solo acepta dígitos (sin letras ni decimales).
 *
 * Mantiene un buffer de texto propio (`raw`) en vez de mostrar `value` directo: así se puede
 * borrar todo el campo y dejarlo temporalmente vacío para volver a escribir, sin que salte a "0"
 * de inmediato (antes, al borrar el último dígito, `commit(0)` actualizaba `value` a 0 y el input
 * volvía a mostrar "0" al toque). Al perder el foco se normaliza a lo que quedó guardado.
 *
 * La resincronización con `value` (ej. al usar los botones +/-, o un cambio externo) pasa durante
 * el render, no en un `useEffect` — es el propio ajuste de estado que recomienda React al derivar
 * de un prop, y evita el round-trip extra de un efecto. */
export function QuantityInput({ value, disabled, onChange }: QuantityInputProps) {
  const [raw, setRaw] = useState(String(value))
  const [syncedValue, setSyncedValue] = useState(value)

  if (value !== syncedValue) {
    setSyncedValue(value)
    setRaw(String(value))
  }

  const commit = (next: number) => onChange(Math.max(0, Math.trunc(next)))

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button" variant="outline" size="icon" className="size-8 shrink-0"
        disabled={disabled || value <= 0}
        onClick={() => commit(value - 1)}
      >
        <Minus className="size-3.5" />
      </Button>
      <Input
        type="text" inputMode="numeric" pattern="[0-9]*"
        className="text-center"
        value={raw}
        disabled={disabled}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const digitsOnly = e.target.value.replace(/\D/g, '')
          const numeric = digitsOnly === '' ? 0 : Number(digitsOnly)
          setRaw(digitsOnly)
          setSyncedValue(numeric)
          onChange(numeric)
        }}
        onBlur={() => setRaw(String(value))}
      />
      <Button
        type="button" variant="outline" size="icon" className="size-8 shrink-0"
        disabled={disabled}
        onClick={() => commit(value + 1)}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  )
}
