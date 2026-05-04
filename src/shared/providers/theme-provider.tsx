'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

const THEME_COOKIE_NAME = 'theme'
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year
const DEFAULT_THEME: Theme = 'system'

type ThemeContextType = {
  defaultTheme: Theme
  theme: Theme
  setTheme: (theme: Theme) => void
  resetTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
  return undefined
}

function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`
}

function removeCookie(name: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=/; max-age=0`
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, _setTheme] = useState<Theme>(
    () => (getCookie(THEME_COOKIE_NAME) as Theme) || DEFAULT_THEME
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    _setTheme(newTheme)
    setCookie(THEME_COOKIE_NAME, newTheme, THEME_COOKIE_MAX_AGE)
  }

  const resetTheme = () => {
    _setTheme(DEFAULT_THEME)
    removeCookie(THEME_COOKIE_NAME)
  }

  return (
    <ThemeContext value={{ defaultTheme: DEFAULT_THEME, theme, setTheme, resetTheme }}>
      {children}
    </ThemeContext>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
