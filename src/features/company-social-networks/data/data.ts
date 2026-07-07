import { Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// lucide-react ya no incluye íconos de marcas (Facebook/Instagram/etc.) — se usa un
// ícono genérico para todas las redes sociales.
export const getSocialNetworkIcon = (_name: string): LucideIcon => Globe

export const SOCIAL_NETWORK_NAME_SUGGESTIONS = ['Facebook', 'Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'WhatsApp Business']
