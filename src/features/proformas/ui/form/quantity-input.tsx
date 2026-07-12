// src/features/proformas/ui/form/quantity-input.tsx
'use client'

import { Minus, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

interface QuantityInputProps {
  value: number
  disabled?: boolean
  onChange: (value: number) => void
}

/** Cantidad de un producto del carrito — solo enteros. Botones +/- al costado, y el input
 * manual también solo acepta dígitos (sin letras ni decimales). */
export function QuantityInput({ value, disabled, onChange }: QuantityInputProps) {
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
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const digitsOnly = e.target.value.replace(/\D/g, '')
          commit(digitsOnly === '' ? 0 : Number(digitsOnly))
        }}
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
