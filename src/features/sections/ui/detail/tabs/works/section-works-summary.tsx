'use client'

// Pestaña "Trabajos" en modo 'summary' (sección «Galería», ver section-works.config.ts): la
// galería muestra TODOS los trabajos visibles, que se administran en Galería → Trabajos. Acá
// solo se resume cuántos hay (total, visibles, por tipo) y se ofrecen los dos atajos: administrar
// los trabajos y elegir qué se ve de ellos en la página (pestaña "Apariencia").
// El resumen vive en memoria (useSectionWorksStore): al volver a la pestaña se ve al instante y
// se actualiza por detrás, sin volver a mostrar la carga.

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Eye, EyeOff, Hammer, ImageIcon, LoaderCircle, Palette } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import { getTypeWorkBadge } from '@/features/web-works'
import { useSectionWorksStore } from '../../../../stores/useSectionWorksStore'
import type { SectionWorksConfig } from './section-works.config'

/** Tarjeta de ayuda: qué se administra y dónde, con su botón. */
function GuideCard({ icon: Icon, title, text, action, primary = false, onClick }: {
  icon: typeof Eye; title: string; text: string; action: string; primary?: boolean; onClick: () => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <p className="flex-1 text-sm text-muted-foreground">{text}</p>
      <Button size="sm" variant={primary ? 'default' : 'outline'} className="w-fit" onClick={onClick}>
        {action}
      </Button>
    </div>
  )
}

function StatTile({ icon: Icon, label, value, className }: { icon: typeof Eye; label: string; value: number; className?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm">
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground', className)}>
        <Icon className="size-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold tabular-nums leading-tight">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

export function SectionWorksSummary({ config, sectionId }: { config: SectionWorksConfig; sectionId: number }) {
  const router = useRouter()
  const goTo = (path: string) => { NProgress.start(); router.push(path) }

  const summary = useSectionWorksStore((s) => s.summary)
  const isError = useSectionWorksStore((s) => s.summaryError)
  const isFetching = useSectionWorksStore((s) => s.summaryFetching)
  const loadSummary = useSectionWorksStore((s) => s.loadSummary)

  // Al entrar a la pestaña: pide el resumen nuevo (en silencio si ya había uno guardado)
  useEffect(() => { void loadSummary() }, [loadSummary])

  return (
    <div className="flex flex-col gap-4">
      {/* Dónde se administra cada cosa: esta sección no tiene fotos propias */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <GuideCard
          icon={ImageIcon}
          title="Trabajos y sus fotos"
          text="Esta sección no tiene fotos propias: muestra los trabajos de la galería. Para agregar, cambiar u ocultar trabajos y sus fotos, entra a Galería → Trabajos."
          action="Ir a Galería → Trabajos"
          primary
          onClick={() => goTo('/web-works')}
        />
        <GuideCard
          icon={Palette}
          title="Qué se ve en la página"
          text="Mostrar u ocultar partes de las tarjetas, los filtros, la paginación y lo que aparece en el detalle de cada trabajo."
          action="Abrir Apariencia"
          onClick={() => goTo(`/sections/settings/${sectionId}?tab=appearance`)}
        />
      </div>

      <h3 className="flex items-center gap-2 text-sm font-medium">
        <Hammer className="size-4" />{config.title}
      </h3>

      {isError ? (
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border">
          <p className="text-sm text-muted-foreground">No se pudo cargar el resumen de trabajos.</p>
          <Button size="sm" variant="outline" disabled={isFetching} onClick={() => void loadSummary()}>Reintentar</Button>
        </div>
      ) : !summary ? (
        <div className="flex min-h-[120px] items-center justify-center">
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : summary.total === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          {config.emptyText}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatTile icon={Hammer} label="Trabajos en total" value={summary.total} />
            <StatTile icon={Eye} label="Visibles en la web" value={summary.visible} className="bg-primary/10 text-primary" />
            <StatTile icon={EyeOff} label="Ocultos" value={summary.total - summary.visible} />
          </div>

          {summary.byType.length > 0 && (
            <div className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Por tipo</span>
              {summary.byType.map((t) => (
                <div key={t.key} className="flex items-center justify-between gap-3 text-sm">
                  <Badge variant="outline" className={cn('text-xs', getTypeWorkBadge(t.key))}>{t.name}</Badge>
                  <span className="tabular-nums text-muted-foreground">
                    <span className="font-medium text-foreground">{t.visible}</span> visibles de {t.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
