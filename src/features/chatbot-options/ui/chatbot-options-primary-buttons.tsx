import Link from 'next/link'
import { ArrowUpDown, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Can } from '@/features/auth/ui/can'

export function ChatbotOptionsPrimaryButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Solo si tiene permiso de reordenar (ver ROLES_Y_PERMISOS.md) */}
      <Can permission="chatbot_options.reorder">
        <Button asChild variant="outline" className="space-x-1">
          <Link href="/chatbot/options/reorder"><ArrowUpDown size={18} /><span>Ordenar</span></Link>
        </Button>
      </Can>
      {/* Solo si tiene permiso de crear (ver ROLES_Y_PERMISOS.md) */}
      <Can permission="chatbot_options.create">
        <Button asChild className="space-x-1">
          <Link href="/chatbot/options/create"><Plus size={18} /><span>Nueva opción</span></Link>
        </Button>
      </Can>
    </div>
  )
}
