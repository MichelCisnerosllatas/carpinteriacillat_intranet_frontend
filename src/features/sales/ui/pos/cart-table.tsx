// src/features/sales/ui/pos/cart-table.tsx
'use client'

import { ShoppingCart } from 'lucide-react'
import { useSalePosStore } from '../../stores/useSalePosStore'
import type { TaxConfig } from '../../lib/sale-pos'
import { CART_GRID_COLS, CartRow } from './cart-row'
import { FieldError } from './field-error'

interface CartTableProps {
  currency: string
  taxConfig: TaxConfig
  errorFor: (key: string) => string | undefined
  /** Devuelve el foco al buscador de productos. */
  focusProductSearch: () => void
}

/**
 * Carrito en memoria. Nada se guarda hasta "Emitir venta".
 * Usa container queries (`@container` / `@xl:`): si la COLUMNA es ancha se ve como tabla; si es
 * angosta (móvil, o escritorio con el sidebar abierto) cada línea pasa a ser una tarjeta.
 */
export function CartTable({ currency, taxConfig, errorFor, focusProductSearch }: CartTableProps) {
  const { lines, updateLine, removeLine } = useSalePosStore()

  // Al quitar una línea con Supr, el foco pasa a la cantidad de la siguiente (o de la anterior);
  // si ya no quedan líneas, vuelve al buscador. Así el teclado nunca queda "perdido".
  const handleRemove = (key: string, index: number) => {
    const next = lines[index + 1] ?? lines[index - 1]
    removeLine(key)
    window.setTimeout(() => {
      const target = next
        ? document.querySelector<HTMLInputElement>(`[data-line="${next.key}"][data-field="quantity"]`)
        : null
      if (target) target.focus()
      else focusProductSearch()
    }, 0)
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed px-4 py-10 text-center">
        <ShoppingCart className="text-muted-foreground/50 mb-2 size-8" />
        <p className="text-sm font-medium">El carrito está vacío</p>
        <p className="text-muted-foreground text-xs">
          Busca un producto arriba y pulsa Enter para agregarlo.
        </p>
        <FieldError message={errorFor('details')} />
      </div>
    )
  }

  return (
    <div className="@container">
      <div className="divide-y rounded-lg border">
        <div
          className={`bg-muted/50 text-muted-foreground hidden gap-2 rounded-t-lg px-3 py-2 text-xs font-medium @xl:grid ${CART_GRID_COLS}`}
        >
          <span>Producto</span>
          <span className="text-center">Cant.</span>
          <span className="text-right">P. Unit.</span>
          <span className="text-right">Desc.</span>
          <span className="text-right">Importe</span>
          <span />
        </div>
        {lines.map((line, index) => (
          <CartRow
            key={line.key}
            line={line}
            index={index}
            currency={currency}
            taxConfig={taxConfig}
            onChange={(patch) => updateLine(line.key, patch)}
            onRemove={() => handleRemove(line.key, index)}
            onDone={focusProductSearch}
            errorFor={errorFor}
          />
        ))}
      </div>
    </div>
  )
}
