import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { SplashScreenProvider } from '@/components/ui/splash-screen-provider'
import { Toaster } from '@/components/ui/sonner'
import { AccessibilityProvider } from '@/components/accessibility/accessibility-provider'
import { VoiceNavigationFab } from '@/components/accessibility/voice-navigation-fab'
import { AppProvider } from '@/presentation/context/app-context'
import { AppGuidedTour } from '@/components/app-guided-tour'
import { FirstVisitPrompt } from '@/components/first-visit-prompt'

// Fonts are wired up for future use (e.g. mono for code blocks); body uses Tailwind's font-sans stack.
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Byte-Sized Business Boost | Support Local Small Businesses',
  description: 'Discover local gems, unlock exclusive deals, and support the heartbeat of your community. Find restaurants, shops, services, and entertainment venues near you.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  /* Dark theme by default; suppressHydrationWarning keeps theme/extension mismatches out of the console. */
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <SplashScreenProvider>
          <AppProvider>
            <AccessibilityProvider>
              {children}
              <FirstVisitPrompt />
              <AppGuidedTour />
              <VoiceNavigationFab />
            </AccessibilityProvider>
          </AppProvider>
        </SplashScreenProvider>
        {/* Sonner: toast notifications from explore, trip planner, deals, etc. */}
        <Toaster richColors position="bottom-right" />
        {/* Vercel Analytics only in prod so local dev traffic doesn't skew charts */}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
