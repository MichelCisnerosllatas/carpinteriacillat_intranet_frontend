// src/shared/config/sidebar-data.ts
import {
  Bot,
  BriefcaseBusiness,
  Building2,
  CreditCard,
  FileChartColumn,
  FileCheck,
  FileStack,
  KeyRound,
  MessageSquareQuote,
  TrendingUp,
  FileText,
  FileType,
  Folder,
  FolderOpen,
  Hammer,
  HardDrive,
  ImageIcon,
  LayoutDashboard,
  LayoutGrid,
  Layers,
  LayoutList,
  Megaphone,
  ListOrdered,
  MessagesSquare,
  MousePointerClick,
  Navigation2,
  Package,
  Palette,
  PanelBottom,
  PenTool,
  Phone,
  Quote,
  Receipt,
  Rows3,
  Settings2,
  Shapes,
  Share2,
  ShieldCheck,
  Smartphone,
  Sofa,
  Tag,
  Target,
  Type,
  UserCog,
  Users2,
  UserRound,
} from 'lucide-react'
import type { SidebarData } from './nav-types'

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR NAVIGATION DATA
//
// HOW TO MODIFY THE MENU
// ──────────────────────
//
// 1. SIMPLE LINK (no children)
//    {
//      title: 'Dashboard',
//      url: '/dashboard',
//      icon: LayoutDashboard,
//    }
//
// 2. MENU WITH CHILDREN (collapsible)
//    {
//      title: 'Reports',
//      icon: BarChart,
//      items: [
//        { title: 'Monthly', url: '/reports/monthly' },
//        { title: 'Annual',  url: '/reports/annual' },
//      ],
//    }
//
// 3. MENU WITH GRANDCHILDREN (nested collapsible — add inside items[].items)
//    Note: sidebar only renders 2 levels natively. For a 3rd level,
//    add another collapsible manually or use a flat structure.
//    {
//      title: 'Analytics',
//      icon: TrendingUp,
//      items: [
//        {
//          title: 'Sales',
//          url: '/analytics/sales',
//          icon: ShoppingCart,
//        },
//        {
//          title: 'Traffic',
//          url: '/analytics/traffic',
//          icon: Globe,
//        },
//      ],
//    }
//
// 4. VISIBILIDAD POR PERMISOS (ver ROLES_Y_PERMISOS.md)
//    Agrega `permission` con la key '<modulo>.view' del backend (config/permissions.php):
//    { title: 'Clientes', url: '/clients', permission: 'clients.view', icon: Users2 }
//    Páginas solo para el superadmin (demos): superadminOnly: true
//    Sin permission ni superadminOnly → lo ve cualquier usuario logueado.
//
//    El sidebar y el buscador filtran con filterNavByPermission() (nav-types.ts).
//    El guard de rutas también usa este archivo: la url de cada item define qué permiso
//    pide la página ('/x/create' → x.create, '/x/edit/...' → x.update, resto → x.view).
//
// 5. ICONS
//    All icons come from lucide-react (https://lucide.dev/icons).
//    Search any icon name → import it from 'lucide-react'.
//    Example: import { Rocket, Star, Globe } from 'lucide-react'
//
// 6. BADGE
//    Add badge?: string to show a count chip next to the title.
//    { title: 'Mensajes', url: '/contact-messages', icon: MessagesSquare, badge: '3' }
//
// ─────────────────────────────────────────────────────────────────────────────

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: '',
  },
  navGroups: [
    {
      title: 'General',
      items: [
        {
          // Dashboards de gestión (contrato API §7). Todos comparten los mismos filtros de fecha/moneda.
          title: 'Dashboard',
          icon: LayoutDashboard,
          items: [
            { title: 'Resumen general',          url: '/dashboard', permission: 'dashboard_summary.view', icon: LayoutDashboard },
            { title: 'Rendimiento de ventas',    url: '/dashboard/sales-performance', permission: 'dashboard_sales.view', icon: TrendingUp },
            { title: 'Seguimiento de proformas', url: '/dashboard/proformas', permission: 'dashboard_proformas.view', icon: FileCheck },
            { title: 'Mensajes y opiniones',     url: '/dashboard/messages', permission: 'dashboard_messages.view', icon: MessageSquareQuote },
            { title: 'Accesos del personal',     url: '/dashboard/staff-access', permission: 'dashboard_staff.view', icon: KeyRound },
          ],
        },
      ],
    },
    {
      title: 'Tipos',
      items: [
        {
          title: 'Catálogo de Tipos',
          icon: FolderOpen,
          items: [
            { title: 'Colores',      url: '/typecolors', permission: 'type_colors.view', icon: Palette },
            { title: 'Documentos',   url: '/typedocs', permission: 'type_docs.view', icon: FileText },
            
            { title: 'Maderas',      url: '/typewoods', permission: 'type_woods.view', icon: Layers },
            { title: 'Tipografías',  url: '/typefonts', permission: 'type_fonts.view', icon: Type },
          ],
        },
      ],
    },
    {
      title: 'Sitio Web',
      items: [
        { title: 'Navegaciones',       url: '/navigations', permission: 'navigations.view', icon: Navigation2 },
        { title: 'Footer del Sitio',   url: '/footer', permission: 'footer.view', icon: PanelBottom },
        { title: 'Alertas del sitio',  url: '/web-alerts', permission: 'web_alerts.view', icon: Megaphone },
        { title: 'Mensajes de Contacto', url: '/contact-messages', permission: 'contact_messages.view', icon: MessagesSquare },
        {
          title: 'Secciones',
          icon: Sofa,
          items: [
            { title: 'Secciones', url: '/sections', permission: 'sections.view', icon: Rows3 },
            { title: 'Sec. Imágenes',   url: '/section-images', permission: 'section_images.view', icon: ImageIcon },
            { title: 'Botones de Sección', url: '/section-buttons', permission: 'section_buttons.view', icon: MousePointerClick },
            { title: 'Items de Sección',   url: '/section-items', permission: 'section_items.view', icon: LayoutList },
            { title: 'Testimonios',        url: '/testimony', permission: 'testimonies.view', icon: Quote },
            { title: 'Tipos de Sección',    url: '/typesections', permission: 'type_sections.view', icon: LayoutGrid },
          ],
        },
        {
          // ChatBot del sitio público: DISEÑO (Configuración, Opciones de inicio) separado de la
          // DATA que generan los clientes (Conversaciones, Visitantes).
          title: 'ChatBot',
          icon: Bot,
          items: [
            { title: 'Configuración',      url: '/chatbot/settings', permission: 'chatbot_settings.view', icon: Settings2 },
            { title: 'Opciones de inicio', url: '/chatbot/options', permission: 'chatbot_options.view', icon: ListOrdered },
            { title: 'Conversaciones',     url: '/chatbot/conversations', permission: 'chatbot_conversations.view', icon: MessagesSquare },
            { title: 'Visitantes',         url: '/chatbot/visitors', permission: 'chatbot_visitors.view', icon: UserRound },
          ],
        },
        {
          title: 'Galería',
          icon: BriefcaseBusiness,
          items: [
            { title: 'Trabajos',         url: '/web-works', permission: 'web_works.view', icon: Hammer },
            { title: 'Tipos de trabajo', url: '/typeworks', permission: 'type_works.view', icon: Shapes },
          ],
        },
      ],
    },
    {
      title: 'Gestión Documentaria',
      items: [
        {
          title: 'Comercial',
          icon: Users2,
          items: [
            { title: 'Clientes',              url: '/clients', permission: 'clients.view', icon: Users2 },
            { title: 'Productos y Servicios', url: '/products-services', permission: 'products_services.view', icon: Package },
            { title: 'Muebles',               url: '/furnitures', permission: 'furnitures.view', icon: Sofa },
            { title: 'Categorías',            url: '/categories', permission: 'categories.view', icon: Tag },
            { title: 'Imágenes',              url: '/images', permission: 'images.view', icon: ImageIcon },
          ],
        },
        {
          title: 'Proformas',
          icon: FileStack,
          items: [
            { title: 'Proformas',           url: '/proformas', permission: 'proformas.view', icon: FileStack },
            { title: 'Plantillas',          url: '/proforma-templates', permission: 'proforma_templates.view', icon: FileText },
            { title: 'Tipos de Proforma',   url: '/proforma-types', permission: 'proforma_types.view', icon: FileType },
          ],
        },
        {
          title: 'Datos de la Empresa',
          icon: Building2,
          items: [
            { title: 'Configuración',    url: '/company-settings', permission: 'company_settings.view', icon: Settings2 },
            { title: 'Sucursales',       url: '/company-branches', permission: 'company_branches.view', icon: Building2 },
            { title: 'Cuentas Bancarias', url: '/company-bank-accounts', permission: 'company_bank_accounts.view', icon: CreditCard },
            { title: 'Firmas',           url: '/company-signatures', permission: 'company_signatures.view', icon: PenTool },
            { title: 'Contactos',        url: '/company-contacts', permission: 'company_contacts.view', icon: Phone },
            { title: 'Redes Sociales',   url: '/company-social-networks', permission: 'company_social_networks.view', icon: Share2 },
          ],
        },
      ],
    },
    {
      title: 'Ventas',
      items: [
        { title: 'Ventas',                  url: '/sales', permission: 'sales.view', icon: Receipt },
        { title: 'Tipos de Comprobante',    url: '/sale-document-types', permission: 'sale_document_types.view', icon: FileType },
        { title: 'Metas de venta',          url: '/sale-goals', permission: 'sale_goals.view', icon: Target },
        { title: 'Configuración de Ventas', url: '/sale-settings', permission: 'sale_settings.view', icon: Settings2 },
      ],
    },
    {
      title: 'Administracion',
      items: [
        {
          title: 'Gestion Usuario',
          icon: ShieldCheck,
          items: [
            { title: 'Usuarios',     url: '/users', permission: 'users.view', icon: UserCog },
            { title: 'Roles',        url: '/roles', permission: 'roles.view', icon: ShieldCheck },
            { title: 'Dispositivos', url: '/user-devices', permission: 'user_devices.view', icon: Smartphone },
            { title: 'Accesos Google', url: '/google-access-requests', permission: 'google_access.view', icon: ShieldCheck },
          ],
        },
        {
          title: 'Servidor',
          icon: HardDrive,
          items: [
            { title: 'Imágenes',  url: '/images/storage', permission: 'storage_images.view', icon: ImageIcon },
            { title: 'Carpetas',  url: '/storage/folders', permission: 'storage_folders.view', icon: Folder },
          ],
        },
        // {
        //   title: 'Auth',
        //   icon: ShieldCheck,
        //   items: [
        //     { title: 'Sign In', url: '/sign-in' },
        //     { title: 'Sign Up', url: '/sign-up' },
        //   ],
        // },
        // {
        //   title: 'Errors',
        //   icon: Bug,
        //   items: [
        //     { title: 'Unauthorized',          url: '/errors/401', icon: Lock },
        //     { title: 'Forbidden',             url: '/errors/403', icon: UserX },
        //     { title: 'Not Found',             url: '/errors/404', icon: FileX },
        //     { title: 'Internal Server Error', url: '/errors/500', icon: ServerOff },
        //     { title: 'Maintenance',           url: '/errors/503', icon: Construction },
        //   ],
        // },
      ],
    },
    {
      // Herramientas del equipo técnico: solo las ve el superadmin.
      title: 'Otros',
      items: [
        {
          title: 'UI Components',
          url: '/ui-components',
          superadminOnly: true, // página de demo
          icon: Package,
        },
      ],
    },
    {
      // Reportes (contrato API §10): una sola página /reports con pestañas por tema.
      // Va al final para no mezclarse con los dashboards del grupo "General".
      title: 'Reportes',
      items: [{ title: 'Reportes', url: '/reports', permission: 'reports.view', icon: FileChartColumn }],
    },
  ],
}
