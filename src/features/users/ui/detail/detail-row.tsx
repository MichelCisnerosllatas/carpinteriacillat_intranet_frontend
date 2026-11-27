'use client'

export function DetailRow({
  label,
  value,
}: {
  label: React.ReactNode
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}
