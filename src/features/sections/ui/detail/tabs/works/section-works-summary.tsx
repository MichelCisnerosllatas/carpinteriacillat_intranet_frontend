'use client'

// Pestaña "Trabajos" en modo 'summary' (sección «Galería», ver section-works.config.ts): la
// galería muestra TODOS los trabajos visibles, que se administran en Galería → Trabajos. Acá
// solo se resume cuántos hay (total, visibles, por tipo) y se ofrecen los dos atajos: administrar
// los trabajos y elegir qué se ve de ellos en la página (pestaña "Apariencia").

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Eye, EyeOff, Hammer, LoaderCircle, Palette, Settings2 } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import { getTypeWorkBadge, webWorksService } from '@/features/web-works'
import { typeworksService } from '@/features/typeworks'
import type { SectionWorksConfig } from './section-works.config'

type TypeCount = { key: string; name: string; total: number; visible: number }
type Summary = { total: number; visible: number; byType: TypeCount[] }

/** Cuántos trabajos cumplen el filtro (solo se pide 1 por página: alcanza con `meta.total`). */
async function countWorks(filters: { state?: number; typework_key?: string }): Promise<number> {
  const res = await webWorksService.getList({ page: 1, per_page: 1, ...filters })
  if (!res.success) throw new Error(res.message)
  return res.meta?.total ?? res.data.length
}

async function loadSummary(): Promise<Summary> {
  const types = await typeworksService.getForSelect()
  const [total, visible, byType] = await Promise.all([
    countWorks({}),
    countWorks({ state: 1 }),
    Promise.all((types.success ? types.data : []).map(async (t) => ({
      key: t.typework_key,
      name: t.typework_name,
      total: await countWorks({ typework_key: t.typework_key }),
      visible: await countWorks({ typework_key: t.typework_key, state: 1 }),
    }))),
  ])
  return { total, visible, byType }
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

  const [summary, setSummary] = useState<Summary | null>(null)
  const [isError, setIsError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    loadSummary()
      .then((data) => { if (!cancelled) { setSummary(data); setIsError(false) } })
      .catch(() => { if (!cancelled) setIsError(true) })
    return () => { cancelled = true }
  }, [reloadKey])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Hammer className="size-4" />{config.title}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => goTo(`/sections/settings/${sectionId}?tab=appearance`)}>
            <Palette className="mr-1.5 size-4" />Qué se ve en la página
          </Button>
          <Button size="sm" onClick={() => goTo('/web-works')}>
            <Settings2 className="mr-1.5 size-4" />Administrar trabajos
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {config.description} Los trabajos se crean, editan, ocultan y ordenan en Galería → Trabajos; aquí solo
        ve el resumen.
      </p>

      {isError ? (
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border">
          <p className="text-sm text-muted-foreground">No se pudo cargar el resumen de trabajos.</p>
          <Button size="sm" variant="outline" onClick={() => { setIsError(false); setSummary(null); setReloadKey((k) => k + 1) }}>Reintentar</Button>
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
