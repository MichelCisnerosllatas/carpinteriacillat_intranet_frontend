import { useEffect, useState } from 'react'
import { proformasService } from '@/features/proformas'

// Vista previa de una plantilla YA GUARDADA (ej. el detalle): usa la URL firmada
// GET /proformas/preview-style/{templateId}/url en vez del POST con blob, porque acá
// no hay ningún formulario en edición — solo se quiere ver el estilo tal como está en BD.
export function useSavedTemplatePreview(templateId: number | null) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refresh = async () => {
    if (templateId == null) return
    setIsLoading(true)
    try {
      const url = await proformasService.getPreviewStyleUrl(templateId)
      setPreviewUrl(url)
    } catch (err) {
      console.error('[preview-style] error al cargar la vista previa guardada:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [templateId])

  return { previewUrl, isLoading, refresh }
}
