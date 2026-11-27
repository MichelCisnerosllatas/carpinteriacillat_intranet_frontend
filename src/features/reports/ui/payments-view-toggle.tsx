'use client'

import { cn } from '@/shared/lib/utils'
import { PAYMENTS_VIEWS, type PaymentsView } from '../data/reports.config'

type Props = {
  views: typeof PAYMENTS_VIEWS
  value: PaymentsView
  onChange: (view: PaymentsView) => void
}

// Toggle "Pagos recibidos / Saldos pendientes" de la pestaña Pagos.
export function PaymentsViewToggle({ views, value, onChange }: Props) {
  return (
    <div role='group' aria-label='Tipo de reporte de pagos' className='bg-muted inline-flex w-fit rounded-lg p-0.5'>
      {views.map((view) => (
        <button
          key={view.value}
          type='button'
          aria-pressed={value === view.value}
          onClick={() => onChange(view.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === view.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {view.label}
        </button>
      ))}
    </div>
  )
}
