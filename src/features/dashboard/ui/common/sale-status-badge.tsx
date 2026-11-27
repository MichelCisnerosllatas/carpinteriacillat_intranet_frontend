import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { getBadgeOption, SALE_STATUS_BADGES } from '../../data/data'

export function SaleStatusBadge({ status }: { status: string }) {
  const option = getBadgeOption(SALE_STATUS_BADGES, status)
  return <Badge variant='outline' className={cn(option.badge)}>{option.label}</Badge>
}
