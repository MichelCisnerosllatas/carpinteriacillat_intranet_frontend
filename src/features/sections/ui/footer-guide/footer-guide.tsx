'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Building2, ExternalLink, Info, LayoutList, Link2, Navigation2, Share2,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { sectionsService } from '../../services/sections.service'

const SERVICES_SECTION_KEY = 'home-services'

function GuideCard({
  icon: Icon, title, description, href, external, note,
}: {
  icon: LucideIcon
  title: string
  description: string
  href?: string
  external?: boolean
  note?: string
}) {
  const content = (
    <div className="flex min-h-24 items-start gap-4 rounded-xl border bg-background p-4 transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:bg-muted/30 group-hover:shadow-md">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {note && (
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground/80">
            <Info className="size-3" />{note}
          </p>
        )}
      </div>
      {href && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:bg-primary/10 group-hover:text-primary">
          {external ? <ExternalLink className="size-4" /> : <ArrowRight className="size-4" />}
        </div>
      )}
    </div>
  )

  if (!href) return <div className="group">{content}</div>

  return (
    <Link href={href} className="group block focus-visible:outline-none">
      {content}
    </Link>
  )
}

/**
 * Punto de entrada único para "¿dónde edito el footer del sitio web?" — el footer en sí mismo
 * junta datos de varios módulos que ya existían por otras razones (facturación, contenido de
 * secciones), así que no hay una sola pantalla de edición: esto es una guía con accesos
 * directos, no un formulario. Evita duplicar inputs que ya viven en otro lado.
 */
export function FooterGuide() {
  const [servicesHref, setServicesHref] = useState<string | null>(null)
  const [servicesLoaded, setServicesLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    sectionsService.getForSelect()
      .then((res) => {
        if (cancelled || !res.success) return
        const section = res.data.find((s) => s.section_key === SERVICES_SECTION_KEY)
        if (section) setServicesHref(`/sections/${section.id_section}`)
      })
      .finally(() => { if (!cancelled) setServicesLoaded(true) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-2 rounded-lg border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          El pie de página (footer) del sitio web público se arma con datos de varios módulos del intranet — no hay
          un único formulario para editarlo todo. Cada tarjeta de abajo te lleva directo a donde se gestiona esa
          parte.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="border-b"><CardTitle className="text-base">Logo y nombre</CardTitle></CardHeader>
          <CardContent className="pt-4">
            <GuideCard
              icon={Building2}
              title="Configuración de la empresa"
              description="El logo y el nombre comercial que aparecen en el footer (y en el header) del sitio público."
              href="/company-settings"
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b"><CardTitle className="text-base">Redes sociales</CardTitle></CardHeader>
          <CardContent className="pt-4">
            <GuideCard
              icon={Share2}
              title="Redes Sociales"
              description="Los íconos clickeables del footer. Solo se muestran las que tengan &quot;Mostrar en el sitio web&quot; activo."
              href="/company-social-networks"
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b"><CardTitle className="text-base">Enlaces rápidos</CardTitle></CardHeader>
          <CardContent className="pt-4">
            <GuideCard
              icon={Navigation2}
              title="Navegaciones"
              description="La columna &quot;Enlaces Rápidos&quot; del footer usa los mismos enlaces del menú principal — no hace falta cargarlos aparte."
              href="/navigations"
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b"><CardTitle className="text-base">Servicios</CardTitle></CardHeader>
          <CardContent className="pt-4">
            {servicesHref ? (
              <GuideCard
                icon={LayoutList}
                title="Sección &quot;Servicios Destacados&quot; — Items"
                description="La columna &quot;Servicios&quot; del footer muestra los mismos items de esta sección del inicio — agregar, quitar o renombrar un item ahí también actualiza el footer."
                href={servicesHref}
              />
            ) : (
              <GuideCard
                icon={LayoutList}
                title="Sección &quot;Servicios Destacados&quot; — Items"
                description={
                  servicesLoaded
                    ? 'No se encontró esa sección todavía. Búscala en Secciones por su nombre.'
                    : 'Buscando la sección...'
                }
                href={servicesLoaded ? '/sections' : undefined}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b"><CardTitle className="text-base">Lo que no se edita desde el intranet (todavía)</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3 pt-4 text-sm">
          <div className="flex items-start gap-2">
            <Link2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <span className="font-medium">Accesos (link &quot;Intranet&quot;)</span>
              <Badge variant="outline" className="ml-2 text-[10px] font-normal">Configuración técnica</Badge>
              <p className="text-muted-foreground">Apunta a la URL del intranet según el ambiente (dev/producción) — la define el equipo técnico, no depende de ningún módulo del intranet.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Link2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <span className="font-medium">Frase debajo del logo y texto de derechos reservados</span>
              <Badge variant="outline" className="ml-2 text-[10px] font-normal">Texto fijo</Badge>
              <p className="text-muted-foreground">Todavía están escritos directamente en el sitio web (el año del copyright sí se actualiza solo). Si necesitas cambiarlos, pide soporte al equipo técnico.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
