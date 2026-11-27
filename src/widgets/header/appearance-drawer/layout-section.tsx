'use client'

import { Root as Radio } from '@radix-ui/react-radio-group'
import { useLayoutStore, type SidebarCollapsible } from '@/shared/stores/layout-store'
import { useSidebar } from '@/shared/ui/sidebar'
import { SectionTitle } from './section-title'
import { IconLayoutDefault } from './icon-layout-default'
import { IconLayoutCompact } from './icon-layout-compact'
import { IconLayoutFull } from './icon-layout-full'
import { RadioItem } from './radio-item'

export function LayoutSection() {
  const { open, setOpen } = useSidebar()
  const { collapsible, setCollapsible } = useLayoutStore()
  const radioState = open ? 'default' : collapsible
  return (
    <div className="max-md:hidden">
      <SectionTitle title="Layout" showReset={radioState !== 'default'} onReset={() => { setOpen(true); setCollapsible('icon') }} resetLabel="Reset layout" />
      <Radio value={radioState} onValueChange={(v) => {
        if (v === 'default') { setOpen(true); return }
        setOpen(false)
        setCollapsible(v as SidebarCollapsible)
      }} className="grid grid-cols-3 gap-4">
        {[
          { value: 'default',   label: 'Default', icon: IconLayoutDefault },
          { value: 'icon',      label: 'Compact', icon: IconLayoutCompact },
          { value: 'offcanvas', label: 'Full',    icon: IconLayoutFull },
        ].map((i) => <RadioItem key={i.value} {...i} />)}
      </Radio>
    </div>
  )
}
