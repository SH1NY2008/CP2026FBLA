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
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase";
import { useRouter } from "next/navigation";
import { validateEmailSyntax, validatePasswordSignup } from "@/lib/validation";
import { ensureRecaptchaVerified } from "@/presentation/lib/recaptcha-client";

export function SignUpForm({ 
  className, 
  ...props 
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const router = useRouter();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const em = validateEmailSyntax(email);
    if (em) {
      setFormError(em);
      return;
    }
    const pw = validatePasswordSignup(password);
    if (pw) {
      setFormError(pw);
      return;
    }
    const recaptcha = await ensureRecaptchaVerified('signup');
    if (!recaptcha.ok) {
      setFormError(recaptcha.message);
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      router.push('/deals');
    } catch (error) {
      console.error('Error signing up:', error);
      setFormError('Could not create account. That email may already be in use.');
    }
  };

  const handleGoogleSignUp = async () => {
    const recaptcha = await ensureRecaptchaVerified('google_signup');
    if (!recaptcha.ok) {
      setFormError(recaptcha.message);
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/deals');
    } catch (error: any) {
      const silent = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'];
      if (!silent.includes(error?.code)) {
        console.error('Error signing up with Google:', error);
        setFormError('Google sign-up failed. Please try again.');
      }
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleEmailSignUp} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to create your account
          </p>
          {formError && (
            <p className="text-sm text-destructive font-medium w-full" role="alert">
              {formError}
            </p>
          )}
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field>
          <Button type="submit">Sign Up</Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button variant="outline" type="button" onClick={handleGoogleSignUp}>
            Sign up with Google
          </Button>
        </Field>
        <FieldDescription className="text-center">
          Already have an account?{" "}
          <a href="/login" className="underline underline-offset-4">
            Login
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