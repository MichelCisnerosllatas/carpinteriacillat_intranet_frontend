import {
  ArrowUpDown,
  BriefcaseBusiness,
  Building2,
  CheckCheck,
  Download,
  Eye,
  FileChartColumn,
  FileCog,
  FileStack,
  FileText,
  Folder,
  Globe,
  Images,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  Monitor,
  Palette,
  Pencil,
  Plus,
  Power,
  Receipt,
  ShieldCheck,
  Smartphone,
  Tag,
  Trash2,
  Users2,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

/**
 * Orden en que se muestran las acciones de un módulo.
 * Primero las del CRUD; las especiales van después, en el orden del backend.
 */
export const BASE_ACTION_ORDER = ['view', 'create', 'update', 'delete', 'state']

/** Icono de cada acción (para los botones tipo "pastilla"). */
export const ACTION_ICONS: Record<string, LucideIcon> = {
  view: Eye,
  create: Plus,
  update: Pencil,
  delete: Trash2,
  state: Power,
  reorder: ArrowUpDown,
  export: Download,
  pdf: FileText,
  payments: Wallet,
  permissions: KeyRound,
  approve: CheckCheck,
}

/** Datos visuales de cada plataforma (botones grandes de arriba). */
export const PLATFORM_INFO: Record<string, { icon: LucideIcon; title: string; description: string }> = {
  intranet: {
    icon: Monitor,
    title: 'Intranet',
    description: 'Panel web de administración',
  },
  mobile: {
    icon: Smartphone,
    title: 'App móvil',
    description: 'Aplicación en el celular',
  },
}

/**
 * Icono de cada grupo (primer nivel del árbol). La key es la del config del backend.
 * Si un grupo no está aquí, se usa una carpeta.
 */
export const GROUP_ICONS: Record<string, LucideIcon> = {
  // Intranet
  general: LayoutDashboard,
  types: Palette,
  website: Globe,
  documents: FileStack,
  sales_group: Receipt,
  administration: ShieldCheck,
  reports_group: FileChartColumn,
  // Móvil
  tabs: LayoutGrid,
  proforma_hub: FileCog,
  more_catalog: Tag,
  more_types: Palette,
  more_sales: Users2,
  more_company: Building2,
  more_media: Images,
  more_admin: ShieldCheck,
  // Sub-grupos que se repiten
  gallery: BriefcaseBusiness,
}

export const DEFAULT_GROUP_ICON = Folder
