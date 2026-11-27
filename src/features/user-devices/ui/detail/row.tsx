'use client'

export function Row({ label, value }: { label: string; value?: string | null | boolean }) {
  if (value === undefined || value === null || value === '') return null
  const display = typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value
  return (
    <div className="grid grid-cols-[160px_1fr] gap-x-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all font-medium text-foreground">{display}</span>
    </div>
  )
}
