'use client'

import { Landmark } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { useCan } from '@/features/auth/hooks/usePermission'

export function CompanyBankAccountsPrimaryButtons() {
  // Solo si tiene permiso de crear cuentas bancarias (ver ROLES_Y_PERMISOS.md)
  const canCreate = useCan('company_bank_accounts.create')
  if (!canCreate) return null

  return (
    <div className="flex gap-2">
      <Button asChild className="space-x-1">
        <Link href="/company-bank-accounts/create">
          <Landmark size={18} />
          <span>Nueva Cuenta Bancaria</span>
        </Link>
      </Button>
    </div>
  )
}
