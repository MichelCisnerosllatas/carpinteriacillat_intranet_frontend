'use client'

import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export function FurnitureImagesPrimaryButtons() {
  const router = useRouter()

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
