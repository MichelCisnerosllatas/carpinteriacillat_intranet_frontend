'use client'

import { Star } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { isRoleBadgeVisible, type ImageRole, type ImageRoleKind } from '../../lib/image-roles'

// Color de cada rol: la principal resalta y las ocultas en gris (las demás no llevan badge)
const ROLE_STYLES: Record<ImageRoleKind, string> = {
  main: 'border-transparent bg-primary text-primary-foreground',
  thumb: '',
  hidden: 'border-neutral-300 bg-neutral-200 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200',
  none: '',
}

/** Badge "Principal ★" u "Oculta". Las demás fotos no llevan badge. */
export function SectionImageRoleBadge({ role, className }: { role?: ImageRole | null; className?: string }) {
  if (!role || !isRoleBadgeVisible(role)) return null
  return (
    <Badge variant="outline" className={cn('gap-1 px-1.5 py-0 text-[10px] font-medium', ROLE_STYLES[role.kind], className)}>
      {role.kind === 'main' && <Star className="size-3 fill-current" />}
      {role.label}
    </Badge>
  )
}
