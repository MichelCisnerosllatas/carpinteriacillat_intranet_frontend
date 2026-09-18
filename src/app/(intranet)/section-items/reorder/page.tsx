'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/widgets/header/header'
import { Card, CardContent } from '@/shared/ui/card'
import { SectionItemsBreadcrumb } from '@/features/section-items/ui/section-items-breadcrumb'
import { SectionItemsReorderList } from '@/features/section-items/ui/reorder/section-items-reorder-list'
import { SectionSelect } from '@/features/sections/ui/section-select'

export default function SectionItemReorderPage() {
  const searchParams = useSearchParams()
  const idSectionParam = Number(searchParams.get('id_section')) || undefined

  const [idSection, setIdSection] = useState<number | null>(idSectionParam ?? null)

  return (
    <>
      <Header fixed title="Reordenar Items de Sección" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionItemsBreadcrumb currentPage="Reordenar" />

        {idSection == null ? (
          <Card>
            <CardContent className="flex flex-col gap-3 pt-6">
              <p className="text-sm text-muted-foreground">Elige la sección cuyos items quieres reordenar.</p>
              <SectionSelect value={idSection} onValueChange={setIdSection} placeholder="Seleccionar sección" />
            </CardContent>
          </Card>
        ) : (
          <SectionItemsReorderList idSection={idSection} />
        )}
      </main>
    </>
  )
}
