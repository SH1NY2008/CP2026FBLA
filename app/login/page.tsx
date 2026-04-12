'use client'

import { SignInPage } from "@/components/ui/sign-in";
import { auth, googleProvider } from "@/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ensureRecaptchaVerified } from "@/presentation/lib/recaptcha-client";

export default function LoginPage() {
  const router = useRouter();

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const recaptcha = await ensureRecaptchaVerified("login");
    if (!recaptcha.ok) {
      alert(recaptcha.message);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error: any) {
      console.error("Error signing in:", error);
      alert(`Sign-In failed. Please check your credentials and the console for details. Error: ${error.message}`);
    }
  };

  const handleGoogleSignIn = async () => {
    const recaptcha = await ensureRecaptchaVerified("google_login");
    if (!recaptcha.ok) {
      alert(recaptcha.message);
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/");
    } catch (error: any) {
      if (error.code !== 'auth/cancelled-popup-request') {
        console.error('Error signing in with Google:', error);
        alert(`Google Sign-In failed. Please check the console for details. Common issues include not enabling Google Sign-In in the Firebase console or missing environment variables. Error: ${error.message}`);
      }
    }
  };

  const handleResetPassword = () => {
    // For now, just log to the console. A real implementation would redirect to a password reset page.
    console.log("Reset password clicked");
    // router.push("/reset-password");
  };

  const handleCreateAccount = () => {
    router.push("/signup");
  };


  return (
    <SignInPage 
      onSignIn={handleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
    />
  );
}