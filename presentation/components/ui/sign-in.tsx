
 import React, { useState } from 'react';
 import { Eye, EyeOff } from 'lucide-react';
 import Link from "next/link";
 import { ShadowOverlay } from '@/components/ui/shadow-overlay';
 
 // --- HELPER COMPONENTS (ICONS) --- 
 
 const GoogleIcon = () => ( 
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48"> 
         <path fill="#9ca3af" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" /> 
        <path fill="#6b7280" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" /> 
        <path fill="#4b5563" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" /> 
        <path fill="#374151" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" /> 
     </svg> 
 ); 
 
 
 // --- TYPE DEFINITIONS --- 
 
 export interface Testimonial { 
   avatarSrc: string; 
   name: string; 
   handle: string; 
   text: string; 
 } 
 
 interface SignInPageProps { 
   title?: React.ReactNode; 
   description?: React.ReactNode; 
   heroImageSrc?: string; 
   testimonials?: Testimonial[]; 
   onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void; 
   onGoogleSignIn?: () => void; 
   onResetPassword?: () => void; 
   onCreateAccount?: () => void; 
 } 
 
 // --- SUB-COMPONENTS --- 
 
 const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => ( 
  <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm transition-colors focus-within:border-white/40 focus-within:bg-white/15"> 
    {children} 
  </div> 
);
 
 const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => ( 
   <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-card/40 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/10 p-5 w-64`}> 
     <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" /> 
     <div className="text-sm leading-snug"> 
       <p className="flex items-center gap-1 font-medium">{testimonial.name}</p> 
       <p className="text-muted-foreground">{testimonial.handle}</p> 
       <p className="mt-1 text-foreground/80">{testimonial.text}</p> 
     </div> 
   </div> 
 ); 
 
 // --- MAIN COMPONENT --- 
 
export const SignInPage: React.FC<SignInPageProps> = ({ 
  title = "Welcome back",
  description = "Access your account and continue your journey with us", 
  heroImageSrc, 
  testimonials = [], 
  onSignIn, 
  onGoogleSignIn, 
  onResetPassword, 
  onCreateAccount, 
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
      {/* Left column: sign-in form */} 
      <section className="relative z-10 flex-1 flex items-center justify-center p-8"> 
        <div className="w-full max-w-md bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"> 
          <div className="flex flex-col gap-6"> 
            <div>
              <h1 className="animate-element animate-delay-100 text-4xl font-bold text-white tracking-tight leading-tight">{title}</h1>
              <p className="animate-element animate-delay-200 text-white/60 text-sm mt-2">{description}</p>
            </div>

            <form className="space-y-5" onSubmit={onSignIn}> 
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
                    <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-white placeholder:text-white/40" /> 
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center"> 
                      {showPassword ? <EyeOff className="w-5 h-5 text-white/50 hover:text-white transition-colors" /> : <Eye className="w-5 h-5 text-white/50 hover:text-white transition-colors" />} 
                    </button> 
                  </div> 
                </GlassInputWrapper> 
              </div> 

              <div className="animate-element animate-delay-500 flex items-center justify-between text-sm"> 
                <label className="flex items-center gap-3 cursor-pointer"> 
                  <input type="checkbox" name="rememberMe" className="custom-checkbox" /> 
                  <span className="text-white/60">Keep me signed in</span> 
                </label> 
                <a href="#" onClick={(e) => { e.preventDefault(); onResetPassword?.(); }} className="text-sm text-white/60 hover:text-white transition-colors">Reset password</a> 
              </div> 

              <button type="submit" className="animate-element animate-delay-600 w-full bg-white text-black text-sm font-semibold py-3 rounded-2xl hover:bg-white/90 transition-all">Sign in</button> 
            </form> 

            <div className="animate-element animate-delay-700 flex items-center gap-3 text-xs text-white/40">
              <div className="flex-1 h-px bg-white/15" />
              Or continue with
              <div className="flex-1 h-px bg-white/15" />
            </div>

            <button onClick={onGoogleSignIn} className="animate-element animate-delay-800 flex items-center justify-center gap-3 w-full bg-white/10 border border-white/20 text-sm font-medium text-white py-3 rounded-2xl hover:bg-white/15 transition-all"> 
              <GoogleIcon /> 
              <span>Sign in with Google</span> 
            </button> 

            <div className="animate-element animate-delay-900 text-center text-sm"> 
              <span className="text-white/50">Don't have an account? </span> 
              <a href="#" onClick={(e) => { e.preventDefault(); onCreateAccount?.(); }} className="text-white font-medium hover:underline underline-offset-4 transition-colors">Create a new account</a> 
            </div> 
          </div> 
        </div> 
      </section>
 
       {/* Right column: testimonials */} 
       {heroImageSrc && ( 
         <section className="hidden md:flex flex-1 relative items-center justify-center bg-zinc-900 p-8"> 
           <img src={heroImageSrc} className="absolute inset-0 h-full w-full object-cover opacity-20" alt="Hero background" /> 
           <div className="relative flex flex-col items-center justify-center gap-5"> 
             {testimonials.map((testimonial, i) => ( 
               <TestimonialCard key={i} testimonial={testimonial} delay={`animate-delay-${1000 + i * 200}`} /> 
             ))} 
           </div> 
         </section> 
       )} 
     </div> 
   ); 
 };
