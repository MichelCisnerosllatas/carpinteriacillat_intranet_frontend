'use client'

import { useState } from 'react'
import { Root as Radio } from '@radix-ui/react-radio-group'
import { SectionTitle } from './section-title'
import { RadioItem } from './radio-item'

export function DirectionSection() {
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr')
  const apply = (v: string) => {
    setDir(v as 'ltr' | 'rtl')
    document.documentElement.setAttribute('dir', v)
  }
  return (
    <div>
      <SectionTitle title="Direction" showReset={dir !== 'ltr'} onReset={() => apply('ltr')} resetLabel="Reset direction" />
      <Radio value={dir} onValueChange={apply} className="grid grid-cols-2 gap-4">
        {[
          { value: 'ltr', label: 'LTR', icon: () => <svg viewBox="0 0 78 60" width="78" height="60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="77" height="59" rx="5.5" stroke="currentColor" strokeOpacity="0.2"/><rect x="8" y="14" width="40" height="4" rx="2" fill="currentColor" fillOpacity="0.3"/><rect x="8" y="24" width="55" height="4" rx="2" fill="currentColor" fillOpacity="0.2"/><path d="M58 38 L70 44 L58 50" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round"/></svg> },
          { value: 'rtl', label: 'RTL', icon: () => <svg viewBox="0 0 78 60" width="78" height="60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="77" height="59" rx="5.5" stroke="currentColor" strokeOpacity="0.2"/><rect x="30" y="14" width="40" height="4" rx="2" fill="currentColor" fillOpacity="0.3"/><rect x="15" y="24" width="55" height="4" rx="2" fill="currentColor" fillOpacity="0.2"/><path d="M20 38 L8 44 L20 50" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round"/></svg> },
        ].map((i) => <RadioItem key={i.value} {...i} />)}
      </Radio>
    </div>
  )
}
