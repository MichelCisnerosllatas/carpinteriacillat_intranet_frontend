'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Pencil, LayoutGrid, Settings } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'
import { getVisibilityStateOption } from '@/shared/config/entity-states'
import { useTabQueryParam } from '@/shared/lib/use-tab-query-param'
import { usePreviewOnView } from '@/shared/hooks/use-preview-on-view'
import type { PreviewPayload } from '@/widgets/landing-preview/landing-preview.types'
import { getGroupedSectionConfig } from '@/features/sectionimages/grouped'
import { useSectionListStore } from '../../stores/useSectionListStore'
import { SectionDetailInfoTab } from './tabs/info/section-detail-info-tab'
import { SectionDetailImagesTab } from './tabs/images/section-detail-images-tab'
import { SectionDetailButtonsTab } from './tabs/buttons/section-detail-buttons-tab'
import { SectionDetailItemsTab } from './tabs/items/section-detail-items-tab'
import { SectionDetailTestimoniesTab } from './tabs/testimonies/section-detail-testimonies-tab'
import { SectionDetailWorksTab } from './tabs/works/section-detail-works-tab'
import { getSectionWorksConfig } from './tabs/works/section-works.config'

const TABS = ['info', 'works', 'images', 'buttons', 'items', 'testimonies'] as const

/**
 * Detalle de Section — cabecera de solo lectura + Tabs. Cada tab es su propio componente bajo
 * `./tabs/<nombre>/` (Info general, Imágenes, Botones, Items) para que crecer uno no signifique
 * tocar los demás. La pestaña activa vive en `?tab=` de la URL (ver `useTabQueryParam`): así un
 * "volver" desde un formulario hijo (crear un botón, una imagen, etc.) recupera la pestaña
 * correcta en vez de siempre caer en la primera.
 */
export function SectionDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, loadById, setCurrentItem } = useSectionListStore()
  const [activeTab, setActiveTab] = useTabQueryParam(TABS, 'info')

  // Siempre trae el registro fresco del backend — no depende de que la tabla ya esté cargada en memoria.
  useEffect(() => {
    void loadById(Number(id))
    return () => setCurrentItem(null)
  }, [id])

  const item = currentItem && String(currentItem.id) === id ? currentItem : items.find((i) => String(i.id) === id) ?? null

  // Solo lectura: no hay un form.watch() que dispare esto — se manda una vez, cuando cambia QUÉ
  // sección se está viendo (ver use-preview-on-view.ts). Antes del "if (!item) return" a
  // propósito: los hooks se llaman siempre, en el mismo orden, en cada render.
  usePreviewOnView(item?.id, (): PreviewPayload => ({
    entity: 'section',
    id: item!.id,
    id_navigation: item!.idNavigation ?? undefined,
    fields: {
      id_type_section: item!.idTypesection,
      section_title: item!.title,
      section_subtitle: item!.subtitle,
      section_description: item!.description,
      section_content: item!.content,
      section_variant: item!.variant,
      section_state: item!.stateValue === 1,
    },
  }))

  if (!item) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>

  const stateOpt = getVisibilityStateOption(item.stateValue)

  // Qué tabs mostrar — config de ESTA sección puntual (`web_settings`, tabla
  // `section_web_setting`, ver SectionSeeder). A diferencia de antes, "Info general" también es
  // configurable ahora (`tab_info`) — así que si la URL trae un `?tab=` que ya no aplica
  // (cambiaron los flags, o alguien la escribió a mano), no se puede asumir que "info" siempre
  // esté disponible: se cae al PRIMER tab visible en el orden de `TABS`.
  const showInfo = item.tabInfo
  const showImages = item.tabImages
  const showButtons = item.tabButtons
  const showItems = item.tabItems
  // No hay flag en `section_web_setting` para esto — a diferencia de las demás pestañas, los
  // testimonios no son un concepto genérico de cualquier sección, solo existen para la única
  // sección tipo `testimonial_carousel` de todo el sitio (ver TestimonyWebSeeder).
  const showTestimonies = item.typesectionKey === 'testimonial_carousel'
  // «Galería» / «Restauración»: su contenido son trabajos (`web_works`). El flag dice SI se muestra
  // la pestaña; la config del tipo de sección dice QUÉ trabajos lista (ver section-works.config.ts).
  const worksConfig = getSectionWorksConfig(item.typesectionKey)
  const showWorks = item.tabWorks && worksConfig !== null
  const visibility: Record<string, boolean> = {
    info: showInfo, works: showWorks, images: showImages, buttons: showButtons, items: showItems, testimonies: showTestimonies,
  }
  const effectiveTab = visibility[activeTab] ? activeTab : (TABS.find((t) => visibility[t]) ?? activeTab)

  // Secciones especiales con pestaña de items propia (ver GROUPED_SECTION_CONFIG[...].itemsTab):
  //   carrusel «Muebles a medida» → "Categorías".
  // Esa pestaña va ANTES de Imágenes (Info general | Categorías | Imágenes).
  // El resto (incluido el hero de Servicios) sigue con "Items" en su lugar de siempre.
  const groupedConfig = getGroupedSectionConfig(item.typesectionKey)
  const specialItemsTab = groupedConfig?.itemsTab ?? null
  const itemsTabTrigger = showItems && (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex flex-1">
          <TabsTrigger value="items" className="w-full">{specialItemsTab?.label ?? 'Items'}</TabsTrigger>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {specialItemsTab?.tooltip ?? 'Estadísticas, características, ubicaciones y valoraciones'}
      </TooltipContent>
    </Tooltip>
  )

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      {/* Responsive por el ancho del CONTENEDOR (`@container`), no de la pantalla: con el panel de
          vista previa abierto el contenido es mucho más angosto que la ventana, y con `sm:` los
          botones se quedaban a la derecha aplastando el texto en una columna mínima. */}
      <div className="@container overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="flex flex-col gap-4 p-4 @md:p-6 @3xl:flex-row @3xl:items-start @3xl:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3 @md:gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm @md:size-14">
              <LayoutGrid className="size-6 @md:size-7" />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <div>
                <h2 className="break-words text-xl font-bold leading-tight @md:text-2xl">{item.name}</h2>
                {item.title && <p className="text-sm text-muted-foreground">{item.title}</p>}
                {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
              </div>
              {item.description && (
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {item.typesectionName && (
                  <Badge variant="secondary" className="w-fit text-xs font-normal">{item.typesectionName}</Badge>
                )}
                <Badge variant="outline" className={cn('w-fit text-xs', stateOpt.badge)}>{stateOpt.label}</Badge>
              </div>
            </div>
          </div>
          {/* Angosto: debajo del texto, en una fila que puede partirse. Ancho: a la derecha. */}
          <div className="flex flex-wrap items-center gap-2 @3xl:shrink-0 @3xl:flex-nowrap">
            <Button
              variant="outline"
              size="sm"
              title="Configuración"
              onClick={() => { NProgress.start(); router.push(`/sections/settings/${item.id}`) }}
            >
              <Settings className="size-4 @sm:mr-1.5" /><span className="hidden @sm:inline">Configuración</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { NProgress.start(); router.push(`/sections/edit/${item.id}`) }}
            >
              <Pencil className="mr-1.5 size-4" />Editar
            </Button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs value={effectiveTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList>
          {
            /* El `span` intermedio es a propósito: `TooltipTrigger asChild` pisaría el `data-state`
            que usa Tabs para marcar la pestaña activa si se compusiera directo sobre
            `TabsTrigger` (ambos primitivos de Radix escriben ese mismo atributo en el mismo
            nodo). Ver proforma-detail.tsx, mismo patrón. */
          }

          {showInfo && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex flex-1">
                  <TabsTrigger value="info" className="w-full">Info general</TabsTrigger>
                </span>
              </TooltipTrigger>
              <TooltipContent>Tipo, navegación, contenido y fechas</TooltipContent>
            </Tooltip>
          )}

          {showWorks && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex flex-1">
                  <TabsTrigger value="works" className="w-full">Trabajos</TabsTrigger>
                </span>
              </TooltipTrigger>
              <TooltipContent>{worksConfig?.title ?? 'Trabajos'} que muestra esta sección</TooltipContent>
            </Tooltip>
          )}

          {/* Carrusel: "Categorías" va antes de "Imágenes" */}
          {specialItemsTab && itemsTabTrigger}

          {showImages && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex flex-1">
                  <TabsTrigger value="images" className="w-full">Imágenes</TabsTrigger>
                </span>
              </TooltipTrigger>
              <TooltipContent>Imágenes asociadas a esta sección</TooltipContent>
            </Tooltip>
          )}

          {showButtons && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex flex-1">
                  <TabsTrigger value="buttons" className="w-full">Botones</TabsTrigger>
                </span>
              </TooltipTrigger>
              <TooltipContent>Botones (CTA) de esta sección</TooltipContent>
            </Tooltip>
          )}

          {!specialItemsTab && itemsTabTrigger}

          {showTestimonies && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex flex-1">
                  <TabsTrigger value="testimonies" className="w-full">Testimonios</TabsTrigger>
                </span>
              </TooltipTrigger>
              <TooltipContent>Testimonios de clientes de esta sección</TooltipContent>
            </Tooltip>
          )}
        </TabsList>

        {showInfo && (
          <TabsContent value="info" className="flex flex-col gap-4">
            <SectionDetailInfoTab item={item} />
          </TabsContent>
        )}

        {showWorks && worksConfig && (
          <TabsContent value="works" className="flex flex-col gap-3">
            <SectionDetailWorksTab config={worksConfig} sectionId={item.id} />
          </TabsContent>
        )}

        {showImages && (
          <TabsContent value="images" className="flex flex-col gap-3">
            <SectionDetailImagesTab
              sectionId={item.id}
              typesectionKey={item.typesectionKey}
              canAdd={item.imagesAdd}
              canReorder={item.imagesReorder}
              canDelete={item.imagesDelete}
            />
          </TabsContent>
        )}

        {showButtons && (
          <TabsContent value="buttons" className="flex flex-col gap-3">
            <SectionDetailButtonsTab
              sectionId={item.id}
              canAdd={item.buttonsAdd}
              canReorder={item.buttonsReorder}
              canDelete={item.buttonsDelete}
            />
          </TabsContent>
        )}

        {showItems && (
          <TabsContent value="items" className="flex flex-col gap-3">
            <SectionDetailItemsTab
              sectionId={item.id}
              // Carrusel: los items son tarjetas (categorías)
              title={specialItemsTab?.title}
              addLabel={specialItemsTab ? groupedConfig?.addItemLabel : undefined}
              canAdd={item.itemsAdd}
              canReorder={item.itemsReorder}
              canDelete={item.itemsDelete}
            />
          </TabsContent>
        )}

        {showTestimonies && (
          <TabsContent value="testimonies" className="flex flex-col gap-3">
            <SectionDetailTestimoniesTab sectionId={item.id} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
