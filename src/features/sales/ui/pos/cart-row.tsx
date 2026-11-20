// src/features/sales/ui/pos/cart-row.tsx
'use client'

import { Minus, Pencil, Plus, X } from 'lucide-react'
import { IconButton } from '@/shared/ui/icon-button'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { cn } from '@/shared/lib/utils'
import { calculateLine, formatMoney, type CartLine, type TaxConfig } from '../../lib/sale-pos'
import { FieldError } from './field-error'

/** Columnas del carrito en modo tabla (contenedor ≥ @xl). La cabecera usa las mismas. */
export const CART_GRID_COLS =
  '@xl:grid-cols-[minmax(0,1fr)_116px_96px_88px_96px_32px] @xl:items-center'

interface CartRowProps {
  line: CartLine
  index: number
  currency: string
  taxConfig: TaxConfig
  onChange: (patch: Partial<Omit<CartLine, 'key'>>) => void
  onRemove: () => void
  /** Enter en una celda numérica: vuelve al buscador para seguir agregando. */
  onDone: () => void
  errorFor: (key: string) => string | undefined
}

// Convierte lo escrito a número; vacío o inválido = 0 (el input muestra lo que el usuario teclea).
const toNumber = (value: string) => {
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

/** Etiqueta que solo se ve en modo tarjeta (en modo tabla la da la cabecera). */
const MobileLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-muted-foreground text-[11px] @xl:hidden">{children}</span>
)

/**
 * Una línea del carrito. Tab recorre Cant → Precio → Desc.; Supr quita la línea; Enter vuelve
 * al buscador de productos.
 * Modo tarjeta (columna angosta): descripción + X arriba, Cant/Precio/Desc en 3 columnas e
 * importe abajo. Modo tabla (≥ @xl): `@xl:contents` "aplana" los bloques internos para que cada
 * campo caiga en su columna del grid, y `@xl:order-last` manda la X al final.
 */
export function CartRow({
  line,
  index,
  currency,
  taxConfig,
  onChange,
  onRemove,
  onDone,
  errorFor,
}: CartRowProps) {
  const amounts = calculateLine(line, taxConfig)
  const isFreeLine = line.productServiceId === null
  const prefix = `details.${index}`
  const rowErrors = [
    errorFor(`${prefix}.description`),
    errorFor(`${prefix}.quantity`),
    errorFor(`${prefix}.unit_price`),
    errorFor(`${prefix}.discount`),
    errorFor(`${prefix}.unit`),
  ].filter(Boolean) as string[]

  // Atajos dentro de las celdas numéricas. En la descripción NO se usa Supr (ahí sirve para
  // borrar texto normalmente).
  const handleNumberKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey) return // Ctrl+Enter = emitir (atajo global)
    if (e.key === 'Delete') {
      e.preventDefault()
      onRemove()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      onDone()
    }
  }

  const numberInputProps = {
    type: 'number' as const,
    step: '0.01',
    min: '0',
    inputMode: 'decimal' as const,
    className: 'h-8 text-right tabular-nums',
    // Al entrar con Tab se selecciona todo: escribir reemplaza el valor directamente.
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.target.select(),
    onKeyDown: handleNumberKeys,
  }

  return (
    <div
      className={cn(
        'grid grid-cols-[minmax(0,1fr)_auto] gap-x-2 gap-y-2 p-3 @xl:gap-y-0 @xl:px-3 @xl:py-2',
        CART_GRID_COLS,
        rowErrors.length > 0 && 'bg-destructive/5'
      )}
    >
      {/* Descripción + unidad */}
      <div className="flex min-w-0 items-center gap-1">
        <Input
          value={line.description}
          data-line={line.key}
          data-field="description"
          placeholder={isFreeLine ? 'Describe el ítem libre...' : ''}
          // Solo el ítem libre entra en el recorrido con Tab (hay que escribirle descripción);
          // en los del catálogo Tab va directo a Cant. Igual se puede editar con el mouse.
          tabIndex={isFreeLine ? 0 : -1}
          className="h-8"
          aria-invalid={Boolean(errorFor(`${prefix}.description`)) || undefined}
          onChange={(e) => onChange({ description: e.target.value })}
        />
        <Popover>
          <PopoverTrigger asChild>
            {/* Solo ícono ✎: la unidad actual va en el tooltip para no ocupar espacio. */}
            <IconButton
              label={`Unidad: ${line.unit || 'sin unidad'} (editar)`}
              variant="ghost"
              tabIndex={-1}
              className="text-muted-foreground size-8 shrink-0"
              icon={<Pencil className="size-3.5" />}
            />
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3" align="end">
            <label className="text-xs font-medium" htmlFor={`unit-${line.key}`}>
              Unidad de medida
            </label>
            <Input
              id={`unit-${line.key}`}
              value={line.unit}
              maxLength={10}
              placeholder="Ej: NIU, ZZ, M2"
              className="mt-1 h-8"
              onChange={(e) => onChange({ unit: e.target.value.toUpperCase() })}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Quitar: arriba a la derecha en tarjeta, última columna en tabla. */}
      <IconButton
        label="Quitar línea (Supr)"
        variant="ghost"
        tabIndex={-1}
        className="text-muted-foreground hover:text-destructive size-8 @xl:order-last @xl:size-7"
        onClick={onRemove}
        icon={<X />}
      />

      {/* Cant / Precio / Desc: 3 columnas en tarjeta; en tabla cada uno en su columna. */}
      <div className="col-span-2 grid grid-cols-3 gap-2 @xl:contents">
        <div className="flex flex-col gap-0.5">
          <MobileLabel>Cantidad</MobileLabel>
          <div className="flex items-center gap-0.5">
            <IconButton
              label="Restar 1"
              variant="ghost"
              tabIndex={-1}
              className="size-7 shrink-0"
              disabled={line.quantity <= 1}
              onClick={() => onChange({ quantity: Math.max(1, line.quantity - 1) })}
              icon={<Minus className="size-3" />}
            />
            <Input
              {...numberInputProps}
              className="h-8 px-1 text-center tabular-nums"
              data-line={line.key}
              data-field="quantity"
              value={line.quantity}
              aria-label="Cantidad"
              aria-invalid={Boolean(errorFor(`${prefix}.quantity`)) || undefined}
              onChange={(e) => onChange({ quantity: toNumber(e.target.value) })}
            />
            <IconButton
              label="Sumar 1"
              variant="ghost"
              tabIndex={-1}
              className="size-7 shrink-0"
              onClick={() => onChange({ quantity: line.quantity + 1 })}
              icon={<Plus className="size-3" />}
            />
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <MobileLabel>P. Unit.</MobileLabel>
          <Input
            {...numberInputProps}
            value={line.unitPrice}
            aria-label="Precio unitario"
            aria-invalid={Boolean(errorFor(`${prefix}.unit_price`)) || undefined}
            onChange={(e) => onChange({ unitPrice: toNumber(e.target.value) })}
          />
        </div>

        <div className="flex flex-col gap-0.5">
          <MobileLabel>Desc.</MobileLabel>
          <Input
            {...numberInputProps}
            value={line.discount}
            aria-label="Descuento (monto)"
            aria-invalid={Boolean(errorFor(`${prefix}.discount`)) || undefined}
            onChange={(e) => onChange({ discount: toNumber(e.target.value) })}
          />
        </div>
      </div>

      {/* Importe */}
      <div className="col-span-2 flex items-center justify-between text-sm @xl:col-span-1 @xl:justify-end">
        <MobileLabel>Importe</MobileLabel>
        <span className="font-semibold tabular-nums">{formatMoney(amounts.subtotal, currency)}</span>
      </div>

      {rowErrors.length > 0 && (
        // order-last también aquí: así en tabla queda DESPUÉS de la X (que también es order-last).
        <div className="col-span-full @xl:order-last @xl:pt-1">
          <FieldError message={rowErrors[0]} />
        </div>
      )}
    </div>
  )
}
