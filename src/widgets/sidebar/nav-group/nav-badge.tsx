'use client'

import { type ReactNode } from 'react'
import { Badge } from '@/shared/ui/badge'

export function NavBadge({ children }: { children: ReactNode }) {
  return <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>
}
