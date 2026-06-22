'use client'

import Link from 'next/link'
import { Rows3 } from 'lucide-react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/shared/ui/breadcrumb'
import { Button } from '@/shared/ui/button'
import NProgress from 'nprogress'
import { useRouter } from 'next/navigation'

interface SectionImagesBreadcrumbProps {
  currentPage: string
  showHeader?: boolean
}

export function SectionImagesBreadcrumb({ currentPage, showHeader = true }: SectionImagesBreadcrumbProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/">Inicio</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/section-images">Sección — Imágenes</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentPage}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rows3 className="size-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">{currentPage}</h1>
          </div>
          {currentPage !== 'Lista' && (
            <Button variant="outline" size="sm" onClick={() => { NProgress.start(); router.push('/section-images') }}>
              Volver al listado
            </Button>
          )}
          {currentPage === 'Lista' && (
            <Button size="sm" onClick={() => { NProgress.start(); router.push('/section-images/create') }}>
              Nueva asignación
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
