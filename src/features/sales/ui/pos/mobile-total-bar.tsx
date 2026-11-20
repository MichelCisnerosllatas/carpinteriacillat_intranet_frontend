// src/features/sales/ui/pos/mobile-total-bar.tsx
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { formatMoney } from '../../lib/sale-pos'

interface MobileTotalBarProps {
  total: number
  currency: string
  isSubmitting: boolean
  onEmit: () => void
}

/** Solo en pantallas chicas: el total y "Emitir" siempre a la vista, sin tener que bajar. */
export function MobileTotalBar({ total, currency, isSubmitting, onEmit }: MobileTotalBarProps) {
  return (
    <div className="bg-background fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t px-4 py-3 shadow-lg lg:hidden">
      <div className="flex flex-col">
        <span className="text-muted-foreground text-xs">Total</span>
        <span className="text-lg font-bold tabular-nums">{formatMoney(total, currency)}</span>
      </div>
      {/* Excepción aprobada: "Emitir venta" lleva texto desde sm; en móvil, solo el ícono. */}
      <Button
        type="button"
        disabled={isSubmitting}
        onClick={onEmit}
        aria-label="Emitir venta"
        className="max-sm:size-10 max-sm:px-0"
      >
        {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
        <span className="hidden sm:inline">Emitir venta</span>
      </Button>
    </div>
  )
}
