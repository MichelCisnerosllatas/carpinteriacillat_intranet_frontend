// src/features/proformas/ui/detail/proforma-detail.tsx
'use client'

import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { useProformaDetailPage } from '../../hooks'
import { ProformaDetailHero } from './proforma-detail-hero'
import { ProformaSummaryTab } from './proforma-summary-tab'
import { ProformaPdfTab } from './proforma-pdf-tab'

/**
 * Vista de solo lectura. "Resumen" (cliente, ítems, totales) es la pestaña por defecto. El PDF
 * se genera en segundo plano (ver useProformaDetailPage) para que ya esté listo si el usuario
 * decide verlo. Ninguna acción de aquí muta datos (eso vive en `proformas-row-actions.tsx`).
 */
export function ProformaDetail({ id }: { id: string }) {
  const {
    item,
    isFetching,
    activeTab,
    setActiveTab,
    pdfUrl,
    pdfLoading,
    pdfError,
    isDownloading,
    handleRefresh,
    handleDownload,
    retryPdf,
  } = useProformaDetailPage(id)

  if (!item) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
      <ProformaDetailHero item={item} isRefreshing={isFetching} onRefresh={() => void handleRefresh()} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList>
          {/* El `span` intermedio es a propósito: `TooltipTrigger asChild` pisaría el `data-state`
              que usa Tabs para marcar la pestaña activa si se compusiera directo sobre
              `TabsTrigger` (ambos primitivos de Radix escriben ese mismo atributo en el mismo
              nodo). El span absorbe el data-state del tooltip sin afectar el de Tabs — pero a
              diferencia de `display:contents`, sí debe tener tamaño real (`flex flex-1`, mismo
              que usaría el trigger), porque Tooltip posiciona su contenido según el rect de ESTE
              nodo: si no genera caja (contents), Tooltip no tiene dónde anclarse y aparece en
              cualquier lugar de la pantalla. */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex flex-1">
                <TabsTrigger value="resumen" className="w-full">Resumen</TabsTrigger>
              </span>
            </TooltipTrigger>
            <TooltipContent>Cliente, ítems y totales</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex flex-1">
                <TabsTrigger value="pdf" className="w-full">Documento PDF</TabsTrigger>
              </span>
            </TooltipTrigger>
            <TooltipContent>Vista previa del PDF real de la proforma</TooltipContent>
          </Tooltip>
        </TabsList>

        <TabsContent value="resumen">
          <ProformaSummaryTab item={item} />
        </TabsContent>

        <TabsContent value="pdf" className="flex flex-col">
          <ProformaPdfTab
            code={item.code}
            pdfUrl={pdfUrl}
            isLoading={pdfLoading}
            isError={pdfError}
            isDownloading={isDownloading}
            onRetry={retryPdf}
            onDownload={() => void handleDownload()}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
