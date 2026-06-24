// src/shared/config/sidebar-data.ts
import {
  AudioWaveform,
  Bell,
  Bug,
  Command,
  Construction,
  FileText,
  FileX,
  Folder,
  FolderOpen,
  GalleryVerticalEnd,
  HardDrive,
  HelpCircle,
  ImageIcon,
  LayoutDashboard,
  LayoutGrid,
  Layers,
  ListTodo,
  Lock,
  MessagesSquare,
  Monitor,
  Navigation2,
  Package,
  Palette,
  Rows3,
  ServerOff,
  Settings,
  ShieldCheck,
  Smartphone,
  Sofa,
  Tag,
  UserCog,
  UserX,
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
// 4. ROLE-BASED VISIBILITY
//    Add a `roles` array to any item, sub-item, or group:
//    { title: 'Admin Panel', url: '/admin', icon: Shield, roles: ['admin'] }
//    { title: 'Reports', icon: BarChart, roles: ['admin', 'editor'], items: [...] }
//
//    Then pass the current user role to filterNavByRole() in the sidebar:
//    import { filterNavByRole } from '@/shared/config/nav-types'
//    const filtered = filterNavByRole(sidebarData.navGroups, user.role)
//
// 5. ICONS
//    All icons come from lucide-react (https://lucide.dev/icons).
//    Search any icon name → import it from 'lucide-react'.
//    Example: import { Rocket, Star, Globe } from 'lucide-react'
//
// 6. BADGE
//    Add badge?: string to show a count chip next to the title.
//    { title: 'Chats', url: '/chats', icon: MessagesSquare, badge: '3' }
//
// ─────────────────────────────────────────────────────────────────────────────

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: '',
  },
  teams: [
    {
      name: 'My App',
      logo: Command,
      plan: 'Next.js + shadcn/ui',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: 'Apps',
          url: '/apps',
          icon: Package,
        },
        {
          title: 'Chats',
          url: '/chats',
          badge: '3',
          icon: MessagesSquare,
        }        
      ],
    },
    {
      title: 'Tipos',
      items: [
        {
          title: 'Catálogo de Tipos',
          icon: FolderOpen,
          items: [
            { title: 'Colores',    url: '/typecolors',   icon: Palette },
            { title: 'Documentos', url: '/typedocs',     icon: FileText },
            { title: 'Secciones',  url: '/typesections', icon: LayoutGrid },
            { title: 'Maderas',    url: '/typewoods',    icon: Layers },
          ],
        },
      ],
    },
    {
      title: 'Catálogo',
      items: [
        {
          title: 'Muebles',
          icon: Sofa,
          items: [
            { title: 'Muebles',          url: '/furnitures',     icon: Sofa },
            { title: 'Categorías',       url: '/categories',     icon: Tag },
            { title: 'Imágenes',         url: '/images',         icon: ImageIcon },
            { title: 'Navegaciones',     url: '/navigations',    icon: Navigation2 },
            { title: 'Secciones',        url: '/sections',       icon: Rows3 },
            { title: 'Secc. — Imágenes', url: '/section-images', icon: ImageIcon },
          ],
        },
        {
          title: 'Servidor',
          icon: HardDrive,
          items: [
            { title: 'Imágenes',  url: '/images/storage',  icon: ImageIcon },
            { title: 'Carpetas',  url: '/storage/folders', icon: Folder },
          ],
        },
      ],
    },
    {
      title: 'Administracion',
      items: [
        {
          title: 'Gestion Usuario',
          icon: ShieldCheck,
          items: [
            { title: 'Usuarios',     url: '/users',         icon: UserCog },
            { title: 'Roles',        url: '/roles',         icon: ShieldCheck },
            { title: 'Dispositivos', url: '/user-devices',  icon: Smartphone },
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
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            { title: 'Apariencia',     url: '/settings/appearance',    icon: Palette },
            { title: 'Notificaciones', url: '/settings/notifications', icon: Bell },
            { title: 'Pantalla',       url: '/settings/display',       icon: Monitor },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
        {
          title: 'UI Components',
          url: '/ui-components',
          icon: Package,
        },
      ],
    },
  ],
}
