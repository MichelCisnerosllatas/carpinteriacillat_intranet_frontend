'use client'

import type { ReactNode } from 'react'
import { CalendarRange, Coins } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { DATE_RANGE_PRESETS, getPresetRange, type DateRangePreset } from './date-range'
import type { Currency } from './format'

export type DashboardFiltersValue = {
  preset: DateRangePreset
  dateFrom: string
  dateTo: string
  currency: Currency
}

export const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: 'PEN', label: 'Soles (S/)' },
  { value: 'USD', label: 'Dólares (US$)' },
]

type DashboardFiltersProps = {
  value: DashboardFiltersValue
  onChange: (value: DashboardFiltersValue) => void
  showCurrency?: boolean
  /** Filtros extra (ej. cliente o estado en reportes) que se pintan en la misma fila. */
  children?: ReactNode
  /** Botones al final de la fila (ej. "Actualizar" o "Consultar"). */
  actions?: ReactNode
  className?: string
}

// Componente controlado: no guarda estado propio, solo avisa los cambios al padre.
// Así el mismo filtro sirve para los 5 dashboards (store compartido) y para los reportes.
export function DashboardFilters({
  value,
  onChange,
  showCurrency = true,
  children,
  actions,
  className,
}: DashboardFiltersProps) {
  const handlePresetChange = (preset: DateRangePreset) => {
    // "Personalizado" conserva las fechas actuales para que el usuario solo ajuste lo que quiera.
    if (preset === 'custom') {
      onChange({ ...value, preset })
      return
    }
    onChange({ ...value, preset, ...getPresetRange(preset) })
  }

  return (
    <div className={cn('bg-card flex flex-wrap items-end gap-3 rounded-xl border p-3', className)}>
      <div className='grid w-full gap-1.5 sm:w-48'>
        <Label className='text-muted-foreground flex items-center gap-1.5 text-xs'>
          <CalendarRange className='h-3.5 w-3.5' /> Periodo
        </Label>
        <Select value={value.preset} onValueChange={(v) => handlePresetChange(v as DateRangePreset)}>
          <SelectTrigger className='w-full'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {value.preset === 'custom' && (
        <>
          <div className='grid w-[calc(50%-0.375rem)] gap-1.5 sm:w-40'>
            <Label htmlFor='dashboard-date-from' className='text-muted-foreground text-xs'>
              Desde
            </Label>
            <Input
              id='dashboard-date-from'
              type='date'
              value={value.dateFrom}
              max={value.dateTo || undefined}
              onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
            />
          </div>
          <div className='grid w-[calc(50%-0.375rem)] gap-1.5 sm:w-40'>
            <Label htmlFor='dashboard-date-to' className='text-muted-foreground text-xs'>
              Hasta
            </Label>
            <Input
              id='dashboard-date-to'
              type='date'
              value={value.dateTo}
              min={value.dateFrom || undefined}
              onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
            />
          </div>
        </>
      )}

      {showCurrency && (
        <div className='grid w-full gap-1.5 sm:w-40'>
          <Label className='text-muted-foreground flex items-center gap-1.5 text-xs'>
            <Coins className='h-3.5 w-3.5' /> Moneda
          </Label>
          <Select value={value.currency} onValueChange={(v) => onChange({ ...value, currency: v as Currency })}>
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {children}

      {actions && <div className='flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto'>{actions}</div>}
    </div>
  )
}
