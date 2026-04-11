import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Wraps Firebase's long-lived auth listener so any component can read `user` without
 * duplicating subscribe/cleanup logic. Initial state is null until Firebase resolves the session.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return { user };
}