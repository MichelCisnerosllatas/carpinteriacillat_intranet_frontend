/** POST /web-work/reorder → deja `webwork_order` = 1..N en el orden de `ids`. */
export type WebWorkReorderRequestDto = {
  ids: number[]
}

export type WebWorkReorderResponseDto = {
  success: boolean
  status: number
  message: string
  data?: unknown
  errors?: Record<string, string[]>
}
