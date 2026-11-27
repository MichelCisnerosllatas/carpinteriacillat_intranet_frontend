// Vista agrupada de fotos (acordeón por item) para las "secciones especiales":
// hero de Servicios (service_showcase) y carrusel «Muebles a medida» (category_coverflow).
// Lo que el resto del intranet puede usar de esta carpeta. Todo lo demás es interno. Ver README.md.

export {
  SERVICE_SHOWCASE_TYPE_KEY,
  CATEGORY_COVERFLOW_TYPE_KEY,
  RESTORATION_COMPARE_TYPE_KEY,
  WORK_GALLERY_TYPE_KEY,
  isServiceShowcaseSection,
  isCategoryCoverflowSection,
  isGroupedImagesSection,
  isRestorationCompareSection,
  isWorkGallerySection,
} from './special-sections.constants'
export {
  GROUPED_SECTION_CONFIG, getGroupedSectionConfig, type GroupedSectionConfig,
} from './grouped-section.config'
export { GroupedImagesManager } from './ui/grouped-images-manager'
export { GroupedReorderBoard } from './ui/reorder/grouped-reorder-board'
export { showServiceIfHidden } from './lib/show-service-if-hidden'
export { useWebWorkList, type GroupedWebWork, type GroupedWebWorkImage } from './lib/use-web-work-list'
export { findWorksOfCategory, visibleWorkImages } from './lib/auto-photos'
export {
  CATEGORY_ITEM_TYPE,
  buildCategoryItemKey,
  getCategoryIdFromKey,
  buildWorkGalleryLink,
  getWorkIdFromLink,
} from './coverflow/coverflow-links'
