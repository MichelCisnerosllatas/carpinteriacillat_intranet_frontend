'use client'

import { type SVGProps } from 'react'
import { Item } from '@radix-ui/react-radio-group'
import { CircleCheck } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import * as React from 'react'

export function RadioGroupItem({
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
