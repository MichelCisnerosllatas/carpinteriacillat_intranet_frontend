'use client'

import { HardDrive, Monitor, Smartphone, Tablet, Terminal } from 'lucide-react'
import type { DeviceType } from '../../../data/schema'

export function DeviceIcon({ type }: { type: DeviceType }) {
  const cls = 'size-3.5 text-muted-foreground shrink-0'
  switch (type) {
    case 'mobile':  return <Smartphone className={cls} />
    case 'tablet':  return <Tablet className={cls} />
    case 'desktop': return <Monitor className={cls} />
    case 'api':     return <Terminal className={cls} />
    default:        return <HardDrive className={cls} />
  }
}
