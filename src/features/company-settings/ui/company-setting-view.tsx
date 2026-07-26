// src/features/company-settings/ui/company-setting-view.tsx
'use client'

import { useEffect } from 'react'
// import { Loader2 } from 'lucide-react'
import { useCompanySettingStore } from '../stores/useCompanySettingStore'
import { CompanySettingForm } from './form/company-setting-form'
import { CompanySettingsSkeleton } from './form/company-settings-skeleton'
import { ErrorState } from '@/widgets/error/error-state'

export function CompanySettingView() {
  const { data, hasLoaded, isLoading, isError, message, fetch } = useCompanySettingStore()

  useEffect(() => {
    if (!hasLoaded) fetch()
  }, [])

  if (isLoading && !data) {
    return <CompanySettingsSkeleton />;
  }

  if (isError && !data) {
    return (
      <ErrorState
        title="No se pudo cargar la configuración"
        message={
          message ??
          'Ocurrió un problema al cargar la configuración de la empresa.'
        }
        // message2="Comprueba tu conexión o vuelve a intentarlo."
        primaryLabel="Reintentar"
        secondaryLabel="Volver al inicio"
        // isPrimaryLoading={isFetching}
        onPrimaryAction={() => {
          fetch()
        }}
        // onSecondaryAction={() => {
        //   router.push('/')
        // }}
      />
    )
  }

  // if (isError && !data) {
  //   return (
  //     <div className="flex flex-1 items-center justify-center py-16 text-destructive">
  //       {message ?? 'No se pudo cargar la configuración de la empresa.'}
  //     </div>
  //   )
  // }

  if (!data) return null

  return <CompanySettingForm />
}
