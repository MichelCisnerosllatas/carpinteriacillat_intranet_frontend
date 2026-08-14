// src/features/proformas/hooks/useProformaDetailPage.ts
'use client'

import { useEffect, useRef, useState } from 'react'
import { useProformaListStore } from '../stores/useProformaListStore'
import { proformasService } from '../services/proformas.service'
import { loadProformaPdf, downloadProformaPdf, refreshProforma } from '../lib/proforma-detail'

/**
 * Solo estado de React (proforma cargada, estado del PDF, tab activo) — la lógica de negocio
 * (cuándo pedir el PDF, cómo descargarlo, cómo refrescar) vive en `lib/proforma-detail/*`.
 *
 * El PDF se pide DESPUÉS de que la cabecera termine de cargar (no en paralelo): el backend de
 * desarrollo (`php -S`) atiende una sola petición a la vez, así que lanzar ambas juntas hace que
 * compitan por el mismo worker y el PDF puede reventar por timeout en silencio. Igual se siente
 * "en segundo plano" para el usuario — no bloquea el tab Resumen.
 */
export function useProformaDetailPage(id: string) {
  const { currentItem, items, setCurrentItem, loadOne, isFetching } = useProformaListStore()
  const [activeTab, setActiveTab] = useState('resumen')

  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const pdfRequestedRef = useRef(false)

  const fetchPdf = (proformaId: number) =>
    loadProformaPdf({
      proformaId,
      viewPdf: proformasService.viewPdf,
      onLoadingChange: setPdfLoading,
      onErrorChange: setPdfError,
      onLoaded: (blob, url) => {
        setPdfBlob(blob)
        setPdfUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return url
        })
      },
    })

  // Siempre se refresca contra el backend al entrar — si el usuario acaba de agregar/editar
  // líneas de detalle desde el formulario, la copia cacheada en la lista puede estar desfasada
  // (los totales y `details[]` se recalculan en el servidor). El ítem cacheado solo se usa para
  // pintar algo de inmediato mientras llega la respuesta fresca.
  useEffect(() => {
    pdfRequestedRef.current = false
    setPdfBlob(null)
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })

    const cached = items.find((i) => String(i.id) === id)
    if (cached) setCurrentItem(cached)

    let cancelled = false
    void loadOne(Number(id)).finally(() => {
      if (!cancelled && !pdfRequestedRef.current) {
        pdfRequestedRef.current = true
        void fetchPdf(Number(id))
      }
    })
    return () => {
      cancelled = true
    }
  }, [id])

  const item = currentItem && String(currentItem.id) === id ? currentItem : null

  const handleRefresh = () => {
    if (!item) return Promise.resolve()
    return refreshProforma({
      proformaId: item.id,
      loadOne,
      onRefreshed: () => void fetchPdf(item.id),
    })
  }

  const handleDownload = () => {
    if (!item) return Promise.resolve()
    return downloadProformaPdf({
      proformaId: item.id,
      code: item.code,
      cachedBlob: pdfBlob,
      downloadPdf: proformasService.downloadPdf,
      onDownloadingChange: setIsDownloading,
    })
  }

  return {
    item,
    isFetching,
    activeTab,
    setActiveTab,
    pdfBlob,
    pdfUrl,
    pdfLoading,
    pdfError,
    isDownloading,
    handleRefresh,
    handleDownload,
    retryPdf: () => item && void fetchPdf(item.id),
  }
}
