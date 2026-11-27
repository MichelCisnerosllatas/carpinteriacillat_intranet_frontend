'use client'

import { Root as Radio } from '@radix-ui/react-radio-group'
import * as React from 'react'
import { SectionTitle } from './section-title'
import { IconDirLTR } from './icon-dir-ltr'
import { IconDirRTL } from './icon-dir-rtl'
import { RadioGroupItem } from './radio-group-item'

export function DirConfig() {
  const [dir, setDir] = React.useState<'ltr' | 'rtl'>('ltr')

  const handleChange = (value: string) => {
    const newDir = value as 'ltr' | 'rtl'
    setDir(newDir)
    document.documentElement.setAttribute('dir', newDir)
  }

  return (
    <div>
      <SectionTitle title="Direction" showReset={dir !== 'ltr'} onReset={() => handleChange('ltr')} resetAriaLabel="Reset direction" />
      <Radio value={dir} onValueChange={handleChange} className="grid w-full max-w-md grid-cols-2 gap-4">
        {[
          { value: 'ltr', label: 'Left to Right', icon: IconDirLTR },
          { value: 'rtl', label: 'Right to Left', icon: IconDirRTL },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
    </div>
  )
}
