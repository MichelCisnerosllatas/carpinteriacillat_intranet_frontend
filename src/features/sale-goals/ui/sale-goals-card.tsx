// src/features/sale-goals/ui/sale-goals-card.tsx
'use client'

import { useEffect } from 'react'
import { Loader2, Save, Target } from 'lucide-react'
import { IconButton } from '@/shared/ui/icon-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { AlertError } from '@/widgets/alerts_components'
import { useSaleGoalStore } from '../stores/useSaleGoalStore'
import { MONTH_LABELS, SALE_GOAL_CURRENCIES, getGoalYearOptions } from '../data/data'

/**
 * Card "Metas mensuales de ventas" (vive en Configuración de Ventas). Se elige año y moneda, se
 * escribe el monto de cada mes y se guarda todo el año de una vez. Las metas alimentan el avance
 * que muestra el dashboard.
 */
export function SaleGoalsCard() {
  const { year, currency, amounts, isLoading, isSaving, error, fieldErrors, load, setAmount, save } =
    useSaleGoalStore()

  useEffect(() => {
    void load(year, currency)
  }, [])

  const total = amounts.reduce((sum, a) => sum + (Number(a) || 0), 0)

  const handleSave = async () => {
    const ok = await save()
    if (ok) toastSuccess('Metas guardadas', `Año ${year} en ${currency}.`)
    else toastError('No se pudieron guardar las metas', useSaleGoalStore.getState().error ?? '')
  }

  return (
    <Card className="mx-auto w-full max-w-3xl overflow-hidden">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Target className="size-4" />
          Metas mensuales de ventas
        </CardTitle>
        <CardDescription>
          Deja un mes vacío (o en 0) si no tiene meta. Se usan para medir el avance en el dashboard.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Año</Label>
            <Select
              value={String(year)}
              onValueChange={(v) => void load(Number(v), currency)}
              disabled={isLoading || isSaving}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getGoalYearOptions().map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Moneda</Label>
            <Select
              value={currency}
              onValueChange={(v) => void load(year, v)}
              disabled={isLoading || isSaving}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SALE_GOAL_CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isLoading && <Loader2 className="text-muted-foreground mb-2 size-4 animate-spin" />}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {MONTH_LABELS.map((label, i) => (
            <div key={label} className="flex flex-col gap-1">
              <Label htmlFor={`goal-${i}`} className="text-xs">
                {label}
              </Label>
              <Input
                id={`goal-${i}`}
                type="number"
                min="0"
                step="0.01"
                placeholder="Sin meta"
                className="tabular-nums"
                value={amounts[i]}
                disabled={isLoading || isSaving}
                aria-invalid={Boolean(fieldErrors?.[`goals.${i}.amount`]) || undefined}
                onChange={(e) => setAmount(i, e.target.value)}
              />
              {fieldErrors?.[`goals.${i}.amount`] && (
                <p className="text-destructive text-xs">{fieldErrors[`goals.${i}.amount`][0]}</p>
              )}
            </div>
          ))}
        </div>

        {error && <AlertError title="Error" message={error} />}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <span className="text-muted-foreground text-sm">
            Meta anual: <span className="text-foreground font-semibold tabular-nums">
              {currency} {total.toFixed(2)}
            </span>
          </span>
          <IconButton
            label="Guardar metas del año"
            variant="default"
            onClick={() => void handleSave()}
            disabled={isLoading || isSaving}
            icon={isSaving ? <Loader2 className="animate-spin" /> : <Save />}
          />
        </div>
      </CardContent>
    </Card>
  )
}
