// src/shared/ui/pdf-viewer.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { AlertTriangle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'

// El worker de pdf.js corre en un Web Worker aparte — sin esto, react-pdf no puede parsear
// el PDF. Se apunta al .mjs que ya trae la propia dependencia (vía import.meta.url, que
// Next.js/Turbopack resuelve como asset estático) en vez de a un CDN, para no depender de
// red externa ni de CSP que la bloquee.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

interface PdfViewerProps {
  /** Blob ya descargado, o una URL (http(s):// firmada, o blob:) — react-pdf hace fetch()
   * internamente cuando es string, así que ambos casos funcionan igual. */
  file: Blob | string
  onLoadSuccess?: (numPages: number) => void
  onLoadError?: () => void
}

/**
 * Render del PDF con pdf.js (canvas), en vez de `<iframe src="...">`. Los navegadores de
 * escritorio traen un visor de PDF nativo que sabe pintar ese iframe, pero los navegadores
 * mobile (Safari iOS, Chrome/WebView Android) no lo tienen: ahí un iframe con un PDF (blob:
 * o URL normal) termina ofreciendo "abrir en otra app" en vez de mostrar el documento inline.
 * Renderizando el PDF nosotros mismos con canvas no dependemos del visor nativo, así que se ve
 * igual en desktop y mobile — dentro de la misma tarjeta, sin salir a otra pestaña. Compartido
 * entre `proformas` (blob ya descargado) y `proforma-templates` (blob o URL firmada) — ver
 * ambos consumidores antes de cambiar la firma de props.
 */
export function PdfViewer({ file, onLoadSuccess, onLoadError }: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [renderError, setRenderError] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Nuevo archivo (reintento / refresh / nueva vista previa) → volver a la primera página y
  // limpiar error previo. Se ajusta durante el render (no en un efecto) siguiendo el patrón de
  // React para "resetear estado cuando cambia una prop": evita el commit extra que un efecto
  // forzaría aquí.
  const [prevFile, setPrevFile] = useState(file)
  if (file !== prevFile) {
    setPrevFile(file)
    setPageNumber(1)
    setRenderError(false)
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width) setContainerWidth(width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (renderError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <AlertTriangle className="size-8 text-muted-foreground/50" />
        <p className="text-sm font-medium">No se pudo renderizar el documento</p>
        <p className="text-xs">Puedes descargarlo con el botón de arriba.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div ref={containerRef} className="flex-1 overflow-auto">
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages)
            onLoadSuccess?.(numPages)
          }}
          onLoadError={() => {
            setRenderError(true)
            onLoadError?.()
          }}
          loading={
            <div className="flex h-full min-h-[400px] items-center justify-center p-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          }
          className="flex justify-center py-4"
        >
          <Page
            pageNumber={pageNumber}
            width={containerWidth ? Math.min(containerWidth - 32, 900) : undefined}
          />
        </Document>
      </div>
      {numPages > 1 && (
        <div className="flex items-center justify-center gap-3 border-t py-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => p - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {pageNumber} de {numPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber((p) => p + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
