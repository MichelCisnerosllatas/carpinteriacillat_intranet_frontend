export type TestimonyPostRequestDto = {
  id_section: number
  id_image?: number | null
  testimony_name: string
  testimony_role?: string
  testimony_city?: string
  testimony_email?: string
  testimony_rating?: number | null
  testimony_message: string
  testimony_is_delivered?: boolean
  testimony_is_verified?: boolean
  testimony_order?: number
  testimony_state?: number
  testimony_created_at: string
}

export type TestimonyPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: { id_testimony_web: number }
  errors?: Record<string, string[]>
}
