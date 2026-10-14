// src/features/categories/model/category-web.dto.ts
//
// Atajo "Mostrar en la web": la categoría tiene (o no) su tarjeta en el carrusel
// «Muebles a medida» de la página Servicios (sección category_coverflow).
// No hay tabla nueva: la tarjeta es un item de esa sección (sections_items) con clave 'category-<id>'.

/** Lo que devuelve el backend dentro de `web` (CategoryResource). */
export type CategoryWebApiItem = {
  /** true si la tarjeta existe y está visible. */
  show_on_web: boolean
  /** Sección del carrusel (para el enlace "Ver sección →"). null si la sección no existe. */
  id_section: number | null
  /** Item (tarjeta) de la categoría. null si todavía no tiene. */
  id_section_item: number | null
}
