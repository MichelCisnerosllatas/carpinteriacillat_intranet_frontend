import { AlertCircle, FileSearch } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

// Aviso compacto (sin datos o error): no ocupa media pantalla.
export function ReportMessage({ text, error = false }: { text: string; error?: boolean }) {
  const Icon = error ? AlertCircle : FileSearch
  return (
    <div className='flex items-center gap-3 rounded-xl border border-dashed p-4'>
      <Icon className={cn('h-5 w-5 shrink-0', error ? 'text-destructive' : 'text-muted-foreground/70')} />
      <p className='text-muted-foreground text-sm'>{text}</p>
    </div>
  )
}
