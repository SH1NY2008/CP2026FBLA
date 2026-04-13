'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useAccessibility } from '@/components/accessibility/accessibility-provider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function AccessibilityPage() {
  const {
    voiceNavigationEnabled,
    setVoiceNavigationEnabled,
    highContrast,
    setHighContrast,
    hydrated,
  } = useAccessibility()

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-16 space-y-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Inclusion
          </p>
          <h1 className="text-4xl font-black tracking-tighter mb-3">Accessibility</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Choose options that work for you. Voice navigation must be turned on here before the
            microphone button appears in the corner of the site.
          </p>
        </div>

        <Card data-tour="a11y-voice">
          <CardHeader>
            <CardTitle>Voice navigation</CardTitle>
            <CardDescription>
              When enabled, a microphone button appears at the bottom-right. The first time you
              tap it, we ask if you are new to voice navigation and can show short instructions.
              Then tap once to start listening, say a destination (for example: &quot;home&quot;,
              &quot;browse&quot;, &quot;deals&quot;), and tap again when you are done — your words
              appear above the mic, and we try to open the matching page. Allow the microphone if
              your browser prompts you. Works best in Chrome or Edge on desktop.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <Label htmlFor="voice-nav" className="text-sm font-normal cursor-pointer">
              Show microphone (click to start / click to stop)
            </Label>
            <Switch
              id="voice-nav"
              checked={hydrated && voiceNavigationEnabled}
              onCheckedChange={setVoiceNavigationEnabled}
              disabled={!hydrated}
            />
          </CardContent>
        </Card>

        <Card data-tour="a11y-display">
          <CardHeader>
            <CardTitle>Display</CardTitle>
            <CardDescription>
              High contrast increases separation between text and backgrounds.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="high-contrast" className="text-sm font-normal cursor-pointer">
                High contrast
              </Label>
              <Switch
                id="high-contrast"
                checked={hydrated && highContrast}
                onCheckedChange={setHighContrast}
                disabled={!hydrated}
              />
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          <Link href="/help" className="underline underline-offset-4">
            Help centre
          </Link>{' '}
          ·{' '}
          <Link href="/contact" className="underline underline-offset-4">
            Contact
          </Link>
        </p>
      </div>
      <Footer />
    </main>
  )
}
