import { useEffect, useState } from 'react'
import { proformasService } from '@/features/proformas'

// Vista previa de una plantilla YA GUARDADA (ej. el detalle): usa la URL firmada
// GET /proformas/pdf-preview-style/{templateId}/url en vez del POST con blob, porque acá
// no hay ningún formulario en edición — solo se quiere ver el estilo tal como está en BD.
export function useSavedTemplatePreview(templateId: number | null) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const refresh = async () => {
    if (templateId == null) return
    setIsLoading(true)
    try {
      const url = await proformasService.getPreviewStyleUrl(templateId)
      // Una URL vacía/undefined (respuesta inesperada del backend) no debe quedar como un
      // estado "vacío" silencioso — sin esto, TemplatePreviewCard lo confunde con "todavía no
      // hay nada que mostrar" y no aparece ni el spinner ni el error, solo un texto plano.
      if (!url) throw new Error('La URL de vista previa vino vacía.')
      setPreviewUrl(url)
      setIsError(false)
    } catch (err) {
      console.error('[preview-style] error al cargar la vista previa guardada:', err)
      setPreviewUrl(null)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [templateId])

  return { previewUrl, isLoading, isError, refresh }
}
