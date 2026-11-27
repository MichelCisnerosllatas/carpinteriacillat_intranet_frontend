'use client'

import { AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import type { PermissionNodeDto } from '../model/permissiontree.dto'
import { countModules } from '../lib/permission-tree'
import { DEFAULT_GROUP_ICON, GROUP_ICONS } from '../data/data'
import type { PermissionEditor } from './editor-types'
import { GroupGrid } from './group-grid'
import { GroupSwitch } from './group-switch'

type GroupProps = {
  node: PermissionNodeDto
  editor: PermissionEditor
}

/** Grupo del primer nivel (ej. "Ventas") como acordeón, con sus módulos en cuadrícula. */
export function PermissionGroup({ node, editor }: GroupProps) {
  const Icon = GROUP_ICONS[node.key] ?? DEFAULT_GROUP_ICON
  const { withAccess, total } = countModules(node.children, editor.selected)
  const visible = withAccess > 0

  return (
    <AccordionItem value={node.key} className="overflow-hidden rounded-xl border bg-card/50">
      {/* Cabecera: el switch va FUERA del trigger (un botón no puede ir dentro de otro) */}
      <div className="flex items-center gap-3 pr-4 [&>h3]:flex-1">
        <AccordionTrigger className="gap-3 px-4 py-3 hover:no-underline">
          <span className="flex min-w-0 flex-1 items-center gap-3 text-left">
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                visible ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="size-4.5" />
            </span>
            <span className="truncate text-base font-semibold">{node.name}</span>
            <Badge variant={visible ? 'default' : 'secondary'} className="shrink-0 font-normal">
              {withAccess}/{total}
            </Badge>
          </span>
        </AccordionTrigger>
        <GroupSwitch node={node} editor={editor} label={`Mostrar el grupo ${node.name}`} />
      </div>

      <AccordionContent className="border-t bg-muted/20 p-4">
        <GroupGrid nodes={node.children} icon={Icon} editor={editor} />
      </AccordionContent>
    </AccordionItem>
  )
}
