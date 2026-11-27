'use client'

import { PanelTop } from 'lucide-react'

// Encabezado visual de cada acordeón: ícono + nombre en lenguaje simple + una línea que explica
// qué controla, para un usuario que no conoce términos como "header/body/footer".
export function AccordionSectionTitle({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof PanelTop
  title: string
  hint: string
}) {
  return (
    <span className="flex items-center gap-3 text-left">
      <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
        <Icon className="size-4" />
      </span>
      <span className="flex flex-col">
        <span>{title}</span>
        <span className="text-muted-foreground text-xs font-normal">{hint}</span>
      </span>
    </span>
  )
}
