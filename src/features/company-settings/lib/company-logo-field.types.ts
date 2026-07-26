// src/features/company-settings/lib/company-logo-field.types.ts
export interface CompanyLogoFieldHandle {
  getPendingFile: () => File | null
  wasRemoved: () => boolean
}