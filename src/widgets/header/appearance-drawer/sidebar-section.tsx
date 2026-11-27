'use client'

import { Root as Radio } from '@radix-ui/react-radio-group'
import { useLayoutStore, type SidebarVariant } from '@/shared/stores/layout-store'
import { SectionTitle } from './section-title'
import { IconSidebarInset } from './icon-sidebar-inset'
import { IconSidebarFloating } from './icon-sidebar-floating'
import { IconSidebarSidebar } from './icon-sidebar-sidebar'
import { RadioItem } from './radio-item'

export function SidebarSection() {
  const { variant, setVariant, reset } = useLayoutStore()
  return (
    <div className="max-md:hidden">
      <SectionTitle title="Sidebar Style" showReset={variant !== 'inset'} onReset={() => setVariant('inset')} resetLabel="Reset sidebar" />
      <Radio value={variant} onValueChange={(v) => setVariant(v as SidebarVariant)} className="grid grid-cols-3 gap-4">
        {[
          { value: 'inset',    label: 'Inset',    icon: IconSidebarInset },
          { value: 'floating', label: 'Floating', icon: IconSidebarFloating },
          { value: 'sidebar',  label: 'Sidebar',  icon: IconSidebarSidebar },
        ].map((i) => <RadioItem key={i.value} {...i} />)}
      </Radio>
    </div>
  )
}
