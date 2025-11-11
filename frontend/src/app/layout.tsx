import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ModeToggle } from '@/components/mode-toggle'

// Use system fonts instead of Google Fonts to avoid download issues
// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GCC Data Extractor',
  description: 'Automated extraction of Global Capability Center data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center">
                <div className="mr-4 flex">
                  <a href="/" className="mr-6 flex items-center space-x-2">
                    <span className="font-bold">GCC Extractor</span>
                  </a>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-2">
                  <ModeToggle />
                </div>
              </div>
            </header>
            <main className="container py-6">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}


