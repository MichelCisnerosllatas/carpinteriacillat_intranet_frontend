# Vista agrupada: secciones especiales con fotos por item

## ¿Qué es?

Algunas secciones de la web muestran **fotos agrupadas por item**. En el intranet tienen pantallas
propias (acordeón por item) en vez de la vista general. Hoy son dos:

| Sección (web) | `typesection_key` | Cada item es... | Helper |
| --- | --- | --- | --- |
| Hero de la página **Servicios** | `service_showcase` | un **servicio** (`sectionitem_type = 'showcase'`) | `isServiceShowcaseSection()` |
| Carrusel **«Muebles a medida»** (Servicios, "01") | `category_coverflow` | una **categoría** (`sectionitem_type = 'category'`) | `isCategoryCoverflowSection()` |

En el código **no** se compara el texto a mano: se usan los helpers de `special-sections.constants.ts`
(`SERVICE_SHOWCASE_TYPE_KEY`, `CATEGORY_COVERFLOW_TYPE_KEY`, `isServiceShowcaseSection`,
`isCategoryCoverflowSection`, `isGroupedImagesSection`).

> **Restauración** (`restoration_compare`) y **Galería** (`work_gallery`) **no** usan la vista agrupada ni
> `sections_items` / `sections_images` para sus trabajos: muestran los **trabajos de la Galería**
> (`web_works`, módulo `features/web-works`, menú *Sitio Web → Galería → Trabajos*). Sus helpers
> (`RESTORATION_COMPARE_TYPE_KEY` / `isRestorationCompareSection()`, `WORK_GALLERY_TYPE_KEY` /
> `isWorkGallerySection()`) siguen aquí porque los usa la pestaña **Trabajos** del detalle de la
> sección (`features/sections/ui/detail/tabs/works/`, ver `section-works.config.ts`): lista los
> trabajos de restauración (Restauración) o todos (Galería), con visibilidad, orden, crear y editar.

Las dos secciones usan **los mismos componentes**. Lo que cambia (textos y reglas) está en un objeto de
configuración por sección: `GROUPED_SECTION_CONFIG[typesectionKey]` en `grouped-section.config.ts`
(se pide con `getGroupedSectionConfig(typesectionKey)`, que devuelve `null` si la sección no es especial).

| Config | Hero de Servicios | Carrusel de categorías |
| --- | --- | --- |
| Nombre del item | "Servicio" / "el servicio" | "Categoría" / "la categoría" |
| `hideItemWithoutVisiblePhotos` (regla "sin fotos visibles = oculto") | **sí** | no |
| `addItemMode` ("+ Agregar ..." al final) | `'inline'` (escribir el nombre) | `'form'` (abre el formulario de item) |
| `canRenameInline` (lápiz en el encabezado) | sí | no (el nombre sale de la categoría) |
| `helpText` (aviso arriba) | — | "Si una categoría no tiene fotos aquí, la web usa las de sus últimos trabajos publicados (Galería → Trabajos)." |
| `itemsTab` (pestaña de items propia, antes de Imágenes) | — (se llama "Items") | "Categorías" |
| `autoPhotos` (fotos automáticas, ver abajo) | `false` | `true` |

"Editar" del menú ⋮ de un item abre siempre el formulario del item (hero: descripción y botón;
carrusel: cambiar categoría). Cada foto tiene "Editar" en su menú ⋮.

Etiquetas sobre las fotos en el intranet: **"Principal ★"** (1ª foto visible de cada item) y **"Oculta"**
(fotos desactivadas), ver `isRoleBadgeVisible()` en `lib/image-roles.ts`.

Todo lo que está en esta carpeta es **exclusivo** de estas secciones. Lo general (sirve para todas las
secciones) se queda fuera, en `features/sectionimages/lib` y `features/sectionimages/ui`.

## ¿Dónde se usa?

Puntos donde se decide "¿es una sección especial o una normal?":

| Pantalla | Archivo que decide | Si es especial usa |
| --- | --- | --- |
| Detalle de sección → pestañas | `features/sections/ui/detail/section-detail.tsx` | Si la config tiene `itemsTab`: la pestaña Items se llama **Categorías** y va antes de Imágenes. Galería / Restauración: pestaña **Trabajos** (`tab_works`, ver `tabs/works/section-works.config.ts`) |
| Detalle de sección → pestaña **Imágenes** | `features/sections/ui/detail/tabs/images/section-detail-images-tab.tsx` | `GroupedImagesManager` con su config |
| **Reordenar** imágenes (`/section-images/reorder?id_section=...`) | `features/sectionimages/ui/reorder/section-images-reorder-list.tsx` | `GroupedReorderBoard` con su config |
| Formulario **crear/editar** imagen de sección | `features/sectionimages/ui/form/sectionimage-form.tsx` | Solo "Pie de foto" + "Servicio"/"Categoría" (oculta los demás textos). Carrusel: además "origen de la imagen" y botón **+ Nuevo** junto a la categoría |
| Formulario **crear/editar** item de sección | `features/section-items/ui/form/section-item-form.tsx` | Hero: `ShowcaseItemFields` · Carrusel: `CategoryItemFields` |
| Configuración → **Apariencia** (qué muestra la web) | `features/sections/ui/appearance/section-appearance-editor.tsx` | Ver "Apariencia de la sección" (no depende de esta carpeta: lo decide el backend) |

El botón **Agregar imagen** de arriba (junto a **Reordenar**) es el único para agregar fotos: abre
`/section-images/create?id_section=<id>` y en el formulario se elige el item (servicio / categoría).

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
- En el encabezado de cada item hay un checkbox **"todas las de este item"** (deshabilitado si el item
  no tiene fotos propias, ej. solo tiene fotos automáticas).
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
├── section-item-form.tsx            -> decide: hero → ShowcaseItemFields; carrusel → CategoryItemFields; resto → general
├── use-used-item-key-ids.ts         -> ids (de la clave 'category-<id>') que ya tienen tarjeta
├── showcase/
│   ├── use-showcase-item-mode.ts     -> ¿la sección es el hero o el carrusel? + SHOWCASE_ITEM_TYPE
│   ├── showcase-item-fields.tsx      -> campos del modo hero (3 columnas en desktop, 2 en tablet, 1 en celular)
│   ├── showcase-link-picker.tsx      -> enlace guiado del botón ("¿A dónde lleva el botón?")
│   ├── showcase-link.ts              -> funciones puras del enlace (detectar la opción, armar /gallery?cat=X)
│   └── use-service-visible-photos.ts -> ¿el servicio tiene alguna foto visible?
└── category/
    └── category-item-fields.tsx      -> modo "Categoría" del carrusel (ver abajo)
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
  trabajo de la Galería: `sectionimage_link = '/gallery/<id_web_work>'`. `sectionimage_title` = pie de foto (opcional).
- Funciones puras para esos enlaces: `coverflow/coverflow-links.ts`
  (`buildCategoryItemKey`, `getCategoryIdFromKey`, `buildWorkGalleryLink`, `getWorkIdFromLink`).

Pantallas:

- **Detalle**: pestañas **Info general | Categorías | Imágenes** (las muestra `web_settings` del backend).
- **Formulario de item** (`section-items/ui/form/category/category-item-fields.tsx`): un solo campo
  **Categoría** (Select de categorías activas). Al elegir se escriben `sectionitem_key = 'category-<id>'`
  y `sectionitem_title = nombre`; el tipo se guarda como `'category'`. Al editar se preselecciona por la
  clave (o por el nombre si la clave no trae id, y se completa la clave). Las categorías que ya tienen
  tarjeta salen deshabilitadas. Estado visible/oculto. A todo el ancho.
- **Formulario de imagen** (`sectionimages/ui/form/sectionimage-form.tsx`): selector **Categoría** y
  **origen de la imagen** (`ui/form/coverflow/image-source-tabs.tsx`, pestañas "Imágenes" | "Trabajos"):
  - **Banco de imágenes**: el `ImageSelect` de siempre.
  - **Foto de un trabajo** (`ui/form/coverflow/work-photo-picker.tsx`): select de trabajo de la Galería
    (solo los de la categoría de la tarjeta: por id de la clave o, si no trae id, por nombre sin tildes;
    publicados y ocultos, los ocultos marcados "· Oculto") → grilla con su portada y fotos visibles de
    galería → al elegir: `id_image` = esa foto, `sectionimage_link = '/gallery/<id_web_work>'` y, si el pie
    de foto está vacío, el título del trabajo.
  - Al editar una foto con enlace `/gallery/<id>` se abre en "Foto de un trabajo" con ese trabajo.
  - Al volver a "Banco de imágenes" se borra el enlace al trabajo.
  - Botón **+ Nuevo** junto al select **Categoría**: diálogo pequeño para crear la tarjeta (select de
    categorías activas; las que ya tienen tarjeta salen deshabilitadas). Ver "Botón + Nuevo" más abajo.

Atajo (lo procesa el backend al guardar, ver contrato):

- **Categorías** (`features/categories/ui/form/category-web-check.tsx`): check "Mostrar en la web"
  → envía `show_on_web`; se precarga de `web.show_on_web`; enlace "Ver sección →" a
  `/sections/<web.id_section>?tab=items`.

### Botón "+ Nuevo" junto a la categoría

`ui/form/new-section-item/new-section-item-dialog.tsx` (textos y opciones en
`use-new-section-item-options.ts`, `NEW_SECTION_ITEM_TEXTS`). Igual que el "Nuevo" de `ImageSelect`:
abre un diálogo pequeño, crea el `sections_item` con `sectionItemsService.post` (type `'category'`,
key `'category-<id>'`, title, `sectionitem_state = 1`, `sectionitem_created_at = formatDatetime()`) y lo
deja **elegido** en el formulario (el select de items se recarga con `reloadKey`). Las categorías ya usadas
salen deshabilitadas (`useUsedItemKeyIds`). El hero de Servicios no lo tiene (agrega servicios en línea
desde la pestaña Imágenes).

### Diseño del formulario de imagen

Sin tarjeta "Vista previa" (el intranet ya tiene la vista previa del sitio en vivo, `useLiveSitePreview`).
Las tarjetas (Ubicación, Foto, Textos) van en una grilla fluida
`grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))]`: 1 columna en celular y más columnas según el ancho.

## Fotos automáticas (solo carrusel)

Si una tarjeta no tiene fotos propias visibles, la **web** usa fotos "automáticas" sacadas de los
**trabajos de la Galería** (`web_works`). El intranet las muestra para que el admin vea lo mismo que la
web. Se activa con `autoPhotos: true` en `GROUPED_SECTION_CONFIG` (solo el carrusel; el hero no tiene).

Regla (funciones puras en `lib/auto-photos.ts` → `getCategoryAutoPhotos()`, igual que la web):

- Solo si la tarjeta NO tiene NINGUNA foto propia visible.
- Trabajos **publicados** (`webwork_state = 1`) con `category.id_category` = la categoría de la tarjeta
  (clave `category-<id>`; si la clave no trae id, se compara el nombre sin tildes).
- Del más reciente al más antiguo (`webwork_delivered_at` desc, sin fecha al final; empate = `webwork_order`).
- Primero la **portada** de cada trabajo (`cover` o, si no tiene, su 1ª foto visible) y luego sus demás
  fotos visibles (`webworkimage_state = 1`, por `webworkimage_order`). Máximo **4**.

Cómo se ve (pestaña Imágenes y Reordenar):

- Título **"Fotos automáticas (de sus trabajos)"** y tarjetas iguales a las normales, con borde punteado,
  badge **"De un trabajo"** y el título del trabajo abajo. **Sin** checkbox, **sin** asa de arrastre y
  **sin** menú. Al tocarlas se abren en el mismo visor (`usePhotoLightbox().openSlides`).
- Encabezado: en vez de "0 fotos" dice **"N fotos · de sus trabajos"**.
- Debajo: ayuda corta + **"Personalizar fotos"** + **"Ver trabajos →"** (`/web-works?typework_key=manufacture`).
- Sin propias ni automáticas: "Esta categoría aún no tiene fotos ni trabajos publicados." + "Ver trabajos →".

**Personalizar fotos** (`lib/use-personalize-auto-photos.ts`): confirma con `swalConfirmAction` y crea una
imagen de sección por cada foto automática (en orden): `id_section`, `id_section_item`, `id_image`,
`sectionimage_link = '/gallery/<id_web_work>'`, `sectionimage_title` = título del trabajo, state 1,
`created_at = formatDatetime()`. Luego recarga y avisa con un toast. En Reordenar, si hay orden sin
confirmar, la pregunta avisa que se pierde.

Datos: `lib/use-web-work-list.ts` → `GET /v1/intranet/web-work?include=media&per_page=100` (`state=1`
para las automáticas; sin filtro para el selector "Foto de un trabajo"). Usa un tipo **local** mínimo
(`GroupedWebWork`) y `apiClient` directo, para no depender de `features/web-works`. Con `enabled = false`
no pide nada. → `lib/use-auto-photos.ts`. Las URLs de las fotos ya vienen absolutas desde la API.

## Apariencia de la sección (`display_settings`)

En **Configuración → Apariencia** de una sección (`/sections/settings/<id>?tab=appearance`, también desde
el botón **Apariencia** del detalle) se elige qué muestra la web de esa sección: interruptores, textos,
números, opciones y listas (ej. Encabezado: título/subtítulo/descripción; carrusel: contador «N trabajos»,
miniaturas, flechas; Restauración: etiquetas Antes/Después, texto del botón…; Galería: buscador, tarjeta y
toda la página de detalle `/gallery/<id>`).

- **El catálogo vive SOLO en el backend**: `config/section_display/*.php` (`_common.php` con el grupo
  "Encabezado" + uno por `typesection_key`). El intranet **no** lo repite: arma el editor con
  `display_settings_schema` (`{ groups, fields }`) y los valores de `display_settings` (`{ clave: valor }`,
  ya resuelto), ambos al nivel de la sección (no en `web_settings`).
- **Grupos** en acordeón, en el orden del catálogo, con contador "N de M visibles". Si hay grupos de la
  página de detalle (`page: 'detail'`) aparece el selector **Listado | Detalle**, que también cambia la vista
  previa (Detalle = `/gallery/<id>` del primer trabajo visible).
- **Para agregar un elemento/grupo**: se agrega en el catálogo del backend y se marca en la web con
  `data-el`. En el intranet no hay que tocar nada.
- Al guardar se envía `display_settings` con **solo las claves que cambiaron** (null = volver al valor por
  defecto) en el PATCH de la sección. La vista previa en vivo manda `fields.display_settings` completo en
  la entidad `section` y el botón ⌖ «Ubicar en la vista previa» manda el mensaje `highlight`.
- Archivos: `features/sections/ui/appearance/` — `section-appearance-editor.tsx` (contenedor + guardar),
  `appearance-group.tsx`, `appearance-field.tsx`, `appearance-list-field.tsx`, `appearance-values.ts`
  (funciones puras: resolver, diff, filtros) y `use-appearance-preview.ts` (vista previa).

## Archivos

```
grouped/
├── index.ts                         -> lo único que deben importar los demás
├── special-sections.constants.ts    -> claves + isServiceShowcaseSection / isCategoryCoverflowSection /
│                                       isGroupedImagesSection + isRestorationCompareSection /
│                                       isWorkGallerySection (para la pestaña Trabajos del detalle)
├── grouped-section.config.ts        -> GROUPED_SECTION_CONFIG (textos y reglas por sección) + getGroupItemName
├── coverflow/
│   └── coverflow-links.ts           -> clave 'category-<id>' y enlace '/gallery/<id_web_work>' (funciones puras)
├── lib/
│   ├── use-web-work-list.ts             -> trabajos de la Galería con fotos (tipo local GroupedWebWork)
│   ├── auto-photos.ts                   -> fotos automáticas: regla de la web (funciones puras) +
│   │                                       findWorksOfCategory / visibleWorkImages
│   ├── auto-photos-texts.ts             -> textos, enlace "Ver trabajos" y contador del encabezado
│   ├── use-auto-photos.ts               -> trae los trabajos publicados y calcula las automáticas de cada tarjeta
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
    ├── grouped-photo-card.tsx           -> tarjeta de una foto (checkbox + rol + menú)
    ├── grouped-photo-row.tsx            -> fila única de fotos (una columna por foto, scroll horizontal)
    ├── grouped-add-item.tsx             -> "+ Agregar ..." (input en línea o ir al formulario)
    ├── auto-photos/
    │   ├── use-grouped-auto-photos.tsx  -> bloque + contador de una tarjeta (lo usan Imágenes y Reordenar)
    │   ├── grouped-auto-photos.tsx      -> tarjetas "De un trabajo" + ayuda + botones (o "aún no tiene fotos")
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
│   ├── image-source-tabs.tsx             -> pestañas Banco de imágenes | Foto de un trabajo
│   ├── work-photo-picker.tsx             -> select de trabajo + grilla de fotos (carrusel)
│   ├── work-photo-grid.tsx               -> grilla de fotos de un trabajo (la usa el picker)
│   ├── work-option-label.tsx             -> opción de trabajo en el select (miniatura + título)
│   └── work-photos.ts                    -> funciones puras: fotos de un trabajo (portada + galería)
└── new-section-item/
    ├── new-section-item-dialog.tsx       -> diálogo "+ Nuevo" (categoría)
    └── use-new-section-item-options.ts   -> textos y opciones del diálogo
```

Cosas **generales** que esta carpeta usa (y que NO se deben mover aquí, porque las usa también la
vista normal): `lib/image-roles.ts`, `lib/lightbox-slides.ts`, `lib/use-photo-lightbox.ts`,
`lib/use-reorder-images.ts`, `lib/use-section-type-key.ts`, `ui/list/section-image-lightbox.tsx`,
`ui/list/sectionimage-role-badge.tsx` y los stores de `stores/`.

## ¿Cómo agregar otra sección especial en el futuro?

1. En `special-sections.constants.ts` agrega su clave y su helper `is<Nombre>Section` (sin literales sueltos).
2. Si sus fotos van agrupadas por item, agrega su entrada en `GROUPED_SECTION_CONFIG` (textos y reglas):
   la pestaña Imágenes y Reordenar la usarán solas (`getGroupedSectionConfig`). Con `itemsTab` su
   pestaña de items tiene nombre propio.
3. Fija su tipo de item en `section-items/data/item-types-by-section.ts`.
4. Si su formulario de item o de imagen necesita algo propio, agrega la rama en los archivos de la
   tabla "¿Dónde se usa?", antes de la vista general, y deja sus archivos en una carpeta propia
   (como `showcase/` y `category/` en section-items, o `ui/form/coverflow/` en sectionimages).
5. Si tiene elementos que se pueden ocultar o textos configurables, agrégalos en el catálogo del backend
   (`config/section_display/<typesection_key>.php`); la pestaña "Apariencia" los pinta sola.
6. Si la sección muestra datos que viven en otro módulo (como Restauración y Galería con los trabajos `web_works`),
   no la metas en la vista agrupada: dale su propia pestaña en el detalle de la sección (ver `tabs/works/`) con un flag `tab_*` en `section_web_setting`.
7. Reutiliza lo general (roles, visor, reorder, selector de fotos de trabajo) en vez de copiarlo.
