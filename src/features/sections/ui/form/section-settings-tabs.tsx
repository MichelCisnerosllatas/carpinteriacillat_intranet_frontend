'use client'

import { Palette, SlidersHorizontal } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { useTabQueryParam } from '@/shared/lib/use-tab-query-param'
import { SectionAppearanceEditor } from '../appearance/section-appearance-editor'
import { SectionSettingsForm } from './section-settings-form'

const TABS = ['appearance', 'structure'] as const

/**
 * Configuración de Sección tiene dos responsabilidades separadas, cada una con su propio store
 * (`useSectionAppearanceStore` / `useSectionFormStore`+`useSectionListStore`) para que no
 * se pisen entre sí `isSubmitting`/`error`:
 * - "Apariencia": qué MUESTRA la web pública de esta sección (visibilidad de cada elemento,
 *   textos, números, opciones y listas) — `SectionAppearanceEditor`, armado solo con el catálogo
 *   `display_settings_schema` que manda el backend.
 * - "Estructura": qué tabs del detalle se muestran y qué acciones (agregar/reordenar/eliminar)
 *   están permitidas en Imágenes/Botones/Items — `SectionSettingsForm` (sin cambios).
 * La pestaña activa vive en `?tab=` (ej. el botón "Apariencia" del detalle abre `?tab=appearance`).
 */
export function SectionSettingsTabs({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useTabQueryParam(TABS, 'appearance')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
      <TabsList>
        <TabsTrigger value="appearance" className="gap-1.5">
          <Palette className="size-4" />Apariencia
        </TabsTrigger>
        <TabsTrigger value="structure" className="gap-1.5">
          <SlidersHorizontal className="size-4" />Estructura
        </TabsTrigger>
      </TabsList>

      {/* forceMount: pasar a "Estructura" y volver no debe perder los cambios sin guardar */}
      <TabsContent value="appearance" forceMount className="pt-4 data-[state=inactive]:hidden">
        <SectionAppearanceEditor id={id} />
      </TabsContent>

      <TabsContent value="structure" className="pt-4">
        <SectionSettingsForm id={id} />
      </TabsContent>
    </Tabs>
  )
}
