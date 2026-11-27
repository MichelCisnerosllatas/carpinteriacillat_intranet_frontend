'use client'

import * as React from 'react'
import { Building2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

/** Logo de la empresa (Configuración de la empresa) o un ícono si no hay. */
export function CompanyLogo({ url, className }: { url: string | null | undefined; className?: string }) {
  const [failed, setFailed] = React.useState(false)

  if (url && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt="Logo de la empresa"
        onError={() => setFailed(true)}
        className={cn('size-6 shrink-0 rounded-md bg-white object-contain', className)}
      />
    )
  }

  return (
    <span
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground',
        className,
      )}
    >
      <Building2 className="size-3.5" />
    </span>
  )
}
