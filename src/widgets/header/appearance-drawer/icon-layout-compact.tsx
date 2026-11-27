'use client'

import { type SVGProps } from 'react'

export function IconLayoutCompact(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 78 60" width="78" height="60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="0.5" y="0.5" width="77" height="59" rx="5.5" stroke="currentColor" strokeOpacity="0.2"/>
      <rect x="6" y="6" width="12" height="48" rx="3" fill="currentColor" fillOpacity="0.15"/>
      <rect x="24" y="6" width="48" height="10" rx="2" fill="currentColor" fillOpacity="0.2"/>
      <rect x="24" y="20" width="48" height="34" rx="2" fill="currentColor" fillOpacity="0.08"/>
    </svg>
  )
}
