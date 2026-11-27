'use client'

export function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1 text-right text-xs font-medium break-all">
        {icon}{value}
      </span>
    </div>
  )
}
