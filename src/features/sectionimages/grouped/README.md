# Vista agrupada: secciones especiales con fotos por item

## ¿Qué es?

Algunas secciones de la web muestran **fotos agrupadas por item**. En el intranet tienen pantallas
propias (acordeón por item) en vez de la vista general. Hoy son tres:

| Sección (web) | `typesection_key` | Cada item es... | Helper |
| --- | --- | --- | --- |
| Hero de la página **Servicios** | `service_showcase` | un **servicio** (`sectionitem_type = 'showcase'`) | `isServiceShowcaseSection()` |
| Carrusel **«Muebles a medida»** (Servicios, "01") | `category_coverflow` | una **categoría** (`sectionitem_type = 'category'`) | `isCategoryCoverflowSection()` |
| Comparador **«Restauración»** (Servicios, "02") | `restoration_compare` | un **trabajo** con nombre propio y mueble relacionado **opcional** (`sectionitem_type = 'restoration'`) | `isRestorationCompareSection()` |

En el código **no** se compara el texto a mano: se usan los helpers de `special-sections.constants.ts`
(`SERVICE_SHOWCASE_TYPE_KEY`, `CATEGORY_COVERFLOW_TYPE_KEY`, `RESTORATION_COMPARE_TYPE_KEY`,
`isServiceShowcaseSection`, `isCategoryCoverflowSection`, `isRestorationCompareSection`, `isGroupedImagesSection`).

Las tres secciones usan **los mismos componentes**. Lo que cambia (textos y reglas) está en un objeto de
configuración por sección: `GROUPED_SECTION_CONFIG[typesectionKey]` en `grouped-section.config.ts`
(se pide con `getGroupedSectionConfig(typesectionKey)`, que devuelve `null` si la sección no es especial).

| Config | Hero de Servicios | Carrusel de categorías | Restauración |
| --- | --- | --- | --- |
| Nombre del item | "Servicio" / "el servicio" | "Categoría" / "la categoría" | "Trabajo" / "el trabajo" |
| `hideItemWithoutVisiblePhotos` (regla "sin fotos visibles = oculto") | **sí** | no | no |
| `addItemMode` ("+ Agregar ..." al final) | `'inline'` (escribir el nombre) | `'form'` (abre el formulario de item) | `'form'` |
| `canRenameInline` (lápiz en el encabezado) | sí | no (el nombre sale de la categoría) | no (el nombre se edita en el formulario del trabajo) |
| `helpText` (aviso arriba) | — | "Si una categoría no tiene fotos aquí, la web usa las de sus últimos trabajos." | "Si un trabajo no tiene fotos Antes/Después aquí, la web usa las de su mueble relacionado (si tiene uno)." |
| `itemsTab` (pestaña de items propia, antes de Imágenes) | — (se llama "Items") | "Categorías" | "Trabajos" |
| `photoVariantLabels` (badge por `sectionimage_variant`) | — | — | `before` → "Antes", `after` → "Después" |
| `autoPhotos` (fotos automáticas, ver abajo) | `null` | `'category'` | `'restoration'` |
| `itemMenuEdit` ("Editar" del ⋮ del item, pestaña Imágenes) | `'item'` → formulario del servicio | `'item'` → cambiar categoría | `'photos'` → **"Editar fotos Antes/Después"** (par del trabajo; si no tiene fotos, abre "agregar" con el trabajo elegido). El trabajo (nombre y mueble) se edita en la pestaña Trabajos. |
| `photoMenuEdit` ("Editar" en el ⋮ de cada foto) | sí | sí | **no** (las fotos se editan de a par desde el ⋮ del trabajo). Las fotos de "Sin trabajo asignado" sí lo tienen, para poder asignarlas. |

Etiquetas sobre las fotos en el intranet: **"Principal ★"** (1ª foto visible de cada item) y **"Oculta"**
(fotos desactivadas), ver `isRoleBadgeVisible()` en `lib/image-roles.ts`. Si la config tiene
`photoVariantLabels`, además un badge abajo a la izquierda con la variante (Restauración: "Antes" /
"Después"), ver `getPhotoVariantLabel()` en `grouped-section.config.ts`.

Todo lo que está en esta carpeta es **exclusivo** de estas secciones. Lo general (sirve para todas las
secciones) se queda fuera, en `features/sectionimages/lib` y `features/sectionimages/ui`.

## ¿Dónde se usa?

Puntos donde se decide "¿es una sección especial o una normal?":

| Pantalla | Archivo que decide | Si es especial usa |
| --- | --- | --- |
| Detalle de sección → pestañas | `features/sections/ui/detail/section-detail.tsx` | Si la config tiene `itemsTab`: la pestaña Items se llama **Categorías** / **Trabajos** y va antes de Imágenes |
| Detalle de sección → pestaña **Imágenes** | `features/sections/ui/detail/tabs/images/section-detail-images-tab.tsx` | `GroupedImagesManager` con su config |
| **Reordenar** imágenes (`/section-images/reorder?id_section=...`) | `features/sectionimages/ui/reorder/section-images-reorder-list.tsx` | `GroupedReorderBoard` con su config |
| Formulario **crear/editar** imagen de sección | `features/sectionimages/ui/form/sectionimage-form.tsx` | Solo "Pie de foto" + "Servicio"/"Categoría"/"Trabajo" (oculta los demás textos). Carrusel y Restauración: además "origen de la imagen" y botón **+ Nuevo** junto al item. Restauración: al crear **y al editar**, bloques **Antes y Después** juntos (misma tarjeta) |
| Formulario **crear/editar** item de sección | `features/section-items/ui/form/section-item-form.tsx` | Hero: `ShowcaseItemFields` · Carrusel: `CategoryItemFields` · Restauración: `RestorationItemFields` |
| Configuración → Visibilidad (elementos de las tarjetas) | `features/sections/ui/form/section-content-visibility-form.tsx` | Ver "Elementos de las tarjetas" (no depende de esta carpeta: lo decide el backend) |

El botón **Agregar imagen** de arriba (junto a **Reordenar**) es el único para agregar fotos: abre
`/section-images/create?id_section=<id>` y en el formulario se elige el item (servicio / categoría / trabajo).

## Cómo se ve cada item (acordeón)

- **Todo el encabezado** abre/cierra el item (clic, toque, o Enter/Espacio con el teclado).
  Truco: el botón del acordeón (Trigger de Radix) se estira detrás de todo el encabezado
  (`absolute inset-0`) y los controles que NO deben abrir/cerrar van encima con `relative z-10`:
  lápiz/input del nombre, switch Visible/Oculto y menú ⋮. Así no hay botones dentro de botones.
- Las fotos van en **una sola fila**: tantas columnas como fotos, todas del mismo tamaño (4/3). Si no
  entran, hay **scroll horizontal** (también en celular). Lo hace `GroupedPhotoRow`.
- La pantalla **Reordenar** usa el mismo encabezado y la misma fila de fotos (sin checkbox).

## Selección masiva (pestaña Imágenes)

- Cada foto tiene un **checkbox** arriba a la izquierda (en celular siempre se ve; en desktop al pasar
  el mouse o cuando ya hay fotos marcadas). Tocarlo NO abre el visor.
- En el encabezado de cada item hay un checkbox **"todas las de este item"**.
- Con 1 o más fotos marcadas aparece la MISMA barra que el resto del intranet
  (`DataTableBulkActions`): **Activar** (= mostrar), **Desactivar** (= ocultar), **Eliminar** (solo con
  permiso) y la X para limpiar.
- **Cada acción pide confirmación** (`swalConfirmAction` / `swalDeleteConfirm`).
- **Ocultar / Mostrar**, después de confirmar, hace:
  1. PATCH de estado de cada foto en paralelo (`bulkToggleState`).
  2. UN solo reorden de toda la sección (`lib/sort-hidden-last.ts`): dentro de cada item primero las
     visibles y luego las ocultas. Al final, las fotos sin item.
  3. Toast, recarga y limpia la selección.

## Regla SOLO del hero: servicio sin fotos visibles = servicio oculto

(Activa con `hideItemWithoutVisiblePhotos: true`; en el carrusel NO aplica: sin fotos propias la web
usa las de los trabajos de esa categoría.)

- Si al **ocultar** o **eliminar** fotos un servicio se queda **sin fotos visibles**, el servicio
  **se oculta solo** (sectionitem_state = 0). Si al **mostrar** vuelve a tener, **se muestra**.
- La confirmación lo avisa antes. El switch Visible/Oculto **no se puede encender** sin fotos visibles.
- Un servicio **nuevo nace oculto** (desde "+ Agregar nuevo servicio" y desde el formulario de item).
  Se muestra al mostrar una foto suya o al guardar una foto visible con ese servicio
  (`lib/show-service-if-hidden.ts`, lo llama `ui/form/sectionimage-form.tsx`).
- Por eso el selector "Servicio" del formulario de imagen lista **también los ocultos**
  (prop `includeHidden` de `ui/form/section-item-select.tsx`; en el carrusel también).

Cálculo (función pura): `lib/sync-service-visibility.ts` → `getServiceStateChanges()`.
Aplicación (llama a la API): `applyServiceStateChanges()` en `lib/use-group-item-actions.ts`.
En `ui/grouped-images-manager.tsx` todo pasa por `getItemChanges()`, que devuelve "sin cambios" si la
regla no aplica.

## Formulario de item (servicio) — hero

Vive en `features/section-items/ui/form/showcase/` (fuera de esta carpeta porque es del módulo section-items):

```
section-items/ui/form/
├── section-item-form.tsx            -> decide: hero → ShowcaseItemFields; carrusel → CategoryItemFields;
│                                       Restauración → RestorationItemFields; resto → general
├── use-used-item-key-ids.ts         -> ids (de la clave 'category-<id>' / 'furniture-<id>') que ya tienen tarjeta
├── showcase/
│   ├── use-showcase-item-mode.ts     -> ¿la sección es el hero, el carrusel o Restauración? + SHOWCASE_ITEM_TYPE
│   ├── showcase-item-fields.tsx      -> campos del modo hero (3 columnas en desktop, 2 en tablet, 1 en celular)
│   ├── showcase-link-picker.tsx      -> enlace guiado del botón ("¿A dónde lleva el botón?")
│   ├── showcase-link.ts              -> funciones puras del enlace (detectar la opción, armar /gallery?cat=X)
│   └── use-service-visible-photos.ts -> ¿el servicio tiene alguna foto visible?
├── category/
│   └── category-item-fields.tsx      -> modo "Categoría" del carrusel (ver abajo)
└── restoration/
    ├── restoration-item-fields.tsx       -> modo "Trabajo" de Restauración (ver abajo)
    └── restoration-furniture-select.tsx  -> campo "Mueble relacionado (opcional)" (también lo usa el diálogo "+ Nuevo")
```

- **Tipo fijo** `'showcase'`. Diseño: **Datos del servicio** | **Botón** | **Estado**.
- Enlace del botón (`sectionitem_link`): `/gallery`, `/gallery?cat=<Nombre>`, sin botón, o a mano
  (Opciones avanzadas). Texto del botón opcional (vacío = «Ver trabajos»).
- **Crear**: el servicio nace oculto. **Editar**: sin fotos visibles el switch no se puede encender.

## Carrusel de categorías («Muebles a medida»)

Datos (sin tablas ni columnas nuevas):

- **Tarjeta** = item de la sección: `sectionitem_type = 'category'`, `sectionitem_title` = nombre de la
  categoría, `sectionitem_key = 'category-<id_category>'` (enlace que sobrevive a renombrar).
- **Foto** de una tarjeta = imagen de la sección con `id_section_item` = la tarjeta. Si viene de un
  mueble: `sectionimage_link = '/gallery/<id_furniture>'`. `sectionimage_title` = pie de foto (opcional).
- Funciones puras para esos enlaces: `coverflow/coverflow-links.ts`
  (`buildCategoryItemKey`, `getCategoryIdFromKey`, `buildFurnitureGalleryLink`, `getFurnitureIdFromLink`).

Pantallas:

- **Detalle**: pestañas **Info general | Categorías | Imágenes** (las muestra `web_settings` del backend).
- **Formulario de item** (`section-items/ui/form/category/category-item-fields.tsx`): un solo campo
  **Categoría** (Select de categorías activas). Al elegir se escriben `sectionitem_key = 'category-<id>'`
  y `sectionitem_title = nombre`; el tipo se guarda como `'category'`. Al editar se preselecciona por la
  clave (o por el nombre si la clave no trae id, y se completa la clave). Las categorías que ya tienen
  tarjeta salen deshabilitadas. Estado visible/oculto. A todo el ancho.
- **Formulario de imagen** (`sectionimages/ui/form/sectionimage-form.tsx`): selector **Categoría** y
  **origen de la imagen** (`ui/form/coverflow/image-source-tabs.tsx`):
  - **Banco de imágenes**: el `ImageSelect` de siempre.
  - **Foto de un mueble** (`ui/form/coverflow/furniture-photo-picker.tsx`): select de mueble (solo los
    de la categoría de la tarjeta) → grilla con su portada y fotos de galería → al elegir:
    `id_image` = esa foto, `sectionimage_link = '/gallery/<id_furniture>'` y, si el pie de foto está
    vacío, el título (o nombre) del mueble.
  - Al editar una foto con enlace `/gallery/<id>` se abre en "Foto de un mueble" con ese mueble.
  - Al volver a "Banco de imágenes" se borra el enlace al mueble.
  - Botón **+ Nuevo** junto al select **Categoría**: diálogo pequeño para crear la tarjeta (select de
    categorías activas; las que ya tienen tarjeta salen deshabilitadas). Ver "Botón + Nuevo" más abajo.

Atajos (los procesa el backend al guardar, ver contrato):

- **Categorías** (`features/categories/ui/form/category-web-check.tsx`): check "Mostrar en la web"
  → envía `show_on_web`; se precarga de `web.show_on_web`; enlace "Ver sección →" a
  `/sections/<web.id_section>?tab=items`.
- **Muebles** (`features/furnitures/ui/form/furniture-category-card-check.tsx`): check "Usar su portada
  en la tarjeta «X»" → envía `show_cover_on_category_card`; se precarga de `category_card.show_cover`;
  enlace a `/sections/<category_card.id_section>?tab=images`. Independiente de "Visible en la web".
- Al editar, esos campos solo se envían si el backend ya mandó el dato (`web` / `category_card`) o si
  se tocó el check (así no se cambia nada por accidente).

## Restauración («02», comparador Antes/Después)

Mismo patrón que el carrusel. Datos (sin tablas ni columnas nuevas):

- **Tarjeta (trabajo)** = item de la sección con `sectionitem_type = 'restoration'`. Un trabajo **NO tiene
  que ser un mueble**:
  - `sectionitem_title` = **nombre del trabajo**: obligatorio y libre; es lo que se ve en la web. **No** se
    sincroniza con el nombre del mueble (el atajo de Muebles solo lo usa como valor inicial al crear la tarjeta).
  - `sectionitem_key` = **mueble relacionado (opcional)**: `'furniture-<id_furniture>'` o `null`.
    - Con mueble: botón «Ver la restauración completa» en la web (→ `/gallery/<id>`) y fotos automáticas.
    - Sin mueble: solo sus fotos propias; la web oculta el botón de detalle.
- **Fotos propias** = imágenes de la sección con `id_section_item` = la tarjeta y
  `sectionimage_variant = 'before' | 'after'`. Si viene de un mueble: `sectionimage_link = '/gallery/<id>'`.
- **Fotos automáticas** (solo con mueble): si la tarjeta no tiene una "Antes" y una "Después" propias visibles,
  la web usa las fotos de la galería del mueble marcadas Antes/Después (`furnitureimageweb_variant`).
- Regla de la web: sin foto Antes **y** Después (propias o automáticas) la tarjeta **no se muestra**.
- Funciones puras: `restoration/restoration-links.ts` (`RESTORATION_ITEM_TYPE`, `RESTORATION_PHOTO_VARIANTS`,
  `buildRestorationItemKey`, `getFurnitureIdFromRestorationKey`, `isRestorationPhotoVariant`,
  `hasBeforeAndAfterPhotos`). El enlace '/gallery/<id>' es el mismo del carrusel (`coverflow-links.ts`).

Pantallas:

- **Detalle**: pestañas **Info general | Trabajos | Imágenes** (`itemsTab` de la config).
- **Imágenes / Reordenar**: la vista agrupada de siempre + badge **"Antes" / "Después"** en cada foto.
- **Formulario de item** (`section-items/ui/form/restoration/restoration-item-fields.tsx`), dos campos:
  - **Nombre del trabajo** (Input, obligatorio) → `sectionitem_title`.
  - **Mueble relacionado (opcional)** (`restoration-furniture-select.tsx`) → `sectionitem_key = 'furniture-<id>'`
    o vacío (el backend lo guarda `null`). Lista **cualquier mueble activo**; los que tienen foto Antes y Después
    en su galería llevan la marca **"· Antes/Después"**; los que ya usa otro trabajo salen deshabilitados.
    Ayuda: "Sirve para el botón «Ver la restauración completa» y para usar sus fotos Antes/Después."
  - Al elegir un mueble, si el nombre está vacío se sugiere su título (no se pisa lo ya escrito).
  - El tipo se guarda como `'restoration'`. Al editar se precargan nombre y mueble. Con mueble muestra la
    vista previa Antes/Después de su galería.
- **Formulario de imagen** (selector **Trabajo** con botón **+ Nuevo**):
  - **Crear** → tarjeta **"Fotos del trabajo"** (`ui/form/restoration/restoration-pair-fields.tsx`; estado en
    `use-restoration-pair.ts`, que guarda el **mueble compartido** y los dos bloques):
    - Arriba, **UN solo select "Mueble"** para los dos bloques (`restoration-pair-furniture.tsx`): muebles con
      fotos, primero los que tienen Antes/Después (miniatura + nombre + "· Antes/Después", con
      `furniture-option-label.tsx`); se **preselecciona el mueble del trabajo** (clave `furniture-<id>`) y se
      puede dejar en **"Sin mueble"**.
    - **Auto-colocar**: al elegir un mueble (o al preseleccionarse el del trabajo, cuando termina de cargar la
      lista) sus fotos marcadas **Antes / Después** (`findVariantPhoto`) se ponen solas en los bloques,
      **reemplazando** lo que hubiera; si no tiene una marcada, ese bloque queda vacío
      (`placeFurniturePhotos` de `use-restoration-pair.ts`, lo llama un `useEffect` de `restoration-pair-fields.tsx`
      con un ref para hacerlo una sola vez por mueble). El link **"Volver a las fotos marcadas"** (debajo del
      select, solo si el mueble tiene alguna marcada) las vuelve a poner.
    - Debajo del select, **UNA fila** con las fotos del mueble (`restoration-furniture-photo-strip.tsx`; scroll
      horizontal si no entran) con la ayuda "Mantén presionada una foto y arrástrala a «Antes» o «Después»".
      Badges: **Portada**, **Antes/Después** (cómo está marcada en la galería) y **"En Antes" / "En Después"**
      (+ borde) si ya está en un bloque. Dos formas de elegir:
      - **Arrastrar** (@dnd-kit, `use-restoration-dnd.ts`): `useDraggable` en cada foto, `useDroppable` en cada
        bloque; al soltar sobre un bloque se usa `pickFurniturePhoto`. `DragOverlay` con la miniatura y el bloque
        destino se resalta. Sensores: `MouseSensor` (distancia 5) y `TouchSensor` (delay 250, tolerance 8: deslizar
        rápido hace scroll normal). Las fotos llevan `touch-action: manipulation` (no `none`). Detección
        `pointerWithin` (cae en el bloque que está bajo el dedo). La foto de un bloque también se puede arrastrar
        al **otro bloque** para **intercambiarlos** (`swapSlots`: foto, enlace y pie).
      - **Tocar / clic / Enter** en una foto: menú pequeño (`Popover`) con **"Poner en «Antes»" / "Poner en
        «Después»"**. Es la vía con teclado (por eso no hay `KeyboardSensor`: Enter/Espacio abren el menú).
        Se usa `Popover` y no `DropdownMenu` porque el trigger del DropdownMenu se abre en `pointerdown` y
        bloquearía el arrastre con mouse.
    - Debajo, dos bloques lado a lado, **Antes** y **Después** (`restoration-photo-slot.tsx`; columnas fluidas,
      en celular uno debajo del otro). Cada bloque: la foto puesta en grande con su **X** para quitarla; vacío,
      borde punteado y "Suelta aquí la foto «Antes»". Link **"Usar del banco de imágenes"** que cambia SOLO ese
      bloque al `ImageSelect` (con su "Nuevo" para subir); "Volver a fotos del mueble" regresa. Sin mueble
      elegido (o mueble sin fotos), los dos bloques muestran directamente el banco. Pie de foto opcional por
      bloque. Mientras cargan los muebles (con un mueble preseleccionado): esqueleto en la fila y en los bloques.
    - En este modo **no** hay pestañas Imágenes | Muebles (siguen solo en el carrusel).
    - Al guardar se crean 1 o 2 filas de `sections_images` (`variant` 'before' / 'after', mismo
      `id_section_item`, en orden) con dos POST seguidos (`create-restoration-pair.ts`).
      `sectionimage_link = '/gallery/<id>'` si la foto vino del mueble; del banco, sin enlace.
      Al menos una foto es obligatoria. Si falla el 2º POST, la foto ya guardada se quita de su bloque y se
      avisa: al pulsar «Crear» otra vez solo se envía la que falta.
  - **Editar** → **la misma tarjeta "Fotos del trabajo"** que al crear (mismos componentes; el hook se usa como
    `useRestorationPair(workFurnitureId, 'edit')`):
    - **Carga** (`use-restoration-edit-initial.ts`): la foto abierta + las fotos de SU trabajo (`sectionImagesService.getList`
      de la sección, visibles y ocultas, filtrando `id_section_item`) + la clave del trabajo (`sectionItemsService.getById`).
      Bloque **Antes** = la 1ª con variant `'before'` (por orden), **Después** = la 1ª `'after'`. La foto abierta
      **siempre** queda en su bloque (si hay varias del mismo tipo, gana ella; sin variant válido va al 1er bloque libre).
      Cada bloque recuerda su `id_section_image` original (o null). Se precargan pie de foto, enlace y visible/oculta.
      **Mueble** del select: el del enlace `/gallery/<id>` (primero la foto abierta), si no el del trabajo
      (`furniture-<id>`), si no "Sin mueble". Lo aplica `pair.loadInitial()`; hasta entonces, esqueleto (`isFormReady`).
    - **NO se auto-colocan** las fotos marcadas del mueble (ni al cargar ni al cambiar de mueble): pisaría lo guardado.
      Solo con el link **"Volver a las fotos marcadas"**.
    - **Sección y Trabajo bloqueados** ("Para cambiar de trabajo, elimina y vuelve a crear."); sin "+ Nuevo".
    - Cada bloque con foto tiene su switch **"Mostrar en el sitio web"** (`sectionimage_state` de esa fila); el switch
      general de "Ubicación" no se muestra.
    - **Guardar** (`save-restoration-pair.ts`), por bloque: tenía id y sigue con foto → **PUT**; no tenía id y ahora
      tiene foto → **POST**; tenía id y quedó vacío (X) → **DELETE**. Antes de guardar, por cada DELETE se pregunta
      "¿Eliminar la foto «Antes»? Quedó vacía en el formulario." (si cancela, no se guarda nada). Orden: DELETE → PUT
      → POST, así reintentar es seguro (los DELETE hechos se olvidan con `forgetOriginalId`). Al menos una foto
      obligatoria. Si algo falla: `swalError` con qué paso falló. Al terminar, `goBackOrFallback`.
    - Las demás fotos del trabajo (si había más de una del mismo tipo) no se tocan.
  - Resto de campos ocultos (Restauración solo usa pie de foto, dentro de cada bloque).

### Botón "+ Nuevo" junto al item (Restauración y carrusel)

`ui/form/new-section-item/new-section-item-dialog.tsx` (textos y opciones por sección en
`use-new-section-item-options.ts`, `NEW_SECTION_ITEM_TEXTS`). Igual que el "Nuevo" de `ImageSelect`:
abre un diálogo pequeño, crea el `sections_item` con `sectionItemsService.post` (type, key, title,
`sectionitem_state = 1`, `sectionitem_created_at = formatDatetime()`) y lo deja **elegido** en el formulario
(el select de items se recarga con `reloadKey`). Restauración: **Nombre del trabajo** (obligatorio) +
**Mueble relacionado (opcional)** (el mismo `restoration-furniture-select.tsx` del formulario de item; sin mueble
se crea sin clave); carrusel: categorías activas. Los ya usados salen deshabilitados (`useUsedItemKeyIds`). El hero de Servicios no lo tiene (agrega servicios en línea desde la pestaña Imágenes).

### Diseño del formulario de imagen

Sin tarjeta "Vista previa" (el intranet ya tiene la vista previa del sitio en vivo, `useLiveSitePreview`).
Las tarjetas (Ubicación, Foto o Antes/Después, Textos) van en una grilla fluida
`grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))]`: 1 columna en celular y más columnas según el ancho.

Atajo en **Muebles** (`features/furnitures/ui/form/furniture-restoration-card-check.tsx`): check
"Mostrar en «Restauración» (página Servicios)" → envía `show_on_restoration`; se precarga de
`restoration_card.show`; enlace "Ver sección →" a `/sections/<restoration_card.id_section>?tab=items`.
Si `restoration_card.has_before_after` es false (y el check está apagado) queda deshabilitado con el aviso
"Necesita una foto Antes y una Después en su galería." (al crear un mueble siempre está deshabilitado:
sus fotos aún no están guardadas). Se envía solo si el backend informó `restoration_card` o si se tocó.
Al crear la tarjeta el backend le pone como nombre inicial el título (o nombre) del mueble; después el nombre
del trabajo es libre y **no** cambia al renombrar el mueble.
Los dos atajos de Muebles usan el mismo componente base `furniture-shortcut-check.tsx`.

## Fotos automáticas (carrusel y Restauración)

Si un item no tiene fotos propias visibles, la **web** usa fotos "automáticas" sacadas de los muebles.
El intranet las muestra para que el admin vea lo mismo que la web. Se activa con `autoPhotos` en
`GROUPED_SECTION_CONFIG` (`'category' | 'restoration' | null`); el hero no tiene (`null`).

Regla (copiada EXACTO de la web, funciones puras en `lib/auto-photos.ts` → `getAutoPhotos()`):

- **Restauración** (`'restoration'`, clave `furniture-<id>`): por cada tipo (Antes / Después) que el item
  NO tenga como foto propia visible, la 1ª foto visible (por `furnitureimage_order`) de la galería del
  mueble con `web.furnitureimageweb_variant` = ese tipo. El mueble tiene que estar **publicado**
  (`web.furnitureweb_state === 1`): si no, la web no lo tiene en `works` y no usa sus fotos.
  Trabajo **sin mueble** (clave `null`): no tiene automáticas.
- **Categoría** (`'category'`, clave `category-<id>`; sin id se compara por nombre sin tildes): si el item
  no tiene NINGUNA foto propia visible, las fotos de los trabajos **publicados** de esa categoría, del más
  reciente al más antiguo (`web.furnitureweb_delivered_at` desc, sin fecha al final; empate =
  `furnitureweb_order`). Primero la portada de cada trabajo y luego sus demás fotos visibles. Máximo 4.

Web (solo lectura): `features/service/lib/categoryCard.ts`, `buildItemCategoryCards.ts`,
`buildRestorationCards.ts` y `shared/services/site_service/lib/workPhotos.ts`.

Cómo se ve (pestaña Imágenes y Reordenar):

- Tarjetas iguales a las normales, con borde punteado y badge **"Automática"** (+ "Antes"/"Después" en
  Restauración). **Sin** checkbox, **sin** asa de arrastre y **sin** menú. Al tocarlas se abren en el mismo
  visor (`usePhotoLightbox().openSlides`).
- Encabezado: en vez de "0 fotos" dice **"Fotos automáticas (del mueble)"** / **"Fotos automáticas (de sus trabajos)"**.
- Debajo: ayuda corta + **"Personalizar fotos"** + **"Ver mueble →"** (`/furnitures/edit/<id>`) o
  **"Ver trabajos →"** (`/furnitures`: esa lista no tiene filtro por categoría en la URL).
- Sin propias ni automáticas: "Este trabajo/categoría aún no tiene fotos." + el mismo botón "Ver ... →"
  (Restauración con el mueble sin publicar: lo avisa).
- El botón **"Ver mueble →"** solo aparece si el trabajo tiene mueble relacionado.
- Restauración, trabajo **sin mueble**: si le falta su foto propia visible «Antes» o «Después», aviso ámbar
  **"Falta foto «Antes»: no se mostrará en la web."** (o «Después», o las dos). Cálculo: `getMissingRestorationVariants()`
  (`lib/auto-photos.ts`) + `getRestorationMissingText()` (`lib/auto-photos-texts.ts`); lo pinta `GroupedAutoPhotos`
  (prop `missingWarning`, la arma `use-grouped-auto-photos.tsx`).

**Personalizar fotos** (`lib/use-personalize-auto-photos.ts`): confirma con `swalConfirmAction` y crea una
imagen de sección por cada foto automática (en orden): `id_section`, `id_section_item`, `id_image`,
`sectionimage_link = '/gallery/<id_furniture>'`, `sectionimage_title` = título del mueble,
`sectionimage_variant` before/after (Restauración), state 1, `created_at = formatDatetime()`. Luego recarga
y avisa con un toast. En Reordenar, si hay orden sin confirmar, la pregunta avisa que se pierde.

Datos: `lib/use-furniture-join-list.ts` (furniture_join, `per_page` 100; con `enabled = false` no pide nada)
→ `lib/use-auto-photos.ts`. URL de cada foto con `buildImageUrl` (`@/shared/lib/images`).

## Elementos de las tarjetas (`card_settings`)

En **Configuración → Visibilidad** de una sección, debajo de título/subtítulo/descripción, aparece el
bloque **"Elementos de las tarjetas"**: un switch por cada parte de las tarjetas que se puede ocultar
(ej. carrusel: contador «N trabajos», miniaturas, flechas; Restauración: etiquetas Antes/Después, ayuda…).

- **El catálogo vive SOLO en el backend**: `config/section_card_settings.php` (una lista por
  `typesection_key`, cada elemento con `label` y `default`). El intranet **no** lo repite: pinta lo que
  llega en `web_settings.card_settings_schema` (`[{ key, label, default }]`) con los valores de
  `web_settings.card_settings` (`{ clave: bool }`, ya resuelto). Si el schema viene vacío, el bloque no
  se muestra.
- **Para agregar un elemento**: se agrega en `config/section_card_settings.php` (backend) y se hace que la
  web lo respete. En el intranet no hay que tocar nada.
- Al guardar se envía `card_settings` (solo con las claves del catálogo) en el mismo PATCH de la sección;
  el backend lo guarda en `section_web_setting.card_settings`. La vista previa en vivo manda
  `fields.card_settings` en la entidad `section`.
- Archivos: `features/sections/ui/form/section-card-settings-fields.tsx` (bloque + `resolveCardSettings`)
  y `section-content-visibility-form.tsx` (lo usa).

## Archivos

```
grouped/
├── index.ts                         -> lo único que deben importar los demás
├── special-sections.constants.ts    -> claves + isServiceShowcaseSection / isCategoryCoverflowSection /
│                                       isRestorationCompareSection / isGroupedImagesSection
├── grouped-section.config.ts        -> GROUPED_SECTION_CONFIG (textos y reglas por sección) + getGroupItemName
│                                       + getPhotoVariantLabel
├── coverflow/
│   └── coverflow-links.ts           -> clave 'category-<id>' y enlace '/gallery/<id>' (funciones puras)
├── restoration/
│   └── restoration-links.ts         -> clave 'furniture-<id>', Antes/Después (funciones puras)
├── lib/
│   ├── use-furniture-join-list.ts       -> muebles con galería (carrusel y Restauración) + getFurnitureDisplayTitle
│   ├── auto-photos.ts                   -> fotos automáticas: regla EXACTA de la web (funciones puras)
│   ├── auto-photos-texts.ts             -> textos, enlace "Ver mueble/trabajos" y contador del encabezado
│   ├── use-auto-photos.ts               -> trae los muebles y calcula las automáticas de cada item
│   ├── use-personalize-auto-photos.ts   -> "Personalizar fotos": copia las automáticas a sections_images
│   ├── use-group-items.ts               -> trae los items de la sección (activos e inactivos)
│   ├── use-group-item-actions.ts        -> renombrar, Visible/Oculto y aplicar la regla del hero
│   ├── sync-service-visibility.ts       -> SOLO hero: qué servicios se ocultan/muestran según sus fotos
│   ├── show-service-if-hidden.ts        -> SOLO hero: muestra un servicio oculto al guardar una foto visible
│   ├── use-photo-selection.ts           -> fotos marcadas con checkbox (selección masiva)
│   ├── use-grouped-photo-visibility.ts  -> Ocultar/Mostrar fotos + guardar el orden "ocultas al final"
│   └── sort-hidden-last.ts              -> funciones puras: orden con las ocultas al final
└── ui/
    ├── grouped-images-manager.tsx       -> pestaña Imágenes: acordeón por item, eliminar items, selección masiva
    ├── grouped-item-accordion.tsx       -> un item: encabezado + fila de fotos (o el texto "sin fotos")
    ├── grouped-item-header.tsx          -> encabezado (checkbox, nombre, Visible/Oculto, contador, menú ⋮)
    ├── grouped-item-title-editor.tsx    -> nombre editable en línea (solo si canRenameInline)
    ├── grouped-photo-card.tsx           -> tarjeta de una foto (checkbox + rol + menú + badge de variante)
    ├── grouped-photo-row.tsx            -> fila única de fotos (una columna por foto, scroll horizontal)
    ├── grouped-add-item.tsx             -> "+ Agregar ..." (input en línea o ir al formulario)
    ├── auto-photos/
    │   ├── use-grouped-auto-photos.tsx  -> bloque + contador de un item (lo usan Imágenes y Reordenar)
    │   ├── grouped-auto-photos.tsx      -> tarjetas "Automática" + ayuda + botones (o "aún no tiene fotos")
    │   └── grouped-auto-photo-card.tsx  -> tarjeta de una foto automática (sin checkbox/asa/menú)
    └── reorder/
        ├── grouped-reorder-board.tsx        -> pantalla Reordenar completa (arrastrar + Confirmar orden)
        ├── grouped-reorder-item.tsx         -> un item en Reordenar
        └── sortable-grouped-photo-card.tsx  -> tarjeta de foto arrastrable
```

Formulario de imagen (fuera de esta carpeta, en `sectionimages/ui/form/`):

```
ui/form/
├── sectionimage-form.tsx                 -> formulario (grilla fluida; elige el modo según la sección)
├── section-item-select.tsx               -> select del item (prop reloadKey para recargar)
├── coverflow/
│   ├── image-source-tabs.tsx             -> pestañas Banco de imágenes | Foto de un mueble
│   ├── furniture-photo-picker.tsx        -> select de mueble + grilla de fotos (carrusel)
│   ├── furniture-photo-grid.tsx          -> grilla de fotos de un mueble (la usa el picker)
│   ├── furniture-option-label.tsx        -> opción de mueble en los selects (miniatura + nombre)
│   └── furniture-photos.ts               -> funciones puras: fotos de un mueble, foto Antes/Después, orden
├── restoration/
│   ├── restoration-pair-fields.tsx       -> tarjeta "Fotos del trabajo" (crear y editar)
│   ├── restoration-pair-furniture.tsx    -> UN select "Mueble" + link "Volver a las fotos marcadas"
│   ├── restoration-furniture-photo-strip.tsx -> fila de fotos del mueble (arrastrables + menú "Poner en...")
│   ├── restoration-photo-slot.tsx        -> un bloque (zona para soltar, foto en grande, banco, pie de foto,
│   │                                        y al editar el switch "Mostrar en el sitio web")
│   ├── use-restoration-dnd.ts            -> arrastre: sensores, miniatura y qué pasa al soltar
│   ├── use-restoration-pair.ts           -> estado: mueble compartido + los dos bloques (auto-colocar, intercambiar);
│   │                                        modo 'create' | 'edit' (ids originales, visible por bloque, loadInitial)
│   ├── use-restoration-edit-initial.ts   -> al editar: carga las fotos del trabajo y arma los valores iniciales
│   ├── create-restoration-pair.ts        -> crear: guarda 1 o 2 filas (POST seguidos)
│   └── save-restoration-pair.ts          -> editar: PUT / POST / DELETE por bloque
└── new-section-item/
    ├── new-section-item-dialog.tsx       -> diálogo "+ Nuevo" (trabajo / categoría)
    └── use-new-section-item-options.ts   -> textos y opciones por sección
```

Cosas **generales** que esta carpeta usa (y que NO se deben mover aquí, porque las usa también la
vista normal): `lib/image-roles.ts`, `lib/lightbox-slides.ts`, `lib/use-photo-lightbox.ts`,
`lib/use-reorder-images.ts`, `lib/use-section-type-key.ts`, `ui/list/section-image-lightbox.tsx`,
`ui/list/sectionimage-role-badge.tsx` y los stores de `stores/`.

## ¿Cómo agregar otra sección especial en el futuro?

1. En `special-sections.constants.ts` agrega su clave y su helper `is<Nombre>Section` (sin literales sueltos).
2. Si sus fotos van agrupadas por item, agrega su entrada en `GROUPED_SECTION_CONFIG` (textos y reglas):
   la pestaña Imágenes y Reordenar la usarán solas (`getGroupedSectionConfig`). Con `itemsTab` su
   pestaña de items tiene nombre propio; con `photoVariantLabels`, badges por variante.
3. Fija su tipo de item en `section-items/data/item-types-by-section.ts`.
4. Si su formulario de item o de imagen necesita algo propio, agrega la rama en los archivos de la
   tabla "¿Dónde se usa?", antes de la vista general, y deja sus archivos en una carpeta propia
   (como `showcase/`, `category/` y `restoration/` en section-items, o `ui/form/coverflow/` y
   `ui/form/restoration/` en sectionimages).
5. Si sus tarjetas tienen elementos que se pueden ocultar, agrégalos en el backend
   (`config/section_card_settings.php`); el intranet los pinta solo.
6. Reutiliza lo general (roles, visor, reorder, selector de fotos de mueble) en vez de copiarlo.
