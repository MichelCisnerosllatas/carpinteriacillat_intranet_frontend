'use client'

import Link from 'next/link'
import { ChevronRight, Images } from 'lucide-react'

interface FurnitureImagesBreadcrumbProps {
  currentPage?: string
  showHeader?: boolean
}

export function FurnitureImagesBreadcrumb({
  currentPage,
  showHeader = true,
}: FurnitureImagesBreadcrumbProps) {
  return (
    <div className="flex flex-col gap-1">
      {showHeader && (
        <div className="flex items-center gap-2">
          <Images className="size-5 text-muted-foreground" />
          <h2 className="text-2xl font-bold tracking-tight">Imágenes de Muebles</h2>
        </div>
      )}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Inicio
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/furniture-images" className="hover:text-foreground transition-colors">
          Imágenes de Muebles
        </Link>
        {currentPage && (
          <>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">{currentPage}</span>
          </>
        )}
      </nav>
    </div>
  )
}
