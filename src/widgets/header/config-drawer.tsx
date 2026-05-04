'use client'

import { type SVGProps } from 'react'
import { Root as Radio, Item } from '@radix-ui/react-radio-group'
import { CircleCheck, RotateCcw, Settings } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useLayout } from '@/shared/providers/layout-provider'
import { useTheme } from '@/shared/providers/theme-provider'
import { Button } from '@/shared/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet'
import { useSidebar } from '@/shared/ui/sidebar'
import type { Collapsible } from '@/shared/providers/layout-provider'

// ─── Icons (inlined from original assets) ───────────────────────────────────

function IconThemeSystem(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 78 60" width="78" height="60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="0.5" y="0.5" width="77" height="59" rx="5.5" fill="white" stroke="#E2E8F0"/>
      <rect x="6" y="6" width="30" height="48" rx="3" fill="#1E293B"/>
      <rect x="42" y="6" width="30" height="22" rx="3" fill="#F1F5F9"/>
      <rect x="42" y="32" width="30" height="22" rx="3" fill="#1E293B"/>
      <rect x="10" y="10" width="22" height="4" rx="2" fill="#475569"/>
      <rect x="10" y="18" width="18" height="3" rx="1.5" fill="#334155"/>
      <rect x="10" y="25" width="20" height="3" rx="1.5" fill="#334155"/>
      <rect x="10" y="32" width="16" height="3" rx="1.5" fill="#334155"/>
      <rect x="46" y="10" width="22" height="4" rx="2" fill="#94A3B8"/>
      <rect x="46" y="18" width="18" height="3" rx="1.5" fill="#CBD5E1"/>
      <rect x="46" y="36" width="22" height="4" rx="2" fill="#475569"/>
      <rect x="46" y="44" width="18" height="3" rx="1.5" fill="#334155"/>
    </svg>
  )
}

function IconThemeLight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 78 60" width="78" height="60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="0.5" y="0.5" width="77" height="59" rx="5.5" fill="white" stroke="#E2E8F0"/>
      <rect x="6" y="6" width="30" height="48" rx="3" fill="#F8FAFC"/>
      <rect x="42" y="6" width="30" height="48" rx="3" fill="#F1F5F9"/>
      <rect x="10" y="10" width="22" height="4" rx="2" fill="#94A3B8"/>
      <rect x="10" y="18" width="18" height="3" rx="1.5" fill="#CBD5E1"/>
      <rect x="10" y="25" width="20" height="3" rx="1.5" fill="#CBD5E1"/>
      <rect x="10" y="32" width="16" height="3" rx="1.5" fill="#CBD5E1"/>
      <rect x="46" y="10" width="22" height="4" rx="2" fill="#94A3B8"/>
      <rect x="46" y="18" width="18" height="3" rx="1.5" fill="#CBD5E1"/>
      <rect x="46" y="25" width="22" height="3" rx="1.5" fill="#E2E8F0"/>
      <rect x="46" y="32" width="22" height="14" rx="2" fill="#E2E8F0"/>
    </svg>
  )
}

function IconThemeDark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 78 60" width="78" height="60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="0.5" y="0.5" width="77" height="59" rx="5.5" fill="#0F172A" stroke="#1E293B"/>
      <rect x="6" y="6" width="30" height="48" rx="3" fill="#1E293B"/>
      <rect x="42" y="6" width="30" height="48" rx="3" fill="#1E293B"/>
      <rect x="10" y="10" width="22" height="4" rx="2" fill="#475569"/>
      <rect x="10" y="18" width="18" height="3" rx="1.5" fill="#334155"/>
      <rect x="10" y="25" width="20" height="3" rx="1.5" fill="#334155"/>
      <rect x="10" y="32" width="16" height="3" rx="1.5" fill="#334155"/>
      <rect x="46" y="10" width="22" height="4" rx="2" fill="#475569"/>
      <rect x="46" y="18" width="18" height="3" rx="1.5" fill="#334155"/>
      <rect x="46" y="25" width="22" height="3" rx="1.5" fill="#1E293B"/>
      <rect x="46" y="32" width="22" height="14" rx="2" fill="#1E293B"/>
    </svg>
  )
}

function IconSidebarInset(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 78 60" width="78" height="60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="0.5" y="0.5" width="77" height="59" rx="5.5" stroke="currentColor" strokeOpacity="0.2"/>
      <rect x="6" y="6" width="28" height="48" rx="3" fill="currentColor" fillOpacity="0.15"/>
      <rect x="40" y="6" width="32" height="48" rx="3" fill="currentColor" fillOpacity="0.08"/>
    </svg>
  )
}

function IconSidebarFloating(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 78 60" width="78" height="60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="0.5" y="0.5" width="77" height="59" rx="5.5" stroke="currentColor" strokeOpacity="0.2"/>
      <rect x="6" y="8" width="28" height="44" rx="4" fill="currentColor" fillOpacity="0.15"/>
      <rect x="40" y="6" width="32" height="48" rx="3" fill="currentColor" fillOpacity="0.08"/>
    </svg>
  )
}

function IconSidebarSidebar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 78 60" width="78" height="60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="0.5" y="0.5" width="77" height="59" rx="5.5" stroke="currentColor" strokeOpacity="0.2"/>
      <rect x="0" y="0" width="34" height="60" rx="6" fill="currentColor" fillOpacity="0.15"/>
      <rect x="40" y="6" width="32" height="48" rx="3" fill="currentColor" fillOpacity="0.08"/>
    </svg>
  )
}

function IconLayoutDefault(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 78 60" width="78" height="60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="0.5" y="0.5" width="77" height="59" rx="5.5" stroke="currentColor" strokeOpacity="0.2"/>
      <rect x="6" y="6" width="28" height="48" rx="3" fill="currentColor" fillOpacity="0.15"/>
      <rect x="40" y="6" width="32" height="10" rx="2" fill="currentColor" fillOpacity="0.2"/>
      <rect x="40" y="20" width="32" height="34" rx="2" fill="currentColor" fillOpacity="0.08"/>
    </svg>
  )
}

function IconLayoutCompact(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 78 60" width="78" height="60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="0.5" y="0.5" width="77" height="59" rx="5.5" stroke="currentColor" strokeOpacity="0.2"/>
      <rect x="6" y="6" width="12" height="48" rx="3" fill="currentColor" fillOpacity="0.15"/>
      <rect x="24" y="6" width="48" height="10" rx="2" fill="currentColor" fillOpacity="0.2"/>
      <rect x="24" y="20" width="48" height="34" rx="2" fill="currentColor" fillOpacity="0.08"/>
    </svg>
  )
}

function IconLayoutFull(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 78 60" width="78" height="60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="0.5" y="0.5" width="77" height="59" rx="5.5" stroke="currentColor" strokeOpacity="0.2"/>
      <rect x="6" y="6" width="66" height="10" rx="2" fill="currentColor" fillOpacity="0.2"/>
      <rect x="6" y="20" width="66" height="34" rx="2" fill="currentColor" fillOpacity="0.08"/>
    </svg>
  )
}

function IconDirLTR(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 78 60" width="78" height="60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="0.5" y="0.5" width="77" height="59" rx="5.5" stroke="currentColor" strokeOpacity="0.2"/>
      <rect x="8" y="14" width="40" height="4" rx="2" fill="currentColor" fillOpacity="0.3"/>
      <rect x="8" y="22" width="55" height="4" rx="2" fill="currentColor" fillOpacity="0.2"/>
      <rect x="8" y="30" width="48" height="4" rx="2" fill="currentColor" fillOpacity="0.2"/>
      <path d="M58 38 L70 44 L58 50" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconDirRTL(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 78 60" width="78" height="60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="0.5" y="0.5" width="77" height="59" rx="5.5" stroke="currentColor" strokeOpacity="0.2"/>
      <rect x="30" y="14" width="40" height="4" rx="2" fill="currentColor" fillOpacity="0.3"/>
      <rect x="15" y="22" width="55" height="4" rx="2" fill="currentColor" fillOpacity="0.2"/>
      <rect x="22" y="30" width="48" height="4" rx="2" fill="currentColor" fillOpacity="0.2"/>
      <path d="M20 38 L8 44 L20 50" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function SectionTitle({
  title,
  showReset = false,
  onReset,
  resetAriaLabel,
  className,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  resetAriaLabel?: string
  className?: string
}) {
  return (
    <div className={cn('mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground', className)}>
      {title}
      {showReset && onReset && (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="size-4 rounded-full"
          onClick={onReset}
          aria-label={resetAriaLabel}
        >
          <RotateCcw className="size-3" />
        </Button>
      )}
    </div>
  )
}

function RadioGroupItem({
  item,
  isTheme = false,
}: {
  item: { value: string; label: string; icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement }
  isTheme?: boolean
}) {
  return (
    <Item
      value={item.value}
      className={cn('group outline-none', 'transition duration-200 ease-in')}
      aria-label={`Select ${item.label.toLowerCase()}`}
    >
      <div
        className={cn(
          'relative rounded-[6px] ring-[1px] ring-border',
          'group-data-[state=checked]:shadow-2xl group-data-[state=checked]:ring-primary',
          'group-focus-visible:ring-2'
        )}
      >
        <CircleCheck
          className={cn(
            'size-6 fill-primary stroke-white',
            'group-data-[state=unchecked]:hidden',
            'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2'
          )}
        />
        <item.icon
          className={cn(
            !isTheme &&
              'fill-primary stroke-primary group-data-[state=unchecked]:fill-muted-foreground group-data-[state=unchecked]:stroke-muted-foreground'
          )}
        />
      </div>
      <div className="mt-1 text-xs">{item.label}</div>
    </Item>
  )
}

// ─── Config sections ─────────────────────────────────────────────────────────

function ThemeConfig() {
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

function SidebarConfig() {
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

function LayoutConfig() {
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

function DirConfig() {
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

import * as React from 'react'

// ─── Main export ─────────────────────────────────────────────────────────────

export function ConfigDrawer() {
  const { setOpen } = useSidebar()
  const { resetTheme } = useTheme()
  const { resetLayout } = useLayout()

  const handleReset = () => {
    setOpen(true)
    resetTheme()
    resetLayout()
    document.documentElement.setAttribute('dir', 'ltr')
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="Open theme settings" className="rounded-full">
          <Settings aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="pb-0 text-start">
          <SheetTitle>Theme Settings</SheetTitle>
          <SheetDescription>
            Adjust the appearance and layout to suit your preferences.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 overflow-y-auto px-4">
          <ThemeConfig />
          <SidebarConfig />
          <LayoutConfig />
          <DirConfig />
        </div>
        <SheetFooter className="gap-2">
          <Button variant="destructive" onClick={handleReset} aria-label="Reset all settings">
            Reset
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
