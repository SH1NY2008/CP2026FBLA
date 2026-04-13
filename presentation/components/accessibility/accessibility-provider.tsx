'use client'

import * as React from 'react'

const STORAGE = {
  voice: 'a11y-voice-navigation',
  voiceMicOnboarding: 'a11y-voice-mic-onboarding',
  highContrast: 'a11y-high-contrast',
  reduceMotion: 'a11y-reduce-motion',
} as const

type AccessibilityState = {
  voiceNavigationEnabled: boolean
  highContrast: boolean
  reduceMotion: boolean
}

type AccessibilityContextValue = AccessibilityState & {
  setVoiceNavigationEnabled: (value: boolean) => void
  setHighContrast: (value: boolean) => void
  setReduceMotion: (value: boolean) => void
  hydrated: boolean
}

const AccessibilityContext = React.createContext<AccessibilityContextValue | null>(null)

function readBool(key: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function writeBool(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, value ? '1' : '0')
  } catch {
    /* ignore quota / private mode */
  }
}

function applyDocumentClasses(state: AccessibilityState) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.toggle('high-contrast', state.highContrast)
  root.classList.toggle('reduce-motion', state.reduceMotion)
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = React.useState(false)
  const [voiceNavigationEnabled, setVoiceNavigationEnabledState] = React.useState(false)
  const [highContrast, setHighContrastState] = React.useState(false)
  const [reduceMotion, setReduceMotionState] = React.useState(false)

  React.useEffect(() => {
    setVoiceNavigationEnabledState(readBool(STORAGE.voice))
    setHighContrastState(readBool(STORAGE.highContrast))
    setReduceMotionState(readBool(STORAGE.reduceMotion))
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!hydrated) return
    applyDocumentClasses({ highContrast, reduceMotion, voiceNavigationEnabled })
  }, [hydrated, highContrast, reduceMotion, voiceNavigationEnabled])

  const setVoiceNavigationEnabled = React.useCallback((value: boolean) => {
    setVoiceNavigationEnabledState(value)
    writeBool(STORAGE.voice, value)
  }, [])

  const setHighContrast = React.useCallback((value: boolean) => {
    setHighContrastState(value)
    writeBool(STORAGE.highContrast, value)
  }, [])

  const setReduceMotion = React.useCallback((value: boolean) => {
    setReduceMotionState(value)
    writeBool(STORAGE.reduceMotion, value)
  }, [])

  const value = React.useMemo<AccessibilityContextValue>(
    () => ({
      voiceNavigationEnabled,
      highContrast,
      reduceMotion,
      setVoiceNavigationEnabled,
      setHighContrast,
      setReduceMotion,
      hydrated,
    }),
    [
      voiceNavigationEnabled,
      highContrast,
      reduceMotion,
      setVoiceNavigationEnabled,
      setHighContrast,
      setReduceMotion,
      hydrated,
    ],
  )

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
}

export function markVoiceMicOnboardingComplete() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE.voiceMicOnboarding, '1')
  } catch {
    /* ignore */
  }
}

export function hasVoiceMicOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(STORAGE.voiceMicOnboarding) === '1'
  } catch {
    return false
  }
}

export function useAccessibility() {
  const ctx = React.useContext(AccessibilityContext)
  if (!ctx) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return ctx
}
