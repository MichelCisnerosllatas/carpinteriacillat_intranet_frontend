'use client'

import {
  Archive, FileAudio, FileSpreadsheet, FileText, FileVideo, Image as ImageIcon, File,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { getFileType } from '../../data/schema'

interface FileTypeIconProps {
  extension: string
  className?: string
}

export function FileTypeIcon({ extension, className }: FileTypeIconProps) {
  const type = getFileType(extension)
  const base = cn('shrink-0', className)

  switch (type) {
    case 'image':       return <ImageIcon        className={cn(base, 'text-blue-400')} />
    case 'pdf':         return <FileText         className={cn(base, 'text-red-500')} />
    case 'document':    return <FileText         className={cn(base, 'text-sky-500')} />
    case 'spreadsheet': return <FileSpreadsheet  className={cn(base, 'text-emerald-500')} />
    case 'video':       return <FileVideo        className={cn(base, 'text-violet-500')} />
    case 'audio':       return <FileAudio        className={cn(base, 'text-pink-500')} />
    case 'archive':     return <Archive          className={cn(base, 'text-amber-500')} />
    default:            return <File             className={cn(base, 'text-muted-foreground')} />
  }
}

export function fileTypeColor(extension: string): string {
  const type = getFileType(extension)
  switch (type) {
    case 'image':       return 'bg-blue-50 dark:bg-blue-950/30'
    case 'pdf':         return 'bg-red-50 dark:bg-red-950/30'
    case 'document':    return 'bg-sky-50 dark:bg-sky-950/30'
    case 'spreadsheet': return 'bg-emerald-50 dark:bg-emerald-950/30'
    case 'video':       return 'bg-violet-50 dark:bg-violet-950/30'
    case 'audio':       return 'bg-pink-50 dark:bg-pink-950/30'
    case 'archive':     return 'bg-amber-50 dark:bg-amber-950/30'
    default:            return 'bg-muted/50'
  }
}
