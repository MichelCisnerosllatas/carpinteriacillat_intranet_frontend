// src/features/proformas/hooks/useProformaForm/useGuardEditableStatus.ts
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toastWarning } from '@/shared/lib/toast'
import type { Proforma } from '../../data/schema'

/**
 * Solo se puede editar mientras la proforma sigue Pendiente — el botón "Editar" ya está oculto
 * para los demás estados en la tabla, pero esto cubre a quien entra directo por URL sin pasar
 * por ahí. Si no está Pendiente, avisa y redirige al detalle (de solo lectura).
 */
export function useGuardEditableStatus(isEdit: boolean, resolved: Proforma | null) {
  const router = useRouter()

  useEffect(() => {
    if (isEdit && resolved && resolved.status !== 'PENDIENTE') {
      toastWarning('No se puede editar', 'Esta proforma ya no está en estado Pendiente.')
      router.replace(`/proformas/${resolved.id}`)
    }
  }, [isEdit, resolved])
}
