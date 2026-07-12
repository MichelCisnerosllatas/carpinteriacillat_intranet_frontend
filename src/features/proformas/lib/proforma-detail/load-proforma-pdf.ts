// src/features/proformas/lib/proforma-detail/load-proforma-pdf.ts
interface LoadProformaPdfDeps {
  proformaId: number
  viewPdf: (id: number) => Promise<Blob>
  onLoadingChange: (loading: boolean) => void
  onErrorChange: (hasError: boolean) => void
  onLoaded: (blob: Blob, url: string) => void
}

/** Pide el PDF real de la proforma y arma el blob URL para el visor. Sin stores/React: recibe
 * la función de servicio y los callbacks para actualizar el estado del hook que lo llama. */
export async function loadProformaPdf(deps: LoadProformaPdfDeps): Promise<void> {
  const { proformaId, viewPdf, onLoadingChange, onErrorChange, onLoaded } = deps
  onLoadingChange(true)
  onErrorChange(false)
  try {
    const blob = await viewPdf(proformaId)
    onLoaded(blob, URL.createObjectURL(blob))
  } catch {
    onErrorChange(true)
  } finally {
    onLoadingChange(false)
  }
}
