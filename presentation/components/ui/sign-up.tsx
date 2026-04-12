
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Link from "next/link";
import { ShadowOverlay } from '@/components/ui/shadow-overlay';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#9ca3af" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#6b7280" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4b5563" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#374151" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
);

interface SignUpPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  onSignUp?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignUp?: () => void;
  onSignIn?: () => void;
}

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm transition-colors focus-within:border-white/40 focus-within:bg-white/15">
    {children}
  </div>
);

export const SignUpPage: React.FC<SignUpPageProps> = ({
  title = "Create account",
  description = "Sign up and start discovering great places near you",
  heroImageSrc,
  onSignUp,
  onGoogleSignUp,
  onSignIn,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row w-[100dvw] relative">
      <ShadowOverlay
        color="rgba(100, 100, 140, 1)"
        animation={{ scale: 40, speed: 30 }}
        noise={{ opacity: 0.4, scale: 1.5 }}
      />
      <Link href="/" className="absolute top-8 left-8 font-black text-xl text-white tracking-tight z-20">
        BOOST
      </Link>

      {/* Left column: sign-up form */}
      <section className="relative z-10 flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="animate-element animate-delay-100 text-4xl font-bold text-white tracking-tight leading-tight">{title}</h1>
              <p className="animate-element animate-delay-200 text-white/60 text-sm mt-2">{description}</p>
            </div>

            <form className="space-y-5" onSubmit={onSignUp}>
              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-white/70 mb-1 block">Email Address</label>
                <GlassInputWrapper>
                  <input name="email" type="email" placeholder="Enter your email address" className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-white placeholder:text-white/40" />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-white/70 mb-1 block">Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-white placeholder:text-white/40" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                      {showPassword ? <EyeOff className="w-5 h-5 text-white/50 hover:text-white transition-colors" /> : <Eye className="w-5 h-5 text-white/50 hover:text-white transition-colors" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <button type="submit" className="animate-element animate-delay-500 w-full bg-white text-black text-sm font-semibold py-3 rounded-2xl hover:bg-white/90 transition-all">Create account</button>
            </form>

            <div className="animate-element animate-delay-600 flex items-center gap-3 text-xs text-white/40">
              <div className="flex-1 h-px bg-white/15" />
              Or continue with
              <div className="flex-1 h-px bg-white/15" />
            </div>

            <button onClick={onGoogleSignUp} className="animate-element animate-delay-700 flex items-center justify-center gap-3 w-full bg-white/10 border border-white/20 text-sm font-medium text-white py-3 rounded-2xl hover:bg-white/15 transition-all">
              <GoogleIcon />
              <span>Sign up with Google</span>
            </button>

            <div className="animate-element animate-delay-800 text-center text-sm">
              <span className="text-white/50">Already have an account? </span>
              <a href="#" onClick={(e) => { e.preventDefault(); onSignIn?.(); }} className="text-white font-medium hover:underline underline-offset-4 transition-colors">Sign in</a>
            </div>

            {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
              <p className="text-[10px] text-white/45 text-center leading-relaxed px-1">
                This site is protected by reCAPTCHA and the Google{' '}
                <a href="https://policies.google.com/privacy" className="underline hover:text-white/80" target="_blank" rel="noreferrer">Privacy Policy</a>
                {' '}and{' '}
                <a href="https://policies.google.com/terms" className="underline hover:text-white/80" target="_blank" rel="noreferrer">Terms of Service</a>
                {' '}apply.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Right column: hero image */}
      {heroImageSrc && (
        <section className="hidden md:flex flex-1 relative items-center justify-center bg-zinc-900 p-8">
          <img src={heroImageSrc} className="absolute inset-0 h-full w-full object-cover opacity-20" alt="Hero background" />
        </section>
      )}
    </div>
  );
};
