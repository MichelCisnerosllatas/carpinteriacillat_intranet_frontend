'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Pencil,
  FilePlus,
  FileStack,
  CalendarDays,
  Palette,
  Eye,
  FileText,
  Type as TypeIcon,
} from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Switch } from '@/shared/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { FieldTip } from '@/shared/ui/field-tip'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import { useProformaTypeSelectStore } from '@/features/proforma-types'
import {
  TemplateTextsManager,
  useProformaTemplateTextDraftStore,
  useProformaTemplateTextListStore,
} from '@/features/proforma-template-texts'
import { useProformaTemplateListStore } from '../../stores/useProformaTemplateListStore'
import { SECTION_GROUPS } from '../../data/data'
import { useSavedTemplatePreview } from '../preview/use-saved-template-preview'
import { TemplatePreviewCard } from '../preview/template-preview-card'
import NProgress from 'nprogress'

// Fila de solo lectura para un toggle de `sections` — mismo texto/tooltip que su versión
// editable en sections-tab.tsx, pero sin Switch interactivo (para eso está "Editar").
function ReadOnlySectionToggle({
  label,
  tip,
  checked,
}: {
  label: string
  tip: string
  checked: boolean
}) {
  return (
    <div className="flex flex-row items-center justify-between gap-2 rounded-md border p-3">
      <span className="text-sm font-normal">
        <FieldTip label={label} tip={tip} />
      </span>
      <div className="flex items-center gap-2">
        <span
          className={cn('text-xs', checked ? 'text-primary font-medium' : 'text-muted-foreground')}
        >
          {checked ? 'Visible' : 'Oculto'}
        </span>
        <Switch checked={checked} disabled />
      </div>
    </div>
  )
}

export function ProformaTemplateDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, setCurrentItem, loadById } = useProformaTemplateListStore()
  const { load: loadProformaTypes } = useProformaTypeSelectStore()
  const { setFromExisting } = useProformaTemplateTextDraftStore()
  const { loadByTemplateText } = useProformaTemplateTextListStore()

  useEffect(() => {
    if (!currentItem || String(currentItem.id) !== id) {
      const found = items.find((i) => String(i.id) === id)
      if (found) setCurrentItem(found)
      else void loadProformaTypes().then(() => loadById(Number(id)))
    }
  }, [id, currentItem, items])

  const item = currentItem && String(currentItem.id) === id ? currentItem : null

  // Misma función/efecto que resuelve la plantilla: se piden los textos ya guardados junto con
  // ella, en vez de esperar a que el usuario entre a la pestaña "Textos" — así, si más adelante
  // visita esa pestaña, `TemplateTextsManager` encuentra el borrador ya listo y no dispara un
  // segundo fetch (ver el guard por `initializedForTemplateId` ahí).
  useEffect(() => {
    if (!item) return
    if (useProformaTemplateTextDraftStore.getState().initializedForTemplateId === item.id) return
    void loadByTemplateText(item.id).then((ok) => {
      if (ok) setFromExisting(item.id, useProformaTemplateTextListStore.getState().items)
    })
  }, [item?.id])

  useEffect(
    () => () => {
      useProformaTemplateTextDraftStore.getState().reset()
      useProformaTemplateTextListStore.getState().reset()
    },
    []
  )

  const {
    previewUrl,
    isLoading: isLoadingPreview,
    isError: isPreviewError,
    refresh: refreshPreview,
  } = useSavedTemplatePreview(item?.id ?? null)

  if (!item)
    return (
      <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
        Cargando...
      </div>
    )

  const stateOpt = getStateOption(item.stateValue)

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-muted flex size-12 items-center justify-center rounded-lg">
                <FileStack className="text-muted-foreground size-5" />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                {item.proformaTypeName && (
                  <p className="text-muted-foreground text-sm">{item.proformaTypeName}</p>
                )}
                <Badge variant="outline" className={cn('mt-1 w-fit text-xs', stateOpt.badge)}>
                  {stateOpt.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        NProgress.start()
                        router.push('/proforma-templates/create')
                      }}
                    >
                      <FilePlus className="mr-1 size-4" />
                      Nueva
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Crear una plantilla nueva</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        NProgress.start()
                        router.push(`/proforma-templates/edit/${item.id}`)
                      }}
                    >
                      <Pencil className="mr-1 size-4" />
                      Editar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar esta plantilla</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="general" className="flex flex-col gap-4">
          <TabsList className="h-auto flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex flex-1">
                  <TabsTrigger value="general" className="w-full gap-1.5">
                    <CalendarDays className="size-3.5" />
                    Registro
                  </TabsTrigger>
                </span>
              </TooltipTrigger>
              <TooltipContent>Fechas de creación y última actualización</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex flex-1">
                  <TabsTrigger value="estilos" className="w-full gap-1.5">
                    <Palette className="size-3.5" />
                    Diseño del PDF
                  </TabsTrigger>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Colores y tipografías del encabezado, cuerpo y pie de página
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex flex-1">
                  <TabsTrigger value="secciones" className="w-full gap-1.5">
                    <Eye className="size-3.5" />
                    Qué se muestra
                  </TabsTrigger>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Qué bloques del PDF están visibles u ocultos en esta plantilla
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex flex-1">
                  <TabsTrigger value="textos" className="w-full gap-1.5">
                    <TypeIcon className="size-3.5" />
                    Textos ({item.textsCount})
                  </TabsTrigger>
                </span>
              </TooltipTrigger>
              <TooltipContent>Bloques de texto libre configurados en esta plantilla</TooltipContent>
            </Tooltip>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CalendarDays className="size-4" />
                  Registro
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creado el</span>
                  <span className="font-medium">{item.createdAt}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actualizado</span>
                  <span className="font-medium">{item.updatedAt || '—'}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estilos" className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Palette className="size-4" />
                  Colores
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4 text-sm">
                {[
                  { label: 'Fondo header', value: item.headerBgColor },
                  { label: 'Texto header', value: item.headerTextColor },
                  { label: 'Texto body', value: item.bodyTextColor },
                  { label: 'Borde body', value: item.bodyBorderColor },
                  { label: 'Fondo footer', value: item.footerBgColor },
                ].map(
                  ({ label, value }) =>
                    value && (
                      <div key={label} className="flex items-center gap-2">
                        <span
                          className="size-5 rounded-full border"
                          style={{ backgroundColor: value }}
                        />
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-xs">{label}</span>
                          <span className="text-xs font-medium">{value}</span>
                        </div>
                      </div>
                    )
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileText className="size-4" />
                  Tipografía
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fuente header</span>
                  <span className="font-medium">{item.headerFontFamily}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fuente body</span>
                  <span className="font-medium">{item.bodyFontFamily}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fuente footer</span>
                  <span className="font-medium">{item.footerFontFamily}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Título / subtítulo</span>
                  <span className="font-medium">
                    {item.headerTitleSize}px / {item.bodySubtitleSize}px
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Texto / tabla</span>
                  <span className="font-medium">
                    {item.bodyTextSize}px / {item.bodyTableSize}px
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distribución header</span>
                  <span className="font-medium">
                    {item.headerLayout === 'logo_izquierda' ? 'Logo izquierda' : 'Logo derecha'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="secciones" className="flex flex-col gap-4">
            <p className="text-muted-foreground text-xs">
              Estos son los bloques que se muestran u ocultan en el PDF de esta plantilla. Para
              cambiarlos, entra a "Editar".
            </p>
            {SECTION_GROUPS.map((group) => (
              <Card key={group.key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-sm font-medium">
                    <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
                      <group.icon className="size-4" />
                    </span>
                    <span className="flex flex-col">
                      <span>{group.label}</span>
                      <span className="text-muted-foreground text-xs font-normal">
                        {group.hint}
                      </span>
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {group.fields.map(({ name, label, tip }) => (
                    <ReadOnlySectionToggle
                      key={name}
                      label={label}
                      tip={tip}
                      checked={item.sections[name]}
                    />
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="textos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TypeIcon className="size-4" />
                  Textos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TemplateTextsManager templateId={item.id} readOnly />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex flex-col gap-4 xl:sticky xl:top-4 xl:self-start">
        <TemplatePreviewCard
          previewUrl={previewUrl}
          isLoading={isLoadingPreview}
          isError={isPreviewError}
          onRefresh={refreshPreview}
        />
      </div>
    </div>
  )
}
