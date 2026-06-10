import { Skeleton } from '@/shared/ui/skeleton'

export default function IntranetLoading() {
  return (
    <div className='flex flex-1 flex-col gap-4 p-4'>
      <Skeleton className='h-8 w-48' />
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-28 rounded-xl' />
        ))}
      </div>
      <Skeleton className='h-64 rounded-xl' />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Skeleton className='h-48 rounded-xl' />
        <Skeleton className='h-48 rounded-xl' />
      </div>
    </div>
  )
}
