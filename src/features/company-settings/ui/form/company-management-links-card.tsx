// src/features/company-settings/ui/form/company-management-links-card.tsx
import Link from 'next/link'
import {
  ArrowRight,
  Phone as PhoneIcon,
  Share2,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
} from '@/shared/ui/card'

import { CompanySectionTitle } from './company-section-title'

interface ManagementLinkProps {
  href: string
  title: string
  description: string
  icon: React.ReactNode
}

function ManagementLink({
  href,
  title,
  description,
  icon,
}: ManagementLinkProps) {
  return (
    <Link
      href={href}
      className="
        group flex min-h-24 items-center gap-4
        rounded-xl border bg-background p-4
        transition-all duration-300 ease-out
        hover:-translate-y-0.5
        hover:border-primary/30
        hover:bg-muted/30
        hover:shadow-md
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-ring
      "
    >
      <div
        className="
          flex size-11 shrink-0 items-center justify-center
          rounded-xl bg-muted text-muted-foreground
          transition-all duration-300
          group-hover:scale-105
          group-hover:bg-primary/10
          group-hover:text-primary
        "
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {title}
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <div
        className="
          flex size-8 shrink-0 items-center justify-center
          rounded-full text-muted-foreground
          transition-all duration-300
          group-hover:translate-x-1
          group-hover:bg-primary/10
          group-hover:text-primary
        "
      >
        <ArrowRight className="size-4" />
      </div>
    </Link>
  )
}

export function CompanyManagementLinksCard() {
  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-md">
      <CardHeader className="border-b">
        <CompanySectionTitle
          title="Contactos y presencia digital"
          help="Administra teléfonos, correos, sitio web y perfiles sociales."
        />
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ManagementLink
          href="/company-contacts"
          title="Teléfonos y correos"
          description="Gestiona los canales de contacto."
          icon={<PhoneIcon className="size-5" />}
        />

        <ManagementLink
          href="/company-social-networks"
          title="Sitio web y redes sociales"
          description="Configura enlaces web y perfiles sociales."
          icon={<Share2 className="size-5" />}
        />
      </CardContent>
    </Card>
  )
}