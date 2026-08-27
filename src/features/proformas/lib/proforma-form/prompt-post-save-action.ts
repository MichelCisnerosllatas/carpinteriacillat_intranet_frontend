// src/features/proformas/lib/proforma-form/prompt-post-save-action.ts
import { baseSwal } from '@/shared/lib/swal'
import { saveFile } from '@/shared/lib/save-file'
import { toastError } from '@/shared/lib/toast'
import { proformasService } from '../../services/proformas.service'

interface PromptPostSaveActionDeps {
  /** Navega al detalle de la proforma recién guardada — solo si el usuario elige "Ver detalle". */
  goToDetail: (id: number) => void
  /** Navega al listado — es el destino por defecto: al descargar el PDF, al cerrar el modal
   * (botón "Cerrar" o click afuera), y también si la descarga falla. */
  goToList: () => void
}

/**
 * Se dispara justo cuando `submitProformaHeader` termina con éxito (ver el `onSubmit` de
 * `useProformaForm.ts`) — TODAVÍA no se navegó a ningún lado, así que este modal es el primer
 * paso post-guardado, no algo que aparece encima del listado ya cargado. Según la respuesta,
 * `useProformaForm.ts` navega una sola vez, al destino que corresponda:
 *   - "Descargar PDF" → descarga y va al listado.
 *   - "Ver detalle"   → va directo al detalle, sin pasar por el listado.
 *   - "Cerrar" (o click afuera) → va al listado, igual que si no existiera este modal.
 */
export async function promptPostSaveAction(
  proformaId: number,
  { goToDetail, goToList }: PromptPostSaveActionDeps
): Promise<void> {
  const result = await baseSwal({
    title: 'Proforma guardada',
    text: '¿Qué deseas hacer ahora?',
    icon: 'success',
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: 'Descargar PDF',
    denyButtonText: 'Ver detalle',
    cancelButtonText: 'Cerrar',
    reverseButtons: true,
  })

  if (result.isDenied) {
    goToDetail(proformaId)
    return
  }

  if (result.isConfirmed) {
    try {
      const { data } = await proformasService.getById(proformaId)
      const blob = await proformasService.downloadPdf(proformaId)
      await saveFile(blob, `${data.code}.pdf`)
    } catch {
      toastError('Error', 'No se pudo descargar el PDF.')
    }
  }

  goToList()
}
