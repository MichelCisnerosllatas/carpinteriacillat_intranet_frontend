// src/features/sale-goals/ui/month-amount-grid.tsx
'use client'

import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { MONTH_LABELS } from '../data/data'

interface MonthAmountGridProps {
  /** Prefijo para los ids de los inputs (deben ser únicos en la página). */
  idPrefix: string
  amounts: string[]
  onChange: (monthIndex: number, value: string) => void
  disabled?: boolean
  fieldErrors?: Record<string, string[]> | null
}

/** Los 12 meses con su input de monto. Se reutiliza para la meta general y la de cada vendedor.
 * En móvil van de a 2 columnas para que los números se lean bien. */
export function MonthAmountGrid({
  idPrefix,
  amounts,
  onChange,
  disabled,
  fieldErrors,
}: MonthAmountGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {MONTH_LABELS.map((label, i) => {
        const error = fieldErrors?.[`goals.${i}.amount`]?.[0]
        return (
          <div key={label} className="flex flex-col gap-1">
            <Label htmlFor={`${idPrefix}-${i}`} className="text-xs">
              {label}
            </Label>
            <Input
              id={`${idPrefix}-${i}`}
              type="number"
              min="0"
              step="0.01"
              placeholder="Sin meta"
              className="tabular-nums"
              value={amounts[i] ?? ''}
              disabled={disabled}
              aria-invalid={Boolean(error) || undefined}
              onChange={(e) => onChange(i, e.target.value)}
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
        )
      })}
    </div>
  )
}

/** Suma de los 12 meses (vacío = 0). */
export const sumAmounts = (amounts: string[]) =>
  amounts.reduce((sum, a) => sum + (Number(a) || 0), 0)
