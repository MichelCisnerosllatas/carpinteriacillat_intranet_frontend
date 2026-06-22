export type ImageUploadResponseDto = {
  success: boolean
  status: number
  message: string
  data: {
    path: string
    url: string
    name: string
  }
  errors?: Record<string, string[]>
}
