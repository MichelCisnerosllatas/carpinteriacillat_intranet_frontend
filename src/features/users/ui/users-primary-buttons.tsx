'use client'

import { UserPlus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'

export function UsersPrimaryButtons() {
  return (
    <div className="flex gap-2">
      <Button asChild className="space-x-1">
        <Link href="/users/create">
          <UserPlus size={18} />
          <span>Nuevo Usuario</span>
        </Link>
      </Button>
    </div>
  )
}
