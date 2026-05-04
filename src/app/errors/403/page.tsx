import Link from 'next/link'
import type { Metadata } from 'next'
import { ShieldOff } from 'lucide-react'

export const metadata: Metadata = { title: 'Error 403' }

export default function Error403Page() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-muted">
        <ShieldOff className="size-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-6xl font-bold tracking-tight">403</h1>
        <h2 className="text-xl font-semibold">Forbidden</h2>
        <p className="max-w-sm text-sm text-muted-foreground">You don't have permission to access this resource.</p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Go back home
      </Link>
    </div>
  )
}
