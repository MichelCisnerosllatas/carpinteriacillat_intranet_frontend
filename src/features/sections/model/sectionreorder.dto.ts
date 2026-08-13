/**
 * `section_order` es único por `id_navigation` (no globalmente) — el reorder manda un
 * grupo por navegación, y cada grupo se resecuencia 1..N de forma independiente en el
 * backend (ver SectionServices::reorder). No mezclar ids de navegaciones distintas dentro
 * del mismo grupo.
 */
export type SectionReorderGroupDto = {
  id_navigation: number
  ids: number[]
}

export type SectionReorderRequestDto = {
  groups: SectionReorderGroupDto[]
}

export type SectionReorderResponseDto = {
  success: boolean
  status: number
  message: string
  data: null
  errors?: Record<string, string[]>
}
