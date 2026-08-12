'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/shared/ui/breadcrumb'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

interface SectionsBreadcrumbProps {
  currentPage: string
  showHeader?: boolean
}

export function SectionsBreadcrumb({ currentPage, showHeader = true }: SectionsBreadcrumbProps) {
  return (
    <div className="flex flex-col gap-4">
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
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="size-8 shrink-0" asChild>
                <Link href="/sections"><ChevronLeft className="size-4" /></Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Volver a secciones</TooltipContent>
          </Tooltip>
          <h2 className="text-xl font-semibold tracking-tight">{currentPage}</h2>
        </div>
      )}
    </div>
  )
}
