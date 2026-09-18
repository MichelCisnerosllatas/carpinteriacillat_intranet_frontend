/**
 * En la práctica existe una única sección de tipo `testimonial_carousel` en todo el sitio (ver
 * `TestimonyWebSeeder` en el backend) — este endpoint la resuelve para que el intranet no tenga
 * que ofrecer un `<SectionSelect>` genérico al crear/editar/reordenar testimonios.
 */
export type TestimonySectionApiItem = {
  id_section: number
  section_name: string
}

export type TestimonySectionResponseDto = {
  success: boolean
  status: number
  message: string
  data: TestimonySectionApiItem | null
}
