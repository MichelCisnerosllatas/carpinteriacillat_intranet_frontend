'use client'

import { Eye, SlidersHorizontal } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { SectionContentVisibilityForm } from './section-content-visibility-form'
import { SectionSettingsForm } from './section-settings-form'

/**
 * Configuración de Sección tiene dos responsabilidades separadas, cada una con su propio store
 * (`useSectionContentVisibilityStore` / `useSectionFormStore`+`useSectionListStore`) para que no
 * se pisen entre sí `isSubmitting`/`error`:
 * - "Visibilidad": qué propiedades de CONTENIDO (título/subtítulo/descripción) se ven en el sitio
 *   público — `SectionContentVisibilityForm`.
 * - "Estructura": qué tabs del detalle se muestran y qué acciones (agregar/reordenar/eliminar)
 *   están permitidas en Imágenes/Botones/Items — `SectionSettingsForm` (sin cambios).
 */
export function SectionSettingsTabs({ id }: { id: string }) {
  return (
    <Tabs defaultValue="visibility" className="flex-1">
      <TabsList>
        <TabsTrigger value="visibility" className="gap-1.5">
          <Eye className="size-4" />Visibilidad
        </TabsTrigger>
        <TabsTrigger value="structure" className="gap-1.5">
          <SlidersHorizontal className="size-4" />Estructura
        </TabsTrigger>
      </TabsList>

      <TabsContent value="visibility" className="pt-4">
        <SectionContentVisibilityForm id={id} />
      </TabsContent>

      <TabsContent value="structure" className="pt-4">
        <SectionSettingsForm id={id} />
      </TabsContent>
    </Tabs>
  )
}
