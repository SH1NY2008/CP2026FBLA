'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase";
import { useRouter } from "next/navigation";
import { validateEmailSyntax } from "@/lib/validation";
import { ensureRecaptchaVerified } from "@/presentation/lib/recaptcha-client";

export function LoginForm({ 
  className, 
  ...props 
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const em = validateEmailSyntax(email);
    if (em) {
      setError(em);
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    const recaptcha = await ensureRecaptchaVerified('login');
    if (!recaptcha.ok) {
      setError(recaptcha.message);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push('/deals');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up.');
      } else {
        setError('An unknown error occurred. Please try again.');
        console.error('Error signing in:', error);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const recaptcha = await ensureRecaptchaVerified('google_login');
    if (!recaptcha.ok) {
      setError(recaptcha.message);
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/deals');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };


  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleEmailLogin} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field>
          <Button type="submit">Login</Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <Button variant="outline" type="button" onClick={handleGoogleSignIn}>
            Login with Google
          </Button>
        </Field>
        <FieldDescription className="text-center">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="underline underline-offset-4">
            Sign up
          </a>
        </FieldDescription>
        {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
          <p className="text-center text-[10px] text-muted-foreground leading-relaxed">
            This site is protected by reCAPTCHA and the Google{' '}
            <a href="https://policies.google.com/privacy" className="underline underline-offset-2" target="_blank" rel="noreferrer">Privacy Policy</a>
            {' '}and{' '}
            <a href="https://policies.google.com/terms" className="underline underline-offset-2" target="_blank" rel="noreferrer">Terms of Service</a>
            {' '}apply.
          </p>
        )}
      </FieldGroup>
    </form>
  )
}