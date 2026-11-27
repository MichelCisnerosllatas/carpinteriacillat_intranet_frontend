'use client'

import { cn } from '@/shared/lib/utils'

export function BulkOption({
  onClick, disabled, icon, label, desc, danger = false,
}: {
  onClick: () => void; disabled: boolean; icon: React.ReactNode
  label: string; desc: string; danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col gap-0.5 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        danger
          ? 'hover:border-destructive hover:bg-destructive/5'
          : 'hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30'
      )}
    >
      <span className={cn('flex items-center gap-2 font-medium', danger && 'text-destructive')}>
        {icon}{label}
      </span>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </button>
  )
}
