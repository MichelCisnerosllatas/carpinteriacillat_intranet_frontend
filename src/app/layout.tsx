// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/shared/ui/sonner'
import { getLayoutScript } from '@/shared/lib/layout-script'
import NextTopLoader from 'nextjs-toploader'
import '@/shared/styles/globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: 'Admin Dashboard', template: '%s | Admin Dashboard' },
  description: 'Admin dashboard built with Next.js 16 and shadcn/ui',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Inline script that runs BEFORE React hydrates.
          Reads localStorage and applies sidebar variant/collapsible as data-attributes
          on <html>, preventing the layout flash on page reload.
          Same technique used by next-themes for dark mode.
          dangerouslySetInnerHTML is required — no external script, no eval.
        */}
        <script
          dangerouslySetInnerHTML={{ __html: getLayoutScript() }}
        />
      </head>
      <body className={`${inter.variable} font-inter antialiased`}>
        <NextTopLoader showSpinner={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
