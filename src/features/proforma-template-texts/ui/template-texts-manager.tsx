'use client'

import { useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  CheckCircle2,
  GripVertical,
  Info,
  Loader2,
  PanelBottom,
  PanelTop,
  Plus,
  Table2,
  Trash2,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Switch } from '@/shared/ui/switch'
import { Label } from '@/shared/ui/label'
import { Card, CardContent } from '@/shared/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'
import { FieldTip } from '@/shared/ui/field-tip'
import { cn } from '@/shared/lib/utils'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { useProformaTemplateTextListStore } from '../stores/useProformaTemplateTextListStore'
import {
  useProformaTemplateTextDraftStore,
  type DraftTextRow,
} from '../stores/useProformaTemplateTextDraftStore'
import { TEMPLATE_TEXT_KEYS, type TemplateTextKey } from '../data/data'

interface TemplateTextsManagerProps {
  // null mientras se está creando la plantilla — el borrador funciona igual, solo que todavía no
  // hay nada que cargar desde la API (se envía recién en el submit del formulario padre).
  templateId: number | null
  // true en la vista de detalle (proforma-template-detail.tsx): solo muestra qué versión se
  // imprime, sin drag&drop ni edición — el detalle no tiene un submit que sincronice el borrador.
  readOnly?: boolean
}

// Mismo agrupado visual (Encabezado / Cuerpo / Pie de página) que usan styles-tab.tsx y
// sections-tab.tsx, para que las 4 pestañas del formulario se lean como un solo lenguaje — aunque
// las 4 keys de texto viven todas dentro del "body" del PDF (ver pdf-template-texts.md), su
// posición real en el flujo del documento sí distingue apertura / contenido / cierre.
const TEXT_SECTION_GROUPS: {
  key: string
  label: string
  hint: string
  icon: typeof PanelTop
  textKeys: TemplateTextKey[]
}[] = [
  {
    key: 'header',
    label: 'Encabezado',
    hint: 'Lo primero que se lee en el cuerpo del documento, antes de la tabla de ítems',
    icon: PanelTop,
    textKeys: ['texto_introductorio'],
  },
  {
    key: 'body',
    label: 'Cuerpo del documento',
    hint: 'Se imprime dentro de la tabla de ítems',
    icon: Table2,
    textKeys: ['forma_pago'],
  },
  {
    key: 'footer',
    label: 'Cierre',
    hint: 'Párrafos finales, antes de la firma',
    icon: PanelBottom,
    textKeys: ['texto_final', 'saludo_final'],
  },
]

// La versión que realmente se imprime: la primera, ordenada por `order` ascendente, entre las que
// están activas (`visible`) dentro del mismo grupo de key — mismo criterio que usa el backend
// (firstActiveContentByKey). "Activo" se maneja como selección única por grupo (ver
// setActiveInGroup en el store), pero este cálculo por order+visible se mantiene como respaldo
// para datos ya guardados que pudieran tener más de una versión activa.
function getActiveLocalId(rows: DraftTextRow[], key: TemplateTextKey): string | null {
  const active = rows
    .filter((r) => r.key === key && !r.deleted && r.visible)
    .sort((a, b) => a.order - b.order)[0]
  return active?.localId ?? null
}

function TextVersionRow({
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
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-muted-foreground mt-4 shrink-0 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive mt-1 shrink-0"
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  )
}

export function TemplateTextsManager({ templateId, readOnly = false }: TemplateTextsManagerProps) {
  const { isFetching, isError, loadByTemplateText } = useProformaTemplateTextListStore()
  const {
    rows,
    setFromExisting,
    seedDefaults,
    addRow,
    updateRow,
    setActiveInGroup,
    deactivate,
    removeRow,
    reorderGroup,
  } = useProformaTemplateTextDraftStore()

  // Se sincroniza el borrador justo cuando ESTE fetch resuelve (no reaccionando a `hasLoaded`
  // via otro useEffect): `hasLoaded` no se reinicia a `false` al iniciar un nuevo fetch, así que
  // observarlo deja una ventana donde el efecto dispara con datos viejos/vacíos y el guard interno
  // de `setFromExisting` bloquea para siempre la sincronización real cuando los datos correctos
  // llegan después — eso hacía que los textos ya guardados nunca aparecieran en el borrador.
  const fetchAndSync = (id: number) => {
    void loadByTemplateText(id).then((ok) => {
      if (ok) setFromExisting(id, useProformaTemplateTextListStore.getState().items)
    })
  }

  useEffect(() => {
    // El formulario y el detalle ya precargan los textos junto con la plantilla (misma función,
    // ver proforma-template-form.tsx/proforma-template-detail.tsx) — si este componente recién
    // se monta al entrar a la pestaña "Textos extra", esos datos ya están en el borrador y no
    // hace falta pedirlos de nuevo al backend.
    if (templateId == null) {
      seedDefaults()
      return
    }
    if (useProformaTemplateTextDraftStore.getState().initializedForTemplateId === templateId) {
      return
    }
    fetchAndSync(templateId)
  }, [templateId])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (key: TemplateTextKey) => (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const groupRows = rows
      .filter((r) => r.key === key && !r.deleted)
      .sort((a, b) => a.order - b.order)
    const oldIdx = groupRows.findIndex((r) => r.localId === active.id)
    const newIdx = groupRows.findIndex((r) => r.localId === over.id)
    if (oldIdx === -1 || newIdx === -1) return
    reorderGroup(
      key,
      arrayMove(groupRows, oldIdx, newIdx).map((r) => r.localId)
    )
  }

  const handleRemove = async (row: DraftTextRow) => {
    if (row.id != null) {
      const ok = await swalDeleteConfirm(
        '¿Quitar esta versión?',
        'Se eliminará al guardar la plantilla. Esta acción no se puede deshacer.'
      )
      if (!ok) return
    }
    removeRow(row.localId)
  }

  if (templateId != null && isFetching && rows.length === 0) {
    return (
      <div className="text-muted-foreground flex min-h-[120px] items-center justify-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Cargando textos...
      </div>
    )
  }

  if (templateId != null && isError) {
    return (
      <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 text-sm">
        <p className="text-muted-foreground">Error al cargar los textos de la plantilla.</p>
        <Button size="sm" variant="outline" onClick={() => fetchAndSync(templateId)}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-muted/30 text-muted-foreground flex gap-2 rounded-md border p-3 text-xs">
        <Info className="text-primary size-4 shrink-0" />
        <p>
          Cada bloque tiene una clave fija que el PDF ya busca por sí solo. Puede haber varias
          versiones del mismo bloque (por ejemplo, para probar redacciones distintas), pero solo una
          puede estar <strong>activa</strong> a la vez — es la que se imprime.
          {!readOnly && (
            <>
              {' '}
              Al activar una versión, las demás de su bloque se desactivan automáticamente. Arrastra
              el ícono <GripVertical className="inline size-3" /> para cambiar el orden de respaldo.
            </>
          )}
        </p>
      </div>

      {TEXT_SECTION_GROUPS.map((group) => (
        <Card key={group.key} className="py-2">
          <CardContent className="px-4">
            <Accordion type="single" collapsible defaultValue={group.key} className="w-full">
              <AccordionItem value={group.key} className="border-b-0">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">
                  <span className="flex items-center gap-3 text-left">
                    <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
                      <group.icon className="size-4" />
                    </span>
                    <span className="flex flex-col">
                      <span>{group.label}</span>
                      <span className="text-muted-foreground text-xs font-normal">
                        {group.hint}
                      </span>
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-4 pt-1">
                    {group.textKeys.map((textKey) => {
                      const { label, hint } = TEMPLATE_TEXT_KEYS.find((t) => t.key === textKey)!
                      const groupRows = rows
                        .filter((r) => r.key === textKey && !r.deleted)
                        .sort((a, b) => a.order - b.order)
                      const activeLocalId = getActiveLocalId(rows, textKey)

                      return (
                        <div key={textKey} className="flex flex-col gap-2">
                          <div>
                            <p className="text-sm font-semibold">{label}</p>
                            <p className="text-muted-foreground text-xs">{hint}</p>
                          </div>

                          {groupRows.length === 0 ? (
                            <p className="text-muted-foreground text-xs italic">
                              Sin versiones — no se imprimirá nada para este bloque.
                            </p>
                          ) : (
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={handleDragEnd(textKey)}
                            >
                              <SortableContext
                                items={groupRows.map((r) => r.localId)}
                                strategy={verticalListSortingStrategy}
                              >
                                <div className="flex flex-col gap-2">
                                  {groupRows.map((row) => (
                                    <TextVersionRow
                                      key={row.localId}
                                      row={row}
                                      isActive={row.localId === activeLocalId}
                                      readOnly={readOnly}
                                      onChangeText={(patch) => updateRow(row.localId, patch)}
                                      onToggleActive={(checked) =>
                                        checked
                                          ? setActiveInGroup(textKey, row.localId)
                                          : deactivate(row.localId)
                                      }
                                      onRemove={() => void handleRemove(row)}
                                    />
                                  ))}
                                </div>
                              </SortableContext>
                            </DndContext>
                          )}

                          {!readOnly && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-fit"
                              onClick={() => addRow(textKey)}
                            >
                              <Plus className="mr-1 size-4" />
                              Agregar otra versión
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
