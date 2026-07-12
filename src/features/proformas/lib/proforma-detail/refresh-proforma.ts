// src/features/proformas/lib/proforma-detail/refresh-proforma.ts
import { toastSuccess } from '@/shared/lib/toast'

interface RefreshProformaDeps {
  proformaId: number
  loadOne: (id: number) => Promise<boolean>
  onRefreshed: () => void
}

/** Vuelve a pedir la proforma al backend y, si sale bien, avisa y deja que el llamador regenere
 * el PDF también (`onRefreshed`). */
export async function refreshProforma(deps: RefreshProformaDeps): Promise<void> {
  const { proformaId, loadOne, onRefreshed } = deps
  const ok = await loadOne(proformaId)
  if (ok) {
    toastSuccess('Actualizado', 'Se cargaron los datos más recientes.')
    onRefreshed()
  }
}
