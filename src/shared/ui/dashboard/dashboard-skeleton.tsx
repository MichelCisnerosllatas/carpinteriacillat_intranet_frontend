import { Skeleton } from '@/shared/ui/skeleton'

// Esqueleto usado por los loading.tsx de dashboards y reportes mientras Next.js carga la página.
export function DashboardSkeleton({ kpis = 4 }: { kpis?: number }) {
  return (
    <div className='flex flex-1 flex-col gap-4 p-4'>
      <Skeleton className='h-8 w-56' />
      <Skeleton className='h-16 rounded-xl' />
      {kpis > 0 && (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {Array.from({ length: kpis }).map((_, i) => (
            <Skeleton key={i} className='h-28 rounded-xl' />
          ))}
        </div>
      )}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
        <Skeleton className='h-80 rounded-xl lg:col-span-2' />
        <Skeleton className='h-80 rounded-xl' />
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Skeleton className='h-64 rounded-xl' />
        <Skeleton className='h-64 rounded-xl' />
      </div>
    </div>
  )
}
