'use client'

import type { LucideIcon } from 'lucide-react'

interface FormGroupTitleProps {
  icon: LucideIcon
  title: string
  /** Texto corto de ayuda debajo del título (opcional). */
  description?: string
  /** Acción opcional a la derecha del título (ej. botón "+ Agregar par"). */
  action?: React.ReactNode
}

/** Título pequeño de un grupo de campos del formulario (mismo estilo que el de Sec. Imágenes). */
export function FormGroupTitle({ icon: Icon, title, description, action }: FormGroupTitleProps) {
  return (
    <div className="flex items-start justify-between gap-2 border-b pb-2">
      <div className="flex flex-col gap-0.5">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
