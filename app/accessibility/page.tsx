'use client'

import * as React from 'react'
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
import { Button } from '@/components/ui/button'
import { ExternalLink, Volume2 } from 'lucide-react'

export default function AccessibilityPage() {
  const {
    voiceNavigationEnabled,
    setVoiceNavigationEnabled,
    highContrast,
    setHighContrast,
    reduceMotion,
    setReduceMotion,
    hydrated,
  } = useAccessibility()

  const contentRef = React.useRef<HTMLDivElement>(null)
  const [reading, setReading] = React.useState(false)

  const readPageAloud = React.useCallback(() => {
    const root = contentRef.current
    if (!root) return
    window.speechSynthesis.cancel()
    const text = root.innerText.replace(/\s+/g, ' ').trim()
    if (!text) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.onend = () => setReading(false)
    u.onerror = () => setReading(false)
    setReading(true)
    window.speechSynthesis.speak(u)
  }, [])

  const stopReadAloud = React.useCallback(() => {
    window.speechSynthesis.cancel()
    setReading(false)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div
        ref={contentRef}
        id="accessibility-page-content"
        className="max-w-2xl mx-auto px-6 pt-28 pb-16 space-y-10"
      >
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

        <Card>
          <CardHeader>
            <CardTitle>Voice navigation</CardTitle>
            <CardDescription>
              When enabled, a microphone button appears at the bottom-right. Click once to start
              listening, speak a destination (for example: &quot;home&quot;, &quot;browse&quot;,
              &quot;deals&quot;), then click again to stop — your words appear above the mic, and we
              try to open the matching page. Works best in Chrome or Edge.
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

        <Card>
          <CardHeader>
            <CardTitle>Display</CardTitle>
            <CardDescription>
              High contrast increases separation between text and backgrounds. Reduce motion limits
              animations for people sensitive to movement.
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
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="reduce-motion" className="text-sm font-normal cursor-pointer">
                Reduce motion
              </Label>
              <Switch
                id="reduce-motion"
                checked={hydrated && reduceMotion}
                onCheckedChange={setReduceMotion}
                disabled={!hydrated}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Screen readers</CardTitle>
            <CardDescription>
              This site works with the screen reader built into your device — we don&apos;t replace
              it. Turn it on in system settings and use normal gestures or keyboard shortcuts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              <span className="text-foreground font-medium">Apple:</span>{' '}
              <a
                href="https://support.apple.com/guide/voiceover/turn-voiceover-on-or-off-vo2682/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 inline-flex items-center gap-1"
              >
                VoiceOver on Mac
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
              </a>
              {' · '}
              <a
                href="https://support.apple.com/guide/iphone/turn-on-and-practice-voiceover-iph3e2e415f/ios"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 inline-flex items-center gap-1"
              >
                VoiceOver on iPhone
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
              </a>
            </p>
            <p>
              <span className="text-foreground font-medium">Windows:</span>{' '}
              <a
                href="https://www.nvaccess.org/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 inline-flex items-center gap-1"
              >
                NVDA (free)
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
              </a>
              {' · '}
              <a
                href="https://support.microsoft.com/windows/complete-guide-to-narrator-e4397a0d-8534-b404-a5b3-7da6355c983f"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 inline-flex items-center gap-1"
              >
                Narrator
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
              </a>
            </p>
            <p>
              <span className="text-foreground font-medium">Android:</span>{' '}
              <a
                href="https://support.google.com/accessibility/android/answer/6007100"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 inline-flex items-center gap-1"
              >
                TalkBack
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
              </a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Read this page aloud</CardTitle>
            <CardDescription>
              Uses your browser&apos;s text-to-speech. This is not a full screen reader, but it can
              help hear the content on this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={readPageAloud}
              disabled={reading}
              className="gap-2"
            >
              <Volume2 className="h-4 w-4" aria-hidden />
              Read aloud
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={stopReadAloud}
              disabled={!reading}
            >
              Stop
            </Button>
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
