'use client'

import { Eye } from 'lucide-react'
import { Button } from '@/shared/ui/button'

/** Tarjeta de ayuda: qué se administra y dónde, con su botón. */
export function GuideCard({ icon: Icon, title, text, action, primary = false, onClick }: {
  icon: typeof Eye; title: string; text: string; action: string; primary?: boolean; onClick: () => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <p className="flex-1 text-sm text-muted-foreground">{text}</p>
      <Button size="sm" variant={primary ? 'default' : 'outline'} className="w-fit" onClick={onClick}>
        {action}
      </Button>
    </div>
  )
}
