'use client'

// Vista previa de la pestaña "Apariencia": manda la sección con `fields.display_settings`
// resuelto, cambia la página del preview (Listado | Detalle) y resalta elementos.
//
// Mismo criterio que `useLiveSitePreview` (debounce de 600 ms, primer envío cuando `ready` pasa
// a true) pero sobre estado propio y no sobre un form de react-hook-form: las claves del
// catálogo llevan punto ("card.show_price") y react-hook-form las interpretaría como rutas
// anidadas ("card" → "show_price").

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePreviewStore } from '@/shared/stores/preview-store'
import type { PreviewPayload } from '@/widgets/landing-preview/landing-preview.types'
import { webWorksService } from '@/features/web-works'
import type { SectionDisplayPage } from '../../model/sectionget.dto'
import type { Section } from '../../data/schema'

const DEBOUNCE_MS = 600
// Tiempo entre el `focus` (cambio de página) y lo que va después: el iframe solo reenvía el
// ÚLTIMO mensaje del store, así que si se mandaran juntos el focus se perdería.
const AFTER_FOCUS_MS = 250
// Lo que tarda la web en montar la otra página antes de poder resaltar algo en ella.
const AFTER_PAGE_CHANGE_MS = 1000
// Página de detalle de un trabajo en la web pública (contrato §6).
const WORK_DETAIL_BASE = '/gallery'

export type DetailTargetStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

type Options = {
  section: Section | null
  /** { clave: valor } completo y resuelto (ver `resolveAll`). */
  resolved: Record<string, unknown>
  /** La sección tiene grupos de la página de detalle (selector Listado | Detalle). */
  hasDetail: boolean
}

export function useAppearancePreview({ section, resolved, hasDetail }: Options) {
  const postPreview = usePreviewStore((s) => s.postPreview)
  const postFocus = usePreviewStore((s) => s.postFocus)
  const postHighlight = usePreviewStore((s) => s.postHighlight)
  const isPanelOpen = usePreviewStore((s) => s.isOpen)
  const setPanelOpen = usePreviewStore((s) => s.setOpen)

  const [page, setPage] = useState<SectionDisplayPage>('listing')
  const [detailUrl, setDetailUrl] = useState<string | null>(null)
  const [detailStatus, setDetailStatus] = useState<DetailTargetStatus>('idle')

  const sectionId = section?.id ?? null
  const ready = section !== null

  // Payload de la sección. title/subtitle/description viajan en null si su interruptor del
  // grupo "Encabezado" está apagado (mismo comportamiento que el backend en la web real).
  const buildPayload = useCallback((): PreviewPayload | null => {
    if (!section) return null
    const show = (key: string) => resolved[key] !== false
    return {
      entity: 'section',
      id: section.id,
      id_navigation: section.idNavigation ?? undefined,
      fields: {
        section_title: show('header.show_title') ? section.title : null,
        section_subtitle: show('header.show_subtitle') ? section.subtitle : null,
        section_description: show('header.show_description') ? section.description : null,
        display_settings: resolved,
      },
    }
  }, [section, resolved])

  // Siempre la versión más nueva para los timers (se actualiza en un efecto, no en el render).
  const buildPayloadRef = useRef(buildPayload)
  useEffect(() => {
    buildPayloadRef.current = buildPayload
  })

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms))
  }, [])
  useEffect(() => () => timersRef.current.forEach(clearTimeout), [])

  const sendPayload = useCallback(() => {
    const payload = buildPayloadRef.current()
    if (payload) postPreview(payload)
  }, [postPreview])

  // Primer trabajo visible: a él va la vista previa en "Detalle".
  useEffect(() => {
    if (!hasDetail) return
    let cancelled = false
    webWorksService.getList({ page: 1, per_page: 1, state: 1 })
      .then((res) => {
        if (cancelled) return
        const first = res.success ? res.data[0] : undefined
        setDetailUrl(first ? `${WORK_DETAIL_BASE}/${first.id_web_work}` : null)
        setDetailStatus(first ? 'ready' : 'empty')
      })
      .catch(() => { if (!cancelled) setDetailStatus('error') })
    return () => { cancelled = true }
  }, [hasDetail])

  const focusPage = useCallback((target: SectionDisplayPage) => {
    if (!section) return
    const url = target === 'detail' ? detailUrl : section.navigationUrl
    postFocus({
      navigationUrl: url ?? undefined,
      label: `${section.name} · ${target === 'detail' ? 'Detalle' : 'Listado'}`,
    })
    // Después del cambio de página, el borrador vuelve a aplicarse (la web no cambia de página
    // porque la montada ya pertenece a la navegación de la sección).
    later(sendPayload, AFTER_FOCUS_MS)
  }, [section, detailUrl, postFocus, later, sendPayload])

  /** Cambia la página del selector Listado | Detalle y la del preview. */
  const changePage = useCallback((target: SectionDisplayPage) => {
    if (target === 'detail' && !detailUrl) return
    setPage(target)
    focusPage(target)
  }, [detailUrl, focusPage])

  // Primer envío al cargar la sección. Con selector, primero se lleva el preview al listado: si
  // estaba en el detalle de un trabajo, el payload solo no lo movería y el selector mentiría.
  useEffect(() => {
    if (!ready) return
    if (hasDetail) focusPage('listing')
    else sendPayload()
    // Solo cuando cambia la sección cargada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, ready])

  // En cada cambio del borrador (debounced).
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isFirstResolvedRef = useRef(true)
  useEffect(() => {
    if (!ready) return
    // El primer valor ya lo mandó el efecto de arriba.
    if (isFirstResolvedRef.current) { isFirstResolvedRef.current = false; return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(sendPayload, DEBOUNCE_MS)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [resolved, ready, sendPayload])

  /**
   * Resalta un elemento en la vista previa. `switchPage` (botón «Ubicar en la vista previa»): si el grupo
   * es de la otra página, primero la cambia y abre el panel si estaba cerrado. Sin `switchPage`
   * (pasar el mouse por la fila) solo resalta si ya se está viendo esa página.
   */
  const highlight = useCallback((element: string | null, elementPage: SectionDisplayPage, switchPage = false) => {
    if (!element) return
    // Con el id de la sección la web busca el elemento dentro de ELLA y no el primero de la
    // página (ej. "header-subtitle" del Hero, arriba de todo en Servicios).
    const post = () => postHighlight(element, sectionId)
    const samePage = !hasDetail || elementPage === page
    if (!switchPage) {
      if (samePage) post()
      return
    }
    if (!isPanelOpen) setPanelOpen(true)
    if (samePage) {
      post()
      return
    }
    if (elementPage === 'detail' && !detailUrl) return
    changePage(elementPage)
    later(post, AFTER_PAGE_CHANGE_MS)
  }, [hasDetail, page, isPanelOpen, setPanelOpen, postHighlight, sectionId, detailUrl, changePage, later])

  // 'idle' con detalle = todavía no volvió la consulta del primer trabajo.
  const status: DetailTargetStatus = hasDetail && detailStatus === 'idle' ? 'loading' : detailStatus

  return { page, changePage, detailStatus: status, canShowDetail: detailUrl !== null, highlight }
}
