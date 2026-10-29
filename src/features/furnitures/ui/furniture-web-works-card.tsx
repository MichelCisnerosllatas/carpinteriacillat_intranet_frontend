'use client'

// Tarjeta "En la galería web": trabajos (web_works) que usan este mueble.
// El mueble ya no guarda nada de la web; los trabajos se administran en Galería → Trabajos.
// Se usa en el formulario (modo editar) y en el detalle del mueble.
import Link from 'next/link'
import { Globe, Plus } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'
import type { FurnitureWebWork } from '../data/schema'

/** Nombre a mostrar de cada tipo de trabajo (claves fijas del backend). */
const TYPEWORK_LABELS: Record<string, string> = {
  manufacture: 'Fabricación',
  restoration: 'Restauración',
}

interface FurnitureWebWorksCardProps {
  furnitureId: number
  webWorks: FurnitureWebWork[]
  className?: string
}

export function FurnitureWebWorksCard({ furnitureId, webWorks, className }: FurnitureWebWorksCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Globe className="size-4 text-sky-600 dark:text-sky-400" />
          En la galería web
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {webWorks.length === 0 ? (
          <p className="text-muted-foreground">
            Ningún trabajo de la galería usa este mueble todavía.
          </p>
        ) : (
          <ul className="flex flex-col divide-y rounded-lg border">
            {webWorks.map((work) => {
              const isPublished = work.state === 1
              return (
                <li key={work.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
                  <Link
                    href={`/web-works/edit/${work.id}`}
                    className="min-w-0 flex-1 truncate font-medium text-primary hover:underline"
                  >
                    {work.title}
                  </Link>
                  {work.typeworkKey && (
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      {TYPEWORK_LABELS[work.typeworkKey] ?? work.typeworkKey}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px]',
                      isPublished
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100'
                        : 'text-muted-foreground',
                    )}
                  >
                    {isPublished ? 'Publicado' : 'Oculto'}
                  </Badge>
                </li>
              )
            })}
          </ul>
        )}
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href={`/web-works/create?id_furniture=${furnitureId}`}>
            <Plus className="mr-1.5 size-4" />
            Crear trabajo con este mueble
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
