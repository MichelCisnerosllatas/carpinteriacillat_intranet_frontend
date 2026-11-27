'use client'

import { Building2, Check, MapPin, ShieldCheck, Star } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import type { ProfileDto } from '../../model/profile.dto'
import { Row } from './row'

// ─── Pestaña: Organización (solo lectura) ─────────────────────────────────────

export function OrganizationTab({ profile }: { profile: ProfileDto }) {
  const activeBranchId = useAuthStore((s) => s.activeBranchId)
  const setActiveBranch = useAuthStore((s) => s.setActiveBranch)
  const canViewAllInSession = useAuthStore((s) => Boolean(s.session?.branch_filter.can_view_all))
  const companyName = profile.company?.trade_name || profile.company?.business_name || '—'

  return (
    <div className="flex flex-col gap-4">
      {/* Rol y empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4" />
            Rol y empresa
          </CardTitle>
          <CardDescription>Los asigna un administrador.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <Row label="Rol" value={profile.is_superadmin ? 'Superadministrador' : profile.role?.role_name} />
          <Separator />
          <div className="flex items-center gap-3 rounded-lg border p-3">
            {profile.company?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.company.logo_url} alt="Logo" className="size-10 rounded-md bg-white object-contain" />
            ) : (
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </span>
            )}
            <div className="grid min-w-0 leading-tight">
              <span className="truncate font-semibold">{companyName}</span>
              {profile.company?.tax_id && (
                <span className="truncate text-xs text-muted-foreground">RUC {profile.company.tax_id}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sucursales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="size-4" />
            Sucursales
          </CardTitle>
          <CardDescription>
            {profile.all_branches
              ? 'Trabajas en todas las sucursales.'
              : 'Sucursales donde trabajas. La activa es donde se registran tus ventas y proformas.'}
            {(profile.can_view_all_branches || canViewAllInSession) && ' Puedes ver los datos de todas las sucursales.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {profile.branches.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No tienes sucursales asignadas. Pide a un administrador que te asigne una.
            </p>
          )}
          {profile.branches.map((branch) => {
            const isActive = branch.id === activeBranchId
            return (
              <div key={branch.id} className="flex items-center gap-3 rounded-lg border p-3">
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                <div className="grid min-w-0 flex-1 leading-tight">
                  <span className="flex items-center gap-1.5 truncate text-sm font-medium">
                    {branch.name}
                    {branch.is_default && (
                      <Star className="size-3.5 fill-amber-400 text-amber-500" aria-label="Principal" />
                    )}
                  </span>
                  {branch.address && <span className="truncate text-xs text-muted-foreground">{branch.address}</span>}
                </div>
                {isActive ? (
                  <Badge className="gap-1">
                    <Check className="size-3.5" /> Activa
                  </Badge>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setActiveBranch(branch.id)}>
                    Usar esta
                  </Button>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
