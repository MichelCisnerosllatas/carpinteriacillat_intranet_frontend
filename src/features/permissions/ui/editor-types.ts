/**
 * Datos que comparten todos los componentes del editor de permisos.
 * Se pasan juntos en una sola prop `editor` para no repetir 4 props en cada componente.
 */
export type PermissionEditor = {
  /** Keys completas marcadas ahora ('intranet.clients.view', ...). */
  selected: Set<string>
  /** true = no se puede cambiar nada (superadmin, sin permiso, o guardando). */
  disabled: boolean
  /** Nombre de cada acción: { view: 'Ver', create: 'Crear', ... } */
  actionLabels: Record<string, string>
  /** Activa (true) o quita (false) varias keys a la vez. */
  toggle: (keys: string[], checked: boolean) => void
}
