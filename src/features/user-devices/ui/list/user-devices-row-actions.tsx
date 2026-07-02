'use client'

import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { type Row } from '@tanstack/react-table'
import { Eye, MoreHorizontal, ShieldOff, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { swalConfirmAction, swalDeleteConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useUserDeviceListStore } from '../../stores/useUserDeviceListStore'
import type { UserDevice } from '../../data/schema'

export function UserDevicesRowActions({ row }: { row: Row<UserDevice> }) {
  const router = useRouter()
  const { revoke, deleteDevice, setCurrentDevice } = useUserDeviceListStore()
  const device = row.original

  const deviceLabel = device.deviceName ?? device.browser ?? `Dispositivo #${device.id}`

  const handleView = () => {
    setCurrentDevice(device)
    NProgress.start()
    router.push(`/user-devices/${device.id}`)
  }

  const handleRevoke = async () => {
    await swalConfirmAction({
      title: '¿Revocar sesión?',
      text: `Se cerrará la sesión de "${deviceLabel}". El usuario deberá iniciar sesión nuevamente.`,
      confirmText: 'Sí, revocar',
      cancelText: 'Cancelar',
      danger: true,
      loading: { title: 'Revocando...' },
      action: async ({ close, showError }) => {
        const ok = await revoke(device.id)
        if (ok) {
          toastSuccess('Sesión revocada', `La sesión de "${deviceLabel}" fue cerrada.`)
          close()
        } else {
          showError('No se pudo revocar la sesión.')
        }
      },
    })
  }

  const handleDelete = async () => {
    await swalDeleteConfirm(
      '¿Eliminar dispositivo?',
      `Se eliminará permanentemente el registro de "${deviceLabel}".`,
      async ({ close, showError }) => {
        const ok = await deleteDevice(device.id)
        if (ok) {
          toastSuccess('Dispositivo eliminado', `"${deviceLabel}" fue eliminado.`)
          close()
        } else {
          showError('No se pudo eliminar el dispositivo.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={handleView}>
          Ver detalle <DropdownMenuShortcut><Eye size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>

        {device.isActive && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => void handleRevoke()}
            >
              Revocar <DropdownMenuShortcut><ShieldOff size={16} /></DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={() => void handleDelete()}
        >
          Eliminar <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
