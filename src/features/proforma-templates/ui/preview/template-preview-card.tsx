'use client'

import { useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'

interface TemplatePreviewCardProps {
  previewUrl: string | null
  isLoading: boolean
  onRefresh: () => void
  emptyMessage?: string
}

// Componente reutilizable: se usa tanto en el formulario de edición (preview en vivo,
// sin guardar) como en el detalle (preview de una plantilla ya guardada) — ambos casos
// solo necesitan mostrar una URL de PDF dentro de un iframe con un botón de refrescar.
export function TemplatePreviewCard({
  previewUrl,
  isLoading,
  onRefresh,
  emptyMessage,
}: TemplatePreviewCardProps) {
  // El PDF real puede tardar en renderizarse DENTRO del iframe (es una navegación aparte
  // del navegador, no la request que trae la URL/blob) — sin esto se ve en blanco un buen
  // rato aunque `isLoading` ya haya terminado.
  const [isRendering, setIsRendering] = useState(false)

  useEffect(() => {
    if (previewUrl) setIsRendering(true)
  }, [previewUrl])

  const showOverlay = isLoading || isRendering

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Vista previa</CardTitle>
        <Button type="button" variant="ghost" size="sm" disabled={isLoading} onClick={onRefresh}>
          <RefreshCw className={isLoading ? 'size-3.5 animate-spin' : 'size-3.5'} />
        </Button>
      </CardHeader>
      <CardContent>
        {!previewUrl && !isLoading ? (
          <p className="text-muted-foreground text-sm">
            {emptyMessage ?? 'No se pudo cargar la vista previa.'}
          </p>
        ) : (
          <div className="relative h-[500px] w-full overflow-hidden rounded-md border">
            {previewUrl && (
              <iframe
                src={previewUrl}
                onLoad={() => setIsRendering(false)}
                className="h-full w-full"
                title="Vista previa de la plantilla"
              />
            )}
            <div
              className={cn(
                'bg-background/90 absolute inset-0 flex flex-col items-center justify-center gap-2 transition-opacity',
                showOverlay ? 'opacity-100' : 'pointer-events-none opacity-0'
              )}
            >
              <Loader2 className="text-primary size-8 animate-spin" />
              <p className="text-muted-foreground text-sm font-medium">Generando PDF...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
