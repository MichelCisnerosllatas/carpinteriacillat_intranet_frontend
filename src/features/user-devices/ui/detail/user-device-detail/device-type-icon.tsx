'use client'

import { HardDrive, Monitor, Smartphone, Tablet, Terminal } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { DeviceType } from '../../../data/schema'

export function DeviceTypeIcon({ type, className }: { type: DeviceType; className?: string }) {
  const cls = cn('size-8', className)
  switch (type) {
    case 'mobile':  return <Smartphone className={cls} />
    case 'tablet':  return <Tablet className={cls} />
    case 'desktop': return <Monitor className={cls} />
    case 'api':     return <Terminal className={cls} />
    default:        return <HardDrive className={cls} />
  }
}
