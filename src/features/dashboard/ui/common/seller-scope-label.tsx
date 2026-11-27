'use client'

import { UserRound, UsersRound } from 'lucide-react'
import { useSellerSelectStore } from '@/features/sellers'

type Props = {
  /** true si el usuario tiene `sales.view_all` (puede ver a todos los vendedores). */
  canViewAll: boolean
  sellerId: number | null
  /** Nombre del vendedor filtrado (sale de `period.seller_name` de la respuesta). */
  sellerName?: string | null
}

// Texto que deja claro de quién son las cifras que se están viendo:
// "Mostrando: Juan Pérez", "Mostrando: todos los vendedores" o "Mis ventas".
export function SellerScopeLabel({ canViewAll, sellerId, sellerName }: Props) {
  // Mientras llega la respuesta, el nombre se toma de la lista del selector de vendedores.
  const options = useSellerSelectStore((s) => s.options)
  const name = sellerName ?? options.find((o) => o.id === sellerId)?.name ?? null
  const Icon = canViewAll && !sellerId ? UsersRound : UserRound
  const text = !canViewAll
    ? 'Mis ventas'
    : sellerId
      ? `Mostrando: ${name ?? 'vendedor seleccionado'}`
      : 'Mostrando: todos los vendedores'

  return (
    <p className='text-muted-foreground flex items-center gap-1.5 text-xs font-medium'>
      <Icon className='h-3.5 w-3.5' /> {text}
    </p>
  )
}
