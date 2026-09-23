'use client'

import { Eye, EyeOff } from 'lucide-react'
import { Switch } from '@/shared/ui/switch'
import { cn } from '@/shared/lib/utils'

interface VisibilityToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

/**
 * Switch + etiqueta de texto ("Mostrar"/"Ocultar") que refleja el estado actual — a pedido
 * explícito: un switch pelado (sin texto) no deja claro qué significa cada posición para un
 * usuario no técnico. Internamente sigue siendo un booleano (0/1 en la base de datos), esto es
 * solo la forma en que se presenta. Vive en `shared/ui` porque lo usan varios módulos de
 * "Sitio Web" (Navegaciones, Secciones, Testimonios, etc. — ver cada `*-form.tsx`), no solo Footer.
 */
export function VisibilityToggle({ checked, onCheckedChange, disabled }: VisibilityToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
      <span className={cn(
        'flex items-center gap-1 text-xs font-medium',
        disabled ? 'text-muted-foreground/50' : checked ? 'text-emerald-600' : 'text-muted-foreground'
      )}>
        {checked ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
        {checked ? 'Mostrar' : 'Ocultar'}
      </span>
    </div>
  )
}
