'use client'

import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { useCan } from '@/features/auth/hooks/usePermission'

export function FurnitureImagesPrimaryButtons() {
  const router = useRouter()
  // Solo si tiene permiso de crear muebles (ver ROLES_Y_PERMISOS.md)
  const canCreate = useCan('furnitures.create')
  if (!canCreate) return null

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => {
          NProgress.start()
          router.push('/furniture-images/create')
        }}
      >
        <Plus className="mr-2 size-4" />
        Nueva asociación
      </Button>
    </div>
  )
}
