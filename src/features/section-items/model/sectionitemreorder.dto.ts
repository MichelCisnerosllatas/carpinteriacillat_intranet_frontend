/**
 * `sectionitem_order` es único por `id_section` — un solo grupo por request (a diferencia de
 * `sections`, que manda varios grupos por navegación en un mismo request).
 */
export type SectionItemReorderRequestDto = {
  id_section: number
  ids: number[]
}

export type SectionItemReorderResponseDto = {
  success: boolean
  status: number
  message: string
  data: null
  errors?: Record<string, string[]>
}
