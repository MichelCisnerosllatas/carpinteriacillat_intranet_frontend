'use client'

import { Root as Radio } from '@radix-ui/react-radio-group'
import { useLayout } from '@/shared/providers/layout-provider'
import { useSidebar } from '@/shared/ui/sidebar'
import type { Collapsible } from '@/shared/providers/layout-provider'
import { SectionTitle } from './section-title'
import { IconLayoutDefault } from './icon-layout-default'
import { IconLayoutCompact } from './icon-layout-compact'
import { IconLayoutFull } from './icon-layout-full'
import { RadioGroupItem } from './radio-group-item'

export function LayoutConfig() {
  const { open, setOpen } = useSidebar()
  const { defaultCollapsible, collapsible, setCollapsible } = useLayout()
  const radioState = open ? 'default' : collapsible

  return (
    <div className="max-md:hidden">
      <SectionTitle
        title="Layout"
        showReset={radioState !== 'default'}
        onReset={() => { setOpen(true); setCollapsible(defaultCollapsible) }}
        resetAriaLabel="Reset layout to default"
      />
      <Radio
        value={radioState}
        onValueChange={(v) => {
          if (v === 'default') { setOpen(true); return }
          setOpen(false)
          setCollapsible(v as Collapsible)
        }}
        className="grid w-full max-w-md grid-cols-3 gap-4"
      >
        {[
          { value: 'default', label: 'Default', icon: IconLayoutDefault },
          { value: 'icon', label: 'Compact', icon: IconLayoutCompact },
          { value: 'offcanvas', label: 'Full', icon: IconLayoutFull },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
    </div>
  )
}
