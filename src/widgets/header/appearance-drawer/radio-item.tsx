'use client'

import { type SVGProps } from 'react'
import { Item } from '@radix-ui/react-radio-group'
import { CircleCheck } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export function RadioItem({ value, label, icon: Icon, isTheme }: {
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
