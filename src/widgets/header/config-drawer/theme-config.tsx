'use client'

import { Root as Radio } from '@radix-ui/react-radio-group'
import { useTheme } from '@/shared/providers/theme-provider'
import { SectionTitle } from './section-title'
import { IconThemeSystem } from './icon-theme-system'
import { IconThemeLight } from './icon-theme-light'
import { IconThemeDark } from './icon-theme-dark'
import { RadioGroupItem } from './radio-group-item'

// ─── Config sections ─────────────────────────────────────────────────────────

export function ThemeConfig() {
  const { defaultTheme, theme, setTheme } = useTheme()
  return (
    <div>
      <SectionTitle
        title="Theme"
        showReset={theme !== defaultTheme}
        onReset={() => setTheme(defaultTheme)}
        resetAriaLabel="Reset theme to default"
      />
      <Radio
        value={theme}
        onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}
        className="grid w-full max-w-md grid-cols-3 gap-4"
      >
        {[
          { value: 'system', label: 'System', icon: IconThemeSystem },
          { value: 'light', label: 'Light', icon: IconThemeLight },
          { value: 'dark', label: 'Dark', icon: IconThemeDark },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} isTheme />
        ))}
      </Radio>
    </div>
  )
}
