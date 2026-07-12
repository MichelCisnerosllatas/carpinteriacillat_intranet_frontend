// src/features/proformas/ui/form/proforma-form/actions-section.tsx
'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

interface ActionsSectionProps {
  proformaId: number | null
  isManualSaving: boolean
  goToList: () => void
}

/** Botones Cancelar/Finalizar y Registrar/Guardar cambios, al pie del formulario. */
export function ActionsSection({ proformaId, isManualSaving, goToList }: ActionsSectionProps) {
  return (
    <div className="flex items-center justify-end gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="outline" onClick={goToList} disabled={isManualSaving}>
            {proformaId ? 'Finalizar' : 'Cancelar'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {proformaId
            ? 'Ya está registrada — vuelve al listado de proformas.'
            : 'Sale sin registrar nada — todavía no se guardó ningún dato.'}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="submit" disabled={isManualSaving} className="min-w-28">
            {isManualSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {proformaId ? 'Guardando...' : 'Registrando...'}
              </>
            ) : proformaId ? (
              'Guardar cambios'
            ) : (
              'Registrar'
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {proformaId
            ? 'Actualiza los datos de la cabecera.'
            : 'Registra la proforma en estado PENDIENTE y sube las líneas del carrito.'}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
