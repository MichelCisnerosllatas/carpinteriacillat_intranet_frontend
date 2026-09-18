import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { BackButton } from '@/shared/ui/back-button'

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
          <BackButton fallbackHref={backHref} label="Volver a dispositivos" />
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
