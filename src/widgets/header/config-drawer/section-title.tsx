'use client'

import { RotateCcw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

// ─── Shared sub-ui ───────────────────────────────────────────────────

export function SectionTitle({
  title,
  showReset = false,
  onReset,
  resetAriaLabel,
  className,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  resetAriaLabel?: string
  className?: string
}) {
  return (
    <div className={cn('mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground', className)}>
      {title}
      {showReset && onReset && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="size-4 rounded-full"
              onClick={onReset}
              aria-label={resetAriaLabel}
            >
              <RotateCcw className="size-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{resetTooltipEs(resetAriaLabel)}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

// Maps the (English) aria-labels used across the reset buttons to Spanish
// tooltip copy without changing the underlying accessibility text.
function resetTooltipEs(resetAriaLabel?: string): string {
  switch (resetAriaLabel) {
    case 'Reset theme to default':
      return 'Restablecer tema'
    case 'Reset sidebar style to default':
      return 'Restablecer estilo de barra lateral'
    case 'Reset layout to default':
      return 'Restablecer diseño'
    case 'Reset direction':
      return 'Restablecer dirección'
    default:
      return resetAriaLabel ?? 'Restablecer'
  }
}
