/**
 * Single Firebase client for the whole app: auth (email + Google), Firestore data,
 * and Storage for anything upload-related. All secrets come from NEXT_PUBLIC_* env vars
 * so Next can bundle them for the browser — fine for Firebase public keys, not for server-only secrets.
 */
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

// Analytics touches `window` — must not run during SSR or the build will complain.
// Skip in development to avoid "Failed to fetch measurement ID" noise from Firebase
// trying to dynamically resolve the ID over the network.
const analytics =
  typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
    ? getAnalytics(app)
    : null;

export const auth = getAuth(app);
/** Firestore instance — collection names and document shapes live in `data/firestore/schema.ts`. */
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();