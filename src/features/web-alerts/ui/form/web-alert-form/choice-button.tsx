'use client'

import { cn } from '@/shared/lib/utils'

/** Botón de opción (se ve marcado cuando está elegido). Lo usan Color, Alineación y Botón al final. */
export function ChoiceButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
        selected ? 'border-primary bg-primary/10 font-medium ring-2 ring-primary/30' : 'hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}
