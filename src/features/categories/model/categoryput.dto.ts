import type { CategoryApiItem } from './categoryget.dto'

export type CategoryPutRequestDto = {
  category_name: string
  category_description: string
  category_state: number
  category_updated_at: string
  /** Opcional: crea/reactiva (true) u oculta (false) la tarjeta del carrusel. Si no se manda, no se toca. */
  show_on_web?: boolean
}

export type CategoryPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: CategoryApiItem
  errors?: Record<string, string[]>
}
