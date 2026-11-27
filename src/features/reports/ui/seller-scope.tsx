'use client'

import { UserRound, UsersRound } from 'lucide-react'
import { useSellerSelectStore } from '@/features/sellers'

type Props = {
  canViewAll: boolean
  sellerId: number | null
  sellerName: string | null
}

// Deja claro de quién son las cifras: "Mostrando: Juan Pérez", "todos los vendedores" o "Mis ventas".
export function SellerScope({ canViewAll, sellerId, sellerName }: Props) {
  // Si el backend no manda el nombre, se toma de la lista del selector de vendedores.
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
