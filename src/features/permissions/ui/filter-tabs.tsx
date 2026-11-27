'use client'

import { cn } from '@/shared/lib/utils'
import type { AccessFilter } from '../lib/permission-tree'

type FilterTabsProps = {
  value: AccessFilter
  onChange: (value: AccessFilter) => void
}

/** Filtro: Todos / Con acceso / Sin acceso. */
export function FilterTabs({ value, onChange }: FilterTabsProps) {
  const options: { value: AccessFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'on', label: 'Con acceso' },
    { value: 'off', label: 'Sin acceso' },
  ]
  return (
    <div role="radiogroup" aria-label="Filtrar módulos" className="inline-flex w-fit rounded-lg bg-muted p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium transition-colors',
            value === option.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
