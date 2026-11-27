'use client'

import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import type { PermissionNodeDto } from '../model/permissiontree.dto'
import { countModules } from '../lib/permission-tree'
import type { PermissionEditor } from './editor-types'
import { GroupGrid } from './group-grid'
import { GroupSwitch } from './group-switch'

type SubGroupProps = {
  node: PermissionNodeDto
  icon: LucideIcon
  editor: PermissionEditor
}

/** Sub-grupo dentro de un grupo: título con su switch y sus cards debajo. */
export function SubGroup({ node, icon, editor }: SubGroupProps) {
  const { withAccess, total } = countModules(node.children, editor.selected)

  return (
    <div className="col-span-full flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold">{node.name}</span>
        <Badge variant="outline" className="font-normal">
          {withAccess}/{total}
        </Badge>
        <span className="h-px flex-1 bg-border" />
        <GroupSwitch node={node} editor={editor} label={`Mostrar ${node.name}`} />
      </div>
      {/* GroupGrid y SubGroup se usan entre sí (sub-grupos dentro de sub-grupos). */}
      <GroupGrid nodes={node.children} icon={icon} editor={editor} />
    </div>
  )
}
