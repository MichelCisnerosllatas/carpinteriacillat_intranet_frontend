'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CheckCircle2, GripVertical, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Switch } from '@/shared/ui/switch'
import { Label } from '@/shared/ui/label'
import { Card, CardContent } from '@/shared/ui/card'
import { FieldTip } from '@/shared/ui/field-tip'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'
import { type DraftTextRow } from '../stores/useProformaTemplateTextDraftStore'

export function TextVersionRow({
  row,
  isActive,
  readOnly,
  onChangeText,
  onToggleActive,
  onRemove,
}: {
  row: DraftTextRow
  isActive: boolean
  readOnly: boolean
  onChangeText: (patch: Partial<Pick<DraftTextRow, 'title' | 'content'>>) => void
  onToggleActive: (checked: boolean) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.localId,
    disabled: readOnly,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-start gap-2', isDragging && 'z-10 opacity-75')}
    >
      {!readOnly && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="text-muted-foreground mt-4 shrink-0 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Arrastra para reordenar</TooltipContent>
        </Tooltip>
      )}

      <Card
        className={cn(
          'flex-1 gap-3 py-4 shadow-none',
          isActive && 'border-primary/50 bg-primary/5'
        )}
      >
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            {isActive ? (
              <span className="text-primary inline-flex items-center gap-1 text-xs font-medium">
                <CheckCircle2 className="size-3.5" />
                Esta versión se imprime en el PDF
              </span>
            ) : (
              <span className="text-muted-foreground text-xs">De respaldo (no se imprime)</span>
            )}
            {readOnly ? (
              <span className="text-muted-foreground text-xs">
                {row.visible ? 'Activo' : 'Inactivo'}
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground text-xs">
                  <FieldTip
                    label="Activo"
                    tip="Solo una versión puede estar activa por bloque. Al encender esta, las demás versiones de este mismo bloque se apagan automáticamente."
                  />
                </Label>
                <Switch checked={row.visible} onCheckedChange={onToggleActive} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground text-xs">
              <FieldTip
                label="Título"
                tip="Encabezado visible de esta versión dentro del PDF (opcional). No es la clave interna — esa ya está fija según el bloque al que pertenece esta tarjeta."
              />
            </Label>
            <Input
              placeholder="Título visible (opcional)"
              value={row.title}
              readOnly={readOnly}
              onChange={(e) => onChangeText({ title: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground text-xs">
              <FieldTip
                label="Contenido"
                tip="Texto que se imprime en el PDF si esta versión queda activa."
              />
            </Label>
            <Textarea
              placeholder="Contenido del bloque..."
              rows={3}
              value={row.content}
              readOnly={readOnly}
              onChange={(e) => onChangeText({ content: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {!readOnly && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive mt-1 shrink-0"
              onClick={onRemove}
            >
              <Trash2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Quitar esta versión</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
