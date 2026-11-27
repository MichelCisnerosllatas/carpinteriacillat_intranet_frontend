'use client'

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Checkbox } from '@/shared/ui/checkbox'
import type { PermissionNodeDto } from '../model/permissiontree.dto'
import { collectSubtreeKeys, hasAccess, sortActions } from '../lib/permission-tree'
import type { PermissionEditor } from './editor-types'
import { PermissionRow, type PermissionRowItem } from './permission-row'

type ModuleCardProps = {
  node: PermissionNodeDto
  /** Icono del grupo al que pertenece (se muestra en la cabecera de la card). */
  icon: LucideIcon
  editor: PermissionEditor
}

/**
 * Card de UN módulo, estilo "ajustes del celular":
 *
 *   ┌──────────────────────────────┐
 *   │ 👥 Clientes        ☑ Todo     │
 *   ├──────────────────────────────┤
 *   │ Ver                  [  ●]    │
 *   │ Crear                [  ●]    │
 *   │ Eliminar             [●  ]    │
 *   └──────────────────────────────┘
 *
 * Los submódulos (ej. cada reporte) aparecen como filas más, con sangría.
 * Los widgets del dashboard (is_widget) van al final, bajo el subtítulo "Widgets".
 */
export function ModuleCard({ node, icon: Icon, editor }: ModuleCardProps) {
  const { selected, disabled, actionLabels, toggle } = editor

  const allRows = buildRows(node, actionLabels)
  const rows = allRows.filter((row) => !row.isWidget)
  const widgetRows = allRows.filter((row) => row.isWidget)
  const allKeys = collectSubtreeKeys(node)
  const markedCount = allKeys.filter((key) => selected.has(key)).length
  const active = hasAccess(node, selected)

  // Check "Todo": marcado, vacío o a medias
  const allState = markedCount === 0 ? false : markedCount === allKeys.length ? true : 'indeterminate'

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition-colors',
        active && 'border-primary/40 ring-1 ring-primary/10'
      )}
    >
      {/* Cabecera */}
      <div className={cn('flex items-center gap-3 border-b px-4 py-3', active && 'bg-primary/5')}>
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg',
            active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{node.name}</p>
          <p className="text-xs text-muted-foreground">
            {markedCount}/{allKeys.length}
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Checkbox
            checked={allState}
            disabled={disabled}
            // Si está a medias o vacío → marca todo. Si está todo → quita todo.
            onCheckedChange={() => toggle(allKeys, allState !== true)}
            aria-label={`Todo ${node.name}`}
          />
          Todo
        </label>
      </div>

      {/* Una fila por acción */}
      <ul className="flex flex-col divide-y">
        {rows.map((row) => (
          <PermissionRow
            key={row.key}
            row={row}
            moduleName={node.name}
            checked={selected.has(row.key)}
            disabled={disabled}
            onToggle={(key, value) => toggle([key], value)}
          />
        ))}
      </ul>

      {/* Widgets del dashboard: mismas filas, debajo de su subtítulo */}
      {widgetRows.length > 0 && (
        <>
          <p className="border-t bg-muted/40 px-4 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Widgets
          </p>
          <ul className="flex flex-col divide-y border-t">
            {widgetRows.map((row) => (
              <PermissionRow
                key={row.key}
                row={row}
                moduleName={node.name}
                checked={selected.has(row.key)}
                disabled={disabled}
                onToggle={(key, value) => toggle([key], value)}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

/** Arma las filas: primero las acciones del módulo y después las de sus submódulos. */
function buildRows(node: PermissionNodeDto, actionLabels: Record<string, string>): PermissionRowItem[] {
  const rows: PermissionRowItem[] = sortActions(node.actions, actionLabels).map((action) => ({
    key: action.key,
    action: action.action,
    label: action.label,
    isChild: false,
    isWidget: action.is_widget,
  }))

  for (const child of node.children) {
    for (const action of sortActions(child.actions, actionLabels)) {
      rows.push({
        key: action.key,
        action: action.action,
        // "Ver" de un submódulo se muestra solo con su nombre: "Registro de ventas"
        label: action.action === 'view' ? child.name : `${child.name} · ${action.label}`,
        isChild: true,
        isWidget: action.is_widget,
      })
    }
  }

  return rows
}
