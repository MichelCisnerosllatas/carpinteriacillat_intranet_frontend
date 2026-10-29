'use client'

// Pestaña "Apariencia" de Configuración de Sección: qué MUESTRA la web pública de esta sección.
// Editor GENÉRICO: se arma solo con `display_settings_schema` (el catálogo vive en el backend,
// config/section_display/*.php) — para agregar un elemento/grupo/tipo de sección no se toca nada
// acá. Los cambios se ven al instante en la vista previa y se publican al guardar (PATCH de la
// sección con SOLO las claves que cambiaron).

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutList, Loader2, PanelTop, Search, Undo2, X } from 'lucide-react'
import { Accordion } from '@/shared/ui/accordion'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { AlertError } from '@/widgets/alerts_components'
import type { SectionDisplayPage, SectionDisplaySchemaField } from '../../model/sectionget.dto'
import type { Section } from '../../data/schema'
import { useSectionAppearanceStore } from '../../stores/useSectionAppearanceStore'
import { AppearanceGroup } from './appearance-group'
import {
  buildPatch, filterGroups, groupPage, hasDetailGroups, rawFieldValue, resolveAll, type AppearanceDraft,
} from './appearance-values'
import { useAppearancePreview } from './use-appearance-preview'

const PAGE_OPTIONS: { value: SectionDisplayPage; label: string; icon: typeof LayoutList; hint: string }[] = [
  { value: 'listing', label: 'Listado', icon: LayoutList, hint: 'La página donde está la sección' },
  { value: 'detail', label: 'Detalle', icon: PanelTop, hint: 'La página de cada trabajo' },
]

export function SectionAppearanceEditor({ id }: { id: string }) {
  const router = useRouter()
  const { section, isLoading, isSubmitting, error, fieldErrors, get, update, reset } = useSectionAppearanceStore()

  useEffect(() => { void get(Number(id)) }, [id, get])
  useEffect(() => () => reset(), [reset])

  if (isLoading && !section) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>
  if (!section) {
    return error
      ? <AlertError title="No se pudo cargar la sección" message={error} />
      : null
  }

  return (
    <AppearanceEditorBody
      section={section}
      isSubmitting={isSubmitting}
      error={error}
      fieldErrors={fieldErrors}
      onBack={() => router.push(`/sections/${id}`)}
      onSave={async (patch) => {
        const ok = await update(section.id, patch)
        // Recarga lo guardado: el borrador se limpia solo al llegar la sección nueva
        if (ok) { await swalSuccess('Apariencia guardada', section.name); void get(section.id) }
        return ok
      }}
    />
  )
}

type BodyProps = {
  section: Section
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
  onBack: () => void
  onSave: (patch: Record<string, unknown>) => Promise<boolean>
}

function AppearanceEditorBody({ section, isSubmitting, error, fieldErrors, onBack, onSave }: BodyProps) {
  const schema = section.displaySettingsSchema
  const saved = section.displaySettings

  // Borrador: se vacía cada vez que llega una sección nueva (al cargar o después de guardar)
  const [draft, setDraft] = useState<AppearanceDraft>({})
  const [draftFor, setDraftFor] = useState(section)
  if (draftFor !== section) {
    setDraftFor(section)
    setDraft({})
  }

  const hasDetail = hasDetailGroups(schema)
  const resolved = useMemo(() => resolveAll(schema, saved, draft), [schema, saved, draft])
  const patch = useMemo(() => buildPatch(schema, saved, draft), [schema, saved, draft])
  const changedKeys = useMemo(() => new Set(Object.keys(patch)), [patch])
  const fieldsByKey = useMemo(() => new Map(schema.fields.map((f) => [f.key, f])), [schema])
  const groupsByKey = useMemo(() => new Map(schema.groups.map((g) => [g.key, g])), [schema])

  const { page, changePage, detailStatus, canShowDetail, highlight } = useAppearancePreview({ section, resolved, hasDetail })

  const [query, setQuery] = useState('')
  const views = filterGroups(schema, { page, query })
  const firstKeyOf = (p: SectionDisplayPage, q: string) => {
    const first = filterGroups(schema, { page: p, query: q })[0]
    return first ? [first.group.key] : []
  }
  const [openGroups, setOpenGroups] = useState<string[]>(() => firstKeyOf('listing', ''))

  const onQueryChange = (q: string) => {
    setQuery(q)
    // Buscando, se abren todos los grupos con resultados; al limpiar, solo el primero
    setOpenGroups(q.trim() ? filterGroups(schema, { page, query: q }).map((v) => v.group.key) : firstKeyOf(page, ''))
  }

  const onPageChange = (p: SectionDisplayPage) => {
    if (p === page) return
    changePage(p)
    setOpenGroups(firstKeyOf(p, ''))
  }

  const setValue = (key: string, value: unknown) => setDraft((d) => ({ ...d, [key]: value }))
  const resetValue = (key: string) => setDraft((d) => ({ ...d, [key]: null }))

  const resetGroup = async (groupKey: string) => {
    const group = groupsByKey.get(groupKey)
    const confirmed = await swalConfirm({
      title: `¿Restablecer «${group?.label ?? 'grupo'}»?`,
      text: 'Todos los elementos de este grupo vuelven a como venían originalmente. El cambio se publica al guardar.',
      confirmText: 'Sí, restablecer',
      cancelText: 'Cancelar',
      danger: true,
    })
    if (!confirmed) return
    setDraft((d) => {
      const next = { ...d }
      for (const f of schema.fields) if (f.group === groupKey) next[f.key] = null
      return next
    })
  }

  const discard = async () => {
    const confirmed = await swalConfirm({
      title: '¿Descartar los cambios?',
      text: 'Se vuelve a lo que está publicado ahora en la web.',
      confirmText: 'Sí, descartar',
      cancelText: 'Seguir editando',
      danger: true,
    })
    if (confirmed) setDraft({})
  }

  const handleHighlight = (field: SectionDisplaySchemaField, switchPage: boolean) => {
    const group = groupsByKey.get(field.group)
    highlight(field.element, group ? groupPage(group) : 'listing', switchPage)
  }

  const changes = changedKeys.size
  const save = async () => {
    if (changes === 0) return
    const confirmed = await swalConfirm({
      title: '¿Guardar la apariencia?',
      text: `${changes} ${changes === 1 ? 'cambio' : 'cambios'} en «${section.name}». Se verán en la web pública.`,
      confirmText: 'Sí, guardar',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return
    await onSave(patch)
  }

  const detailHint = detailStatus === 'loading'
    ? 'Buscando un trabajo para mostrar…'
    : detailStatus === 'error'
      ? 'No se pudo consultar los trabajos. Recargue la página.'
      : 'No hay trabajos visibles: publique al menos uno para ver el detalle.'

  return (
    <div className="flex flex-col gap-4">
      {/* ── Barra superior: ayuda, buscador y página ── */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm sm:p-4">
        <p className="text-sm text-muted-foreground">
          Elija qué se ve de <span className="font-medium text-foreground">{section.name}</span> en la web y cómo se
          llama cada cosa. Los cambios se ven al instante en la vista previa (botón «Vista» a la derecha) y se
          publican recién al guardar. Pase el mouse por una fila para ubicarla en la página.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Buscar un elemento: precio, botón, miniaturas…"
              aria-label="Buscar un elemento"
              className="pr-8 pl-8"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                aria-label="Limpiar búsqueda"
                className="absolute top-1/2 right-2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Listado | Detalle — solo si la sección tiene página de detalle (ej. Galería) */}
          {hasDetail && (
            <div role="group" aria-label="Página que se edita" className="flex shrink-0 rounded-lg border bg-muted/40 p-0.5">
              {PAGE_OPTIONS.map((opt) => {
                const disabled = opt.value === 'detail' && !canShowDetail
                const button = (
                  <button
                    type="button"
                    onClick={() => onPageChange(opt.value)}
                    disabled={disabled}
                    aria-pressed={page === opt.value}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                      page === opt.value ? 'bg-background font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <opt.icon className="size-4" />{opt.label}
                  </button>
                )
                return (
                  <Tooltip key={opt.value}>
                    <TooltipTrigger asChild>
                      {/* span: un botón deshabilitado no dispara eventos y el tooltip no se mostraría */}
                      <span className="flex flex-1">{button}</span>
                    </TooltipTrigger>
                    <TooltipContent>{disabled ? detailHint : opt.hint}</TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          )}
        </div>
        {query && (
          <p className="text-xs text-muted-foreground">
            Buscando en todas las páginas de la sección. {views.length === 0 && `Ningún elemento coincide con «${query}».`}
          </p>
        )}
      </div>

      {/* ── Grupos ── */}
      {schema.fields.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
          Esta sección no tiene elementos para configurar.
        </div>
      ) : (
        <Accordion type="multiple" value={openGroups} onValueChange={setOpenGroups} className="flex flex-col gap-3">
          {views.map((view) => (
            <AppearanceGroup
              key={view.group.key}
              view={view}
              values={resolved}
              rawValue={(field) => rawFieldValue(field, saved, draft)}
              fieldsByKey={fieldsByKey}
              changedKeys={changedKeys}
              fieldErrors={fieldErrors}
              showPageBadge={hasDetail && !!query.trim()}
              onChange={setValue}
              onReset={resetValue}
              onResetGroup={() => void resetGroup(view.group.key)}
              onHighlight={handleHighlight}
            />
          ))}
        </Accordion>
      )}

      {error && <AlertError title="Error al guardar" message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}

      {/* ── Acciones (fijas abajo: el editor puede ser largo) ── */}
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <span className={cn('text-sm', changes ? 'font-medium text-primary' : 'text-muted-foreground')}>
          {changes ? `${changes} ${changes === 1 ? 'cambio sin guardar' : 'cambios sin guardar'}` : 'Sin cambios'}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {changes > 0 && (
            <Button type="button" variant="ghost" onClick={() => void discard()} disabled={isSubmitting}>
              <Undo2 className="mr-1.5 size-4" />Descartar
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>Volver</Button>
          <Button type="button" onClick={() => void save()} disabled={isSubmitting || changes === 0} className="min-w-28">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
