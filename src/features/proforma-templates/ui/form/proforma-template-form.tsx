'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Eye, FileText, Loader2, Palette, Type } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { Form } from '@/shared/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { swalConfirmAction, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { useIsMobile } from '@/shared/lib/use-mobile'
import { AlertError } from '@/widgets/alerts_components'
import {
  useProformaTemplateTextDraftStore,
  useProformaTemplateTextListStore,
} from '@/features/proforma-template-texts'
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

// Campos del tab "General" (nombre, tipo, estado): no afectan el estilo del PDF (son datos de la
// tabla, no de diseño), así que no deben disparar una regeneración de la vista previa.
const GENERAL_TAB_FIELDS: (keyof ProformaTemplateFormValues)[] = ['name', 'moduleTypeId', 'status']

export function ProformaTemplateForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router = useRouter()
  const isMobile = useIsMobile()
  // En celular arranca oculta para no empujar los tabs fuera de pantalla; en escritorio arranca
  // visible. Ocultarla es solo visual: el fetch de useLiveStylePreview vive en este componente y
  // sigue corriendo con cada cambio del formulario aunque la tarjeta esté oculta.
  const [previewVisible, setPreviewVisible] = useState<boolean | null>(null)
  useEffect(() => {
    if (previewVisible === null) setPreviewVisible(!isMobile)
  }, [isMobile, previewVisible])
  const showPreview = previewVisible ?? !isMobile
  const { currentItem, items, loadById } = useProformaTemplateListStore()
  const {
    isSubmitting,
    error,
    fieldErrors,
    create,
    update: updateTemplate,
    reset,
  } = useProformaTemplateFormStore()
  const {
    syncToTemplate,
    setFromExisting,
    seedDefaults,
    reset: resetTextDrafts,
  } = useProformaTemplateTextDraftStore()
  const { loadByTemplateText, reset: resetTextList } = useProformaTemplateTextListStore()
  // El preview no arranca hasta que los textos también estén listos: antes se cargaban recién al
  // entrar al tab "Textos extra", y como cambiar el borrador dispara una regeneración del PDF (ver
  // el subscribe más abajo), el usuario veía el PDF renderizarse UNA VEZ al entrar y OTRA VEZ al
  // abrir esa pestaña. Cargar todo antes del primer render evita el segundo renderizado.
  const [textsReady, setTextsReady] = useState(false)
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

  // Misma función/efecto que resuelve la plantilla: en cuanto se conoce el id (edición) se piden
  // sus textos ya guardados; en creación, se siembra el redactado por defecto. Ambos casos dejan
  // el borrador listo ANTES de que el preview haga su primera petición.
  useEffect(() => {
    if (!isEdit) {
      seedDefaults()
      setTextsReady(true)
      return
    }
    if (!resolved) return
    if (useProformaTemplateTextDraftStore.getState().initializedForTemplateId === resolved.id) {
      setTextsReady(true)
      return
    }
    let alive = true
    void loadByTemplateText(resolved.id).then((ok) => {
      if (!alive) return
      if (ok) setFromExisting(resolved.id, useProformaTemplateTextListStore.getState().items)
      setTextsReady(true)
    })
    return () => {
      alive = false
    }
  }, [isEdit, resolved?.id])

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
        showCompanyName: resolved.sections.showCompanyName,
        showClientName: resolved.sections.showClientName,
        showClientDocument: resolved.sections.showClientDocument,
        showClientAddress: resolved.sections.showClientAddress,
        showClientAttention: resolved.sections.showClientAttention,
        showIntroText: resolved.sections.showIntroText,
        showItemsTable: resolved.sections.showItemsTable,
        showSummaryTotal: resolved.sections.showSummaryTotal,
        showDeliveryTime: resolved.sections.showDeliveryTime,
        showCompanyData: resolved.sections.showCompanyData,
        showCompanyTaxId: resolved.sections.showCompanyTaxId,
        showCompanyAddress: resolved.sections.showCompanyAddress,
        showCompanyBusinessName: resolved.sections.showCompanyBusinessName,
        showCompanySocialNetworks: resolved.sections.showCompanySocialNetworks,
        showCompanyContacts: resolved.sections.showCompanyContacts,
        showBranches: resolved.sections.showBranches,
        showPaymentMethod: resolved.sections.showPaymentMethod,
        showBankAccounts: resolved.sections.showBankAccounts,
        showFinalText: resolved.sections.showFinalText,
        showFinalGreeting: resolved.sections.showFinalGreeting,
        showSignature: resolved.sections.showSignature,
        showFooter: resolved.sections.showFooter,
        status: resolved.stateValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(
    () => () => {
      reset()
      resetTextDrafts()
      resetTextList()
    },
    []
  )

  const previewReady = (isEdit ? Boolean(resolved) : true) && textsReady
  // El payload de estilo no incluye los textos por sí solo (viven en un store aparte, no en el
  // formulario) — se agregan acá leyendo el estado más reciente del borrador en cada llamada
  // (`.getState()`, no una variable capturada), para que el preview siempre imprima lo que el
  // usuario ve en el tab "Textos extra", incluso cuando cambia sin tocar ningún campo de estilo.
  const stylePayloadWithTexts = (values: ProformaTemplateFormValues): Record<string, unknown> => ({
    ...toProformaTemplateStylePayload(values),
    texts: useProformaTemplateTextDraftStore
      .getState()
      .rows.filter((r) => !r.deleted)
      .map((r) => ({ key: r.key, content: r.content, visible: r.visible, order: r.order })),
  })

  const {
    previewUrl,
    isLoading: isLoadingPreview,
    isError: isPreviewError,
    refresh: refreshPreview,
  } = useLiveStylePreview(form, stylePayloadWithTexts, previewReady, GENERAL_TAB_FIELDS)

  // El watcher de estilos del hook solo escucha cambios del formulario (react-hook-form) — los
  // textos viven en un store aparte y no lo disparan, así que se resuscribe acá directo al store
  // para regenerar el preview (debounced) cada vez que el borrador de textos cambia.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const unsubscribe = useProformaTemplateTextDraftStore.subscribe(() => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => refreshPreview(), 600)
    })
    return () => {
      if (timer) clearTimeout(timer)
      unsubscribe()
    }
  }, [])

  const onSubmit = async (values: ProformaTemplateFormValues) => {
    const payload = toProformaTemplatePayload(values)
    // El id se obtiene DENTRO de la acción (creando o actualizando la plantilla) y solo después de
    // tenerlo se sincronizan los textos — nunca al revés, porque los textos necesitan el
    // `template_id` real para guardarse.
    let savedId: number | null = null

    const confirmed = await swalConfirmAction({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear plantilla de proforma?',
      text: values.name,
      confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear',
      cancelText: 'Cancelar',
      loading: { title: isEdit ? 'Actualizando plantilla...' : 'Registrando plantilla...' },
      action: async ({ update: setStep, close, showError }) => {
        if (isEdit) {
          const success = await updateTemplate(resolved!.id, payload)
          if (!success) return showError('No se pudo actualizar la plantilla.')
          savedId = resolved!.id
        } else {
          const created = await create(payload)
          if (!created) return showError('No se pudo crear la plantilla.')
          savedId = created.id
        }

        setStep({ title: 'Registrando textos...' })
        const sync = await syncToTemplate(savedId)
        if (!sync.ok) {
          return showError(sync.error ?? 'La plantilla se guardó, pero los textos no.')
        }

        close()
      },
    })

    if (!confirmed) {
      if (savedId == null) {
        applyApiErrors(form, fieldErrors)
      } else if (!isEdit) {
        // La plantilla ya quedó creada aunque los textos fallaran — se deja seguir editando ahí
        // en vez de perder el registro y obligar a crear todo de nuevo.
        router.push(`/proforma-templates/edit/${savedId}`)
      }
      return
    }

    await swalSuccess(isEdit ? 'Actualizado' : 'Creado', values.name)
    if (!isEdit && savedId) router.push(`/proforma-templates/edit/${savedId}`)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <Tabs defaultValue="general" className="flex flex-col gap-4">
            <TabsList className="h-auto flex-wrap">
              {/* El `span` intermedio evita que el `data-state` del tooltip pise el que usa Tabs
                  para marcar la pestaña activa (ver el mismo patrón en proforma-detail.tsx).
                  Los nombres y el número de paso buscan que el usuario entienda, sin adivinar,
                  qué hace cada pestaña y en qué orden conviene llenarlas. */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex flex-1">
                    <TabsTrigger value="general" className="w-full gap-1.5">
                      <FileText className="size-3.5" />
                      1. Datos generales
                    </TabsTrigger>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Nombre, tipo de proforma y estado de la plantilla</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex flex-1">
                    <TabsTrigger value="estilos" className="w-full gap-1.5">
                      <Palette className="size-3.5" />
                      2. Diseño del PDF
                    </TabsTrigger>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Colores, tipografías y tamaños del encabezado, cuerpo y pie de página
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex flex-1">
                    <TabsTrigger value="secciones" className="w-full gap-1.5">
                      <Eye className="size-3.5" />
                      3. Qué se muestra
                    </TabsTrigger>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Muestra u oculta bloques que el PDF ya tiene (logo, datos de la empresa, firma,
                  etc.). No agrega secciones nuevas al documento.
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex flex-1">
                    <TabsTrigger value="textos" className="w-full gap-1.5">
                      <Type className="size-3.5" />
                      4. Textos extra {resolved ? `(${resolved.textsCount})` : ''}
                    </TabsTrigger>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Bloques de texto libre adicionales dentro del documento
                </TooltipContent>
              </Tooltip>
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
              isError={isPreviewError}
              onRefresh={refreshPreview}
              isVisible={showPreview}
              onToggleVisible={() => setPreviewVisible(!showPreview)}
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
