'use client'

import { Compass, Eye } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { FooterGuide } from '@/features/sections/ui/footer-guide/footer-guide'
import { FooterVisibilityForm } from './form/footer-visibility-form'

/**
 * Dos responsabilidades separadas, cada una con su propio store:
 * - "Visibilidad": mostrar/ocultar el footer completo y cada una de sus columnas
 *   (`useFooterSettingStore` → `footer_setting`).
 * - "Guía": accesos directos a dónde se edita el CONTENIDO de cada columna (logo, redes,
 *   servicios) — no es un formulario, son links a otros módulos (`FooterGuide`).
 */
export function FooterSettingsTabs() {
  return (
    <Tabs defaultValue="visibility" className="flex-1">
      <TabsList>
        <TabsTrigger value="visibility" className="gap-1.5">
          <Eye className="size-4" />Visibilidad
        </TabsTrigger>
        <TabsTrigger value="guide" className="gap-1.5">
          <Compass className="size-4" />Guía
        </TabsTrigger>
      </TabsList>

      <TabsContent value="visibility" className="pt-4">
        <FooterVisibilityForm />
      </TabsContent>

      <TabsContent value="guide" className="pt-4">
        <FooterGuide />
      </TabsContent>
    </Tabs>
  )
}
