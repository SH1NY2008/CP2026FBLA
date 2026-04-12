"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"

const STORAGE_KEY = "app-onboarding-complete"

type FirstVisitChoice = "yes" | "no"

type AppContextValue = {
  completeOnboarding: () => void
  /** null = prompt not answered this session. Not persisted — prompt shows again on every full page load. */
  firstVisitChoice: FirstVisitChoice | null
  /** true after client mount (avoids SSR mismatch). */
  firstVisitHydrated: boolean
  setFirstVisitChoice: (choice: FirstVisitChoice) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [firstVisitChoice, setFirstVisitState] = useState<FirstVisitChoice | null>(null)
  const [firstVisitHydrated, setFirstVisitHydrated] = useState(false)

  useEffect(() => {
    setFirstVisitHydrated(true)
  }, [])

  const completeOnboarding = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1")
    } catch {
      /* ignore */
    }
  }, [])

  const setFirstVisitChoice = useCallback((choice: FirstVisitChoice) => {
    setFirstVisitState(choice)
  }, [])

  return (
    <AppContext.Provider
      value={{
        completeOnboarding,
        firstVisitChoice,
        firstVisitHydrated,
        setFirstVisitChoice,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider")
  }
  return ctx
}
