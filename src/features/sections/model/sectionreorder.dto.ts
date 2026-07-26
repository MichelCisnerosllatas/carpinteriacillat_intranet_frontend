export type SectionReorderRequestDto = {
  ids: number[]
}

export type SectionReorderResponseDto = {
  success: boolean
  status: number
  message: string
  data: null
  errors?: Record<string, string[]>
}
