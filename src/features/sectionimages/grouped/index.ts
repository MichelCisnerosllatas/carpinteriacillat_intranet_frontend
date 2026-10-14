// Vista agrupada de fotos (acordeón por item) para las "secciones especiales":
// hero de Servicios (service_showcase), carrusel «Muebles a medida» (category_coverflow)
// y comparador «Restauración» (restoration_compare).
// Lo que el resto del intranet puede usar de esta carpeta. Todo lo demás es interno. Ver README.md.

export {
  SERVICE_SHOWCASE_TYPE_KEY,
  CATEGORY_COVERFLOW_TYPE_KEY,
  RESTORATION_COMPARE_TYPE_KEY,
  isServiceShowcaseSection,
  isCategoryCoverflowSection,
  isRestorationCompareSection,
  isGroupedImagesSection,
} from './special-sections.constants'
export {
  GROUPED_SECTION_CONFIG, getGroupedSectionConfig, getPhotoVariantLabel, type GroupedSectionConfig,
} from './grouped-section.config'
export { GroupedImagesManager } from './ui/grouped-images-manager'
export { GroupedReorderBoard } from './ui/reorder/grouped-reorder-board'
export { showServiceIfHidden } from './lib/show-service-if-hidden'
export { useFurnitureJoinList, getFurnitureDisplayTitle } from './lib/use-furniture-join-list'
export {
  CATEGORY_ITEM_TYPE,
  buildCategoryItemKey,
  getCategoryIdFromKey,
  buildFurnitureGalleryLink,
  getFurnitureIdFromLink,
} from './coverflow/coverflow-links'
export {
  RESTORATION_ITEM_TYPE,
  RESTORATION_PHOTO_VARIANTS,
  type RestorationPhotoVariant,
  buildRestorationItemKey,
  getFurnitureIdFromRestorationKey,
  isRestorationPhotoVariant,
  hasBeforeAndAfterPhotos,
} from './restoration/restoration-links'
