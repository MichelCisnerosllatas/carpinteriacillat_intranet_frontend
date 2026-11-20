import Link from 'next/link'
import { ArrowUpDown, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export function ChatbotOptionsPrimaryButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline" className="space-x-1">
        <Link href="/chatbot/options/reorder"><ArrowUpDown size={18} /><span>Ordenar</span></Link>
      </Button>
      <Button asChild className="space-x-1">
        <Link href="/chatbot/options/create"><Plus size={18} /><span>Nueva opción</span></Link>
      </Button>
    </div>
  )
}
