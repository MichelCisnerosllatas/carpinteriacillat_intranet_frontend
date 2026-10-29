// Stores
export { useWebWorkListStore, mapWebWorkFromApi } from './stores/useWebWorkListStore'
export { useWebWorkFormStore } from './stores/useWebWorkFormStore'
export { useWebWorkDeleteStore } from './stores/useWebWorkDeleteStore'
export { useWebWorkSelectStore } from './stores/useWebWorkSelectStore'
export { useWebWorkReorderStore } from './stores/useWebWorkReorderStore'
/** Trabajos con `include=media` (images + pairs), cacheados. Para fotos automáticas / selector "Foto de un trabajo". */
export { useWebWorkMediaStore } from './stores/useWebWorkMediaStore'

// Servicio
export { webWorksService } from './services/web-works.service'
export { WEB_WORKS_ENDPOINTS } from './services/web-works.endpoint'

// UI
export { WebWorksTable } from './ui/list/web-works-table'
export { WebWorkForm } from './ui/form/web-work-form'
export { WebWorkDetail } from './ui/detail/web-work-detail'
export { WebWorksReorderList } from './ui/reorder/web-works-reorder-list'
export { WebWorkSelect } from './ui/web-work-select'
export { WebWorksBreadcrumb } from './ui/web-works-breadcrumb'
export { WebWorksPrimaryButtons } from './ui/web-works-primary-buttons'
export { WebWorksError } from './ui/web-works-error'

// Datos y tipos
export { WEB_WORK_STATES, getWebWorkStateOption, RESTORATION_KEY, getTypeWorkBadge } from './data/data'
export type { WebWork, WebWorkImage, WebWorkPair } from './data/schema'
export type {
  WebWorkApiItem, WebWorkImageApiItem, WebWorkPairApiItem, WebWorkImageRefApi,
  WebWorkListRequestDto, WebWorkListResponseDto,
} from './model/webworkget.dto'
