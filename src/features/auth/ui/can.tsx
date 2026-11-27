'use client'

import { ReactNode } from 'react'
import { useCan } from '../hooks/usePermission'

type CanProps = {
  /** Key 'modulo.accion' o lista de keys (basta con tener una). Ej: 'clients.create' */
  permission: string | string[]
  children: ReactNode
  /** Lo que se muestra si NO tiene permiso (por defecto, nada). */
  fallback?: ReactNode
}

/**
 * Muestra su contenido solo si el usuario tiene el permiso.
 *
 *   <Can permission="clients.create">
 *     <Button>Nuevo cliente</Button>
 *   </Can>
 */
export function Can({ permission, children, fallback = null }: CanProps) {
  const allowed = useCan(permission)
  return <>{allowed ? children : fallback}</>
}
