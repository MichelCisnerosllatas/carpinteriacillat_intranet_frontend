// src/features/sale-settings/ui/sale-setting-view.tsx
'use client'

import { useEffect } from 'react'
import { useSaleSettingStore } from '../stores/useSaleSettingStore'
import { SaleSettingForm } from './form/sale-setting-form'
import { SaleSettingsSkeleton } from './form/sale-settings-skeleton'
import { ErrorState } from '@/widgets/error/error-state'

export function SaleSettingView() {
  const { data, hasLoaded, isLoading, isError, message, fetch } = useSaleSettingStore()

  useEffect(() => {
    if (!hasLoaded) fetch()
  }, [])

  if (isLoading && !data) {
    return <SaleSettingsSkeleton />
  }

  if (isError && !data) {
    return (
      <ErrorState
        title="No se pudo cargar la configuración"
        message={
          message ??
          'Ocurrió un problema al cargar la configuración de ventas.'
        }
        primaryLabel="Reintentar"
        secondaryLabel="Volver al inicio"
        onPrimaryAction={() => {
          fetch()
        }}
      />
    )
  }

  if (!data) return null

  return <SaleSettingForm />
}
