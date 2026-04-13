'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Mic } from 'lucide-react'
import { toast } from 'sonner'
import {
  hasVoiceMicOnboardingCompleted,
  markVoiceMicOnboardingComplete,
  useAccessibility,
} from '@/components/accessibility/accessibility-provider'
import { matchVoiceRoute } from '@/lib/voice-routes'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type RecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((ev: Event) => void) | null
  onerror: ((ev: Event) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

function getSpeechRecognitionCtor(): (new () => RecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: new () => RecognitionLike
    webkitSpeechRecognition?: new () => RecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/** Concatenate all current hypothesis text from a SpeechRecognition result event. */
function fullTranscriptFromEvent(event: Event): string {
  const results = (event as unknown as { results: ArrayLike<{ 0: { transcript: string } }> }).results
  let out = ''
  for (let i = 0; i < results.length; i++) {
    const line = results[i]
    out += line[0]?.transcript ?? ''
  }
  return out
}

type IntroStep = 'ask' | 'instructions'

export function VoiceNavigationFab() {
  const router = useRouter()
  const { voiceNavigationEnabled, hydrated } = useAccessibility()
  const [listening, setListening] = React.useState(false)
  const [liveTranscript, setLiveTranscript] = React.useState('')
  const [supported, setSupported] = React.useState(true)
  const [introOpen, setIntroOpen] = React.useState(false)
  const [introStep, setIntroStep] = React.useState<IntroStep>('ask')
  const [onboardingDone, setOnboardingDone] = React.useState(false)
  const recognitionRef = React.useRef<RecognitionLike | null>(null)
  const transcriptRef = React.useRef('')
  /** True when the user pressed the button to stop — used for empty-transcript messaging. */
  const userStoppedRef = React.useRef(false)
  /** Prevents stale `onend` from an old session from running navigation after a new session starts. */
  const sessionGenRef = React.useRef(0)
  /** Avoid duplicate navigation when a command is matched before `onend` fires. */
  const autoNavigatedRef = React.useRef(false)

  React.useEffect(() => {
    setSupported(!!getSpeechRecognitionCtor())
    setOnboardingDone(hasVoiceMicOnboardingCompleted())
  }, [])

  const tearDownRecognition = React.useCallback(() => {
    const r = recognitionRef.current
    if (r) {
      try {
        r.stop()
      } catch {
        try {
          r.abort()
        } catch {
          /* ignore */
        }
      }
    }
    recognitionRef.current = null
  }, [])

  const stopFromUser = React.useCallback(() => {
    userStoppedRef.current = true
    tearDownRecognition()
  }, [tearDownRecognition])

  const startListening = React.useCallback(() => {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      toast.error('Voice navigation needs a secure connection (https).')
      return
    }

    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      toast.error('Voice navigation is not supported in this browser. Try Chrome or Edge.')
      return
    }

    sessionGenRef.current += 1
    const sessionGen = sessionGenRef.current

    tearDownRecognition()
    userStoppedRef.current = false
    autoNavigatedRef.current = false
    transcriptRef.current = ''
    setLiveTranscript('')

    const recognition = new Ctor()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: Event) => {
      const text = fullTranscriptFromEvent(event)
      transcriptRef.current = text
      setLiveTranscript(text.trim())

      if (autoNavigatedRef.current) {
        return
      }

      const path = matchVoiceRoute(text)
      if (!path) {
        return
      }

      autoNavigatedRef.current = true
      setListening(false)
      recognitionRef.current = null
      try {
        recognition.stop()
      } catch {
        try {
          recognition.abort()
        } catch {
          /* ignore */
        }
      }
      router.push(path)
      toast.success(`Going to ${path === '/' ? 'home' : path}`)
    }

    recognition.onerror = (event: Event) => {
      const err = (event as unknown as { error?: string }).error
      if (err === 'aborted') {
        return
      }
      setListening(false)
      if (err === 'not-allowed') {
        toast.error(
          'Microphone access was blocked. Allow the microphone for this site in your browser settings, then try again.',
        )
      } else if (err === 'network') {
        toast.error('Voice service unreachable. Check your network and try again.')
      } else if (err !== 'no-speech') {
        toast.message('Voice input paused. Tap the mic to try again.')
      }
    }

    recognition.onend = () => {
      if (sessionGen !== sessionGenRef.current) {
        return
      }

      setListening(false)
      recognitionRef.current = null

      const text = transcriptRef.current.trim()
      const explicitStop = userStoppedRef.current
      const autoNavigated = autoNavigatedRef.current
      userStoppedRef.current = false
      autoNavigatedRef.current = false
      transcriptRef.current = ''
      setLiveTranscript('')

      if (autoNavigated) {
        return
      }

      if (text) {
        const path = matchVoiceRoute(text)
        if (path) {
          router.push(path)
          toast.success(`Going to ${path === '/' ? 'home' : path}`)
        } else {
          toast.message('No matching page. Try: home, browse, deals, help, …')
        }
        return
      }

      if (explicitStop) {
        toast.message('No speech detected. Click the mic and try again.')
      }
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      setListening(true)
    } catch {
      toast.error('Could not start microphone. Check permissions and try again.')
      setListening(false)
    }
  }, [router, tearDownRecognition])

  React.useEffect(() => {
    return () => {
      userStoppedRef.current = false
      tearDownRecognition()
    }
  }, [tearDownRecognition])

  const openIntroIfNeeded = React.useCallback(() => {
    if (onboardingDone || hasVoiceMicOnboardingCompleted()) {
      return false
    }
    setIntroStep('ask')
    setIntroOpen(true)
    return true
  }, [onboardingDone])

  const finishOnboardingAndListen = React.useCallback(() => {
    markVoiceMicOnboardingComplete()
    setOnboardingDone(true)
    setIntroOpen(false)
    setIntroStep('ask')
    startListening()
  }, [startListening])

  const handleIntroNotFirstTime = React.useCallback(() => {
    markVoiceMicOnboardingComplete()
    setOnboardingDone(true)
    setIntroOpen(false)
    setIntroStep('ask')
    startListening()
  }, [startListening])

  const toggle = React.useCallback(() => {
    if (!supported) {
      toast.error('Voice navigation is not supported in this browser. Try Chrome or Edge.')
      return
    }
    if (listening) {
      stopFromUser()
    } else {
      if (openIntroIfNeeded()) {
        return
      }
      startListening()
    }
  }, [listening, openIntroIfNeeded, startListening, stopFromUser, supported])

  if (!hydrated || !voiceNavigationEnabled) return null

  const showTranscript = liveTranscript.length > 0

  return (
    <>
      <Dialog
        open={introOpen}
        onOpenChange={(open) => {
          setIntroOpen(open)
          if (!open) {
            setIntroStep('ask')
          }
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton>
          {introStep === 'ask' ? (
            <>
              <DialogHeader>
                <DialogTitle>Voice navigation</DialogTitle>
                <DialogDescription>
                  Is this your first time using the microphone to move around the site?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
                <Button type="button" variant="outline" onClick={() => setIntroStep('instructions')}>
                  Yes, show me how
                </Button>
                <Button type="button" onClick={handleIntroNotFirstTime}>
                  No, I&apos;ve used it before
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>How voice navigation works</DialogTitle>
                <DialogDescription id="voice-intro-detail" className="text-left space-y-3">
                  <span className="block">
                    <strong className="text-foreground font-medium">1.</strong> Tap the round mic
                    button once. If your browser asks, allow microphone access for this site.
                  </span>
                  <span className="block">
                    <strong className="text-foreground font-medium">2.</strong> Say where you want
                    to go (for example: &quot;home&quot;, &quot;browse&quot;, &quot;deals&quot;,
                    &quot;help&quot;). Your words show above the button while you speak.
                  </span>
                  <span className="block">
                    <strong className="text-foreground font-medium">3.</strong> Tap the mic again
                    when you are done — or wait; when listening stops, we use what we heard to open
                    a page if it matches.
                  </span>
                  <span className="block text-xs">
                    Works best in Chrome or Edge on desktop. Use the Accessibility page to turn this
                    feature off anytime.
                  </span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" onClick={finishOnboardingAndListen}>
                  Got it — start listening
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="fixed z-40 bottom-24 right-6 flex flex-col items-end gap-2 pointer-events-none max-w-[min(100vw-3rem,320px)]">
        <div
          className={cn(
            'w-full rounded-lg border border-border bg-background/95 px-3 py-2 shadow-lg pointer-events-none',
            listening || showTranscript ? 'text-foreground' : 'sr-only',
          )}
          aria-live="polite"
          aria-atomic="true"
        >
          {listening && (
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary mb-1">
              Listening — speak now
            </p>
          )}
          {showTranscript && (
            <p className="text-sm leading-snug break-words">{liveTranscript}</p>
          )}
          {!listening && !showTranscript && (
            <span>Voice navigation off. Click the mic to start.</span>
          )}
        </div>

        <Button
          type="button"
          size="icon"
          variant={listening ? 'default' : 'secondary'}
          disabled={!supported}
          onClick={toggle}
          className={cn(
            'pointer-events-auto h-14 w-14 rounded-full shadow-lg border border-border',
            listening && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
          )}
          aria-pressed={listening}
          aria-label={
            listening
              ? 'Stop listening and go to page if recognized'
              : 'Start voice navigation — speak a page name, then tap again or wait'
          }
          title={supported ? 'Tap to start or stop listening' : 'Not supported in this browser'}
        >
          <Mic
            className={cn('h-7 w-7', listening ? 'text-primary-foreground' : 'text-foreground')}
            aria-hidden
          />
        </Button>
      </div>
    </>
  )
}
