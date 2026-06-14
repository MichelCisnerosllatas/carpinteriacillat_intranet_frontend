'use client'

import { ShieldPlus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'

export function RolesPrimaryButtons() {
  return (
    <div className="flex gap-2">
      <Button asChild className="space-x-1">
        <Link href="/roles/create">
          <ShieldPlus size={18} />
          <span>Nuevo Rol</span>
        </Link>
      </Button>
    </div>
  )
}
