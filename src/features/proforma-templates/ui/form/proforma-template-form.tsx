'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { Form } from '@/shared/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { AlertError } from '@/widgets/alerts_components'
import { useProformaTemplateListStore } from '../../stores/useProformaTemplateListStore'
import { useProformaTemplateFormStore } from '../../stores/useProformaTemplateFormStore'
import { useLiveStylePreview } from '../preview/use-live-style-preview'
import { TemplatePreviewCard } from '../preview/template-preview-card'
import { GeneralTab } from './tabs/general-tab'
import { StylesTab } from './tabs/styles-tab'
import { SectionsTab } from './tabs/sections-tab'
import { TextsTab } from './tabs/texts-tab'
import {
  proformaTemplateFormSchema,
  proformaTemplateFormDefaults,
  toProformaTemplatePayload,
  toProformaTemplateStylePayload,
  type ProformaTemplateFormValues,
} from './proforma-template-form.schema'

export function ProformaTemplateForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router = useRouter()
  const { currentItem, items, loadById } = useProformaTemplateListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useProformaTemplateFormStore()
  const isEdit = mode === 'edit'
  const resolved = currentItem ?? (id ? (items.find((i) => i.id === Number(id)) ?? null) : null)

  const form = useForm<ProformaTemplateFormValues>({
    resolver: zodResolver(proformaTemplateFormSchema),
    defaultValues: proformaTemplateFormDefaults,
  })

  useEffect(() => {
    if (isEdit && id && (!resolved || String(resolved.id) !== id)) {
      void loadById(Number(id))
    }
  }, [isEdit, id])

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        moduleTypeId: resolved.moduleTypeId,
        name: resolved.name,
        headerBgColor: resolved.headerBgColor,
        headerTextColor: resolved.headerTextColor,
        headerTitleSize: resolved.headerTitleSize,
        headerHeight: resolved.headerHeight,
        headerLogoWidth: resolved.headerLogoWidth,
        headerLogoHeight: resolved.headerLogoHeight,
        headerLayout: resolved.headerLayout,
        headerFontFamily: resolved.headerFontFamily,
        bodyBgColor: resolved.bodyBgColor,
        bodyTextColor: resolved.bodyTextColor,
        bodyBorderColor: resolved.bodyBorderColor,
        bodyFontFamily: resolved.bodyFontFamily,
        bodySubtitleSize: resolved.bodySubtitleSize,
        bodyTextSize: resolved.bodyTextSize,
        bodyTableSize: resolved.bodyTableSize,
        footerBgColor: resolved.footerBgColor,
        footerTextColor: resolved.footerTextColor,
        footerTextSize: resolved.footerTextSize,
        footerFontFamily: resolved.footerFontFamily,
        footerText: resolved.footerText ?? '',
        showLogo: resolved.sections.showLogo,
        showDate: resolved.sections.showDate,
        showCompanyData: resolved.sections.showCompanyData,
        showBranches: resolved.sections.showBranches,
        showPaymentMethod: resolved.sections.showPaymentMethod,
        showBankAccounts: resolved.sections.showBankAccounts,
        showSignature: resolved.sections.showSignature,
        showFooter: resolved.sections.showFooter,
        status: resolved.stateValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => reset(), [])

  const previewReady = isEdit ? Boolean(resolved) : true
  const {
    previewUrl,
    isLoading: isLoadingPreview,
    refresh: refreshPreview,
  } = useLiveStylePreview(form, toProformaTemplateStylePayload, previewReady)

  const onSubmit = async (values: ProformaTemplateFormValues) => {
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear plantilla de proforma?',
      text: values.name,
      confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const payload = toProformaTemplatePayload(values)

    if (isEdit) {
      const success = await update(resolved!.id, payload)
      if (success) {
        await swalSuccess('Actualizado', values.name)
      } else {
        applyApiErrors(form, fieldErrors)
      }
    } else {
      const created = await create(payload)
      if (created) {
        await swalSuccess('Creado', values.name)
        router.push(`/proforma-templates/edit/${created.id}`)
      } else {
        applyApiErrors(form, fieldErrors)
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <Tabs defaultValue="general" className="flex flex-col gap-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="estilos">Estilos</TabsTrigger>
              <TabsTrigger value="secciones">Secciones</TabsTrigger>
              <TabsTrigger value="textos">
                Textos {resolved ? `(${resolved.textsCount})` : ''}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <GeneralTab form={form} />
            </TabsContent>
            <TabsContent value="estilos">
              <StylesTab form={form} />
            </TabsContent>
            <TabsContent value="secciones">
              <SectionsTab form={form} />
            </TabsContent>
            <TabsContent value="textos">
              <TextsTab templateId={isEdit && resolved ? resolved.id : null} />
            </TabsContent>
          </Tabs>

          <div className="flex flex-col gap-4 xl:sticky xl:top-4 xl:self-start">
            <TemplatePreviewCard
              previewUrl={previewUrl}
              isLoading={isLoadingPreview}
              onRefresh={refreshPreview}
            />
          </div>
        </div>

        <Separator />
        {error && (
          <AlertError
            title={isEdit ? 'Error al actualizar' : 'Error al crear'}
            message={error}
            apiError={fieldErrors ? { errors: fieldErrors } : undefined}
          />
        )}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/proforma-templates')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-36">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? 'Guardando...' : 'Creando...'}
              </>
            ) : isEdit ? (
              'Guardar estilos'
            ) : (
              'Crear plantilla'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
