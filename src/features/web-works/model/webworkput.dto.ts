import type { WebWorkApiItem } from './webworkget.dto'
import type { WebWorkBaseBodyDto } from './webworkpost.dto'

/**
 * Body de PUT /web-work/{id} (JSON). `images` / `pairs` con la semántica de sincronización:
 * si la clave viene se sincroniza; si no viene, no se tocan. Si el tipo cambia a uno que no es
 * restauración y no se manda `pairs`, el backend borra los pares existentes.
 */
export type WebWorkPutRequestDto = WebWorkBaseBodyDto & {
  /** `Y-m-d H:i:s` */
  webwork_updated_at: string
}

export type WebWorkPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: WebWorkApiItem
  errors?: Record<string, string[]>
}
