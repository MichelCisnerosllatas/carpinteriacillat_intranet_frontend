'use client'

import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/shared/ui/breadcrumb'
import { BackButton } from '@/shared/ui/back-button'

interface SectionItemDetailsBreadcrumbProps {
  currentPage: string
  showHeader?: boolean
}

export function SectionItemDetailsBreadcrumb({ currentPage, showHeader = true }: SectionItemDetailsBreadcrumbProps) {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/">Inicio</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/section-item-details">Detalles de Item de Sección</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentPage}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {showHeader && (
        <div className="flex items-center gap-3">
          <BackButton fallbackHref="/section-item-details" label="Volver a detalles de item de sección" />
          <h2 className="text-xl font-semibold tracking-tight">{currentPage}</h2>
        </div>
      )}
    </div>
  )
}
