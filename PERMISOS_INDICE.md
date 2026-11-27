# Índice de permisos del intranet

Para cada permiso (`modulo.accion`), los archivos del intranet donde se usa para mostrar u ocultar algo.
Las keys de los reportes (`report_*.view`) se arman con el slug del reporte, por eso pueden aparecer "sin uso directo".

> Generado automáticamente el 2026-11-27 a partir del código. Si agregas o mueves condiciones,
> este índice puede quedar desactualizado: la búsqueda en el editor (ver ROLES_Y_PERMISOS.md) siempre es la fuente real.
> Para regenerarlo, desde la carpeta del backend: `php scripts/generar_indice_permisos.php . <ruta-intranet> <ruta-movil>`

## General › Dashboard › Resumen general

| Permiso | Dónde se usa |
|---|---|
| `dashboard_summary.view` | [src/features/auth/lib/home-url.ts:20](src/features/auth/lib/home-url.ts#L20)<br>[src/shared/config/sidebar-data.ts:131](src/shared/config/sidebar-data.ts#L131) — menú lateral |

## General › Dashboard › Rendimiento de ventas

| Permiso | Dónde se usa |
|---|---|
| `dashboard_sales.view` | [src/shared/config/sidebar-data.ts:132](src/shared/config/sidebar-data.ts#L132) — menú lateral |

## General › Dashboard › Seguimiento de proformas

| Permiso | Dónde se usa |
|---|---|
| `dashboard_proformas.view` | [src/shared/config/sidebar-data.ts:133](src/shared/config/sidebar-data.ts#L133) — menú lateral |

## General › Dashboard › Mensajes y opiniones

| Permiso | Dónde se usa |
|---|---|
| `dashboard_messages.view` | [src/shared/config/sidebar-data.ts:134](src/shared/config/sidebar-data.ts#L134) — menú lateral |

## General › Dashboard › Accesos del personal

| Permiso | Dónde se usa |
|---|---|
| `dashboard_staff.view` | [src/shared/config/sidebar-data.ts:135](src/shared/config/sidebar-data.ts#L135) — menú lateral |

## Tipos › Catálogo de Tipos › Colores

| Permiso | Dónde se usa |
|---|---|
| `type_colors.view` | [src/features/typecolors/ui/list/typecolors-row-actions.tsx:30](src/features/typecolors/ui/list/typecolors-row-actions.tsx#L30) — `useCan`<br>[src/shared/config/sidebar-data.ts:147](src/shared/config/sidebar-data.ts#L147) — menú lateral |
| `type_colors.create` | [src/app/(intranet)/typecolors/page.tsx:22](src/app/(intranet)/typecolors/page.tsx#L22) — página |
| `type_colors.update` | [src/features/typecolors/ui/detail/typecolor-detail.tsx:20](src/features/typecolors/ui/detail/typecolor-detail.tsx#L20) — `useCan`<br>[src/features/typecolors/ui/list/typecolors-row-actions.tsx:31](src/features/typecolors/ui/list/typecolors-row-actions.tsx#L31) — `useCan` |
| `type_colors.delete` | [src/features/typecolors/ui/list/typecolors-row-actions.tsx:33](src/features/typecolors/ui/list/typecolors-row-actions.tsx#L33) — `useCan`<br>[src/features/typecolors/ui/list/typecolors-table.tsx:38](src/features/typecolors/ui/list/typecolors-table.tsx#L38) — `useCan` |
| `type_colors.state` | [src/features/typecolors/ui/list/typecolors-row-actions.tsx:32](src/features/typecolors/ui/list/typecolors-row-actions.tsx#L32) — `useCan`<br>[src/features/typecolors/ui/list/typecolors-table.tsx:37](src/features/typecolors/ui/list/typecolors-table.tsx#L37) — `useCan` |

## Tipos › Catálogo de Tipos › Documentos

| Permiso | Dónde se usa |
|---|---|
| `type_docs.view` | [src/features/typedocs/ui/list/typedocs-row-actions.tsx:29](src/features/typedocs/ui/list/typedocs-row-actions.tsx#L29) — `useCan`<br>[src/shared/config/sidebar-data.ts:148](src/shared/config/sidebar-data.ts#L148) — menú lateral |
| `type_docs.create` | [src/app/(intranet)/typedocs/page.tsx:22](src/app/(intranet)/typedocs/page.tsx#L22) — página |
| `type_docs.update` | [src/features/typedocs/ui/detail/typedoc-detail.tsx:19](src/features/typedocs/ui/detail/typedoc-detail.tsx#L19) — `useCan`<br>[src/features/typedocs/ui/list/typedocs-row-actions.tsx:30](src/features/typedocs/ui/list/typedocs-row-actions.tsx#L30) — `useCan` |
| `type_docs.delete` | [src/features/typedocs/ui/list/typedocs-row-actions.tsx:32](src/features/typedocs/ui/list/typedocs-row-actions.tsx#L32) — `useCan`<br>[src/features/typedocs/ui/list/typedocs-table.tsx:35](src/features/typedocs/ui/list/typedocs-table.tsx#L35) — `useCan` |
| `type_docs.state` | [src/features/typedocs/ui/list/typedocs-row-actions.tsx:31](src/features/typedocs/ui/list/typedocs-row-actions.tsx#L31) — `useCan`<br>[src/features/typedocs/ui/list/typedocs-table.tsx:34](src/features/typedocs/ui/list/typedocs-table.tsx#L34) — `useCan` |

## Tipos › Catálogo de Tipos › Maderas

| Permiso | Dónde se usa |
|---|---|
| `type_woods.view` | [src/features/typewoods/ui/list/typewoods-row-actions.tsx:29](src/features/typewoods/ui/list/typewoods-row-actions.tsx#L29) — `useCan`<br>[src/shared/config/sidebar-data.ts:150](src/shared/config/sidebar-data.ts#L150) — menú lateral |
| `type_woods.create` | [src/app/(intranet)/typewoods/page.tsx:22](src/app/(intranet)/typewoods/page.tsx#L22) — página<br>[src/features/web-works/ui/form/web-work-form.tsx:399](src/features/web-works/ui/form/web-work-form.tsx#L399) — `<Can>` |
| `type_woods.update` | [src/features/typewoods/ui/detail/typewood-detail.tsx:19](src/features/typewoods/ui/detail/typewood-detail.tsx#L19) — `useCan`<br>[src/features/typewoods/ui/list/typewoods-row-actions.tsx:30](src/features/typewoods/ui/list/typewoods-row-actions.tsx#L30) — `useCan` |
| `type_woods.delete` | [src/features/typewoods/ui/list/typewoods-row-actions.tsx:32](src/features/typewoods/ui/list/typewoods-row-actions.tsx#L32) — `useCan`<br>[src/features/typewoods/ui/list/typewoods-table.tsx:35](src/features/typewoods/ui/list/typewoods-table.tsx#L35) — `useCan` |
| `type_woods.state` | [src/features/typewoods/ui/list/typewoods-row-actions.tsx:31](src/features/typewoods/ui/list/typewoods-row-actions.tsx#L31) — `useCan`<br>[src/features/typewoods/ui/list/typewoods-table.tsx:34](src/features/typewoods/ui/list/typewoods-table.tsx#L34) — `useCan` |

## Tipos › Catálogo de Tipos › Tipografías

| Permiso | Dónde se usa |
|---|---|
| `type_fonts.view` | [src/features/typefonts/ui/list/typefonts-row-actions.tsx:29](src/features/typefonts/ui/list/typefonts-row-actions.tsx#L29) — `useCan`<br>[src/shared/config/sidebar-data.ts:151](src/shared/config/sidebar-data.ts#L151) — menú lateral |
| `type_fonts.create` | [src/app/(intranet)/typefonts/page.tsx:22](src/app/(intranet)/typefonts/page.tsx#L22) — página |
| `type_fonts.update` | [src/features/typefonts/ui/detail/typefont-detail.tsx:21](src/features/typefonts/ui/detail/typefont-detail.tsx#L21) — `useCan`<br>[src/features/typefonts/ui/list/typefonts-row-actions.tsx:30](src/features/typefonts/ui/list/typefonts-row-actions.tsx#L30) — `useCan` |
| `type_fonts.delete` | [src/features/typefonts/ui/list/typefonts-row-actions.tsx:32](src/features/typefonts/ui/list/typefonts-row-actions.tsx#L32) — `useCan`<br>[src/features/typefonts/ui/list/typefonts-table.tsx:35](src/features/typefonts/ui/list/typefonts-table.tsx#L35) — `useCan` |
| `type_fonts.state` | [src/features/typefonts/ui/list/typefonts-row-actions.tsx:31](src/features/typefonts/ui/list/typefonts-row-actions.tsx#L31) — `useCan`<br>[src/features/typefonts/ui/list/typefonts-table.tsx:34](src/features/typefonts/ui/list/typefonts-table.tsx#L34) — `useCan` |

## Sitio Web › Navegaciones

| Permiso | Dónde se usa |
|---|---|
| `navigations.view` | [src/features/navigations/ui/list/navigations-row-actions.tsx:27](src/features/navigations/ui/list/navigations-row-actions.tsx#L27) — `useCan`<br>[src/shared/config/sidebar-data.ts:159](src/shared/config/sidebar-data.ts#L159) — menú lateral |
| `navigations.create` | [src/app/(intranet)/navigations/page.tsx:29](src/app/(intranet)/navigations/page.tsx#L29) — página<br>[src/features/sections/ui/form/section-form.tsx:55](src/features/sections/ui/form/section-form.tsx#L55) — `useCan` |
| `navigations.update` | [src/features/navigations/ui/detail/navigation-detail.tsx:21](src/features/navigations/ui/detail/navigation-detail.tsx#L21) — `useCan`<br>[src/features/navigations/ui/list/navigations-row-actions.tsx:28](src/features/navigations/ui/list/navigations-row-actions.tsx#L28) — `useCan` |
| `navigations.delete` | [src/features/navigations/ui/list/navigations-row-actions.tsx:30](src/features/navigations/ui/list/navigations-row-actions.tsx#L30) — `useCan`<br>[src/features/navigations/ui/list/navigations-table.tsx:100](src/features/navigations/ui/list/navigations-table.tsx#L100) — `useCan` |
| `navigations.state` | [src/features/navigations/ui/list/navigations-row-actions.tsx:29](src/features/navigations/ui/list/navigations-row-actions.tsx#L29) — `useCan`<br>[src/features/navigations/ui/list/navigations-table.tsx:99](src/features/navigations/ui/list/navigations-table.tsx#L99) — `useCan` |
| `navigations.reorder` | [src/app/(intranet)/navigations/page.tsx:23](src/app/(intranet)/navigations/page.tsx#L23) — página<br>[src/features/navigations/ui/reorder/navigations-reorder-list/navigations-reorder-list.tsx:34](src/features/navigations/ui/reorder/navigations-reorder-list/navigations-reorder-list.tsx#L34) — `useCan` |

## Sitio Web › Footer del Sitio

| Permiso | Dónde se usa |
|---|---|
| `footer.view` | [src/shared/config/sidebar-data.ts:160](src/shared/config/sidebar-data.ts#L160) — menú lateral |
| `footer.update` | [src/features/footer/ui/form/footer-visibility-form/footer-visibility-form.tsx:47](src/features/footer/ui/form/footer-visibility-form/footer-visibility-form.tsx#L47) — `useCan` |

## Sitio Web › Alertas del sitio

| Permiso | Dónde se usa |
|---|---|
| `web_alerts.view` | [src/shared/config/sidebar-data.ts:161](src/shared/config/sidebar-data.ts#L161) — menú lateral |
| `web_alerts.create` | [src/features/web-alerts/ui/web-alerts-primary-buttons.tsx:18](src/features/web-alerts/ui/web-alerts-primary-buttons.tsx#L18) — `<Can>` |
| `web_alerts.update` | [src/features/web-alerts/ui/list/web-alerts-row-actions.tsx:25](src/features/web-alerts/ui/list/web-alerts-row-actions.tsx#L25) — `useCan` |
| `web_alerts.delete` | [src/features/web-alerts/ui/list/web-alerts-row-actions.tsx:27](src/features/web-alerts/ui/list/web-alerts-row-actions.tsx#L27) — `useCan`<br>[src/features/web-alerts/ui/list/web-alerts-table.tsx:82](src/features/web-alerts/ui/list/web-alerts-table.tsx#L82) — `useCan` |
| `web_alerts.state` | [src/features/web-alerts/ui/list/web-alerts-columns.tsx:39](src/features/web-alerts/ui/list/web-alerts-columns.tsx#L39) — `useCan`<br>[src/features/web-alerts/ui/list/web-alerts-row-actions.tsx:26](src/features/web-alerts/ui/list/web-alerts-row-actions.tsx#L26) — `useCan`<br>[src/features/web-alerts/ui/list/web-alerts-table.tsx:81](src/features/web-alerts/ui/list/web-alerts-table.tsx#L81) — `useCan` |
| `web_alerts.reorder` | [src/features/web-alerts/ui/reorder/web-alerts-reorder-list.tsx:33](src/features/web-alerts/ui/reorder/web-alerts-reorder-list.tsx#L33) — `useCan`<br>[src/features/web-alerts/ui/web-alerts-primary-buttons.tsx:12](src/features/web-alerts/ui/web-alerts-primary-buttons.tsx#L12) — `<Can>` |

## Sitio Web › Mensajes de Contacto

| Permiso | Dónde se usa |
|---|---|
| `contact_messages.view` | [src/features/contact-messages/ui/list/contact-messages-row-actions.tsx:29](src/features/contact-messages/ui/list/contact-messages-row-actions.tsx#L29) — `useCan`<br>[src/shared/config/sidebar-data.ts:162](src/shared/config/sidebar-data.ts#L162) — menú lateral |
| `contact_messages.state` | [src/features/contact-messages/ui/detail/contact-message-detail.tsx:23](src/features/contact-messages/ui/detail/contact-message-detail.tsx#L23) — `useCan`<br>[src/features/contact-messages/ui/list/contact-messages-row-actions.tsx:30](src/features/contact-messages/ui/list/contact-messages-row-actions.tsx#L30) — `useCan` |
| `contact_messages.delete` | [src/features/contact-messages/ui/detail/contact-message-detail.tsx:24](src/features/contact-messages/ui/detail/contact-message-detail.tsx#L24) — `useCan`<br>[src/features/contact-messages/ui/list/contact-messages-row-actions.tsx:31](src/features/contact-messages/ui/list/contact-messages-row-actions.tsx#L31) — `useCan`<br>[src/features/contact-messages/ui/list/contact-messages-table.tsx:103](src/features/contact-messages/ui/list/contact-messages-table.tsx#L103) — `useCan` |

## Sitio Web › Secciones › Secciones

| Permiso | Dónde se usa |
|---|---|
| `sections.view` | [src/features/sections/ui/list/sections-row-actions.tsx:27](src/features/sections/ui/list/sections-row-actions.tsx#L27) — `useCan`<br>[src/shared/config/sidebar-data.ts:167](src/shared/config/sidebar-data.ts#L167) — menú lateral |
| `sections.create` | [src/app/(intranet)/sections/page.tsx:28](src/app/(intranet)/sections/page.tsx#L28) — página |
| `sections.update` | [src/features/sections/ui/appearance/appearance-editor-body.tsx:39](src/features/sections/ui/appearance/appearance-editor-body.tsx#L39) — `useCan`<br>[src/features/sections/ui/detail/section-detail.tsx:153](src/features/sections/ui/detail/section-detail.tsx#L153) — `<Can>`<br>[src/features/sections/ui/form/section-settings-form/section-settings-form.tsx:37](src/features/sections/ui/form/section-settings-form/section-settings-form.tsx#L37) — `useCan`<br>[src/features/sections/ui/list/sections-row-actions.tsx:28](src/features/sections/ui/list/sections-row-actions.tsx#L28) — `useCan` |
| `sections.delete` | [src/features/sections/ui/list/sections-group-table.tsx:29](src/features/sections/ui/list/sections-group-table.tsx#L29) — `useCan`<br>[src/features/sections/ui/list/sections-row-actions.tsx:30](src/features/sections/ui/list/sections-row-actions.tsx#L30) — `useCan` |
| `sections.state` | [src/features/sections/ui/list/sections-group-table.tsx:28](src/features/sections/ui/list/sections-group-table.tsx#L28) — `useCan`<br>[src/features/sections/ui/list/sections-row-actions.tsx:29](src/features/sections/ui/list/sections-row-actions.tsx#L29) — `useCan` |
| `sections.reorder` | [src/app/(intranet)/sections/page.tsx:23](src/app/(intranet)/sections/page.tsx#L23) — página<br>[src/features/sections/ui/reorder/sections-reorder-list/sections-reorder-list.tsx:19](src/features/sections/ui/reorder/sections-reorder-list/sections-reorder-list.tsx#L19) — `useCan` |

## Sitio Web › Secciones › Imágenes de sección

| Permiso | Dónde se usa |
|---|---|
| `section_images.view` | [src/features/sectionimages/grouped/ui/grouped-photo-card.tsx:57](src/features/sectionimages/grouped/ui/grouped-photo-card.tsx#L57) — `useCan`<br>[src/features/sectionimages/ui/list/sectionimage-card.tsx:60](src/features/sectionimages/ui/list/sectionimage-card.tsx#L60) — `useCan`<br>[src/shared/config/sidebar-data.ts:168](src/shared/config/sidebar-data.ts#L168) — menú lateral |
| `section_images.create` | [src/app/(intranet)/section-images/page.tsx:22](src/app/(intranet)/section-images/page.tsx#L22) — página<br>[src/features/sectionimages/grouped/ui/auto-photos/use-grouped-auto-photos.tsx:46](src/features/sectionimages/grouped/ui/auto-photos/use-grouped-auto-photos.tsx#L46) — `useCan`<br>[src/features/sectionimages/ui/list/sectionimages-table.tsx:61](src/features/sectionimages/ui/list/sectionimages-table.tsx#L61) — `useCan`<br>[src/features/sections/ui/detail/tabs/images/section-detail-images-tab.tsx:28](src/features/sections/ui/detail/tabs/images/section-detail-images-tab.tsx#L28) — `useCan` |
| `section_images.update` | [src/features/sectionimages/grouped/ui/grouped-photo-card.tsx:58](src/features/sectionimages/grouped/ui/grouped-photo-card.tsx#L58) — `useCan`<br>[src/features/sectionimages/ui/detail/sectionimage-detail.tsx:74](src/features/sectionimages/ui/detail/sectionimage-detail.tsx#L74) — `<Can>`<br>[src/features/sectionimages/ui/list/sectionimage-card.tsx:61](src/features/sectionimages/ui/list/sectionimage-card.tsx#L61) — `useCan` |
| `section_images.delete` | [src/features/sectionimages/grouped/ui/grouped-images-manager.tsx:66](src/features/sectionimages/grouped/ui/grouped-images-manager.tsx#L66) — `useCan`<br>[src/features/sectionimages/grouped/ui/grouped-item-header.tsx:66](src/features/sectionimages/grouped/ui/grouped-item-header.tsx#L66) — `useCan`<br>[src/features/sectionimages/grouped/ui/grouped-photo-card.tsx:60](src/features/sectionimages/grouped/ui/grouped-photo-card.tsx#L60) — `useCan`<br>[src/features/sectionimages/ui/list/sectionimage-card.tsx:63](src/features/sectionimages/ui/list/sectionimage-card.tsx#L63) — `useCan`<br>[src/features/sectionimages/ui/list/sectionimages-table.tsx:63](src/features/sectionimages/ui/list/sectionimages-table.tsx#L63) — `useCan` |
| `section_images.state` | [src/features/sectionimages/grouped/ui/grouped-images-manager.tsx:65](src/features/sectionimages/grouped/ui/grouped-images-manager.tsx#L65) — `useCan`<br>[src/features/sectionimages/grouped/ui/grouped-item-header.tsx:66](src/features/sectionimages/grouped/ui/grouped-item-header.tsx#L66) — `useCan`<br>[src/features/sectionimages/grouped/ui/grouped-photo-card.tsx:59](src/features/sectionimages/grouped/ui/grouped-photo-card.tsx#L59) — `useCan`<br>[src/features/sectionimages/ui/list/sectionimage-card.tsx:62](src/features/sectionimages/ui/list/sectionimage-card.tsx#L62) — `useCan`<br>[src/features/sectionimages/ui/list/sectionimages-table.tsx:62](src/features/sectionimages/ui/list/sectionimages-table.tsx#L62) — `useCan` |
| `section_images.reorder` | [src/features/sectionimages/grouped/ui/reorder/grouped-reorder-board.tsx:63](src/features/sectionimages/grouped/ui/reorder/grouped-reorder-board.tsx#L63) — `useCan`<br>[src/features/sectionimages/ui/list/sectionimages-table.tsx:64](src/features/sectionimages/ui/list/sectionimages-table.tsx#L64) — `useCan`<br>[src/features/sectionimages/ui/reorder/section-images-reorder-default.tsx:37](src/features/sectionimages/ui/reorder/section-images-reorder-default.tsx#L37) — `useCan`<br>[src/features/sections/ui/detail/tabs/images/section-detail-images-tab.tsx:29](src/features/sections/ui/detail/tabs/images/section-detail-images-tab.tsx#L29) — `useCan` |

## Sitio Web › Secciones › Botones de sección

| Permiso | Dónde se usa |
|---|---|
| `section_buttons.view` | [src/features/section-buttons/ui/list/section-buttons-row-actions.tsx:33](src/features/section-buttons/ui/list/section-buttons-row-actions.tsx#L33) — `useCan`<br>[src/shared/config/sidebar-data.ts:169](src/shared/config/sidebar-data.ts#L169) — menú lateral |
| `section_buttons.create` | [src/app/(intranet)/section-buttons/page.tsx:28](src/app/(intranet)/section-buttons/page.tsx#L28) — página<br>[src/features/sections/ui/detail/tabs/buttons/section-detail-buttons-tab.tsx:28](src/features/sections/ui/detail/tabs/buttons/section-detail-buttons-tab.tsx#L28) — `useCan` |
| `section_buttons.update` | [src/features/section-buttons/ui/detail/section-button-detail.tsx:67](src/features/section-buttons/ui/detail/section-button-detail.tsx#L67) — `<Can>`<br>[src/features/section-buttons/ui/list/section-buttons-row-actions.tsx:34](src/features/section-buttons/ui/list/section-buttons-row-actions.tsx#L34) — `useCan` |
| `section_buttons.delete` | [src/features/section-buttons/ui/list/section-buttons-row-actions.tsx:36](src/features/section-buttons/ui/list/section-buttons-row-actions.tsx#L36) — `useCan`<br>[src/features/section-buttons/ui/list/section-buttons-table.tsx:55](src/features/section-buttons/ui/list/section-buttons-table.tsx#L55) — `useCan` |
| `section_buttons.state` | [src/features/section-buttons/ui/list/section-buttons-row-actions.tsx:35](src/features/section-buttons/ui/list/section-buttons-row-actions.tsx#L35) — `useCan`<br>[src/features/section-buttons/ui/list/section-buttons-table.tsx:54](src/features/section-buttons/ui/list/section-buttons-table.tsx#L54) — `useCan` |
| `section_buttons.reorder` | [src/app/(intranet)/section-buttons/page.tsx:23](src/app/(intranet)/section-buttons/page.tsx#L23) — página<br>[src/features/section-buttons/ui/reorder/section-buttons-reorder-list/section-buttons-reorder-list.tsx:40](src/features/section-buttons/ui/reorder/section-buttons-reorder-list/section-buttons-reorder-list.tsx#L40) — `useCan`<br>[src/features/sections/ui/detail/tabs/buttons/section-detail-buttons-tab.tsx:29](src/features/sections/ui/detail/tabs/buttons/section-detail-buttons-tab.tsx#L29) — `useCan` |

## Sitio Web › Secciones › Items de sección

| Permiso | Dónde se usa |
|---|---|
| `section_items.view` | [src/features/section-item-details/ui/list/section-item-details-row-actions.tsx:27](src/features/section-item-details/ui/list/section-item-details-row-actions.tsx#L27) — `useCan`<br>[src/features/section-items/ui/detail/tabs/details/section-item-detail-details-tab.tsx:34](src/features/section-items/ui/detail/tabs/details/section-item-detail-details-tab.tsx#L34) — `useCan`<br>[src/features/section-items/ui/list/section-items-row-actions.tsx:33](src/features/section-items/ui/list/section-items-row-actions.tsx#L33) — `useCan`<br>[src/shared/config/route-permissions.ts:39](src/shared/config/route-permissions.ts#L39) — guard de rutas<br>[src/shared/config/sidebar-data.ts:170](src/shared/config/sidebar-data.ts#L170) — menú lateral |
| `section_items.create` | [src/app/(intranet)/section-item-details/page.tsx:28](src/app/(intranet)/section-item-details/page.tsx#L28) — página<br>[src/app/(intranet)/section-items/page.tsx:28](src/app/(intranet)/section-items/page.tsx#L28) — página<br>[src/features/section-items/ui/detail/tabs/details/section-item-detail-details-tab.tsx:36](src/features/section-items/ui/detail/tabs/details/section-item-detail-details-tab.tsx#L36) — `useCan`<br>[src/features/sectionimages/grouped/ui/grouped-images-manager.tsx:67](src/features/sectionimages/grouped/ui/grouped-images-manager.tsx#L67) — `useCan`<br>[src/features/sectionimages/ui/form/sectionimage-form.tsx:126](src/features/sectionimages/ui/form/sectionimage-form.tsx#L126) — `useCan`<br>[src/features/sections/ui/detail/tabs/items/section-detail-items-tab.tsx:34](src/features/sections/ui/detail/tabs/items/section-detail-items-tab.tsx#L34) — `useCan` |
| `section_items.update` | [src/features/section-item-details/ui/detail/section-item-detail-detail.tsx:64](src/features/section-item-details/ui/detail/section-item-detail-detail.tsx#L64) — `<Can>`<br>[src/features/section-item-details/ui/list/section-item-details-row-actions.tsx:28](src/features/section-item-details/ui/list/section-item-details-row-actions.tsx#L28) — `useCan`<br>[src/features/section-items/ui/detail/section-item-detail.tsx:127](src/features/section-items/ui/detail/section-item-detail.tsx#L127) — `<Can>`<br>[src/features/section-items/ui/detail/tabs/details/section-item-detail-details-tab.tsx:35](src/features/section-items/ui/detail/tabs/details/section-item-detail-details-tab.tsx#L35) — `useCan`<br>[src/features/section-items/ui/form/section-item-settings-form/section-item-settings-form.tsx:37](src/features/section-items/ui/form/section-item-settings-form/section-item-settings-form.tsx#L37) — `useCan`<br>[src/features/section-items/ui/list/section-items-row-actions.tsx:34](src/features/section-items/ui/list/section-items-row-actions.tsx#L34) — `useCan`<br>[src/features/sectionimages/grouped/ui/grouped-item-header.tsx:62](src/features/sectionimages/grouped/ui/grouped-item-header.tsx#L62) — `useCan` |
| `section_items.delete` | [src/features/section-item-details/ui/list/section-item-details-row-actions.tsx:30](src/features/section-item-details/ui/list/section-item-details-row-actions.tsx#L30) — `useCan`<br>[src/features/section-item-details/ui/list/section-item-details-table.tsx:41](src/features/section-item-details/ui/list/section-item-details-table.tsx#L41) — `useCan`<br>[src/features/section-items/ui/list/section-items-row-actions.tsx:36](src/features/section-items/ui/list/section-items-row-actions.tsx#L36) — `useCan`<br>[src/features/section-items/ui/list/section-items-table.tsx:49](src/features/section-items/ui/list/section-items-table.tsx#L49) — `useCan`<br>[src/features/sectionimages/grouped/ui/grouped-item-header.tsx:64](src/features/sectionimages/grouped/ui/grouped-item-header.tsx#L64) — `useCan` |
| `section_items.state` | [src/features/section-item-details/ui/list/section-item-details-row-actions.tsx:29](src/features/section-item-details/ui/list/section-item-details-row-actions.tsx#L29) — `useCan`<br>[src/features/section-item-details/ui/list/section-item-details-table.tsx:40](src/features/section-item-details/ui/list/section-item-details-table.tsx#L40) — `useCan`<br>[src/features/section-items/ui/list/section-items-row-actions.tsx:35](src/features/section-items/ui/list/section-items-row-actions.tsx#L35) — `useCan`<br>[src/features/section-items/ui/list/section-items-table.tsx:48](src/features/section-items/ui/list/section-items-table.tsx#L48) — `useCan`<br>[src/features/sectionimages/grouped/ui/grouped-item-header.tsx:63](src/features/sectionimages/grouped/ui/grouped-item-header.tsx#L63) — `useCan` |
| `section_items.reorder` | [src/app/(intranet)/section-item-details/page.tsx:23](src/app/(intranet)/section-item-details/page.tsx#L23) — página<br>[src/app/(intranet)/section-items/page.tsx:23](src/app/(intranet)/section-items/page.tsx#L23) — página<br>[src/features/section-item-details/ui/reorder/section-item-details-reorder-list/section-item-details-reorder-list.tsx:40](src/features/section-item-details/ui/reorder/section-item-details-reorder-list/section-item-details-reorder-list.tsx#L40) — `useCan`<br>[src/features/section-items/ui/detail/tabs/details/section-item-detail-details-tab.tsx:37](src/features/section-items/ui/detail/tabs/details/section-item-detail-details-tab.tsx#L37) — `useCan`<br>[src/features/section-items/ui/reorder/section-items-reorder-list/section-items-reorder-list.tsx:39](src/features/section-items/ui/reorder/section-items-reorder-list/section-items-reorder-list.tsx#L39) — `useCan`<br>[src/features/sections/ui/detail/tabs/items/section-detail-items-tab.tsx:35](src/features/sections/ui/detail/tabs/items/section-detail-items-tab.tsx#L35) — `useCan` |

## Sitio Web › Secciones › Testimonios

| Permiso | Dónde se usa |
|---|---|
| `testimonies.view` | [src/features/testimony-web/ui/list/testimony-row-actions.tsx:32](src/features/testimony-web/ui/list/testimony-row-actions.tsx#L32) — `useCan`<br>[src/shared/config/sidebar-data.ts:171](src/shared/config/sidebar-data.ts#L171) — menú lateral |
| `testimonies.create` | [src/app/(intranet)/testimony/page.tsx:32](src/app/(intranet)/testimony/page.tsx#L32) — página<br>[src/features/sections/ui/detail/tabs/testimonies/section-detail-testimonies-tab.tsx:42](src/features/sections/ui/detail/tabs/testimonies/section-detail-testimonies-tab.tsx#L42) — `<Can>` |
| `testimonies.update` | [src/features/testimony-web/ui/detail/testimony-detail.tsx:26](src/features/testimony-web/ui/detail/testimony-detail.tsx#L26) — `useCan`<br>[src/features/testimony-web/ui/form/testimony-web-setting-form/testimony-web-setting-form.tsx:45](src/features/testimony-web/ui/form/testimony-web-setting-form/testimony-web-setting-form.tsx#L45) — `useCan`<br>[src/features/testimony-web/ui/list/testimony-row-actions.tsx:33](src/features/testimony-web/ui/list/testimony-row-actions.tsx#L33) — `useCan` |
| `testimonies.delete` | [src/features/testimony-web/ui/list/testimony-row-actions.tsx:35](src/features/testimony-web/ui/list/testimony-row-actions.tsx#L35) — `useCan`<br>[src/features/testimony-web/ui/list/testimony-table.tsx:42](src/features/testimony-web/ui/list/testimony-table.tsx#L42) — `useCan` |
| `testimonies.state` | [src/features/testimony-web/ui/list/testimony-row-actions.tsx:34](src/features/testimony-web/ui/list/testimony-row-actions.tsx#L34) — `useCan`<br>[src/features/testimony-web/ui/list/testimony-table.tsx:41](src/features/testimony-web/ui/list/testimony-table.tsx#L41) — `useCan` |
| `testimonies.reorder` | [src/app/(intranet)/testimony/page.tsx:26](src/app/(intranet)/testimony/page.tsx#L26) — página<br>[src/features/sections/ui/detail/tabs/testimonies/section-detail-testimonies-tab.tsx:37](src/features/sections/ui/detail/tabs/testimonies/section-detail-testimonies-tab.tsx#L37) — `<Can>`<br>[src/features/testimony-web/ui/reorder/testimony-reorder-list/testimony-reorder-list.tsx:42](src/features/testimony-web/ui/reorder/testimony-reorder-list/testimony-reorder-list.tsx#L42) — `useCan` |

## Sitio Web › Secciones › Tipos de sección

| Permiso | Dónde se usa |
|---|---|
| `type_sections.view` | [src/features/typesections/ui/list/typesections-row-actions.tsx:29](src/features/typesections/ui/list/typesections-row-actions.tsx#L29) — `useCan`<br>[src/shared/config/sidebar-data.ts:172](src/shared/config/sidebar-data.ts#L172) — menú lateral |
| `type_sections.create` | [src/app/(intranet)/typesections/page.tsx:22](src/app/(intranet)/typesections/page.tsx#L22) — página<br>[src/features/sections/ui/form/section-form.tsx:54](src/features/sections/ui/form/section-form.tsx#L54) — `useCan` |
| `type_sections.update` | [src/features/typesections/ui/detail/typesection-detail.tsx:20](src/features/typesections/ui/detail/typesection-detail.tsx#L20) — `useCan`<br>[src/features/typesections/ui/list/typesections-row-actions.tsx:30](src/features/typesections/ui/list/typesections-row-actions.tsx#L30) — `useCan` |
| `type_sections.delete` | [src/features/typesections/ui/list/typesections-row-actions.tsx:32](src/features/typesections/ui/list/typesections-row-actions.tsx#L32) — `useCan`<br>[src/features/typesections/ui/list/typesections-table.tsx:35](src/features/typesections/ui/list/typesections-table.tsx#L35) — `useCan` |
| `type_sections.state` | [src/features/typesections/ui/list/typesections-row-actions.tsx:31](src/features/typesections/ui/list/typesections-row-actions.tsx#L31) — `useCan`<br>[src/features/typesections/ui/list/typesections-table.tsx:34](src/features/typesections/ui/list/typesections-table.tsx#L34) — `useCan` |

## Sitio Web › ChatBot › Configuración

| Permiso | Dónde se usa |
|---|---|
| `chatbot_settings.view` | [src/shared/config/sidebar-data.ts:181](src/shared/config/sidebar-data.ts#L181) — menú lateral |
| `chatbot_settings.update` | [src/features/chatbot-settings/ui/chatbot-settings-form/chatbot-settings-form.tsx:80](src/features/chatbot-settings/ui/chatbot-settings-form/chatbot-settings-form.tsx#L80) — `useCan` |

## Sitio Web › ChatBot › Opciones de inicio

| Permiso | Dónde se usa |
|---|---|
| `chatbot_options.view` | [src/shared/config/sidebar-data.ts:182](src/shared/config/sidebar-data.ts#L182) — menú lateral |
| `chatbot_options.create` | [src/features/chatbot-options/ui/chatbot-options-primary-buttons.tsx:16](src/features/chatbot-options/ui/chatbot-options-primary-buttons.tsx#L16) — `<Can>` |
| `chatbot_options.update` | [src/features/chatbot-options/ui/list/chatbot-options-row-actions.tsx:23](src/features/chatbot-options/ui/list/chatbot-options-row-actions.tsx#L23) — `useCan` |
| `chatbot_options.delete` | [src/features/chatbot-options/ui/list/chatbot-options-row-actions.tsx:25](src/features/chatbot-options/ui/list/chatbot-options-row-actions.tsx#L25) — `useCan`<br>[src/features/chatbot-options/ui/list/chatbot-options-table.tsx:77](src/features/chatbot-options/ui/list/chatbot-options-table.tsx#L77) — `useCan` |
| `chatbot_options.state` | [src/features/chatbot-options/ui/list/chatbot-options-columns.tsx:19](src/features/chatbot-options/ui/list/chatbot-options-columns.tsx#L19) — `useCan`<br>[src/features/chatbot-options/ui/list/chatbot-options-row-actions.tsx:24](src/features/chatbot-options/ui/list/chatbot-options-row-actions.tsx#L24) — `useCan`<br>[src/features/chatbot-options/ui/list/chatbot-options-table.tsx:76](src/features/chatbot-options/ui/list/chatbot-options-table.tsx#L76) — `useCan` |
| `chatbot_options.reorder` | [src/features/chatbot-options/ui/chatbot-options-primary-buttons.tsx:10](src/features/chatbot-options/ui/chatbot-options-primary-buttons.tsx#L10) — `<Can>`<br>[src/features/chatbot-options/ui/reorder/chatbot-options-reorder-list.tsx:33](src/features/chatbot-options/ui/reorder/chatbot-options-reorder-list.tsx#L33) — `useCan` |

## Sitio Web › ChatBot › Conversaciones

| Permiso | Dónde se usa |
|---|---|
| `chatbot_conversations.view` | [src/features/chatbot-conversations/ui/list/chatbot-conversations-row-actions.tsx:33](src/features/chatbot-conversations/ui/list/chatbot-conversations-row-actions.tsx#L33) — `useCan`<br>[src/shared/config/sidebar-data.ts:183](src/shared/config/sidebar-data.ts#L183) — menú lateral |
| `chatbot_conversations.state` | [src/features/chatbot-conversations/ui/detail/chatbot-conversation-detail.tsx:30](src/features/chatbot-conversations/ui/detail/chatbot-conversation-detail.tsx#L30) — `useCan`<br>[src/features/chatbot-conversations/ui/list/chatbot-conversations-row-actions.tsx:35](src/features/chatbot-conversations/ui/list/chatbot-conversations-row-actions.tsx#L35) — `useCan`<br>[src/features/chatbot-conversations/ui/list/chatbot-conversations-table.tsx:97](src/features/chatbot-conversations/ui/list/chatbot-conversations-table.tsx#L97) — `useCan` |
| `chatbot_conversations.delete` | [src/features/chatbot-conversations/ui/detail/chatbot-conversation-detail.tsx:31](src/features/chatbot-conversations/ui/detail/chatbot-conversation-detail.tsx#L31) — `useCan`<br>[src/features/chatbot-conversations/ui/list/chatbot-conversations-row-actions.tsx:36](src/features/chatbot-conversations/ui/list/chatbot-conversations-row-actions.tsx#L36) — `useCan`<br>[src/features/chatbot-conversations/ui/list/chatbot-conversations-table.tsx:98](src/features/chatbot-conversations/ui/list/chatbot-conversations-table.tsx#L98) — `useCan` |

## Sitio Web › ChatBot › Visitantes

| Permiso | Dónde se usa |
|---|---|
| `chatbot_visitors.view` | [src/features/chatbot-conversations/ui/detail/chatbot-conversation-detail.tsx:32](src/features/chatbot-conversations/ui/detail/chatbot-conversation-detail.tsx#L32) — `useCan`<br>[src/features/chatbot-conversations/ui/list/chatbot-conversations-row-actions.tsx:34](src/features/chatbot-conversations/ui/list/chatbot-conversations-row-actions.tsx#L34) — `useCan`<br>[src/features/chatbot-visitors/ui/list/chatbot-visitors-row-actions.tsx:24](src/features/chatbot-visitors/ui/list/chatbot-visitors-row-actions.tsx#L24) — `useCan`<br>[src/shared/config/sidebar-data.ts:184](src/shared/config/sidebar-data.ts#L184) — menú lateral |
| `chatbot_visitors.delete` | [src/features/chatbot-visitors/ui/detail/chatbot-visitor-detail.tsx:27](src/features/chatbot-visitors/ui/detail/chatbot-visitor-detail.tsx#L27) — `useCan`<br>[src/features/chatbot-visitors/ui/list/chatbot-visitors-row-actions.tsx:25](src/features/chatbot-visitors/ui/list/chatbot-visitors-row-actions.tsx#L25) — `useCan`<br>[src/features/chatbot-visitors/ui/list/chatbot-visitors-table.tsx:65](src/features/chatbot-visitors/ui/list/chatbot-visitors-table.tsx#L65) — `useCan` |

## Sitio Web › Galería › Trabajos

| Permiso | Dónde se usa |
|---|---|
| `web_works.view` | [src/features/sections/ui/detail/tabs/works/section-works-manager.tsx:41](src/features/sections/ui/detail/tabs/works/section-works-manager.tsx#L41) — `useCan`<br>[src/features/web-works/ui/list/web-works-row-actions.tsx:26](src/features/web-works/ui/list/web-works-row-actions.tsx#L26) — `useCan`<br>[src/shared/config/sidebar-data.ts:191](src/shared/config/sidebar-data.ts#L191) — menú lateral |
| `web_works.create` | [src/features/furnitures/ui/furniture-web-works-card.tsx:75](src/features/furnitures/ui/furniture-web-works-card.tsx#L75) — `<Can>`<br>[src/features/sections/ui/detail/tabs/works/section-works-manager.tsx:42](src/features/sections/ui/detail/tabs/works/section-works-manager.tsx#L42) — `useCan`<br>[src/features/web-works/ui/web-works-primary-buttons.tsx:17](src/features/web-works/ui/web-works-primary-buttons.tsx#L17) — `<Can>` |
| `web_works.update` | [src/features/sections/ui/detail/tabs/works/section-works-manager.tsx:43](src/features/sections/ui/detail/tabs/works/section-works-manager.tsx#L43) — `useCan`<br>[src/features/web-works/ui/detail/web-work-detail.tsx:26](src/features/web-works/ui/detail/web-work-detail.tsx#L26) — `useCan`<br>[src/features/web-works/ui/list/web-works-row-actions.tsx:27](src/features/web-works/ui/list/web-works-row-actions.tsx#L27) — `useCan` |
| `web_works.delete` | [src/features/sections/ui/detail/tabs/works/section-works-manager.tsx:45](src/features/sections/ui/detail/tabs/works/section-works-manager.tsx#L45) — `useCan`<br>[src/features/web-works/ui/list/web-works-row-actions.tsx:29](src/features/web-works/ui/list/web-works-row-actions.tsx#L29) — `useCan`<br>[src/features/web-works/ui/list/web-works-table.tsx:112](src/features/web-works/ui/list/web-works-table.tsx#L112) — `useCan` |
| `web_works.state` | [src/features/sections/ui/detail/tabs/works/section-works-manager.tsx:44](src/features/sections/ui/detail/tabs/works/section-works-manager.tsx#L44) — `useCan`<br>[src/features/web-works/ui/list/web-works-row-actions.tsx:28](src/features/web-works/ui/list/web-works-row-actions.tsx#L28) — `useCan`<br>[src/features/web-works/ui/list/web-works-table.tsx:111](src/features/web-works/ui/list/web-works-table.tsx#L111) — `useCan` |
| `web_works.reorder` | [src/features/sections/ui/detail/tabs/works/section-works-manager.tsx:46](src/features/sections/ui/detail/tabs/works/section-works-manager.tsx#L46) — `useCan`<br>[src/features/web-works/ui/reorder/web-works-reorder-list/web-works-reorder-list.tsx:35](src/features/web-works/ui/reorder/web-works-reorder-list/web-works-reorder-list.tsx#L35) — `useCan`<br>[src/features/web-works/ui/web-works-primary-buttons.tsx:11](src/features/web-works/ui/web-works-primary-buttons.tsx#L11) — `<Can>` |

## Sitio Web › Galería › Tipos de trabajo

| Permiso | Dónde se usa |
|---|---|
| `type_works.view` | [src/features/typeworks/ui/list/typeworks-row-actions.tsx:29](src/features/typeworks/ui/list/typeworks-row-actions.tsx#L29) — `useCan`<br>[src/shared/config/sidebar-data.ts:192](src/shared/config/sidebar-data.ts#L192) — menú lateral |
| `type_works.create` | [src/app/(intranet)/typeworks/page.tsx:22](src/app/(intranet)/typeworks/page.tsx#L22) — página |
| `type_works.update` | [src/features/typeworks/ui/detail/typework-detail.tsx:20](src/features/typeworks/ui/detail/typework-detail.tsx#L20) — `useCan`<br>[src/features/typeworks/ui/list/typeworks-row-actions.tsx:30](src/features/typeworks/ui/list/typeworks-row-actions.tsx#L30) — `useCan` |
| `type_works.delete` | [src/features/typeworks/ui/list/typeworks-row-actions.tsx:32](src/features/typeworks/ui/list/typeworks-row-actions.tsx#L32) — `useCan`<br>[src/features/typeworks/ui/list/typeworks-table.tsx:35](src/features/typeworks/ui/list/typeworks-table.tsx#L35) — `useCan` |
| `type_works.state` | [src/features/typeworks/ui/list/typeworks-row-actions.tsx:31](src/features/typeworks/ui/list/typeworks-row-actions.tsx#L31) — `useCan`<br>[src/features/typeworks/ui/list/typeworks-table.tsx:34](src/features/typeworks/ui/list/typeworks-table.tsx#L34) — `useCan` |

## Gestión Documentaria › Comercial › Clientes

| Permiso | Dónde se usa |
|---|---|
| `clients.view` | [src/features/auth/model/verify.dto.ts:16](src/features/auth/model/verify.dto.ts#L16)<br>[src/features/auth/model/verify.dto.ts:71](src/features/auth/model/verify.dto.ts#L71)<br>[src/features/clients/ui/list/clients-row-actions.tsx:26](src/features/clients/ui/list/clients-row-actions.tsx#L26) — `useCan`<br>[src/shared/config/nav-types.ts:13](src/shared/config/nav-types.ts#L13)<br>[src/shared/config/sidebar-data.ts:97](src/shared/config/sidebar-data.ts#L97) — menú lateral<br>[src/shared/config/sidebar-data.ts:204](src/shared/config/sidebar-data.ts#L204) — menú lateral |
| `clients.create` | [src/app/(intranet)/clients/page.tsx:22](src/app/(intranet)/clients/page.tsx#L22) — página<br>[src/features/auth/hooks/usePermission.ts:15](src/features/auth/hooks/usePermission.ts#L15) — `useCan`<br>[src/features/auth/model/verify.dto.ts:71](src/features/auth/model/verify.dto.ts#L71)<br>[src/features/auth/ui/can.tsx:17](src/features/auth/ui/can.tsx#L17) — `<Can>`<br>[src/features/clients/ui/client-picker-modal.tsx:34](src/features/clients/ui/client-picker-modal.tsx#L34) — `useCan`<br>[src/features/sales/ui/pos/client-field.tsx:55](src/features/sales/ui/pos/client-field.tsx#L55) — `useCan` |
| `clients.update` | [src/features/auth/hooks/usePermission.ts:19](src/features/auth/hooks/usePermission.ts#L19) — `useCan`<br>[src/features/clients/ui/detail/client-detail.tsx:51](src/features/clients/ui/detail/client-detail.tsx#L51) — `<Can>`<br>[src/features/clients/ui/list/clients-row-actions.tsx:27](src/features/clients/ui/list/clients-row-actions.tsx#L27) — `useCan` |
| `clients.delete` | [src/features/clients/ui/list/clients-row-actions.tsx:29](src/features/clients/ui/list/clients-row-actions.tsx#L29) — `useCan`<br>[src/features/clients/ui/list/clients-table.tsx:35](src/features/clients/ui/list/clients-table.tsx#L35) — `useCan` |
| `clients.state` | [src/features/auth/hooks/usePermission.ts:19](src/features/auth/hooks/usePermission.ts#L19) — `useCan`<br>[src/features/clients/ui/list/clients-row-actions.tsx:28](src/features/clients/ui/list/clients-row-actions.tsx#L28) — `useCan`<br>[src/features/clients/ui/list/clients-table.tsx:34](src/features/clients/ui/list/clients-table.tsx#L34) — `useCan` |

## Gestión Documentaria › Comercial › Productos y Servicios

| Permiso | Dónde se usa |
|---|---|
| `products_services.view` | [src/features/products-services/ui/list/products-services-row-actions.tsx:26](src/features/products-services/ui/list/products-services-row-actions.tsx#L26) — `useCan`<br>[src/shared/config/sidebar-data.ts:205](src/shared/config/sidebar-data.ts#L205) — menú lateral |
| `products_services.create` | [src/app/(intranet)/products-services/page.tsx:22](src/app/(intranet)/products-services/page.tsx#L22) — página<br>[src/features/products-services/ui/product-service-picker-modal.tsx:68](src/features/products-services/ui/product-service-picker-modal.tsx#L68) — `useCan` |
| `products_services.update` | [src/features/products-services/ui/detail/product-service-detail.tsx:96](src/features/products-services/ui/detail/product-service-detail.tsx#L96) — `<Can>`<br>[src/features/products-services/ui/list/products-services-row-actions.tsx:27](src/features/products-services/ui/list/products-services-row-actions.tsx#L27) — `useCan` |
| `products_services.delete` | [src/features/products-services/ui/list/products-services-row-actions.tsx:29](src/features/products-services/ui/list/products-services-row-actions.tsx#L29) — `useCan`<br>[src/features/products-services/ui/list/products-services-table.tsx:35](src/features/products-services/ui/list/products-services-table.tsx#L35) — `useCan` |
| `products_services.state` | [src/features/products-services/ui/list/products-services-row-actions.tsx:28](src/features/products-services/ui/list/products-services-row-actions.tsx#L28) — `useCan`<br>[src/features/products-services/ui/list/products-services-table.tsx:34](src/features/products-services/ui/list/products-services-table.tsx#L34) — `useCan` |

## Gestión Documentaria › Comercial › Muebles

| Permiso | Dónde se usa |
|---|---|
| `furnitures.view` | [src/features/furnitures/ui/list/furniture-card.tsx:44](src/features/furnitures/ui/list/furniture-card.tsx#L44) — `useCan`<br>[src/features/furnitures/ui/list/furnitures-row-actions.tsx:26](src/features/furnitures/ui/list/furnitures-row-actions.tsx#L26) — `useCan`<br>[src/features/furnitures_images/ui/list/furniture-image-card.tsx:41](src/features/furnitures_images/ui/list/furniture-image-card.tsx#L41) — `useCan`<br>[src/shared/config/route-permissions.ts:38](src/shared/config/route-permissions.ts#L38) — guard de rutas<br>[src/shared/config/sidebar-data.ts:206](src/shared/config/sidebar-data.ts#L206) — menú lateral |
| `furnitures.create` | [src/app/(intranet)/furnitures/page.tsx:22](src/app/(intranet)/furnitures/page.tsx#L22) — página<br>[src/features/furnitures_images/ui/list/furniture-images-primary-buttons.tsx:12](src/features/furnitures_images/ui/list/furniture-images-primary-buttons.tsx#L12) — `useCan` |
| `furnitures.update` | [src/features/furnitures/ui/detail/furniture-detail.tsx:130](src/features/furnitures/ui/detail/furniture-detail.tsx#L130) — `<Can>`<br>[src/features/furnitures/ui/list/furniture-card.tsx:45](src/features/furnitures/ui/list/furniture-card.tsx#L45) — `useCan`<br>[src/features/furnitures/ui/list/furnitures-row-actions.tsx:27](src/features/furnitures/ui/list/furnitures-row-actions.tsx#L27) — `useCan`<br>[src/features/furnitures_images/ui/list/furniture-image-card.tsx:42](src/features/furnitures_images/ui/list/furniture-image-card.tsx#L42) — `useCan` |
| `furnitures.delete` | [src/features/furnitures/ui/list/furniture-card.tsx:47](src/features/furnitures/ui/list/furniture-card.tsx#L47) — `useCan`<br>[src/features/furnitures/ui/list/furnitures-row-actions.tsx:29](src/features/furnitures/ui/list/furnitures-row-actions.tsx#L29) — `useCan`<br>[src/features/furnitures/ui/list/furnitures-table.tsx:35](src/features/furnitures/ui/list/furnitures-table.tsx#L35) — `useCan`<br>[src/features/furnitures_images/ui/list/furniture-image-card.tsx:44](src/features/furnitures_images/ui/list/furniture-image-card.tsx#L44) — `useCan`<br>[src/features/furnitures_images/ui/list/furniture-images-grid.tsx:35](src/features/furnitures_images/ui/list/furniture-images-grid.tsx#L35) — `useCan` |
| `furnitures.state` | [src/features/furnitures/ui/list/furniture-card.tsx:46](src/features/furnitures/ui/list/furniture-card.tsx#L46) — `useCan`<br>[src/features/furnitures/ui/list/furnitures-row-actions.tsx:28](src/features/furnitures/ui/list/furnitures-row-actions.tsx#L28) — `useCan`<br>[src/features/furnitures/ui/list/furnitures-table.tsx:34](src/features/furnitures/ui/list/furnitures-table.tsx#L34) — `useCan`<br>[src/features/furnitures_images/ui/list/furniture-image-card.tsx:43](src/features/furnitures_images/ui/list/furniture-image-card.tsx#L43) — `useCan`<br>[src/features/furnitures_images/ui/list/furniture-images-grid.tsx:34](src/features/furnitures_images/ui/list/furniture-images-grid.tsx#L34) — `useCan` |
| `furnitures.reorder` | _(sin uso directo en el código)_ |

## Gestión Documentaria › Comercial › Categorías

| Permiso | Dónde se usa |
|---|---|
| `categories.view` | [src/features/categories/ui/list/categories-row-actions.tsx:29](src/features/categories/ui/list/categories-row-actions.tsx#L29) — `useCan`<br>[src/shared/config/sidebar-data.ts:207](src/shared/config/sidebar-data.ts#L207) — menú lateral |
| `categories.create` | [src/app/(intranet)/categories/page.tsx:22](src/app/(intranet)/categories/page.tsx#L22) — página<br>[src/features/web-works/ui/form/web-work-form.tsx:386](src/features/web-works/ui/form/web-work-form.tsx#L386) — `<Can>` |
| `categories.update` | [src/features/categories/ui/detail/category-detail.tsx:19](src/features/categories/ui/detail/category-detail.tsx#L19) — `useCan`<br>[src/features/categories/ui/list/categories-row-actions.tsx:30](src/features/categories/ui/list/categories-row-actions.tsx#L30) — `useCan` |
| `categories.delete` | [src/features/categories/ui/list/categories-row-actions.tsx:32](src/features/categories/ui/list/categories-row-actions.tsx#L32) — `useCan`<br>[src/features/categories/ui/list/categories-table.tsx:37](src/features/categories/ui/list/categories-table.tsx#L37) — `useCan` |
| `categories.state` | [src/features/categories/ui/list/categories-row-actions.tsx:31](src/features/categories/ui/list/categories-row-actions.tsx#L31) — `useCan`<br>[src/features/categories/ui/list/categories-table.tsx:36](src/features/categories/ui/list/categories-table.tsx#L36) — `useCan` |

## Gestión Documentaria › Comercial › Imágenes

| Permiso | Dónde se usa |
|---|---|
| `images.view` | [src/features/images/ui/list/images-row-actions.tsx:26](src/features/images/ui/list/images-row-actions.tsx#L26) — `useCan`<br>[src/shared/config/sidebar-data.ts:208](src/shared/config/sidebar-data.ts#L208) — menú lateral |
| `images.create` | [src/features/images/ui/list/images-header-actions.tsx:25](src/features/images/ui/list/images-header-actions.tsx#L25) — `<Can>`<br>[src/features/sectionimages/ui/form/sectionimage-form.tsx:127](src/features/sectionimages/ui/form/sectionimage-form.tsx#L127) — `useCan`<br>[src/features/testimony-web/ui/form/testimony-form.tsx:251](src/features/testimony-web/ui/form/testimony-form.tsx#L251) — `<Can>`<br>[src/features/web-works/ui/form/bank-image-picker.tsx:42](src/features/web-works/ui/form/bank-image-picker.tsx#L42) — `<Can>`<br>[src/features/web-works/ui/form/web-work-pairs-field/pair-slot.tsx:69](src/features/web-works/ui/form/web-work-pairs-field/pair-slot.tsx#L69) — `<Can>` |
| `images.update` | _(sin uso directo en el código)_ |
| `images.delete` | [src/features/images/ui/detail/image-detail.tsx:96](src/features/images/ui/detail/image-detail.tsx#L96) — `<Can>`<br>[src/features/images/ui/list/image-card.tsx:35](src/features/images/ui/list/image-card.tsx#L35) — `useCan`<br>[src/features/images/ui/list/images-grid.tsx:43](src/features/images/ui/list/images-grid.tsx#L43) — `useCan`<br>[src/features/images/ui/list/images-row-actions.tsx:27](src/features/images/ui/list/images-row-actions.tsx#L27) — `useCan`<br>[src/features/images/ui/list/images-table.tsx:32](src/features/images/ui/list/images-table.tsx#L32) — `useCan` |
| `images.state` | _(sin uso directo en el código)_ |

## Gestión Documentaria › Proformas › Proformas

| Permiso | Dónde se usa |
|---|---|
| `proformas.view` | [src/features/proformas/ui/list/proformas-row-actions.tsx:40](src/features/proformas/ui/list/proformas-row-actions.tsx#L40) — `useCan`<br>[src/features/sales/ui/pos/sale-pos-page.tsx:47](src/features/sales/ui/pos/sale-pos-page.tsx#L47) — `useCan`<br>[src/shared/config/sidebar-data.ts:215](src/shared/config/sidebar-data.ts#L215) — menú lateral |
| `proformas.create` | [src/app/(intranet)/proformas/page.tsx:22](src/app/(intranet)/proformas/page.tsx#L22) — página<br>[src/features/proformas/ui/detail/proforma-detail-hero.tsx:59](src/features/proformas/ui/detail/proforma-detail-hero.tsx#L59) — `useCan` |
| `proformas.update` | [src/features/proformas/ui/detail/proforma-detail-hero.tsx:60](src/features/proformas/ui/detail/proforma-detail-hero.tsx#L60) — `useCan`<br>[src/features/proformas/ui/list/proformas-row-actions.tsx:41](src/features/proformas/ui/list/proformas-row-actions.tsx#L41) — `useCan` |
| `proformas.delete` | [src/features/proformas/ui/list/proformas-row-actions.tsx:42](src/features/proformas/ui/list/proformas-row-actions.tsx#L42) — `useCan`<br>[src/features/proformas/ui/list/proformas-table.tsx:53](src/features/proformas/ui/list/proformas-table.tsx#L53) — `useCan` |
| `proformas.state` | [src/features/proformas/ui/list/proformas-row-actions.tsx:43](src/features/proformas/ui/list/proformas-row-actions.tsx#L43) — `useCan`<br>[src/features/proformas/ui/list/proformas-table.tsx:52](src/features/proformas/ui/list/proformas-table.tsx#L52) — `useCan` |
| `proformas.pdf` | [src/features/proformas/hooks/useProformaDetailPage.ts:13](src/features/proformas/hooks/useProformaDetailPage.ts#L13)<br>[src/features/proformas/ui/detail/proforma-detail.tsx:35](src/features/proformas/ui/detail/proforma-detail.tsx#L35) — `useCan`<br>[src/features/proformas/ui/list/proformas-row-actions.tsx:44](src/features/proformas/ui/list/proformas-row-actions.tsx#L44) — `useCan` |
| `proformas.view_all` | [src/features/proformas/ui/list/proformas-table.tsx:55](src/features/proformas/ui/list/proformas-table.tsx#L55) — `useCan` |

## Gestión Documentaria › Proformas › Plantillas

| Permiso | Dónde se usa |
|---|---|
| `proforma_templates.view` | [src/features/proforma-templates/ui/list/proforma-templates-row-actions.tsx:33](src/features/proforma-templates/ui/list/proforma-templates-row-actions.tsx#L33) — `useCan`<br>[src/shared/config/sidebar-data.ts:216](src/shared/config/sidebar-data.ts#L216) — menú lateral |
| `proforma_templates.create` | [src/app/(intranet)/proforma-templates/page.tsx:22](src/app/(intranet)/proforma-templates/page.tsx#L22) — página<br>[src/features/proforma-templates/ui/detail/proforma-template-detail.tsx:44](src/features/proforma-templates/ui/detail/proforma-template-detail.tsx#L44) — `useCan` |
| `proforma_templates.update` | [src/features/proforma-templates/ui/detail/proforma-template-detail.tsx:45](src/features/proforma-templates/ui/detail/proforma-template-detail.tsx#L45) — `useCan`<br>[src/features/proforma-templates/ui/list/proforma-templates-row-actions.tsx:34](src/features/proforma-templates/ui/list/proforma-templates-row-actions.tsx#L34) — `useCan` |
| `proforma_templates.delete` | [src/features/proforma-templates/ui/list/proforma-templates-row-actions.tsx:36](src/features/proforma-templates/ui/list/proforma-templates-row-actions.tsx#L36) — `useCan`<br>[src/features/proforma-templates/ui/list/proforma-templates-table.tsx:51](src/features/proforma-templates/ui/list/proforma-templates-table.tsx#L51) — `useCan` |
| `proforma_templates.state` | [src/features/proforma-templates/ui/list/proforma-templates-row-actions.tsx:35](src/features/proforma-templates/ui/list/proforma-templates-row-actions.tsx#L35) — `useCan`<br>[src/features/proforma-templates/ui/list/proforma-templates-table.tsx:50](src/features/proforma-templates/ui/list/proforma-templates-table.tsx#L50) — `useCan` |

## Gestión Documentaria › Proformas › Tipos de Proforma

| Permiso | Dónde se usa |
|---|---|
| `proforma_types.view` | [src/features/proforma-types/ui/list/proforma-types-row-actions.tsx:29](src/features/proforma-types/ui/list/proforma-types-row-actions.tsx#L29) — `useCan`<br>[src/shared/config/sidebar-data.ts:217](src/shared/config/sidebar-data.ts#L217) — menú lateral |
| `proforma_types.create` | [src/app/(intranet)/proforma-types/page.tsx:22](src/app/(intranet)/proforma-types/page.tsx#L22) — página |
| `proforma_types.update` | [src/features/proforma-types/ui/detail/proforma-type-detail.tsx:19](src/features/proforma-types/ui/detail/proforma-type-detail.tsx#L19) — `useCan`<br>[src/features/proforma-types/ui/list/proforma-types-row-actions.tsx:30](src/features/proforma-types/ui/list/proforma-types-row-actions.tsx#L30) — `useCan` |
| `proforma_types.delete` | [src/features/proforma-types/ui/list/proforma-types-row-actions.tsx:32](src/features/proforma-types/ui/list/proforma-types-row-actions.tsx#L32) — `useCan`<br>[src/features/proforma-types/ui/list/proforma-types-table.tsx:35](src/features/proforma-types/ui/list/proforma-types-table.tsx#L35) — `useCan` |
| `proforma_types.state` | [src/features/proforma-types/ui/list/proforma-types-row-actions.tsx:31](src/features/proforma-types/ui/list/proforma-types-row-actions.tsx#L31) — `useCan`<br>[src/features/proforma-types/ui/list/proforma-types-table.tsx:34](src/features/proforma-types/ui/list/proforma-types-table.tsx#L34) — `useCan` |

## Gestión Documentaria › Datos de la Empresa › Configuración

| Permiso | Dónde se usa |
|---|---|
| `company_settings.view` | [src/shared/config/sidebar-data.ts:224](src/shared/config/sidebar-data.ts#L224) — menú lateral |
| `company_settings.update` | [src/features/company-settings/ui/form/company-setting-form.tsx:17](src/features/company-settings/ui/form/company-setting-form.tsx#L17) — `useCan` |

## Gestión Documentaria › Datos de la Empresa › Sucursales

| Permiso | Dónde se usa |
|---|---|
| `company_branches.view` | [src/features/company-branches/ui/list/company-branches-row-actions.tsx:26](src/features/company-branches/ui/list/company-branches-row-actions.tsx#L26) — `useCan`<br>[src/shared/config/sidebar-data.ts:225](src/shared/config/sidebar-data.ts#L225) — menú lateral |
| `company_branches.create` | [src/app/(intranet)/company-branches/page.tsx:22](src/app/(intranet)/company-branches/page.tsx#L22) — página |
| `company_branches.update` | [src/features/company-branches/ui/detail/company-branch-detail.tsx:47](src/features/company-branches/ui/detail/company-branch-detail.tsx#L47) — `<Can>`<br>[src/features/company-branches/ui/list/company-branches-row-actions.tsx:27](src/features/company-branches/ui/list/company-branches-row-actions.tsx#L27) — `useCan` |
| `company_branches.delete` | [src/features/company-branches/ui/list/company-branches-row-actions.tsx:29](src/features/company-branches/ui/list/company-branches-row-actions.tsx#L29) — `useCan`<br>[src/features/company-branches/ui/list/company-branches-table.tsx:34](src/features/company-branches/ui/list/company-branches-table.tsx#L34) — `useCan` |
| `company_branches.state` | [src/features/company-branches/ui/list/company-branches-row-actions.tsx:28](src/features/company-branches/ui/list/company-branches-row-actions.tsx#L28) — `useCan`<br>[src/features/company-branches/ui/list/company-branches-table.tsx:33](src/features/company-branches/ui/list/company-branches-table.tsx#L33) — `useCan` |
| `company_branches.view_all` | _(sin uso directo en el código)_ |

## Gestión Documentaria › Datos de la Empresa › Cuentas Bancarias

| Permiso | Dónde se usa |
|---|---|
| `company_bank_accounts.view` | [src/features/company-bank-accounts/ui/list/company-bank-accounts-row-actions.tsx:26](src/features/company-bank-accounts/ui/list/company-bank-accounts-row-actions.tsx#L26) — `useCan`<br>[src/shared/config/sidebar-data.ts:226](src/shared/config/sidebar-data.ts#L226) — menú lateral |
| `company_bank_accounts.create` | [src/features/company-bank-accounts/ui/company-bank-accounts-primary-buttons.tsx:10](src/features/company-bank-accounts/ui/company-bank-accounts-primary-buttons.tsx#L10) — `useCan` |
| `company_bank_accounts.update` | [src/features/company-bank-accounts/ui/detail/company-bank-account-detail.tsx:58](src/features/company-bank-accounts/ui/detail/company-bank-account-detail.tsx#L58) — `<Can>`<br>[src/features/company-bank-accounts/ui/list/company-bank-accounts-row-actions.tsx:27](src/features/company-bank-accounts/ui/list/company-bank-accounts-row-actions.tsx#L27) — `useCan` |
| `company_bank_accounts.delete` | [src/features/company-bank-accounts/ui/list/company-bank-accounts-row-actions.tsx:29](src/features/company-bank-accounts/ui/list/company-bank-accounts-row-actions.tsx#L29) — `useCan`<br>[src/features/company-bank-accounts/ui/list/company-bank-accounts-table.tsx:38](src/features/company-bank-accounts/ui/list/company-bank-accounts-table.tsx#L38) — `useCan` |
| `company_bank_accounts.state` | [src/features/company-bank-accounts/ui/list/company-bank-accounts-row-actions.tsx:28](src/features/company-bank-accounts/ui/list/company-bank-accounts-row-actions.tsx#L28) — `useCan`<br>[src/features/company-bank-accounts/ui/list/company-bank-accounts-table.tsx:37](src/features/company-bank-accounts/ui/list/company-bank-accounts-table.tsx#L37) — `useCan` |

## Gestión Documentaria › Datos de la Empresa › Firmas

| Permiso | Dónde se usa |
|---|---|
| `company_signatures.view` | [src/features/company-signatures/ui/list/company-signatures-row-actions.tsx:26](src/features/company-signatures/ui/list/company-signatures-row-actions.tsx#L26) — `useCan`<br>[src/shared/config/sidebar-data.ts:227](src/shared/config/sidebar-data.ts#L227) — menú lateral |
| `company_signatures.create` | [src/app/(intranet)/company-signatures/page.tsx:22](src/app/(intranet)/company-signatures/page.tsx#L22) — página |
| `company_signatures.update` | [src/features/company-signatures/ui/detail/company-signature-detail.tsx:58](src/features/company-signatures/ui/detail/company-signature-detail.tsx#L58) — `<Can>`<br>[src/features/company-signatures/ui/list/company-signatures-row-actions.tsx:27](src/features/company-signatures/ui/list/company-signatures-row-actions.tsx#L27) — `useCan` |
| `company_signatures.delete` | [src/features/company-signatures/ui/list/company-signatures-row-actions.tsx:29](src/features/company-signatures/ui/list/company-signatures-row-actions.tsx#L29) — `useCan`<br>[src/features/company-signatures/ui/list/company-signatures-table.tsx:34](src/features/company-signatures/ui/list/company-signatures-table.tsx#L34) — `useCan` |
| `company_signatures.state` | [src/features/company-signatures/ui/list/company-signatures-row-actions.tsx:28](src/features/company-signatures/ui/list/company-signatures-row-actions.tsx#L28) — `useCan`<br>[src/features/company-signatures/ui/list/company-signatures-table.tsx:33](src/features/company-signatures/ui/list/company-signatures-table.tsx#L33) — `useCan` |

## Gestión Documentaria › Datos de la Empresa › Contactos

| Permiso | Dónde se usa |
|---|---|
| `company_contacts.view` | [src/features/company-contacts/ui/list/company-contacts-row-actions.tsx:26](src/features/company-contacts/ui/list/company-contacts-row-actions.tsx#L26) — `useCan`<br>[src/shared/config/sidebar-data.ts:228](src/shared/config/sidebar-data.ts#L228) — menú lateral |
| `company_contacts.create` | [src/app/(intranet)/company-contacts/page.tsx:22](src/app/(intranet)/company-contacts/page.tsx#L22) — página |
| `company_contacts.update` | [src/features/company-contacts/ui/detail/company-contact-detail.tsx:58](src/features/company-contacts/ui/detail/company-contact-detail.tsx#L58) — `<Can>`<br>[src/features/company-contacts/ui/list/company-contacts-row-actions.tsx:27](src/features/company-contacts/ui/list/company-contacts-row-actions.tsx#L27) — `useCan` |
| `company_contacts.delete` | [src/features/company-contacts/ui/list/company-contacts-row-actions.tsx:29](src/features/company-contacts/ui/list/company-contacts-row-actions.tsx#L29) — `useCan`<br>[src/features/company-contacts/ui/list/company-contacts-table.tsx:35](src/features/company-contacts/ui/list/company-contacts-table.tsx#L35) — `useCan` |
| `company_contacts.state` | [src/features/company-contacts/ui/list/company-contacts-row-actions.tsx:28](src/features/company-contacts/ui/list/company-contacts-row-actions.tsx#L28) — `useCan`<br>[src/features/company-contacts/ui/list/company-contacts-table.tsx:34](src/features/company-contacts/ui/list/company-contacts-table.tsx#L34) — `useCan` |

## Gestión Documentaria › Datos de la Empresa › Redes Sociales

| Permiso | Dónde se usa |
|---|---|
| `company_social_networks.view` | [src/features/company-social-networks/ui/list/company-social-networks-row-actions.tsx:26](src/features/company-social-networks/ui/list/company-social-networks-row-actions.tsx#L26) — `useCan`<br>[src/shared/config/sidebar-data.ts:229](src/shared/config/sidebar-data.ts#L229) — menú lateral |
| `company_social_networks.create` | [src/app/(intranet)/company-social-networks/page.tsx:22](src/app/(intranet)/company-social-networks/page.tsx#L22) — página |
| `company_social_networks.update` | [src/features/company-social-networks/ui/detail/company-social-network-detail.tsx:56](src/features/company-social-networks/ui/detail/company-social-network-detail.tsx#L56) — `<Can>`<br>[src/features/company-social-networks/ui/list/company-social-networks-row-actions.tsx:27](src/features/company-social-networks/ui/list/company-social-networks-row-actions.tsx#L27) — `useCan` |
| `company_social_networks.delete` | [src/features/company-social-networks/ui/list/company-social-networks-row-actions.tsx:29](src/features/company-social-networks/ui/list/company-social-networks-row-actions.tsx#L29) — `useCan`<br>[src/features/company-social-networks/ui/list/company-social-networks-table.tsx:34](src/features/company-social-networks/ui/list/company-social-networks-table.tsx#L34) — `useCan` |
| `company_social_networks.state` | [src/features/company-social-networks/ui/list/company-social-networks-row-actions.tsx:28](src/features/company-social-networks/ui/list/company-social-networks-row-actions.tsx#L28) — `useCan`<br>[src/features/company-social-networks/ui/list/company-social-networks-table.tsx:33](src/features/company-social-networks/ui/list/company-social-networks-table.tsx#L33) — `useCan` |

## Ventas › Ventas

| Permiso | Dónde se usa |
|---|---|
| `sales.view` | [src/features/proformas/ui/detail/proforma-detail-hero.tsx:62](src/features/proformas/ui/detail/proforma-detail-hero.tsx#L62) — `useCan`<br>[src/features/proformas/ui/list/proformas-row-actions.tsx:46](src/features/proformas/ui/list/proformas-row-actions.tsx#L46) — `useCan`<br>[src/features/sales/ui/list/sales-row-actions.tsx:38](src/features/sales/ui/list/sales-row-actions.tsx#L38) — `useCan`<br>[src/shared/config/nav-types.ts:14](src/shared/config/nav-types.ts#L14)<br>[src/shared/config/sidebar-data.ts:237](src/shared/config/sidebar-data.ts#L237) — menú lateral |
| `sales.create` | [src/app/(intranet)/sales/page.tsx:22](src/app/(intranet)/sales/page.tsx#L22) — página<br>[src/features/proformas/ui/detail/proforma-detail-hero.tsx:61](src/features/proformas/ui/detail/proforma-detail-hero.tsx#L61) — `useCan`<br>[src/features/proformas/ui/list/proformas-row-actions.tsx:45](src/features/proformas/ui/list/proformas-row-actions.tsx#L45) — `useCan`<br>[src/features/sales/ui/detail/sale-detail-hero.tsx:41](src/features/sales/ui/detail/sale-detail-hero.tsx#L41) — `useCan`<br>[src/shared/config/nav-types.ts:14](src/shared/config/nav-types.ts#L14) |
| `sales.update` | [src/features/sales/ui/detail/sale-detail-hero.tsx:42](src/features/sales/ui/detail/sale-detail-hero.tsx#L42) — `useCan`<br>[src/features/sales/ui/list/sales-row-actions.tsx:39](src/features/sales/ui/list/sales-row-actions.tsx#L39) — `useCan` |
| `sales.delete` | [src/features/sales/ui/list/sales-row-actions.tsx:41](src/features/sales/ui/list/sales-row-actions.tsx#L41) — `useCan`<br>[src/features/sales/ui/list/sales-table.tsx:42](src/features/sales/ui/list/sales-table.tsx#L42) — `useCan` |
| `sales.state` | [src/features/sales/ui/list/sales-row-actions.tsx:40](src/features/sales/ui/list/sales-row-actions.tsx#L40) — `useCan` |
| `sales.payments` | [src/features/sale-payments/ui/sale-payments-section.tsx:39](src/features/sale-payments/ui/sale-payments-section.tsx#L39) — `useCan` |
| `sales.view_all` | [src/features/dashboard/ui/common/dashboard-toolbar.tsx:42](src/features/dashboard/ui/common/dashboard-toolbar.tsx#L42) — `useCan`<br>[src/features/dashboard/ui/sales-performance/sales-performance-dashboard.tsx:35](src/features/dashboard/ui/sales-performance/sales-performance-dashboard.tsx#L35) — `useCan`<br>[src/features/dashboard/ui/summary/summary-kpis.tsx:24](src/features/dashboard/ui/summary/summary-kpis.tsx#L24) — `useCan`<br>[src/features/reports/ui/report-filters.tsx:29](src/features/reports/ui/report-filters.tsx#L29) — `useCan`<br>[src/features/reports/ui/report-panel.tsx:30](src/features/reports/ui/report-panel.tsx#L30) — `useCan`<br>[src/features/reports/ui/reports-view.tsx:68](src/features/reports/ui/reports-view.tsx#L68)<br>[src/features/sale-goals/ui/sale-goals-view.tsx:25](src/features/sale-goals/ui/sale-goals-view.tsx#L25) — `useCan`<br>[src/features/sales/hooks/useSalePos.ts:53](src/features/sales/hooks/useSalePos.ts#L53) — `useCan`<br>[src/features/sales/ui/list/sales-table.tsx:44](src/features/sales/ui/list/sales-table.tsx#L44) — `useCan` |

## Ventas › Tipos de Comprobante

| Permiso | Dónde se usa |
|---|---|
| `sale_document_types.view` | [src/features/sale-document-types/ui/list/sale-document-types-row-actions.tsx:29](src/features/sale-document-types/ui/list/sale-document-types-row-actions.tsx#L29) — `useCan`<br>[src/shared/config/sidebar-data.ts:238](src/shared/config/sidebar-data.ts#L238) — menú lateral |
| `sale_document_types.create` | [src/app/(intranet)/sale-document-types/page.tsx:22](src/app/(intranet)/sale-document-types/page.tsx#L22) — página |
| `sale_document_types.update` | [src/features/sale-document-types/ui/detail/sale-document-type-detail.tsx:19](src/features/sale-document-types/ui/detail/sale-document-type-detail.tsx#L19) — `useCan`<br>[src/features/sale-document-types/ui/list/sale-document-types-row-actions.tsx:30](src/features/sale-document-types/ui/list/sale-document-types-row-actions.tsx#L30) — `useCan` |
| `sale_document_types.delete` | [src/features/sale-document-types/ui/list/sale-document-types-row-actions.tsx:32](src/features/sale-document-types/ui/list/sale-document-types-row-actions.tsx#L32) — `useCan`<br>[src/features/sale-document-types/ui/list/sale-document-types-table.tsx:35](src/features/sale-document-types/ui/list/sale-document-types-table.tsx#L35) — `useCan` |
| `sale_document_types.state` | [src/features/sale-document-types/ui/list/sale-document-types-row-actions.tsx:31](src/features/sale-document-types/ui/list/sale-document-types-row-actions.tsx#L31) — `useCan`<br>[src/features/sale-document-types/ui/list/sale-document-types-table.tsx:34](src/features/sale-document-types/ui/list/sale-document-types-table.tsx#L34) — `useCan` |

## Ventas › Configuración de Ventas

| Permiso | Dónde se usa |
|---|---|
| `sale_settings.view` | [src/shared/config/sidebar-data.ts:240](src/shared/config/sidebar-data.ts#L240) — menú lateral |
| `sale_settings.update` | [src/features/sale-settings/ui/form/sale-setting-form.tsx:59](src/features/sale-settings/ui/form/sale-setting-form.tsx#L59) — `useCan` |

## Ventas › Metas de venta

| Permiso | Dónde se usa |
|---|---|
| `sale_goals.view` | [src/shared/config/sidebar-data.ts:239](src/shared/config/sidebar-data.ts#L239) — menú lateral |
| `sale_goals.update` | [src/features/dashboard/ui/sales-performance/goal-gauge-card.tsx:20](src/features/dashboard/ui/sales-performance/goal-gauge-card.tsx#L20) — `useCan`<br>[src/features/dashboard/ui/summary/summary-kpis.tsx:26](src/features/dashboard/ui/summary/summary-kpis.tsx#L26) — `useCan`<br>[src/features/sale-goals/ui/sale-goals-view.tsx:23](src/features/sale-goals/ui/sale-goals-view.tsx#L23) — `useCan` |

## Administración › Gestión de Usuarios › Usuarios

| Permiso | Dónde se usa |
|---|---|
| `users.view` | [src/features/users/ui/list/users-row-actions.tsx:26](src/features/users/ui/list/users-row-actions.tsx#L26) — `useCan`<br>[src/shared/config/sidebar-data.ts:250](src/shared/config/sidebar-data.ts#L250) — menú lateral |
| `users.create` | [src/features/users/ui/users-primary-buttons.tsx:10](src/features/users/ui/users-primary-buttons.tsx#L10) — `useCan` |
| `users.update` | [src/features/users/ui/detail/user-detail.tsx:25](src/features/users/ui/detail/user-detail.tsx#L25) — `useCan`<br>[src/features/users/ui/list/users-row-actions.tsx:27](src/features/users/ui/list/users-row-actions.tsx#L27) — `useCan` |
| `users.delete` | [src/features/users/ui/list/users-row-actions.tsx:29](src/features/users/ui/list/users-row-actions.tsx#L29) — `useCan`<br>[src/features/users/ui/list/users-table.tsx:57](src/features/users/ui/list/users-table.tsx#L57) — `useCan` |
| `users.state` | [src/features/users/ui/list/users-row-actions.tsx:28](src/features/users/ui/list/users-row-actions.tsx#L28) — `useCan`<br>[src/features/users/ui/list/users-table.tsx:56](src/features/users/ui/list/users-table.tsx#L56) — `useCan` |

## Administración › Gestión de Usuarios › Roles

| Permiso | Dónde se usa |
|---|---|
| `roles.view` | [src/features/roles/ui/detail/role-detail.tsx:24](src/features/roles/ui/detail/role-detail.tsx#L24) — `useCan`<br>[src/features/roles/ui/list/roles-row-actions.tsx:33](src/features/roles/ui/list/roles-row-actions.tsx#L33) — `useCan`<br>[src/shared/config/sidebar-data.ts:251](src/shared/config/sidebar-data.ts#L251) — menú lateral |
| `roles.create` | [src/features/roles/ui/roles-primary-buttons.tsx:9](src/features/roles/ui/roles-primary-buttons.tsx#L9) — `useCan` |
| `roles.update` | [src/features/roles/ui/detail/role-detail.tsx:23](src/features/roles/ui/detail/role-detail.tsx#L23) — `useCan`<br>[src/features/roles/ui/list/roles-row-actions.tsx:34](src/features/roles/ui/list/roles-row-actions.tsx#L34) — `useCan` |
| `roles.delete` | [src/features/roles/ui/list/roles-row-actions.tsx:35](src/features/roles/ui/list/roles-row-actions.tsx#L35) — `useCan`<br>[src/features/roles/ui/list/roles-table.tsx:34](src/features/roles/ui/list/roles-table.tsx#L34) — `useCan` |
| `roles.state` | [src/features/roles/ui/list/roles-row-actions.tsx:36](src/features/roles/ui/list/roles-row-actions.tsx#L36) — `useCan`<br>[src/features/roles/ui/list/roles-table.tsx:33](src/features/roles/ui/list/roles-table.tsx#L33) — `useCan` |
| `roles.permissions` | [src/features/permissions/ui/role-permissions-view.tsx:64](src/features/permissions/ui/role-permissions-view.tsx#L64) — `useCan` |

## Administración › Gestión de Usuarios › Dispositivos

| Permiso | Dónde se usa |
|---|---|
| `user_devices.view` | [src/features/user-devices/ui/list/user-devices-accordion-table/user-device-group.tsx:58](src/features/user-devices/ui/list/user-devices-accordion-table/user-device-group.tsx#L58) — `useCan`<br>[src/features/user-devices/ui/list/user-devices-row-actions.tsx:29](src/features/user-devices/ui/list/user-devices-row-actions.tsx#L29) — `useCan`<br>[src/shared/config/sidebar-data.ts:252](src/shared/config/sidebar-data.ts#L252) — menú lateral |
| `user_devices.delete` | [src/features/user-devices/ui/list/user-devices-accordion-table/user-device-group.tsx:59](src/features/user-devices/ui/list/user-devices-accordion-table/user-device-group.tsx#L59) — `useCan`<br>[src/features/user-devices/ui/list/user-devices-row-actions.tsx:30](src/features/user-devices/ui/list/user-devices-row-actions.tsx#L30) — `useCan` |

## Administración › Gestión de Usuarios › Accesos Google

| Permiso | Dónde se usa |
|---|---|
| `google_access.view` | [src/shared/config/sidebar-data.ts:253](src/shared/config/sidebar-data.ts#L253) — menú lateral |
| `google_access.approve` | [src/features/google-access-requests/ui/list/google-access-requests-row-actions.tsx:28](src/features/google-access-requests/ui/list/google-access-requests-row-actions.tsx#L28) — `useCan` |

## Administración › Servidor › Imágenes

| Permiso | Dónde se usa |
|---|---|
| `storage_images.view` | [src/shared/config/sidebar-data.ts:260](src/shared/config/sidebar-data.ts#L260) — menú lateral |
| `storage_images.create` | [src/features/images_storage/ui/gallery/storage-gallery/storage-gallery.tsx:211](src/features/images_storage/ui/gallery/storage-gallery/storage-gallery.tsx#L211) — `<Can>`<br>[src/features/images_storage/ui/gallery/storage-gallery/storage-gallery.tsx:328](src/features/images_storage/ui/gallery/storage-gallery/storage-gallery.tsx#L328) — `<Can>` |
| `storage_images.update` | [src/features/images_storage/ui/dialogs/storage-detail-dialog.tsx:188](src/features/images_storage/ui/dialogs/storage-detail-dialog.tsx#L188) — `<Can>`<br>[src/features/images_storage/ui/gallery/storage-card.tsx:125](src/features/images_storage/ui/gallery/storage-card.tsx#L125) — `<Can>` |
| `storage_images.delete` | [src/features/images_storage/ui/dialogs/storage-detail-dialog.tsx:200](src/features/images_storage/ui/dialogs/storage-detail-dialog.tsx#L200) — `<Can>`<br>[src/features/images_storage/ui/gallery/storage-card.tsx:141](src/features/images_storage/ui/gallery/storage-card.tsx#L141) — `<Can>`<br>[src/features/images_storage/ui/gallery/storage-gallery/storage-gallery.tsx:291](src/features/images_storage/ui/gallery/storage-gallery/storage-gallery.tsx#L291) — `<Can>` |

## Administración › Servidor › Carpetas

| Permiso | Dónde se usa |
|---|---|
| `storage_folders.view` | [src/shared/config/sidebar-data.ts:261](src/shared/config/sidebar-data.ts#L261) — menú lateral |
| `storage_folders.create` | [src/features/storage-folders/ui/explorer/storage-explorer.tsx:377](src/features/storage-folders/ui/explorer/storage-explorer.tsx#L377) — `<Can>`<br>[src/features/storage-folders/ui/explorer/storage-explorer.tsx:383](src/features/storage-folders/ui/explorer/storage-explorer.tsx#L383) — `<Can>`<br>[src/features/storage-folders/ui/explorer/storage-explorer.tsx:523](src/features/storage-folders/ui/explorer/storage-explorer.tsx#L523) — `<Can>`<br>[src/features/storage-folders/ui/explorer/storage-explorer.tsx:528](src/features/storage-folders/ui/explorer/storage-explorer.tsx#L528) — `<Can>` |
| `storage_folders.update` | [src/features/storage-folders/ui/explorer/storage-explorer.tsx:603](src/features/storage-folders/ui/explorer/storage-explorer.tsx#L603) — `<Can>`<br>[src/features/storage-folders/ui/explorer/storage-item-card/storage-item-card.tsx:67](src/features/storage-folders/ui/explorer/storage-item-card/storage-item-card.tsx#L67) — `useCan`<br>[src/features/storage-folders/ui/tree/folder-tree/folder-tree-node.tsx:24](src/features/storage-folders/ui/tree/folder-tree/folder-tree-node.tsx#L24) — `useCan` |
| `storage_folders.delete` | [src/features/storage-folders/ui/explorer/storage-explorer.tsx:616](src/features/storage-folders/ui/explorer/storage-explorer.tsx#L616) — `<Can>`<br>[src/features/storage-folders/ui/explorer/storage-item-card/storage-item-card.tsx:68](src/features/storage-folders/ui/explorer/storage-item-card/storage-item-card.tsx#L68) — `useCan` |

## Reportes › Reportes

| Permiso | Dónde se usa |
|---|---|
| `reports.view` | [src/features/dashboard/lib/use-report-href.ts:46](src/features/dashboard/lib/use-report-href.ts#L46) — `useCan`<br>[src/shared/config/sidebar-data.ts:301](src/shared/config/sidebar-data.ts#L301) — menú lateral |

## Reportes › Reportes › Registro de ventas

| Permiso | Dónde se usa |
|---|---|
| `report_sales_register.view` | _(sin uso directo en el código)_ |
| `report_sales_register.kpis` | _(sin uso directo en el código)_ |
| `report_sales_register.charts` | _(sin uso directo en el código)_ |
| `report_sales_register.table` | _(sin uso directo en el código)_ |
| `report_sales_register.detail` | _(sin uso directo en el código)_ |
| `report_sales_register.export` | _(sin uso directo en el código)_ |

## Reportes › Reportes › Ventas por cliente

| Permiso | Dónde se usa |
|---|---|
| `report_sales_by_client.view` | _(sin uso directo en el código)_ |
| `report_sales_by_client.kpis` | _(sin uso directo en el código)_ |
| `report_sales_by_client.charts` | _(sin uso directo en el código)_ |
| `report_sales_by_client.table` | _(sin uso directo en el código)_ |
| `report_sales_by_client.detail` | _(sin uso directo en el código)_ |
| `report_sales_by_client.export` | _(sin uso directo en el código)_ |

## Reportes › Reportes › Ventas por producto

| Permiso | Dónde se usa |
|---|---|
| `report_sales_by_product.view` | _(sin uso directo en el código)_ |
| `report_sales_by_product.kpis` | _(sin uso directo en el código)_ |
| `report_sales_by_product.charts` | _(sin uso directo en el código)_ |
| `report_sales_by_product.table` | _(sin uso directo en el código)_ |
| `report_sales_by_product.detail` | _(sin uso directo en el código)_ |
| `report_sales_by_product.export` | _(sin uso directo en el código)_ |

## Reportes › Reportes › Pagos

| Permiso | Dónde se usa |
|---|---|
| `report_payments.view` | _(sin uso directo en el código)_ |
| `report_payments.kpis` | _(sin uso directo en el código)_ |
| `report_payments.charts` | _(sin uso directo en el código)_ |
| `report_payments.table` | _(sin uso directo en el código)_ |
| `report_payments.detail` | _(sin uso directo en el código)_ |
| `report_payments.export` | _(sin uso directo en el código)_ |

## Reportes › Reportes › Cuentas por cobrar

| Permiso | Dónde se usa |
|---|---|
| `report_receivables.view` | _(sin uso directo en el código)_ |
| `report_receivables.kpis` | _(sin uso directo en el código)_ |
| `report_receivables.charts` | _(sin uso directo en el código)_ |
| `report_receivables.table` | _(sin uso directo en el código)_ |
| `report_receivables.detail` | _(sin uso directo en el código)_ |
| `report_receivables.export` | _(sin uso directo en el código)_ |

## Reportes › Reportes › Proformas

| Permiso | Dónde se usa |
|---|---|
| `report_proformas.view` | _(sin uso directo en el código)_ |
| `report_proformas.kpis` | _(sin uso directo en el código)_ |
| `report_proformas.charts` | _(sin uso directo en el código)_ |
| `report_proformas.table` | _(sin uso directo en el código)_ |
| `report_proformas.detail` | _(sin uso directo en el código)_ |
| `report_proformas.export` | _(sin uso directo en el código)_ |

## Reportes › Reportes › Mensajes de contacto

| Permiso | Dónde se usa |
|---|---|
| `report_contact_messages.view` | _(sin uso directo en el código)_ |
| `report_contact_messages.kpis` | _(sin uso directo en el código)_ |
| `report_contact_messages.charts` | _(sin uso directo en el código)_ |
| `report_contact_messages.table` | _(sin uso directo en el código)_ |
| `report_contact_messages.detail` | _(sin uso directo en el código)_ |
| `report_contact_messages.export` | _(sin uso directo en el código)_ |

## Reportes › Reportes › Ventas por vendedor

| Permiso | Dónde se usa |
|---|---|
| `report_sales_by_seller.view` | _(sin uso directo en el código)_ |
| `report_sales_by_seller.kpis` | _(sin uso directo en el código)_ |
| `report_sales_by_seller.charts` | _(sin uso directo en el código)_ |
| `report_sales_by_seller.table` | _(sin uso directo en el código)_ |
| `report_sales_by_seller.detail` | _(sin uso directo en el código)_ |
| `report_sales_by_seller.export` | _(sin uso directo en el código)_ |

