import { Skeleton } from '@/shared/ui/skeleton'

// Esqueleto mientras se genera el reporte: KPIs, gráfico y filas.
export function ReportSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-24 w-full rounded-xl' />
        ))}
      </div>
      <Skeleton className='h-64 w-full rounded-xl' />
      <div className='flex flex-col gap-2'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-9 w-full' />
        ))}
      </div>
    </div>
  )
}
