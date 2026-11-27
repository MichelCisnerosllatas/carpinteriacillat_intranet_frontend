'use client'

import { UserPlus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { useCan } from '@/features/auth/hooks/usePermission'

export function UsersPrimaryButtons() {
  // Solo si tiene permiso de crear usuarios (ver ROLES_Y_PERMISOS.md)
  const canCreate = useCan('users.create')

  if (!canCreate) return null

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
