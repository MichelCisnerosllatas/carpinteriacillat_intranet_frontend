import type { ReactNode } from 'react'

// Subtítulo para separar bloques dentro de una página de dashboard (ej. "Pagos pendientes").
export function DashboardSectionTitle({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <div className='mt-2'>
      <h3 className='text-lg font-semibold tracking-tight'>{title}</h3>
      {description && <p className='text-muted-foreground text-sm'>{description}</p>}
    </div>
  )
}
