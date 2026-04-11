/**
 * Maps normalized voice transcripts to app routes. Longer / more specific phrases first.
 */
export function matchVoiceRoute(transcript: string): string | null {
  const t = transcript.toLowerCase().trim()
  if (!t) return null

  const rules: { path: string; match: (s: string) => boolean }[] = [
    { path: '/trip-planner', match: (s) => s.includes('trip planner') },
    { path: '/signup', match: (s) => /\bsign\s*up\b/.test(s) || s.includes('signup') || s.includes('register') },
    { path: '/login', match: (s) => s.includes('sign in') || s.includes('log in') || s.includes('login') },
    { path: '/accessibility', match: (s) => s.includes('accessibility') || s.includes('a11y') },
    {
      path: '/explore',
      match: (s) => s.includes('ai explorer') || s.includes('explorer') || s.includes('explore'),
    },
    { path: '/bookmarks', match: (s) => s.includes('bookmark') },
    { path: '/dashboard', match: (s) => s.includes('dashboard') },
    { path: '/resources', match: (s) => s.includes('resource') },
    { path: '/contact', match: (s) => s.includes('contact') },
    { path: '/portal', match: (s) => s.includes('portal') },
    { path: '/help', match: (s) => s.includes('help') },
    { path: '/deals', match: (s) => s.includes('deal') },
    { path: '/browse', match: (s) => s.includes('browse') || s.includes('search') },
    {
      path: '/',
      match: (s) =>
        s.includes('home') ||
        s.includes('landing') ||
        s.includes('main page') ||
        s.includes('go home') ||
        s === 'main',
    },
  ]

  for (const { path, match } of rules) {
    if (match(t)) return path
  }
  return null
}
