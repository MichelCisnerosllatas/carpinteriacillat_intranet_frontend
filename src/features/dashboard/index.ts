// API pública de la feature dashboard (lo que pueden importar las páginas de app/).
export * from './ui/summary/summary-dashboard'
export * from './ui/sales-performance/sales-performance-dashboard'
export * from './ui/proformas/proformas-dashboard'
export * from './ui/messages/messages-dashboard'
export * from './ui/staff-access/staff-access-dashboard'

export * from './stores/useDashboardFiltersStore'
export * from './stores/useDashboardStores'

export * from './services/dashboard.service'
export * from './services/dashboard.endpoint'

export * from './model/dashboard-common.dto'
export * from './model/dashboard-summary.dto'
export * from './model/dashboard-sales-performance.dto'
export * from './model/dashboard-proformas.dto'
export * from './model/dashboard-messages.dto'
export * from './model/dashboard-staff-access.dto'
