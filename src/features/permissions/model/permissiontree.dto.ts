// Respuesta de GET /v1/intranet/permissions/tree
// El árbol de módulos y acciones de las dos plataformas (intranet y móvil).

/** Una acción marcable de un módulo. */
export type PermissionActionDto = {
  id_permission: number
  /** Acción corta: 'view', 'create', 'update', 'delete', 'state', 'reorder'... */
  action: string
  /** Texto en español: 'Ver', 'Crear'... (en un widget, su nombre: 'Meta del mes') */
  label: string
  /** true = es un widget del dashboard (ej. dashboard_sales.goal). Se lista aparte bajo "Widgets". */
  is_widget: boolean
  /** Key COMPLETA: 'intranet.clients.view' (es la que se envía al guardar). */
  key: string
}

/** Un nodo del árbol: grupo, módulo o submódulo. */
export type PermissionNodeDto = {
  id_module: number
  key: string
  name: string
  icon: string | null
  /** Vacío en los grupos (solo agrupan a sus hijos). */
  actions: PermissionActionDto[]
  children: PermissionNodeDto[]
}

export type PermissionPlatformDto = {
  /** 'intranet' | 'mobile' */
  key: string
  name: string
  modules: PermissionNodeDto[]
}

export type PermissionTreeDto = {
  /** Nombre de cada acción: { view: 'Ver', create: 'Crear', ... } */
  actions: Record<string, string>
  platforms: PermissionPlatformDto[]
}

export type PermissionTreeResponseDto = {
  success: boolean
  status: number
  message: string
  data: PermissionTreeDto
}
