'use client'

import { SignUpPage } from "@/components/ui/sign-up";
import { auth, googleProvider } from "@/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ensureRecaptchaVerified } from "@/presentation/lib/recaptcha-client";

export default function SignupPage() {
  const router = useRouter();

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const recaptcha = await ensureRecaptchaVerified("signup");
    if (!recaptcha.ok) {
      alert(recaptcha.message);
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error: any) {
      console.error("Error signing up:", error);
      alert(`Sign-Up failed. ${error.message}`);
    }
  };

  const handleGoogleSignUp = async () => {
    const recaptcha = await ensureRecaptchaVerified("google_signup");
    if (!recaptcha.ok) {
      alert(recaptcha.message);
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/");
    } catch (error: any) {
      const silent = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'];
      if (!silent.includes(error?.code)) {
        console.error('Error signing up with Google:', error);
        alert(`Google Sign-Up failed. ${error.message}`);
      }
    }
  };

  const handleSignIn = () => {
    router.push("/login");
  };

  return (
    <SignUpPage
      onSignUp={handleSignUp}
      onGoogleSignUp={handleGoogleSignUp}
      onSignIn={handleSignIn}
    />
  );
}
