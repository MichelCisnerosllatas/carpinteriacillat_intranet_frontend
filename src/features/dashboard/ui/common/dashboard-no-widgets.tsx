import { LayoutDashboard } from 'lucide-react'

// Aviso cuando el rol no tiene ningún widget habilitado en la pantalla del dashboard.
export function DashboardNoWidgets() {
  return (
    <div className='flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-10 text-center'>
      <LayoutDashboard className='text-muted-foreground/60 h-8 w-8' />
      <p className='font-medium'>No tienes widgets habilitados en esta pantalla</p>
      <p className='text-muted-foreground max-w-sm text-sm'>
        Pide a un administrador que active los widgets que necesitas en los permisos de tu rol.
      </p>
    </div>
  )
}
