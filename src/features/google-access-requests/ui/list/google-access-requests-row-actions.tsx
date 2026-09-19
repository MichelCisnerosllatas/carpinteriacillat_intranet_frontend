'use client'

import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/shared/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastSuccess } from '@/shared/lib/toast'
import { RoleSelect } from '@/features/roles/ui/role-select'
import { useGoogleAccessRequestActionStore } from '../../stores/useGoogleAccessRequestActionStore'
import type { GoogleAccessRequest } from '../../data/schema'

export function GoogleAccessRequestRowActions({ row }: { row: Row<GoogleAccessRequest> }) {
  const { approve, reject, isSubmitting } = useGoogleAccessRequestActionStore()
  const [approveOpen, setApproveOpen] = useState(false)
  const [idRol, setIdRol] = useState<string>('')

  const isPending = row.original.status === 'pending'
  const displayName = row.original.name?.trim() || row.original.email

  const handleApprove = async () => {
    if (!idRol) return
    const ok = await approve(row.original.id, Number(idRol))
    if (ok) {
      toastSuccess('Solicitud aprobada', `Se creó el usuario para "${displayName}".`)
      setApproveOpen(false)
      setIdRol('')
    }
  }

  const handleReject = async () => {
    await swalDeleteConfirm(
      `¿Rechazar el acceso de "${displayName}"?`,
      'Podrás revisarlo de nuevo más adelante si cambias de opinión.',
      async ({ close, showError }) => {
        const ok = await reject(row.original.id)
        if (ok) {
          toastSuccess('Solicitud rechazada', `"${displayName}" no podrá entrar con Google.`)
          close()
        } else {
          showError('No se pudo rechazar la solicitud.')
        }
      },
      { title: 'Rechazando...' }
    )
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted" disabled={!isPending}>
                  <DotsHorizontalIcon className="h-4 w-4" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </DropdownMenuTrigger>
            </span>
          </TooltipTrigger>
          <TooltipContent>{isPending ? 'Más acciones' : 'Ya fue revisada'}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => setApproveOpen(true)}>
            Aprobar <DropdownMenuShortcut><CheckCircle2 size={16} /></DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void handleReject()} className="text-red-500!">
            Rechazar <DropdownMenuShortcut><XCircle size={16} /></DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar acceso de {displayName}</DialogTitle>
            <DialogDescription>
              Se creará una persona y un usuario reales con el correo <strong>{row.original.email}</strong>. Elige el rol que tendrá.
            </DialogDescription>
          </DialogHeader>

          <RoleSelect value={idRol} onValueChange={setIdRol} placeholder="Seleccionar rol..." />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setApproveOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => void handleApprove()} disabled={!idRol || isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 size-4 animate-spin" />Aprobando...</> : 'Aprobar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
