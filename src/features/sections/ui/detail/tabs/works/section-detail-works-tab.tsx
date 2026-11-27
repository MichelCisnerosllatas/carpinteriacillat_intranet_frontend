'use client'

// Pestaña "Trabajos" del detalle de las secciones «Galería» y «Restauración». Los trabajos NO son
// hijos de la sección (viven en `web_works`): esta pestaña los lista filtrados por el tipo que
// muestra la sección (ver section-works.config.ts) y permite administrarlos sin salir del detalle.
// Crear / editar / ordenar abren las pantallas de Galería → Trabajos y, al terminar, vuelven acá
// (la pestaña activa vive en `?tab=works`).
// En modo 'summary' (Galería, ver section-works.config.ts) no administra nada: muestra un
// resumen con enlaces (SectionWorksSummary).

import type { SectionWorksConfig } from './section-works.config'
import { SectionWorksSummary } from './section-works-summary/section-works-summary'
import { SectionWorksManager } from './section-works-manager'

export function SectionDetailWorksTab({ config, sectionId }: { config: SectionWorksConfig; sectionId: number }) {
  if (config.mode === 'summary') return <SectionWorksSummary config={config} sectionId={sectionId} />
  return <SectionWorksManager config={config} />
}
