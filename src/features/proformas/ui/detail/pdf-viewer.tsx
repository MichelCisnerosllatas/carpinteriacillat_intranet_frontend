'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// pdf.js necesita `canvas`/Web Worker del navegador — sin ssr:false, Next intentaría
// renderizarlo también en el servidor (como cualquier componente 'use client' en su primer
// render) y reventaría ahí por falta de esas APIs.
export const PdfViewer = dynamic(
  () => import('@/shared/ui/pdf-viewer').then((m) => m.PdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
)
