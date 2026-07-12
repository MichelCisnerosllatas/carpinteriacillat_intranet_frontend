// src/features/proformas/ui/detail/proforma-pdf-tab.tsx
'use client'

import { AlertTriangle, Download, ExternalLink, FileText, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

interface ProformaPdfTabProps {
  code: string
  pdfUrl: string | null
  isLoading: boolean
  isError: boolean
  isDownloading: boolean
  onRetry: () => void
  onDownload: () => void
}

/**
 * Componente puramente presentacional — el fetch del PDF (perezoso pero automático al abrir
 * esta pestaña) lo controla `proforma-detail.tsx`, para que el estado sobreviva si el usuario
 * cambia de pestaña y vuelve (Radix desmonta el contenido inactivo, así que ese estado no
 * puede vivir aquí sin perderse).
 */
export function ProformaPdfTab({
  code,
  pdfUrl,
  isLoading,
  isError,
  isDownloading,
  onRetry,
  onDownload,
}: ProformaPdfTabProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileText className="size-4" /> Vista previa del documento
        </CardTitle>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" disabled={!pdfUrl} onClick={() => pdfUrl && window.open(pdfUrl, '_blank')}>
                <ExternalLink className="mr-1 size-4" />
                Abrir en pestaña
              </Button>
            </TooltipTrigger>
            <TooltipContent>Abrir el PDF en una pestaña nueva</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" disabled={isDownloading} onClick={onDownload}>
                {isDownloading ? <Loader2 className="mr-1 size-4 animate-spin" /> : <Download className="mr-1 size-4" />}
                Descargar
              </Button>
            </TooltipTrigger>
            <TooltipContent>Descargar el PDF (reutiliza el ya generado)</TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>


      <CardContent className="p-0">
        <div className="flex h-[calc(100dvh-200px)] min-h-[520px] items-center justify-center bg-muted/30">
          {isLoading && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
              <span className="text-sm">Generando vista previa...</span>
            </div>
          )}
          {!isLoading && isError && (
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertTriangle className="size-8 text-muted-foreground/50" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">No se pudo cargar la vista previa</p>
                <p className="text-xs text-muted-foreground">Puedes reintentar o descargar el PDF directamente.</p>
              </div>
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="mr-1 size-4" />
                Reintentar
              </Button>
            </div>
          )}
          {!isLoading && !isError && pdfUrl && (
            <iframe src={pdfUrl} title={`Proforma ${code}`} className="h-full w-full" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
