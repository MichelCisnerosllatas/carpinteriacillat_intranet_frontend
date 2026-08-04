'use client'

import Link from 'next/link'
import { RefreshCw, Upload } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import { useImageListStore } from '../../stores/useImageListStore'

export function ImagesHeaderActions() {
  const { isFetching, load } = useImageListStore()

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="icon"
        variant="outline"
        disabled={isFetching}
        onClick={() => void load({ page: 1 })}
      >
        <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} />
      </Button>
      <Button asChild className="space-x-1">
        <Link href="/images/upload"><Upload size={18} /><span>Subir</span></Link>
      </Button>
    </div>
  )
}
