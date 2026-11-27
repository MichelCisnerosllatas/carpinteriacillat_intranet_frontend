'use client'

// Interruptor "Activada / Desactivada" de una alerta, con texto al lado para que se entienda.
// Se usa en la lista y en el formulario.

import { Switch } from '@/shared/ui/switch'
import { cn } from '@/shared/lib/utils'

interface WebAlertStateSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

export function WebAlertStateSwitch({ checked, onCheckedChange, disabled }: WebAlertStateSwitchProps) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2', disabled && 'cursor-not-allowed opacity-60')}>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="data-[state=checked]:bg-emerald-600"
      />
      <span className={cn('text-sm font-medium', checked ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground')}>
        {checked ? 'Activada' : 'Desactivada'}
      </span>
    </label>
  )
}
