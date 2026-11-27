'use client'

import type { LucideIcon } from 'lucide-react'
import type { PermissionNodeDto } from '../model/permissiontree.dto'
import { isModule } from '../lib/permission-tree'
import type { PermissionEditor } from './editor-types'
import { ModuleCard } from './module-card'
import { SubGroup } from './sub-group'

type GroupGridProps = {
  nodes: PermissionNodeDto[]
  icon: LucideIcon
  editor: PermissionEditor
}

/** Cuadrícula de cards. Los sub-grupos (ej. "Catálogo de Tipos") ocupan toda la fila. */
export function GroupGrid({ nodes, icon, editor }: GroupGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {nodes.map((child) =>
        isModule(child) ? (
          <ModuleCard key={child.key} node={child} icon={icon} editor={editor} />
        ) : (
          <SubGroup key={child.key} node={child} icon={icon} editor={editor} />
        )
      )}
    </div>
  )
}
