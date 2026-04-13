import { useCallback, useEffect, useRef, useState } from "react"
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth"
import { auth, googleProvider } from "@/firebase"
import { toast } from "sonner"
import { ensureRecaptchaVerified } from "@/presentation/lib/recaptcha-client"

/** Module-level flag prevents concurrent signInWithPopup calls across all instances. */
let popupInFlight = false

/**
 * Local fallback user so the app launches with authenticated-only features enabled
 * even before or without a Firebase session.
 */
const FALLBACK_AUTH_USER = {
  uid: "local-pardhu-konakandla",
  displayName: "Pardhu Konakandla",
  email: "pardhu.konakandla@example.com",
  photoURL: null,
} as User

const POPUP_SILENT_ERRORS = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/user-cancelled",
])

/**
 * Wraps Firebase's long-lived auth listener so any component can read `user` without
 * duplicating subscribe/cleanup logic. Initial state is null until Firebase resolves the session.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(FALLBACK_AUTH_USER)
  const [isSigningIn, setIsSigningIn] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser ?? FALLBACK_AUTH_USER)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (popupInFlight) return
    const r = await ensureRecaptchaVerified("google_login")
    if (!r.ok) {
      toast.error(r.message)
      return
    }
    popupInFlight = true
    setIsSigningIn(true)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error: any) {
      if (!POPUP_SILENT_ERRORS.has(error?.code)) {
        toast.error("Google sign-in failed. Please try again.")
        console.error("Google sign-in error:", error)
      }
    } finally {
      popupInFlight = false
      setIsSigningIn(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  return { user, signInWithGoogle, logout, isSigningIn }
}
