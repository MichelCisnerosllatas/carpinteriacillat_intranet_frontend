'use client'

import { Plus } from 'lucide-react'

/** Atajo "+ Nuevo" junto a la etiqueta de un select: abre el modal de creación rápida (mismo que Secciones). */
export function NewOptionButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:pointer-events-none disabled:opacity-50"
    >
      <Plus className="size-3.5" />Nuevo
    </button>
  )
}
