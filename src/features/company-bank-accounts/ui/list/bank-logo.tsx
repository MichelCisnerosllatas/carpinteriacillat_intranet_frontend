'use client'

import { Landmark } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { getImageUrl } from '@/features/images/lib/image-url'

interface BankLogoProps {
  logo?: string | null
  className?: string
}

export function BankLogo({ logo, className }: BankLogoProps) {
  if (!logo) {
    return (
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted', className)}>
        <Landmark className="size-4 text-muted-foreground" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={getImageUrl(logo)}
      alt="Logo del banco"
      className={cn('size-9 shrink-0 rounded-md border object-contain bg-background', className)}
    />
  )
}
