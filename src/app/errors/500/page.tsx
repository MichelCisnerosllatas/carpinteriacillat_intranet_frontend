import Link from 'next/link'
import type { Metadata } from 'next'
import { ServerCrash } from 'lucide-react'

export const metadata: Metadata = { title: 'Error 500' }

export default function Error500Page() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-muted">
        <ServerCrash className="size-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-6xl font-bold tracking-tight">500</h1>
        <h2 className="text-xl font-semibold">Internal Server Error</h2>
        <p className="max-w-sm text-sm text-muted-foreground">Something went wrong on our end. Please try again later.</p>
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
