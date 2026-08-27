// src/features/proformas/ui/form/unit-price-input.tsx
'use client'

import { useState } from 'react'
import { Input } from '@/shared/ui/input'

interface UnitPriceInputProps {
  value: number
  disabled?: boolean
  onChange: (value: number) => void
}

/**
 * Input de precio unitario con un buffer de texto propio — a diferencia de un `<Input
 * type="number" value={number}>` directo, deja al usuario borrar todo el campo y dejarlo
 * temporalmente vacío (o a mitad de escribir un decimal, ej. "12.") sin que salte a "0" de
 * inmediato. Eso pasaba antes: `Number('')` es `0`, así que al borrar el último dígito el valor
 * volvía a mostrarse como "0" al toque, imposible de dejar en blanco para volver a escribir.
 * Al perder el foco, se normaliza a lo que realmente quedó guardado (si quedó vacío, vuelve a
 * mostrar "0").
 *
 * La resincronización con `value` (cuando cambia desde afuera, ej. autocompletar por producto
 * elegido) pasa durante el render, no en un `useEffect` — es el propio ajuste de estado que
 * recomienda React al derivar de un prop, y evita el round-trip extra de un efecto.
 */
export function UnitPriceInput({ value, disabled, onChange }: UnitPriceInputProps) {
  const [raw, setRaw] = useState(String(value))
  const [syncedValue, setSyncedValue] = useState(value)

  if (value !== syncedValue) {
    setSyncedValue(value)
    setRaw(String(value))
  }

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={raw}
      disabled={disabled}
      onFocus={(e) => e.target.select()}
      onChange={(e) => {
        const next = e.target.value
        if (!/^\d*\.?\d{0,2}$/.test(next)) return // solo dígitos y un punto, hasta 2 decimales
        const numeric = next === '' || next === '.' ? 0 : Number(next)
        setRaw(next)
        setSyncedValue(numeric)
        onChange(numeric)
      }}
      onBlur={() => setRaw(String(value))}
    />
  )
}
