'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Mic, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAccessibility } from '@/components/accessibility/accessibility-provider'
import { matchVoiceRoute } from '@/lib/voice-routes'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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

export function VoiceNavigationFab() {
  const router = useRouter()
  const { voiceNavigationEnabled, hydrated } = useAccessibility()
  const [listening, setListening] = React.useState(false)
  const [liveTranscript, setLiveTranscript] = React.useState('')
  const [supported, setSupported] = React.useState(true)
  const recognitionRef = React.useRef<RecognitionLike | null>(null)
  const transcriptRef = React.useRef('')
  /** True when the user pressed the button to stop — we should try navigation on `onend`. */
  const userStoppedRef = React.useRef(false)
  /** Prevents stale `onend` from an old session from running navigation after a new session starts. */
  const sessionGenRef = React.useRef(0)

  React.useEffect(() => {
    setSupported(!!getSpeechRecognitionCtor())
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
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      toast.error('Voice navigation is not supported in this browser. Try Chrome or Edge.')
      return
    }

    sessionGenRef.current += 1
    const sessionGen = sessionGenRef.current

    tearDownRecognition()
    userStoppedRef.current = false
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
    }

    recognition.onerror = (event: Event) => {
      const err = (event as unknown as { error?: string }).error
      if (err === 'aborted') {
        return
      }
      setListening(false)
      transcriptRef.current = ''
      setLiveTranscript('')
      recognitionRef.current = null
      if (err === 'not-allowed') {
        toast.error('Microphone permission denied.')
      } else if (err !== 'no-speech') {
        toast.message('Voice input ended.')
      }
    }

    recognition.onend = () => {
      if (sessionGen !== sessionGenRef.current) {
        return
      }

      setListening(false)
      recognitionRef.current = null

      const text = transcriptRef.current.trim()
      const shouldTryNavigate = userStoppedRef.current
      userStoppedRef.current = false
      transcriptRef.current = ''
      setLiveTranscript('')

      if (!shouldTryNavigate) {
        return
      }

      if (!text) {
        toast.message('No speech detected. Click the mic and try again.')
        return
      }

      const path = matchVoiceRoute(text)
      if (path) {
        router.push(path)
        toast.success(`Going to ${path === '/' ? 'home' : path}`)
      } else {
        toast.message('No matching page. Try: home, browse, deals, help, …')
      }
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      setListening(true)
    } catch {
      toast.error('Could not start microphone. Check permissions.')
      setListening(false)
    }
  }, [router, tearDownRecognition])

  React.useEffect(() => {
    return () => {
      userStoppedRef.current = false
      tearDownRecognition()
    }
  }, [tearDownRecognition])

  const toggle = React.useCallback(() => {
    if (!supported) {
      toast.error('Voice navigation is not supported in this browser. Try Chrome or Edge.')
      return
    }
    if (listening) {
      stopFromUser()
    } else {
      startListening()
    }
  }, [listening, startListening, stopFromUser, supported])

  if (!hydrated || !voiceNavigationEnabled) return null

  const showTranscript = liveTranscript.length > 0

  return (
    <div className="fixed z-[95] bottom-24 right-6 flex flex-col items-end gap-2 pointer-events-none max-w-[min(100vw-3rem,320px)]">
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
            : 'Start voice navigation — click again when finished speaking'
        }
        title={supported ? 'Click to start or stop listening' : 'Not supported in this browser'}
      >
        <span className="relative flex h-9 w-9 items-center justify-center" aria-hidden>
          <Mic
            className={cn('h-7 w-7', listening ? 'text-primary-foreground' : 'text-foreground')}
          />
          {!listening && (
            <X className="absolute inset-0 m-auto h-7 w-7 text-destructive stroke-[2.75] drop-shadow-sm pointer-events-none" />
          )}
        </span>
      </Button>
    </div>
  )
}
