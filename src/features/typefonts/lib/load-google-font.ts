const loadedFonts = new Set<string>()

export function loadGoogleFont(family: string, weights: string[] = ['400', '700']) {
  if (!family || typeof document === 'undefined' || loadedFonts.has(family)) return

  const id = `google-font-${family.replace(/\s+/g, '-')}`
  if (document.getElementById(id)) {
    loadedFonts.add(family)
    return
  }

  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weights.join(';')}&display=swap`
  document.head.appendChild(link)
  loadedFonts.add(family)
}

export function fontFamilyStyle(family: string | null | undefined) {
  return family ? { fontFamily: `'${family}', sans-serif` } : undefined
}
