// src/features/proformas/lib/proforma-detail/download-proforma-pdf.ts
import { saveFile } from '@/shared/lib/save-file'
import { toastError } from '@/shared/lib/toast'

interface DownloadProformaPdfDeps {
  proformaId: number
  code: string
  /** Blob ya generado en segundo plano — si existe, se reutiliza en vez de pedirle al backend
   * que lo vuelva a renderizar solo para descargarlo. */
  cachedBlob: Blob | null
  downloadPdf: (id: number) => Promise<Blob>
  onDownloadingChange: (downloading: boolean) => void
}

export async function downloadProformaPdf(deps: DownloadProformaPdfDeps): Promise<void> {
  const { proformaId, code, cachedBlob, downloadPdf, onDownloadingChange } = deps
  onDownloadingChange(true)
  try {
    const blob = cachedBlob ?? (await downloadPdf(proformaId))
    await saveFile(blob, `${code}.pdf`)
  } catch {
    toastError('Error', 'No se pudo descargar el PDF.')
  } finally {
    onDownloadingChange(false)
  }
}
