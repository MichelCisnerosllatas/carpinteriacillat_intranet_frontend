/**
 * Tipos del componente genérico <ModalSelect />.
 *
 * `T` es el tipo de dato de cada fila (ej. RoleType, CategoryType, etc).
 * El componente no sabe nada de una entidad concreta: todo llega por props,
 * así puede vivir en `shared/ui` sin romper la regla de FSD
 * (shared no puede importar de features).
 */

export interface ModalSelectColumn<T> {
  /** Texto de la cabecera de columna. */
  header: string
  /** Cómo renderizar el valor de esa columna para una fila. */
  cell: (item: T) => React.ReactNode
  /** Clases opcionales para alinear/ajustar ancho de la celda. */
  className?: string
}

export interface ModalSelectProps<T> {
  /** Controla si el modal está abierto (patrón igual al resto de Dialogs del proyecto). */
  open: boolean
  onOpenChange: (open: boolean) => void

  /** Título y descripción del header. */
  title: string
  description?: string

  /** Datos ya cargados (el modal no hace fetch, eso lo hace el store/servicio). */
  data: T[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  /** Reintentar carga tras un error. */
  onRetry?: () => void

  /** Identificador único de cada fila (para key y para resaltar selección). */
  getId: (item: T) => string | number

  /** Columnas "importantes" a mostrar — se recomienda 2 a 4, no toda la entidad. */
  columns: ModalSelectColumn<T>[]

  /** Placeholder del input de búsqueda del header. */
  searchPlaceholder?: string
  /**
   * Filtro de búsqueda client-side. Si no se pasa, se usa un filtro por
   * defecto que hace `String(...)` sobre el resultado de cada columna.
   */
  filterFn?: (item: T, search: string) => boolean

  /** Se llama con el objeto completo elegido; el modal se cierra solo. */
  onSelect: (item: T) => void

  /** Mensaje cuando la lista (filtrada) queda vacía. */
  emptyMessage?: string
  /** Texto del botón de acción por fila. Por defecto "Seleccionar". */
  selectLabel?: string

  /**
   * Contenido del footer. Si se omite, el footer no se renderiza
   * (este modal es de selección directa, no necesita botones de confirmar/cancelar).
   */
  footer?: React.ReactNode
}
