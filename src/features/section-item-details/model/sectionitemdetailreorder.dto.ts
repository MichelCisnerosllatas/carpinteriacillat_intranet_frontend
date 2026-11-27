/**
 * `sectionitemdetail_order` es único por `id_section_item` — igual que `section-buttons/reorder`
 * (que reordena UN SOLO grupo por request, a diferencia de `sections/reorder` con varios grupos
 * `{ groups: [...] }`), este endpoint reordena los detalles de UN item de sección. El índice de
 * cada id en `ids` define su nuevo `sectionitemdetail_order`, empezando en 1.
 */
export type SectionItemDetailReorderRequestDto = {
  id_section_item: number
  ids: number[]
}

export type SectionItemDetailReorderResponseDto = {
  success: boolean
  status: number
  message: string
  data: null
  errors?: Record<string, string[]>
}
