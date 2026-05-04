'use client'

import { useState } from 'react'
import { type SVGProps } from 'react'
import { Root as Radio, Item } from '@radix-ui/react-radio-group'
import { CircleCheck, RotateCcw } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/shared/lib/utils'
import {
  useLayoutStore,
  type SidebarCollapsible,
  type SidebarVariant,
} from '@/shared/stores/layout-store'
import { Button } from '@/shared/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { useSidebar } from '@/shared/ui/sidebar'

// ─── Inline SVG icons ────────────────────────────────────────────────────────

function IconThemeSystem(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 78 60" width="78" height="60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="0.5" y="0.5" width="77" height="59" rx="5.5" fill="white" stroke="#E2E8F0"/>
      <rect x="6" y="6" width="30" height="48" rx="3" fill="#1E293B"/>
      <rect x="42" y="6" width="30" height="22" rx="3" fill="#F1F5F9"/>
      <rect x="42" y="32" width="30" height="22" rx="3" fill="#1E293B"/>
      <rect x="10" y="10" width="22" height="4" rx="2" fill="#475569"/>
      <rect x="10" y="18" width="18" height="3" rx="1.5" fill="#334155"/>
      <rect x="46" y="10" width="22" height="4" rx="2" fill="#94A3B8"/>
      <rect x="46" y="36" width="22" height="4" rx="2" fill="#475569"/>
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
      <rect x="46" y="10" width="22" height="4" rx="2" fill="#94A3B8"/>
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
      <rect x="46" y="10" width="22" height="4" rx="2" fill="#475569"/>
      <rect x="46" y="32" width="22" height="14" rx="2" fill="#334155"/>
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

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionTitle({
  title,
  showReset,
  onReset,
  resetLabel,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  resetLabel?: string
}) {
  return (
    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
      {title}
      {showReset && onReset && (
        <Button type="button" size="icon" variant="secondary" className="size-4 rounded-full" onClick={onReset} aria-label={resetLabel}>
          <RotateCcw className="size-3" />
        </Button>
      )}
    </div>
  )
}

function RadioItem({ value, label, icon: Icon, isTheme }: {
  value: string; label: string; icon: (p: SVGProps<SVGSVGElement>) => React.ReactElement; isTheme?: boolean
}) {
  return (
    <Item value={value} className="group outline-none transition duration-200 ease-in" aria-label={`Select ${label}`}>
      <div className={cn(
        'relative rounded-[6px] ring-[1px] ring-border',
        'group-data-[state=checked]:shadow-2xl group-data-[state=checked]:ring-primary',
        'group-focus-visible:ring-2'
      )}>
        <CircleCheck className={cn('size-6 fill-primary stroke-white absolute top-0 right-0 translate-x-1/2 -translate-y-1/2', 'group-data-[state=unchecked]:hidden')} aria-hidden />
        <Icon className={cn(!isTheme && 'fill-primary stroke-primary group-data-[state=unchecked]:fill-muted-foreground group-data-[state=unchecked]:stroke-muted-foreground')} aria-hidden />
      </div>
      <div className="mt-1 text-xs">{label}</div>
    </Item>
  )
}

// ─── Section components ──────────────────────────────────────────────────────

function ThemeSection() {
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

function SidebarSection() {
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

function LayoutSection() {
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

function DirectionSection() {
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

// ─── Main export ─────────────────────────────────────────────────────────────

type AppearanceDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AppearanceDrawer({ open, onOpenChange }: AppearanceDrawerProps) {
  const { setTheme } = useTheme()
  const { reset } = useLayoutStore()
  const { setOpen: setSidebarOpen } = useSidebar()

  const handleReset = () => {
    setSidebarOpen(true)
    setTheme('system')
    reset()
    document.documentElement.setAttribute('dir', 'ltr')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="pb-0 text-start">
          <SheetTitle>Appearance & Layout</SheetTitle>
          <SheetDescription>
            Customize the theme, sidebar style, layout and text direction.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-6 overflow-y-auto px-4">
          <ThemeSection />
          <SidebarSection />
          <LayoutSection />
          <DirectionSection />
        </div>
        <SheetFooter>
          <Button variant="destructive" onClick={handleReset}>
            Reset to defaults
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
