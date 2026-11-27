'use client'

import { Root as Radio } from '@radix-ui/react-radio-group'
import { useLayout } from '@/shared/providers/layout-provider'
import { SectionTitle } from './section-title'
import { IconSidebarInset } from './icon-sidebar-inset'
import { IconSidebarFloating } from './icon-sidebar-floating'
import { IconSidebarSidebar } from './icon-sidebar-sidebar'
import { RadioGroupItem } from './radio-group-item'

export function SidebarConfig() {
  const { defaultVariant, variant, setVariant } = useLayout()
  return (
    <div className="max-md:hidden">
      <SectionTitle
        title="Sidebar"
        showReset={defaultVariant !== variant}
        onReset={() => setVariant(defaultVariant)}
        resetAriaLabel="Reset sidebar style to default"
      />
      <Radio
        value={variant}
        onValueChange={(v) => setVariant(v as 'inset' | 'sidebar' | 'floating')}
        className="grid w-full max-w-md grid-cols-3 gap-4"
      >
        {[
          { value: 'inset', label: 'Inset', icon: IconSidebarInset },
          { value: 'floating', label: 'Floating', icon: IconSidebarFloating },
          { value: 'sidebar', label: 'Sidebar', icon: IconSidebarSidebar },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
    </div>
  )
}
