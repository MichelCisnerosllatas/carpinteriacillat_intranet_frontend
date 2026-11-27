'use client'

import { Type } from 'lucide-react'

export function SectionTitle({ icon: Icon, title }: { icon: typeof Type; title: string }) {
  return (
    <h3 className="flex items-center gap-2 border-b pb-2 text-sm font-semibold">
      <Icon className="size-4 text-muted-foreground" />{title}
    </h3>
  )
}
