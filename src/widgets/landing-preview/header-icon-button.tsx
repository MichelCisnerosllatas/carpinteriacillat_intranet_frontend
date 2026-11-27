'use client'

import { RotateCw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

// Botón chico e icono solo, con tooltip — todos los del header terminan usando esto, para que
// agregar uno nuevo no rompa la consistencia de tamaño/alineación.
export function HeaderIconButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  active,
  spinning,
}: {
  icon: typeof RotateCw
  label: string
  onClick?: () => void
  disabled?: boolean
  active?: boolean
  spinning?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          aria-pressed={active}
          className={cn(
            'flex size-6 items-center justify-center rounded transition-colors disabled:pointer-events-none disabled:opacity-40',
            active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Icon className={cn('size-3.5', spinning && 'animate-spin')} />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
