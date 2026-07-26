// src/features/company-settings/ui/form/company-section-title.tsx
import { Info } from 'lucide-react'

import { CardTitle } from '@/shared/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/tooltip'

interface CompanySectionTitleProps {
  title: string
  help: string
}

export function CompanySectionTitle({title, help }: CompanySectionTitleProps) {
  return (
    <div className="flex items-center">
      <CardTitle className="text-base font-semibold"> {title} </CardTitle>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Información sobre ${title}`}
            className="
              inline-flex size-6 items-center justify-center
              rounded-full text-muted-foreground
              transition-colors duration-200
              hover:bg-muted hover:text-foreground
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-ring
            "
          >
            <Info className="size-4" />
          </button>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          sideOffset={8}
          className="max-w-64 text-sm"
        >
          {help}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}