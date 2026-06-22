'use client'

import Link from 'next/link'
import { LayoutGrid } from 'lucide-react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/shared/ui/breadcrumb'
import { Button } from '@/shared/ui/button'
import NProgress from 'nprogress'
import { useRouter } from 'next/navigation'

interface SectionsBreadcrumbProps {
  currentPage: string
  showHeader?: boolean
}

export function SectionsBreadcrumb({ currentPage, showHeader = true }: SectionsBreadcrumbProps) {
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
            <BreadcrumbLink asChild><Link href="/sections">Secciones</Link></BreadcrumbLink>
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
            <LayoutGrid className="size-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">{currentPage}</h1>
          </div>
          {currentPage !== 'Lista' && (
            <Button variant="outline" size="sm" onClick={() => { NProgress.start(); router.push('/sections') }}>
              Volver al listado
            </Button>
          )}
          {currentPage === 'Lista' && (
            <Button size="sm" onClick={() => { NProgress.start(); router.push('/sections/create') }}>
              Nueva sección
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
