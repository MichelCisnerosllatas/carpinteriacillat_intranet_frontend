'use client'

import { getInitials } from '@/shared/lib/get-initials'

export function UserAvatar({ name }: { name: string }) {
  const initials = getInitials(name)
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
      {initials || '?'}
    </div>
  )
}
