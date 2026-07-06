'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { TemplateTextsManager } from '@/features/proforma-template-texts'

export function TextsTab({ templateId }: { templateId: number | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Textos de la plantilla</CardTitle>
      </CardHeader>
      <CardContent>
        {templateId != null ? (
          <TemplateTextsManager templateId={templateId} />
        ) : (
          <p className="text-muted-foreground text-sm">
            Guarda la plantilla primero para poder agregar textos.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
