'use client'

import { Type } from 'lucide-react'
import { FieldTip } from '@/shared/ui/field-tip'

/** Título de cada tarjeta. `tip` = ayuda opcional en un ícono ⓘ (tooltip). */
export function CardTitle({ icon: Icon, title, tip }: { icon: typeof Type; title: string; tip?: string }) {
  return (
    <h3 className="flex items-center gap-2 border-b pb-2 text-sm font-semibold">
      <Icon className="size-4 text-muted-foreground" />
      {tip ? <FieldTip label={title} tip={tip} /> : title}
    </h3>
  )
}
