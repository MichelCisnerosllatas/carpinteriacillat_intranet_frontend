'use client'

export function DetailField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1 text-xs text-muted-foreground">{icon}{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
