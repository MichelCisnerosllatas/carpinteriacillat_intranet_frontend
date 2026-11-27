'use client'

import React from 'react'
import { Separator } from '@/shared/ui/separator'

// ─── Section wrapper ──────────────────────────────────────────────────────────
export function Section({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
      <Separator />
    </section>
  )
}
