import type { Metadata } from 'next'
import { IntranetNotFound } from '@/widgets/not-found/intranet-not-found'

export const metadata: Metadata = { title: 'Página no encontrada' }

/**
 * 404 dentro del intranet: se dibuja con el sidebar y el header.
 * Lo activa la ruta "comodín" [...notFound]/page.tsx cuando ninguna otra ruta coincide.
 */
export default function IntranetNotFoundPage() {
  return <IntranetNotFound />
}
