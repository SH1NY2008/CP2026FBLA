import { useCallback, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth"
import { auth, googleProvider } from "@/firebase"

/**
 * Wraps Firebase's long-lived auth listener so any component can read `user` without
 * duplicating subscribe/cleanup logic. Initial state is null until Firebase resolves the session.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider)
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  return { user, signInWithGoogle, logout }
}
