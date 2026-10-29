// Botones de arriba de la lista: "Ordenar" y "Nueva alerta".

import Link from 'next/link'
import { ArrowUpDown, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export function WebAlertsPrimaryButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline" className="space-x-1">
        <Link href="/web-alerts/reorder"><ArrowUpDown size={18} /><span>Ordenar</span></Link>
      </Button>
      <Button asChild className="space-x-1">
        <Link href="/web-alerts/create"><Plus size={18} /><span>Nueva alerta</span></Link>
      </Button>
    </div>
  )
}
