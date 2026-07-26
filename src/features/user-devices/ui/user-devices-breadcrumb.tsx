import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

interface UserDevicesBreadcrumbProps {
  currentPage: string
  parentPage?: string
  backHref?: string
}

export function UserDevicesBreadcrumb({
  currentPage,
  parentPage,
  backHref,
}: UserDevicesBreadcrumbProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {backHref && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="size-8 shrink-0" asChild>
                <Link href={backHref}>
                  <ChevronLeft className="size-4" />
                  <span className="sr-only">Volver</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Volver a dispositivos</TooltipContent>
          </Tooltip>
        )}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {parentPage && backHref && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={backHref}>{parentPage}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h2 className="text-xl font-semibold tracking-tight">{currentPage}</h2>
    </div>
  )
}
