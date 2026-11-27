'use client'

import { Switch } from '@/shared/ui/switch'
import type { PermissionNodeDto } from '../model/permissiontree.dto'
import { collectKeys, collectViewKeys, countModules } from '../lib/permission-tree'
import type { PermissionEditor } from './editor-types'

type GroupSwitchProps = {
  node: PermissionNodeDto
  editor: PermissionEditor
  label: string
}

/**
 * Switch de un grupo completo:
 *  - Encendido = el grupo se ve (al menos un módulo tiene «Ver»).
 *  - Al ENCENDERLO se activa «Ver» en todos sus módulos.
 *  - Al APAGARLO se quitan todos los permisos del grupo → el grupo desaparece del menú.
 */
export function GroupSwitch({ node, editor, label }: GroupSwitchProps) {
  const { withAccess } = countModules(node.children, editor.selected)

  return (
    <Switch
      checked={withAccess > 0}
      disabled={editor.disabled}
      onCheckedChange={(checked) => {
        if (checked) editor.toggle(collectViewKeys(node.children), true)
        else editor.toggle(collectKeys(node.children), false)
      }}
      aria-label={label}
    />
  )
}
