import { cn } from '@/shared/lib/utils'
import type { LucideIcon } from 'lucide-react'

const COLOR_CLASS = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
} as const

interface CardIconProps {
  icon: LucideIcon
  color?: keyof typeof COLOR_CLASS
  className?: string
}

/** Ícono en un chip cuadrado de color — para darle jerarquía visual a los `CardTitle` de tarjetas de detalle (ver section-detail-info-tab.tsx / section-item-detail-info-tab.tsx). Puramente decorativo, el color no tiene ningún significado semántico. */
export function CardIcon({ icon: Icon, color = 'slate', className }: CardIconProps) {
  return (
    <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-md', COLOR_CLASS[color], className)}>
      <Icon className="size-3.5" />
    </span>
  )
}
