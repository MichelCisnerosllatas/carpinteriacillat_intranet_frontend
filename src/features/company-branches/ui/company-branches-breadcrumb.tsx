import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/shared/ui/breadcrumb'

interface CompanyBranchesBreadcrumbProps {
  currentPage: string
  showHeader?: boolean
}

export function CompanyBranchesBreadcrumb({ currentPage, showHeader = true }: CompanyBranchesBreadcrumbProps) {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/dashboard">Inicio</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/company-branches">Sucursales</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{currentPage}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {showHeader && (
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="size-8 shrink-0" asChild>
            <Link href="/company-branches"><ChevronLeft className="size-4" /></Link>
          </Button>
          <h2 className="text-xl font-semibold tracking-tight">{currentPage}</h2>
        </div>
      )}
    </div>
  )
}
