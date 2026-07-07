import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Share2 } from 'lucide-react'
import { CompanySocialNetworksTable } from '@/features/company-social-networks/ui/list/company-social-networks-table'

export const metadata: Metadata = { title: 'Redes Sociales' }

export default function CompanySocialNetworksPage() {
  return (
    <>
      <Header fixed title="Redes Sociales" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Redes Sociales</h2>
            <p className="text-muted-foreground">Redes sociales de la empresa</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/company-social-networks/create"><Share2 size={18} /><span>Nueva Red Social</span></Link>
          </Button>
        </div>
        <CompanySocialNetworksTable />
      </main>
    </>
  )
}
