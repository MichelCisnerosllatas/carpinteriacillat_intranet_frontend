'use client'

import Link from 'next/link'
import { ArrowRight, ExternalLink, Info, type LucideIcon } from 'lucide-react'

export function GuideCard({
  icon: Icon, title, description, href, external, note,
}: {
  icon: LucideIcon
  title: string
  description: string
  href?: string
  external?: boolean
  note?: string
}) {
  const content = (
    <div className="flex min-h-24 items-start gap-4 rounded-xl border bg-background p-4 transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:bg-muted/30 group-hover:shadow-md">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {note && (
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground/80">
            <Info className="size-3" />{note}
          </p>
        )}
      </div>
      {href && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:bg-primary/10 group-hover:text-primary">
          {external ? <ExternalLink className="size-4" /> : <ArrowRight className="size-4" />}
        </div>
      )}
    </div>
  )

  if (!href) return <div className="group">{content}</div>

  return (
    <Link href={href} className="group block focus-visible:outline-none">
      {content}
    </Link>
  )
}
