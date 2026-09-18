/**
 * `sectionbutton_order` es único por `id_section` — a diferencia de `sections/reorder`
 * (que acepta varios grupos `{ groups: [...] }`, uno por navegación), este endpoint reordena
 * UN SOLO grupo por request: los botones de UNA sección. El índice de cada id en `ids` define
 * su nuevo `sectionbutton_order`, empezando en 1.
 */
export type SectionButtonReorderRequestDto = {
  id_section: number
  ids: number[]
}

export type SectionButtonReorderResponseDto = {
  success: boolean
  status: number
  message: string
  data: null
  errors?: Record<string, string[]>
}
