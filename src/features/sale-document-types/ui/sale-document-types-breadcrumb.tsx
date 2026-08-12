import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/shared/ui/breadcrumb'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

interface SaleDocumentTypesBreadcrumbProps {
  currentPage: string
  showHeader?: boolean
}

export function SaleDocumentTypesBreadcrumb({ currentPage, showHeader = true }: SaleDocumentTypesBreadcrumbProps) {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/dashboard">Inicio</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/sale-document-types">Tipos de Comprobante de Venta</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{currentPage}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {showHeader && (
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="size-8 shrink-0" asChild>
                <Link href="/sale-document-types">
                  <ChevronLeft className="size-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Volver a tipos de comprobante de venta</TooltipContent>
          </Tooltip>
          <h2 className="text-xl font-semibold tracking-tight">{currentPage}</h2>
        </div>
      )}
    </div>
  )
}
