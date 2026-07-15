'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, FileStack, CalendarDays, Palette, Type as TypeIcon } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import { useProformaTypeSelectStore } from '@/features/proforma-types'
import { useProformaTemplateListStore } from '../../stores/useProformaTemplateListStore'
import { useSavedTemplatePreview } from '../preview/use-saved-template-preview'
import { TemplatePreviewCard } from '../preview/template-preview-card'
import NProgress from 'nprogress'

export function ProformaTemplateDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, setCurrentItem, loadById } = useProformaTemplateListStore()
  const { load: loadProformaTypes } = useProformaTypeSelectStore()

  useEffect(() => {
    if (!currentItem || String(currentItem.id) !== id) {
      const found = items.find((i) => String(i.id) === id)
      if (found) setCurrentItem(found)
      else void loadProformaTypes().then(() => loadById(Number(id)))
    }
  }, [id, currentItem, items])

  const item = currentItem && String(currentItem.id) === id ? currentItem : null
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
            </div>
          </CardContent>
        </Card>

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
              <TypeIcon className="size-4" />
              Tipografía y secciones
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
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bloques de texto</span>
              <span className="font-medium">{item.textsCount}</span>
            </div>
          </CardContent>
        </Card>

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
