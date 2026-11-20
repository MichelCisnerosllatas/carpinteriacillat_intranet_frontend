'use client'

import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { IconButton } from '@/shared/ui/icon-button'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useReportStore } from '../stores/useReportStore'

// Botones solo ícono para exportar. No dependen de lo que se ve en pantalla:
// el backend genera el archivo con los mismos filtros.
export function ReportExportButtons({ disabled }: { disabled?: boolean }) {
  const exporting = useReportStore((s) => s.exporting)
  const exportFile = useReportStore((s) => s.exportFile)

  const handleExport = async (format: 'xlsx' | 'pdf') => {
    const ok = await exportFile(format)
    if (ok) toastSuccess(`Reporte exportado en ${format === 'xlsx' ? 'Excel' : 'PDF'}`)
    else toastError('No se pudo exportar el reporte', useReportStore.getState().message ?? undefined)
  }

  return (
    <>
      <IconButton
        label='Exportar Excel'
        onClick={() => handleExport('xlsx')}
        disabled={disabled || exporting !== null}
        icon={
          exporting === 'xlsx' ? (
            <Loader2 className='animate-spin' />
          ) : (
            <FileSpreadsheet className='text-emerald-600 dark:text-emerald-400' />
          )
        }
      />
      <IconButton
        label='Exportar PDF'
        onClick={() => handleExport('pdf')}
        disabled={disabled || exporting !== null}
        icon={
          exporting === 'pdf' ? <Loader2 className='animate-spin' /> : <FileText className='text-red-600 dark:text-red-400' />
        }
      />
    </>
  )
}
