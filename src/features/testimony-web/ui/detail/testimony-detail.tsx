'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import {
  Pencil, Quote, CalendarDays, Star, Mail, MapPin, Briefcase,
  CheckCircle2, XCircle, Layers, ListOrdered,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import { getInitials } from '@/shared/lib/get-initials'
import { formatTestimonyRating } from '../../data/data'
import { useTestimonyListStore } from '../../stores/useTestimonyListStore'

export function TestimonyDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, loadById, setCurrentItem } = useTestimonyListStore()

  // Siempre trae el registro fresco del backend — no depende de que la tabla ya esté cargada en memoria.
  useEffect(() => {
    void loadById(Number(id))
    return () => setCurrentItem(null)
  }, [id])

  const item = currentItem && String(currentItem.id) === id ? currentItem : items.find((i) => String(i.id) === id) ?? null
  if (!item) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>

  const stateOpt = getStateOption(item.stateValue)

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <Avatar className="size-12 shrink-0 rounded-xl shadow-sm sm:size-14">
              <AvatarImage src={item.imageUrl} alt={item.name} />
              <AvatarFallback className="rounded-xl bg-primary/10 text-primary">{getInitials(item.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <div>
                <h2 className="text-xl font-bold leading-tight sm:text-2xl">{item.name}</h2>
                {(item.role || item.city) && (
                  <p className="text-sm text-muted-foreground">
                    {[item.role, item.city].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {item.rating != null && (
                  <Badge variant="secondary" className="w-fit gap-1 text-xs font-normal">
                    <Star className="size-3 fill-amber-400 text-amber-400" />{formatTestimonyRating(item.rating)}
                  </Badge>
                )}
                <Badge variant="outline" className={cn('w-fit text-xs', stateOpt.badge)}>{stateOpt.label}</Badge>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => { NProgress.start(); router.push(`/testimony/edit/${item.id}`) }}
          >
            <Pencil className="mr-1.5 size-4" />Editar
          </Button>
        </div>
      </div>

      <div className="grid max-w-lg grid-cols-1 gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Quote className="size-4" />Testimonio</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p className="italic text-muted-foreground">&ldquo;{item.message}&rdquo;</p>
            <Separator />
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-muted-foreground"><Mail className="size-3.5" />Correo</span>
              <span className="font-medium">{item.email ?? '—'}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="size-3.5" />Ciudad</span>
              <span className="font-medium">{item.city ?? '—'}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-muted-foreground"><Briefcase className="size-3.5" />Rol / Cargo</span>
              <span className="font-medium">{item.role ?? '—'}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Proyecto entregado</span>
              {item.isDelivered
                ? <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle2 className="size-3.5" />Sí</span>
                : <span className="flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="size-3.5" />No</span>}
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cliente verificado</span>
              {item.isVerified
                ? <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle2 className="size-3.5" />Sí</span>
                : <span className="flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="size-3.5" />No</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Layers className="size-4" />Ubicación</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Sección</span>
              <span className="font-medium">{item.sectionName ?? `Sección #${item.idSection}`}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground"><ListOrdered className="size-3.5" />Orden</span>
              <span className="font-medium">{item.order ?? '—'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CalendarDays className="size-4" />Registro</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Creado el</span><span className="font-medium">{item.createdAtFormatted ?? item.createdAt}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Actualizado</span><span className="font-medium">{(item.updatedAtFormatted ?? item.updatedAt) || '—'}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
