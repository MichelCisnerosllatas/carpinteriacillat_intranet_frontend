'use client'

import { Switch } from '@/shared/ui/switch'
import { cn } from '@/shared/lib/utils'

interface ChatbotOptionStateSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

/** Interruptor "Activa / Inactiva" con texto al lado (lista y formulario). */
export function ChatbotOptionStateSwitch({ checked, onCheckedChange, disabled }: ChatbotOptionStateSwitchProps) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2', disabled && 'cursor-not-allowed opacity-60')}>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="data-[state=checked]:bg-emerald-600"
      />
      <span className={cn('text-sm font-medium', checked ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground')}>
        {checked ? 'Activa' : 'Inactiva'}
      </span>
    </label>
  )
}
