'use client'

import { CalendarDays, LayoutGrid, Link as LinkIcon, ListOrdered, MapPin, Star } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { CardIcon } from '@/shared/ui/card-icon'
import { Separator } from '@/shared/ui/separator'
import { FaIcon } from '@/shared/ui/icon-picker/fa-icon'
import { LocationPreviewButton } from '@/shared/ui/location-picker/location-preview-button'
import type { SectionItem } from '../../../../data/schema'

/** Tab "Info del item" del detalle de SectionItem — datos generales, contenido, ubicación y fechas. Puramente presentacional. */
export function SectionItemDetailInfoTab({ item }: { item: SectionItem }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CardIcon icon={LayoutGrid} color="blue" />Datos generales</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Sección</span>
              <Badge variant="secondary" className="text-xs font-normal">#{item.idSection}</Badge>
            </div>
            {item.key && (
              <>
                <Separator />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Clave</span>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{item.key}</code>
                </div>
              </>
            )}
            {item.variant && (
              <>
                <Separator />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Variante</span>
                  <span className="font-medium">{item.variant}</span>
                </div>
              </>
            )}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground"><ListOrdered className="size-3.5" />Orden</span>
              <span className="font-medium">{item.order ?? '—'}</span>
            </div>
          </CardContent>
        </Card>

        {item.description && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CardIcon icon={LayoutGrid} color="amber" />Descripción</CardTitle></CardHeader>
            <CardContent className="text-sm whitespace-pre-wrap text-muted-foreground">{item.description}</CardContent>
          </Card>
        )}

        {(item.latitude != null || item.longitude != null) && (
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-sm"><CardIcon icon={MapPin} color="rose" />Ubicación</CardTitle>
              {item.latitude != null && item.longitude != null && (
                <LocationPreviewButton latitude={item.latitude} longitude={item.longitude} label={item.title || item.label || undefined} />
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Latitud</span>
                <span className="font-medium">{item.latitude ?? '—'}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Longitud</span>
                <span className="font-medium">{item.longitude ?? '—'}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CardIcon icon={Star} color="purple" />Contenido</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {item.label && (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Label</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                <Separator />
              </>
            )}
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Valor</span>
              <span className="font-medium">
                {item.value != null ? `${item.value}${item.suffix ?? ''}` : '—'}
              </span>
            </div>
            {item.rating != null && (
              <>
                <Separator />
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><Star className="size-3.5" />Valoración</span>
                  <span className="font-medium">{item.rating}</span>
                </div>
              </>
            )}
            {item.icon && (
              <>
                <Separator />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Icono</span>
                  <span className="flex items-center gap-1.5">
                    <FaIcon value={item.icon} className="size-4" />
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{item.icon}</code>
                  </span>
                </div>
              </>
            )}
            {item.link && (
              <>
                <Separator />
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><LinkIcon className="size-3.5" />Enlace</span>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="max-w-[220px] truncate text-xs text-primary underline">
                    {item.link}
                  </a>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CardIcon icon={CalendarDays} color="emerald" />Registro</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Creado el</span><span className="font-medium">{item.createdAtFormatted ?? item.createdAt}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Actualizado</span><span className="font-medium">{item.updatedAtFormatted ?? item.updatedAt ?? '—'}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
