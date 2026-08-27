// src/features/clients/lib/resolveOrCreateClient.ts
import { toastInfo } from '@/shared/lib/toast'
import { clientsService } from '../services/clients.service'
import { useClientFormStore } from '../stores/useClientFormStore'
import type { ClientApiItem } from '../model/client-api-item.dto'

/**
 * Resuelve el id de un cliente a partir de solo su nombre (razón social) — para cuando el usuario
 * escribió el nombre a mano en `<ClientNamePickerField />` sin usar el modal de búsqueda, así que
 * el formulario todavía no tiene un `client_id`.
 *
 * 1. Busca clientes cuya razón social contenga el texto (el único filtro disponible en el backend
 *    es `LIKE`, no hay endpoint de igualdad exacta).
 * 2. Compara client-side, sin distinguir mayúsculas ni espacios sobrantes: si hay un match exacto,
 *    reutiliza ese cliente (no duplica).
 * 3. Si no hay match, crea uno nuevo con ese nombre y avisa con un toast informativo — para que
 *    quede claro que no era un cliente ya existente (esta función es la única que sabe distinguir
 *    "encontrado" de "creado", por eso el aviso vive acá y no en quien la llama).
 *
 * Devuelve el cliente resuelto (existente o recién creado) o `null` si el nombre viene vacío o la
 * búsqueda/creación falla.
 */
export async function resolveOrCreateClient(name: string): Promise<ClientApiItem | null> {
  const trimmed = name.trim()
  if (!trimmed) return null

  try {
    const res = await clientsService.getList({ search: trimmed, per_page: 100, status: 1 })
    if (res.success) {
      const match = res.data.find(
        (client) => client.business_name.trim().toLowerCase() === trimmed.toLowerCase()
      )
      if (match) return match
    }
  } catch {
    // Si falla la búsqueda, se intenta crear igual — el backend es la última palabra.
  }

  const created = await useClientFormStore.getState().create({ business_name: trimmed, status: 1 })
  if (created) {
    toastInfo('Cliente creado automáticamente', `"${created.business_name}" no existía y se creó.`)
  }
  return created
}
