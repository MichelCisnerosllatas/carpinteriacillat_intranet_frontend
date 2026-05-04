'use client'

import { Search } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { useSearchStore } from '@/shared/stores/search-store'

export function SearchButton() {
  const { setOpen } = useSearchStore()
  return (
    <Button
      variant="ghost"
      size="sm"
      className="hidden gap-2 text-muted-foreground sm:flex"
      onClick={() => setOpen(true)}
    >
      <Search className="size-4" />
      <span className="text-sm">Search...</span>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
}
