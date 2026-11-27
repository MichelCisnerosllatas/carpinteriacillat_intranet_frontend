// src/features/company-settings/ui/form/company-management-links-card.tsx

import { Phone as PhoneIcon, Share2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/shared/ui/card'
import { CompanySectionTitle } from './company-section-title'
import { ManagementLink } from './management-link'

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
          description="Se muestran como íconos clickeables en el footer del sitio web público — solo las que actives ahí con &quot;Mostrar en el sitio web&quot;."
          icon={<Share2 className="size-5" />}
        />
      </CardContent>
    </Card>
  )
}
