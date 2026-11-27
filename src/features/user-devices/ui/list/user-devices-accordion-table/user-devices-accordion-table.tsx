'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { Accordion } from '@/shared/ui/accordion'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { DataTableFilterActions } from '@/shared/ui/data-table/filter-actions'
import { useUserDeviceListStore } from '../../../stores/useUserDeviceListStore'
import { UserDevicesError } from '../../user-devices-error'
import type { UserDevice } from '../../../data/schema'
import type { UserGroup } from './types'
import { UserDeviceGroup } from './user-device-group'

// ─── Tabla principal ──────────────────────────────────────────────────────────

export function UserDevicesAccordionTable() {
  const { devices, filters, hasLoaded, isInitialLoading, isFetching, isError, message, load } =
    useUserDeviceListStore()

  const [search, setSearch] = useState(filters.search ?? '')
  const [isActive, setIsActive] = useState<string>(
    filters.is_active !== undefined ? String(filters.is_active) : 'all'
  )
  const [platform, setPlatform] = useState<string>(filters.platform ?? 'all')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const appliedFilters = useRef({ search, isActive, platform })

  useEffect(() => {
    if (!hasLoaded && !isInitialLoading) {
      void load({ page: 1, per_page: 100 })
    }
  }, [hasLoaded, isInitialLoading, load])

  const applyFilters = useCallback(
    (overrides: Record<string, unknown> = {}) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        void load({
          page: 1,
          per_page: 100,
          search: search || undefined,
          is_active: isActive !== 'all' ? (Number(isActive) as 0 | 1) : undefined,
          platform: platform !== 'all' ? (platform as UserDevice['platform']) : undefined,
          ...overrides,
        })
      }, 500)
    },
    [load, search, isActive, platform]
  )

  useEffect(() => {
    const prev = appliedFilters.current
    const changed =
      prev.search !== search || prev.isActive !== isActive || prev.platform !== platform
    appliedFilters.current = { search, isActive, platform }
    if (!changed) return
    applyFilters()
  }, [search, isActive, platform]) // eslint-disable-line react-hooks/exhaustive-deps

  // Limpia los filtros (el efecto de arriba recarga la lista)
  const resetFilters = () => {
    setSearch('')
    setIsActive('all')
    setPlatform('all')
  }

  // Vuelve a pedir la lista con los filtros actuales
  const handleRefresh = () => {
    void load({ page: 1, per_page: 100 })
  }

  const hasActiveFilters = search !== '' || isActive !== 'all' || platform !== 'all'

  // Agrupar por usuario
  const groups: UserGroup[] = []
  const groupMap = new Map<number, UserGroup>()

  for (const device of devices) {
    const userId = device.userId
    if (!groupMap.has(userId)) {
      const g: UserGroup = {
        userId,
        userName: device.user
          ? `${device.user.personName} ${device.user.personLastname}`.trim() || device.user.email
          : `Usuario #${userId}`,
        userEmail: device.user?.email ?? '',
        userRole: device.user?.roleName ?? '',
        devices: [],
      }
      groupMap.set(userId, g)
      groups.push(g)
    }
    groupMap.get(userId)!.devices.push(device)
  }

  if (isError) {
    return <UserDevicesError message={message ?? undefined} onRetry={() => void load()} />
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Buscar usuario, dispositivo, IP..."
          className="h-8 w-[240px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          value={isActive}
          onValueChange={(v) => setIsActive(v)}
        >
          <SelectTrigger className="h-8 w-[130px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="1">Activas</SelectItem>
            <SelectItem value="0">Cerradas</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={platform}
          onValueChange={(v) => setPlatform(v)}
        >
          <SelectTrigger className="h-8 w-[130px]">
            <SelectValue placeholder="Plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="web">Web</SelectItem>
            <SelectItem value="ios">iOS</SelectItem>
            <SelectItem value="android">Android</SelectItem>
            <SelectItem value="desktop">Desktop</SelectItem>
          </SelectContent>
        </Select>

        <DataTableFilterActions
          onClear={resetFilters}
          onRefresh={handleRefresh}
          hasActiveFilters={hasActiveFilters}
          isFetching={isFetching}
        />
      </div>

      {/* Resumen */}
      <div className="text-xs text-muted-foreground">
        {groups.length} usuario{groups.length !== 1 ? 's' : ''} · {devices.length} sesion{devices.length !== 1 ? 'es' : ''} en total
      </div>

      {/* Accordion */}
      {isInitialLoading || (!hasLoaded && isFetching) ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : groups.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          No se encontraron dispositivos.
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={groups.map((g) => String(g.userId))} className="flex flex-col gap-2">
          {groups.map((group) => (
            <UserDeviceGroup key={group.userId} group={group} />
          ))}
        </Accordion>
      )}
    </div>
  )
}
