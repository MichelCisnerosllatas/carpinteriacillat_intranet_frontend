'use client'

import { RotateCcw } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

// ─── Sub-ui ──────────────────────────────────────────────────────────

export function SectionTitle({
  title,
  showReset,
  onReset,
  resetLabel,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  resetLabel?: string
}) {
  return (
    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
      {title}
      {showReset && onReset && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" size="icon" variant="secondary" className="size-4 rounded-full" onClick={onReset} aria-label={resetLabel}>
              <RotateCcw className="size-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{resetTooltipEs(resetLabel)}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

// Maps the (English) aria-labels used across the reset buttons to Spanish
// tooltip copy without changing the underlying accessibility text.
function resetTooltipEs(resetLabel?: string): string {
  switch (resetLabel) {
    case 'Reset theme':
      return 'Restablecer tema'
    case 'Reset sidebar':
      return 'Restablecer barra lateral'
    case 'Reset layout':
      return 'Restablecer diseño'
    case 'Reset direction':
      return 'Restablecer dirección'
    default:
      return resetLabel ?? 'Restablecer'
  }
}
