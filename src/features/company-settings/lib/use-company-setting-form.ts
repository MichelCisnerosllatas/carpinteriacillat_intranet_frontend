// src/features/company-settings/lib/use-company-setting-form.ts
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { toastError } from '@/shared/lib/toast'
import { storageFilesService } from '@/features/storage-files/services/storage-files.service'

import { useCompanySettingStore } from '../stores/useCompanySettingStore'

import {
  COMPANY_SETTING_DEFAULT_VALUES,
  companySettingFormSchema,
  type CompanySettingFormValues,
} from './company-setting-form.schema'

import type { CompanyLogoFieldHandle } from './company-logo-field.types'

export function useCompanySettingForm() {
  const { data, isLoading, message, update} = useCompanySettingStore()
  const logoFieldRef = useRef<CompanyLogoFieldHandle>(null)

  const form = useForm<CompanySettingFormValues>({
    resolver: zodResolver(companySettingFormSchema),
    defaultValues: COMPANY_SETTING_DEFAULT_VALUES,
  })

  useEffect(() => {
    if (!data) return

    form.reset({
      business_name: data.businessName,
      trade_name: data.tradeName ?? '',
      tax_id: data.taxId ?? '',
      tax_address: data.taxAddress ?? '',
      logo: data.logo ?? undefined,
      status: data.statusValue,
    })
  }, [data, form])

  const onSubmit = async (values: CompanySettingFormValues): Promise<void> => {
    const confirmed = await swalConfirm({
      title: '¿Guardar cambios?',
      text: values.business_name,
      confirmText: 'Sí, guardar',
      cancelText: 'Cancelar',
    })

    if (!confirmed) return
    let logo = values.logo || undefined

    const pendingFile = logoFieldRef.current?.getPendingFile()
    const logoWasRemoved = logoFieldRef.current?.wasRemoved() ?? false

    if (pendingFile) {
      const formData = new FormData()
      formData.append('file', pendingFile)

      const uploadResponse = await storageFilesService.upload(formData)
      if (!uploadResponse.success) {
        toastError('Error', 'No se pudo subir el logo de la empresa.')
        return
      }

      logo = uploadResponse.data.path
    } else if (logoWasRemoved) {
      logo = undefined
    }

    const payload = {
      business_name: values.business_name.trim(),
      trade_name: values.trade_name?.trim() || undefined,
      tax_id: values.tax_id?.trim() || undefined,
      tax_address: values.tax_address?.trim() || undefined,
      logo,
      status: values.status,
    }

    const success = await update(payload)
    if (!success) {
      const errorMessage = useCompanySettingStore.getState().message ?? 'No se pudo guardar la configuración.'
      toastError('Error', errorMessage)
      return
    }

    await swalSuccess('Actualizado', 'La configuración de la empresa fue guardada.')

    /*
     * Después de guardar correctamente, el logo deja de ser
     * un archivo temporal y se actualiza el valor del formulario.
     */
    form.setValue('logo', logo, {
      shouldDirty: false,
      shouldValidate: false,
    })

    form.reset({
      ...form.getValues(),
      logo,
    })
  }

  return {
    form,
    logoFieldRef,
    message,
    isSubmitting: isLoading,
    onSubmit,
  }
}