'use client'

import { Root as Radio } from '@radix-ui/react-radio-group'
import { useTheme } from 'next-themes'
import { SectionTitle } from './section-title'
import { IconThemeSystem } from './icon-theme-system'
import { IconThemeLight } from './icon-theme-light'
import { IconThemeDark } from './icon-theme-dark'
import { RadioItem } from './radio-item'

// ─── Section ui ──────────────────────────────────────────────────────

export function ThemeSection() {
  const { theme = 'system', setTheme } = useTheme()
  return (
    <div>
      <SectionTitle title="Theme" showReset={theme !== 'system'} onReset={() => setTheme('system')} resetLabel="Reset theme" />
      <Radio value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
        {[
          { value: 'system', label: 'System', icon: IconThemeSystem },
          { value: 'light',  label: 'Light',  icon: IconThemeLight },
          { value: 'dark',   label: 'Dark',   icon: IconThemeDark },
        ].map((i) => <RadioItem key={i.value} {...i} isTheme />)}
      </Radio>
    </div>
  )
}
