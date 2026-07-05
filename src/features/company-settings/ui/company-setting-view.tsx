// src/features/company-settings/ui/company-setting-view.tsx
'use client'

import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useCompanySettingStore } from '../stores/useCompanySettingStore'
import { CompanySettingForm } from './form/company-setting-form'

export function CompanySettingView() {
  const { data, isLoading, isError, message, fetch } = useCompanySettingStore()

  useEffect(() => {
    if (!data) fetch()
  }, [])

  if (isLoading && !data) {
    return (
      <div className="flex flex-1 items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Cargando configuración...
      </div>
    )
  }

  if (isError && !data) {
    return (
      <div className="flex flex-1 items-center justify-center py-16 text-destructive">
        {message ?? 'No se pudo cargar la configuración de la empresa.'}
      </div>
    )
  }

  if (!data) return null

  return <CompanySettingForm />
}
