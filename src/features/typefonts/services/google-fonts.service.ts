export type GoogleFontItem = {
  family: string
  category: string
  variants: string[]
}

type GoogleFontsApiResponse = {
  kind: string
  items: GoogleFontItem[]
}

const GOOGLE_FONTS_API_URL = 'https://www.googleapis.com/webfonts/v1/webfonts'

export const googleFontsService = {
  getList: async (): Promise<GoogleFontItem[]> => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY
    if (!apiKey) {
      throw new Error('Falta configurar NEXT_PUBLIC_GOOGLE_FONTS_API_KEY en el archivo .env')
    }
    const res = await fetch(`${GOOGLE_FONTS_API_URL}?key=${apiKey}&sort=popularity`)
    if (!res.ok) {
      throw new Error('No se pudo cargar la lista de tipografías de Google Fonts')
    }
    const data: GoogleFontsApiResponse = await res.json()
    return data.items
  },
}
