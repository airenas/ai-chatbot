import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'

import '@/app/globals.css'
import { Header } from '@/components/header'
import { Providers } from '@/components/providers'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import VersionLogger from './version-logger'
import { AppProvider } from './app-context'

export const metadata = {
  title: {
    default: 'DiPOLIS',
    template: `%s`
  },
  description: 'Policijos pokalbių robotas',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  }
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <base href={process.env.NEXT_PUBLIC_BASE_PATH || '/'} />
      </head>
      <body
        className={cn(
          'font-sans antialiased',
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        <VersionLogger />
        <Toaster position="top-center" />
        <Providers
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex flex-col flex-1 bg-muted/50">{children}</main>
            </div>
          </AppProvider>
          <TailwindIndicator />
        </Providers>
      </body>
    </html>
  )
}
