'use client'

import { Switch } from '@/shared/ui/switch'
import { FieldTip } from '@/shared/ui/field-tip'
import { cn } from '@/shared/lib/utils'

// Fila de solo lectura para un toggle de `sections` — mismo texto/tooltip que su versión
// editable en sections-tab.tsx, pero sin Switch interactivo (para eso está "Editar").
export function ReadOnlySectionToggle({
  label,
  tip,
  checked,
}: {
  label: string
  tip: string
  checked: boolean
}) {
  return (
    <div className="flex flex-row items-center justify-between gap-2 rounded-md border p-3">
      <span className="text-sm font-normal">
        <FieldTip label={label} tip={tip} />
      </span>
      <div className="flex items-center gap-2">
        <span
          className={cn('text-xs', checked ? 'text-primary font-medium' : 'text-muted-foreground')}
        >
          {checked ? 'Visible' : 'Oculto'}
        </span>
        <Switch checked={checked} disabled />
      </div>
    </div>
  )
}
