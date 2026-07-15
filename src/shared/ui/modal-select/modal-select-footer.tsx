'use client'

import { DialogFooter } from '@/shared/ui/dialog'

/**
 * Footer del <ModalSelect />. Este modal es de selección directa (clic o Enter
 * en una fila ya selecciona y cierra), así que por defecto NO se renderiza nada.
 * Si algún caso de uso necesita botones extra (ej. "Crear nuevo"), pásalos por
 * la prop `footer` de <ModalSelect /> y aparecerán aquí.
 */
interface ModalSelectFooterProps {
  children?: React.ReactNode
}

export function ModalSelectFooter({ children }: ModalSelectFooterProps) {
  if (!children) return null

  return <DialogFooter className="px-6 pb-6">{children}</DialogFooter>
}
