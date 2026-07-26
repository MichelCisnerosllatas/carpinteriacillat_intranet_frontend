// src/features/company-settings/ui/form/company-setting-actions.tsx
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'

interface CompanySettingActionsProps {
  isSubmitting: boolean
}

export function CompanySettingActions({isSubmitting}: CompanySettingActionsProps) {
  return (
    <div
      className="
        sticky bottom-4 z-20
        flex items-center justify-end
        rounded-xl border bg-background/90 p-3
        shadow-lg shadow-black/5
        backdrop-blur-md
      "
    >
      <Button
        type="submit"
        disabled={isSubmitting}
        className="
          w-full min-w-40
          transition-transform duration-200
          active:scale-[0.98]
          sm:w-auto
        "
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Guardando...
          </>
        ) : (
          'Guardar cambios'
        )}
      </Button>
    </div>
  )
}