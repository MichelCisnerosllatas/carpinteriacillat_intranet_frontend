/**
 * `testimony_order` es único por `id_section` — igual que `sectionbutton_order` — este
 * endpoint reordena UN SOLO grupo por request: los testimonios de UNA sección. El índice de
 * cada id en `ids` define su nuevo `testimony_order`, empezando en 1.
 */
export type TestimonyReorderRequestDto = {
  id_section: number
  ids: number[]
}

export type TestimonyReorderResponseDto = {
  success: boolean
  status: number
  message: string
  data: null
  errors?: Record<string, string[]>
}
