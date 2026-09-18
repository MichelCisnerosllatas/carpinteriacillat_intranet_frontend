// src/features/users/ui/users-breadcrumb.tsx
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

interface UsersBreadcrumbProps {
  currentPage: string
  showHeader?: boolean
  backHref?: string | null
  backLabel?: string | null
}

export function UsersBreadcrumb({
  currentPage,
  showHeader = true,
  backHref = '/users',
  backLabel = 'Volver a Usuarios',
}: UsersBreadcrumbProps) {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Inicio</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/users">Usuarios</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{currentPage}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {showHeader && (
        <div className="flex items-center gap-3">
          {backHref && (
            <BackButton fallbackHref={backHref} label={backLabel ?? 'Volver a usuarios'} />
          )}

          <h2 className="text-xl font-semibold tracking-tight">
            {currentPage}
          </h2>
        </div>
      )}
    </div>
  )
}