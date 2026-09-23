'use client'

import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { ArrowUpDown, MessageSquareQuote, Plus, Settings } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { TestimonyTable } from '@/features/testimony-web/ui/list/testimony-table'

interface SectionDetailTestimoniesTabProps {
  sectionId: number
}

/**
 * Tab "Testimonios" del detalle de Section — solo aparece para la sección tipo
 * `testimonial_carousel` (ver `section-detail.tsx`), ya que en la práctica solo existe una en
 * todo el sitio. Lista embebida filtrada a esta sección (`TestimonyTable` con `idSection`), igual
 * patrón que Imágenes/Botones/Items. "Configuración"/"Reordenar"/"Nuevo testimonio" van SIN
 * `?id_section=` — a diferencia de las demás pestañas, tanto la configuración (singleton global)
 * como la sección misma se resuelven solas del lado del backend/store, no hay nada que elegir
 * (ver `testimony-web-setting-form.tsx` y `useTestimonySectionStore`).
 */
export function SectionDetailTestimoniesTab({ sectionId }: SectionDetailTestimoniesTabProps) {
  const router = useRouter()
  const goTo = (path: string) => { NProgress.start(); router.push(path) }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-medium"><MessageSquareQuote className="size-4" />Testimonios de la sección</h3>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => goTo('/testimony/settings')}>
            <Settings className="size-4 sm:mr-1.5" /><span className="hidden sm:inline">Configuración</span>
          </Button>
          <Button size="sm" variant="outline" onClick={() => goTo('/testimony/reorder')}>
            <ArrowUpDown className="mr-1.5 size-4" />Reordenar
          </Button>
          <Button size="sm" onClick={() => goTo('/testimony/create')}>
            <Plus className="mr-1.5 size-4" />Nuevo testimonio
          </Button>
        </div>
      </div>

      <TestimonyTable idSection={sectionId} />
    </div>
  )
}
