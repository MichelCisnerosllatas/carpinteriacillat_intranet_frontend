export type NavigationReorderRequestDto = {
  ids: number[]
}

export type NavigationReorderResponseDto = {
  success: boolean
  status: number
  message: string
  data: null
  errors?: Record<string, string[]>
}
