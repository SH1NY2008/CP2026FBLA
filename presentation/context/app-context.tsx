"use client"

import React, { createContext, useCallback, useContext } from "react"

const STORAGE_KEY = "app-onboarding-complete"

type AppContextValue = {
  completeOnboarding: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const completeOnboarding = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1")
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <AppContext.Provider value={{ completeOnboarding }}>{children}</AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider")
  }
  return ctx
}
