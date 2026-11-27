'use client'

import type { LucideIcon } from 'lucide-react'

interface FormGroupTitleProps {
  icon: LucideIcon
  title: string
  /** Texto corto de ayuda debajo del título (opcional). */
  description?: string
}

/** Título pequeño de un grupo de campos del formulario (ej. "Ubicación y foto", "Textos"). */
export function FormGroupTitle({ icon: Icon, title, description }: FormGroupTitleProps) {
  return (
    <div className="flex flex-col gap-0.5 border-b pb-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4 text-muted-foreground" />
        {title}
      </h3>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}
