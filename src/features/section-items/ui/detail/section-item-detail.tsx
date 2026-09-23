'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import {
  LayoutGrid, Pencil, Settings,
  Phone, MessageCircle, Mail, MapPin, Rows3,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'
import { getVisibilityStateOption } from '@/shared/config/entity-states'
import { useTabQueryParam } from '@/shared/lib/use-tab-query-param'
import { SECTION_ITEM_TYPES } from '../../data/data'
import { useSectionItemListStore } from '../../stores/useSectionItemListStore'
import { SectionItemDetailInfoTab } from './tabs/info/section-item-detail-info-tab'
import { SectionItemDetailDetailsTab } from './tabs/details/section-item-detail-details-tab'

const TABS = ['info', 'detalles'] as const

/** Ícono representativo por `sectionitem_type` — solo para la cabecera del detalle (look & feel), no afecta ninguna lógica. Los tipos sin entrada acá caen en `LayoutGrid`. */
const TYPE_ICON: Partial<Record<string, LucideIcon>> = {
  phone: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  branch: MapPin,
  category: Rows3,
}

/**
 * Detalle de SectionItem — cabecera de solo lectura + Tabs (Info del item / Detalles), cada uno
 * su propio componente bajo `./tabs/<nombre>/`, igual patrón que `SectionDetail`. La pestaña
 * activa vive en `?tab=` de la URL (ver `useTabQueryParam`).
 */
export function SectionItemDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, loadById, setCurrentItem } = useSectionItemListStore()
  const [activeTab, setActiveTab] = useTabQueryParam(TABS, 'info')

  // Siempre trae el registro fresco del backend — necesario además porque el array `details`
  // solo viene en la respuesta de getById (whenLoaded), no en la lista.
  useEffect(() => {
    void loadById(Number(id))
    return () => setCurrentItem(null)
  }, [id])

  const item = currentItem && String(currentItem.id) === id ? currentItem : items.find((i) => String(i.id) === id) ?? null
  if (!item) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>

  const stateOpt = getVisibilityStateOption(item.stateValue)
  const typeLabel = SECTION_ITEM_TYPES.find((t) => t.value === item.type)?.label ?? item.type
  const detailsCount = item.details?.length ?? 0
  const TypeIcon = (item.type && TYPE_ICON[item.type]) || LayoutGrid

  // Qué tabs mostrar — config de ESTE item puntual (`web_settings`, tabla
  // `section_web_setting`, ver SectionItemSeeder). "Info del item" también es configurable
  // ahora — si la URL trae un `?tab=` que ya no aplica, se cae al PRIMER tab visible.
  const showInfo = item.tabInfo
  const showDetails = item.tabDetails
  const visibility: Record<string, boolean> = { info: showInfo, detalles: showDetails }
  const effectiveTab = visibility[activeTab] ? activeTab : (TABS.find((t) => visibility[t]) ?? activeTab)

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm sm:size-14">
              <TypeIcon className="size-6 sm:size-7" />
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <h2 className="text-xl font-bold leading-tight sm:text-2xl">{item.title || item.label || `Item #${item.id}`}</h2>
                {item.subtitle && <p className="text-sm text-muted-foreground">{item.subtitle}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {typeLabel && (
                  <Badge variant="secondary" className="w-fit gap-1 text-xs font-normal">
                    <TypeIcon className="size-3" />{typeLabel}
                  </Badge>
                )}
                <Badge variant="outline" className={cn('w-fit text-xs', stateOpt.badge)}>{stateOpt.label}</Badge>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { NProgress.start(); router.push(`/section-items/settings/${item.id}`) }}
            >
              <Settings className="size-4 sm:mr-1.5" /><span className="hidden sm:inline">Configuración</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { NProgress.start(); router.push(`/section-items/edit/${item.id}`) }}
            >
              <Pencil className="mr-1.5 size-4" />Editar
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={effectiveTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList>
          {/* El `span` intermedio evita que Tooltip pise el `data-state` que usa Tabs para
              marcar la pestaña activa (ambos primitivos de Radix lo escriben en el mismo nodo
              si se compone `TooltipTrigger asChild` directo sobre `TabsTrigger`). */}
          {showInfo && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex flex-1">
                  <TabsTrigger value="info" className="w-full">Info del item</TabsTrigger>
                </span>
              </TooltipTrigger>
              <TooltipContent>Datos generales, contenido y ubicación</TooltipContent>
            </Tooltip>
          )}
          {showDetails && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex flex-1">
                  <TabsTrigger value="detalles" className="w-full">
                    Detalles
                    {detailsCount > 0 && (
                      <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px] font-normal">{detailsCount}</Badge>
                    )}
                  </TabsTrigger>
                </span>
              </TooltipTrigger>
              <TooltipContent>Sub-registros de este item</TooltipContent>
            </Tooltip>
          )}
        </TabsList>

        {showInfo && (
          <TabsContent value="info">
            <SectionItemDetailInfoTab item={item} />
          </TabsContent>
        )}

        {showDetails && (
          <TabsContent value="detalles">
            <SectionItemDetailDetailsTab item={item} canAdd={item.detailsAdd} canReorder={item.detailsReorder} canDelete={item.detailsDelete} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
