'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/ui/button'

/**
 * Botón "Volver atrás" con texto (para páginas de error).
 * Si no hay página anterior (se abrió el enlace directo), lleva a `fallbackHref`.
 */
export function GoBackButton({ fallbackHref = '/' }: { fallbackHref?: string }) {
  const router = useRouter()

  const handleClick = () => {
    if (window.history.length > 1) router.back()
    else router.push(fallbackHref)
  }

  return (
    <Button variant="outline" onClick={handleClick}>
      <ArrowLeft className="mr-2 size-4" />
      Volver atrás
    </Button>
  )
}
