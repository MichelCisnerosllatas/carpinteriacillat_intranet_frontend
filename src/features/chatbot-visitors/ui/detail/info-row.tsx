'use client'

import { Mail } from 'lucide-react'

export function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground"><Icon className="size-3.5" />{label}</span>
      <span className="min-w-0 break-words text-right font-medium">{value}</span>
    </div>
  )
}
