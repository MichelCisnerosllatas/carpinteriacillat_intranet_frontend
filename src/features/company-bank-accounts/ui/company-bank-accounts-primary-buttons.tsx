'use client'

import { Landmark } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'

export function CompanyBankAccountsPrimaryButtons() {
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
