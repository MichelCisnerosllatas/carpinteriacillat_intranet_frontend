'use client'

import { Globe, HardDrive, Monitor, Smartphone, Tablet, Terminal } from 'lucide-react'
import type { UserDevice, DeviceType } from '../../data/schema'

export function DeviceIcon({ type, platform }: { type: DeviceType; platform: UserDevice['platform'] }) {
  const cls = 'size-5 text-muted-foreground'
  if (platform === 'ios' || platform === 'android') return <Smartphone className={cls} />
  if (type === 'tablet')  return <Tablet className={cls} />
  if (type === 'desktop') return <Monitor className={cls} />
  if (type === 'api')     return <Terminal className={cls} />
  if (platform === 'web') return <Globe className={cls} />
  return <HardDrive className={cls} />
}
