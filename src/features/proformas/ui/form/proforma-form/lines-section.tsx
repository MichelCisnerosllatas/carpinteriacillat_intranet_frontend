// src/features/proformas/ui/form/proforma-form/lines-section.tsx
'use client'

import { Info } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { ProformaDetailLines } from '../proforma-detail-lines'

interface LinesSectionProps {
  proformaId: number | null
  currency: string
  onCountChange: (count: number) => void
  /** true cuando se intentó registrar/guardar con el carrito vacío. */
  cartError?: boolean
}

/** Card "Carrito" — envuelve el carrito de productos/servicios de la proforma. */
export function LinesSection({ proformaId, currency, onCountChange, cartError }: LinesSectionProps) {
  return (
    <Card className={cn(cartError && 'border-destructive/50')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          Productos/Servicios
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              Puedes ir agregando productos ya mismo — se guardan solos en cuanto registres la proforma.
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ProformaDetailLines proformaId={proformaId} currency={currency} onCountChange={onCountChange} cartError={cartError} />
      </CardContent>
    </Card>
  )
}
