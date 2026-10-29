// Lo que este módulo ofrece al resto de la intranet.

// Stores
export { useWebAlertListStore, mapWebAlertFromApi } from './stores/useWebAlertListStore'
export { useWebAlertFormStore } from './stores/useWebAlertFormStore'
export { useWebAlertDeleteStore } from './stores/useWebAlertDeleteStore'
export { useWebAlertReorderStore } from './stores/useWebAlertReorderStore'

// Servicio
export { webAlertsService } from './services/web-alerts.service'
export { WEB_ALERTS_ENDPOINTS } from './services/web-alerts.endpoint'

// Pantallas
export { WebAlertsTable } from './ui/list/web-alerts-table'
export { WebAlertForm } from './ui/form/web-alert-form'
export { WebAlertsReorderList } from './ui/reorder/web-alerts-reorder-list'
export { WebAlertsBreadcrumb } from './ui/web-alerts-breadcrumb'
export { WebAlertsPrimaryButtons } from './ui/web-alerts-primary-buttons'

// Datos y tipos
export {
  ALERT_STYLES, ALERT_ALIGNS, ALERT_TRAILINGS, ALERT_SCROLL_BEHAVIORS,
  ALERT_VISIBILITY_STATUSES, ALERT_STATES, getAlertStyle, getAlertVisibilityStatus,
} from './data/data'
export type { WebAlert, WebAlertFormValues } from './data/schema'
export type { WebAlertApiItem, WebAlertListRequestDto, WebAlertListResponseDto } from './model/webalertget.dto'
