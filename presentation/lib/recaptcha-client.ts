'use client';

/**
 * reCAPTCHA v3 — invisible, score-based.
 * If NEXT_PUBLIC_RECAPTCHA_SITE_KEY is unset, verification is skipped (local dev without keys).
 */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

/** Single flight: load script and wait until grecaptcha.ready() has fired */
let scriptReady: Promise<void> | null = null;

function loadRecaptcha(siteKey: string): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('reCAPTCHA runs in the browser only'));
  }

  if (scriptReady) return scriptReady;

  scriptReady = (async () => {
    if (window.grecaptcha?.ready) {
      await new Promise<void>((resolve) => {
        window.grecaptcha!.ready(() => resolve());
      });
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="google.com/recaptcha/api.js"]',
    );
    if (existing) {
      await new Promise<void>((resolve, reject) => {
        const deadline = Date.now() + 20000;
        const id = setInterval(() => {
          if (window.grecaptcha?.ready) {
            clearInterval(id);
            window.grecaptcha!.ready(() => resolve());
          } else if (Date.now() > deadline) {
            clearInterval(id);
            reject(new Error('reCAPTCHA script present but API did not initialize'));
          }
        }, 50);
      });
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
      s.async = true;
      s.onload = () => {
        if (!window.grecaptcha?.ready) {
          reject(new Error('reCAPTCHA loaded without grecaptcha API'));
          return;
        }
        window.grecaptcha.ready(() => resolve());
      };
      s.onerror = () => reject(new Error('Failed to load reCAPTCHA script'));
      document.head.appendChild(s);
    });
  })().catch((e) => {
    scriptReady = null;
    throw e;
  });

  return scriptReady;
}

export async function getRecaptchaToken(siteKey: string, action: string): Promise<string | null> {
  try {
    await loadRecaptcha(siteKey);
    const g = window.grecaptcha;
    if (!g) return null;
    return await g.execute(siteKey, { action });
  } catch {
    return null;
  }
}

export type RecaptchaAction = 'login' | 'signup' | 'google_login' | 'google_signup';

export async function ensureRecaptchaVerified(
  action: RecaptchaAction,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) {
    return { ok: true };
  }

  const token = await getRecaptchaToken(siteKey, action);
  if (!token) {
    return {
      ok: false,
      message: 'reCAPTCHA could not run. Please refresh the page and try again.',
    };
  }

  try {
    const res = await fetch('/api/verify-recaptcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = (await res.json()) as { success?: boolean; error?: string };
    if (!res.ok) {
      return {
        ok: false,
        message: data.error ?? 'reCAPTCHA verification failed. Please try again.',
      };
    }
    if (!data.success) {
      return {
        ok: false,
        message: data.error ?? 'reCAPTCHA verification failed. Please try again.',
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: 'Network error during security check.' };
  }
}
