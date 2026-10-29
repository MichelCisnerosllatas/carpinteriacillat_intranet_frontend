import Link from 'next/link'
import { ArrowUpDown, Hammer } from 'lucide-react'
import { Button } from '@/shared/ui/button'

/** Botones de la cabecera del listado: ordenar la galería y crear un trabajo. */
export function WebWorksPrimaryButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline" className="space-x-1">
        <Link href="/web-works/reorder"><ArrowUpDown size={18} /><span>Ordenar</span></Link>
      </Button>
      <Button asChild className="space-x-1">
        <Link href="/web-works/create"><Hammer size={18} /><span>Nuevo trabajo</span></Link>
      </Button>
    </div>
  )
}
