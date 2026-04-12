/**
 * Content for the interactive Help Q&A — keywords power both search filtering and
 * “best match” scoring when someone types a free-form question.
 */
export interface HelpQAEntry {
  id: string;
  question: string;
  answer: string;
  /** Lowercase tokens for fuzzy matching */
  keywords: string[];
}

export const HELP_QA_ENTRIES: HelpQAEntry[] = [
  {
    id: 'browse',
    question: 'How do I find businesses near me?',
    answer:
      'Open Browse, allow location or pick a city, then use categories and the radius slider. Switch to split view to see results on the map.',
    keywords: ['browse', 'near', 'location', 'map', 'search', 'find', 'places'],
  },
  {
    id: 'ai-explorer',
    question: 'What is the AI Explorer?',
    answer:
      'It lets you ask in plain English (for example “quiet brunch spots with outdoor seating”). Answers are grounded in real place data — try it from the Explore page.',
    keywords: ['ai', 'explorer', 'natural', 'language', 'ask', 'search', 'chat'],
  },
  {
    id: 'deals',
    question: 'How do I save deals?',
    answer:
      'Sign in, open Deals, and tap the heart on a card. Saved deals appear on your Dashboard so you can redeem them later.',
    keywords: ['deals', 'save', 'heart', 'discount', 'dashboard'],
  },
  {
    id: 'trip',
    question: 'How does the Trip Planner work?',
    answer:
      'Bookmark places while you browse, then open Trip Planner to load your bookmarks as stops and optimize the route for driving, walking, biking, or transit.',
    keywords: ['trip', 'route', 'planner', 'bookmarks', 'stops', 'optimize'],
  },
  {
    id: 'portal',
    question: 'I own a business — how do I claim my listing?',
    answer:
      'Go to Business Portal, sign in, search for your place, and claim it. You can then edit your profile, post deals, and reply to community comments.',
    keywords: ['portal', 'claim', 'business', 'owner', 'listing', 'profile'],
  },
  {
    id: 'account',
    question: 'Do I need an account?',
    answer:
      'You can browse and use the AI Explorer without signing in. An account unlocks bookmarks, saved deals, trip planning from bookmarks, and posting comments.',
    keywords: ['account', 'sign', 'login', 'register', 'need'],
  },
];

/** Score how well a user question matches an entry — used for the “smart” answer line. */
export function scoreHelpMatch(userQuestion: string, entry: HelpQAEntry): number {
  const q = userQuestion.toLowerCase().trim();
  if (!q) return 0;
  let score = 0;
  const tokens = q.split(/\s+/).filter((t) => t.length > 1);

  for (const kw of entry.keywords) {
    if (q.includes(kw)) score += 4;
  }
  const ql = entry.question.toLowerCase();
  const al = entry.answer.toLowerCase();
  if (ql.includes(q) || al.includes(q)) score += 12;
  for (const t of tokens) {
    if (ql.includes(t)) score += 3;
    if (al.includes(t)) score += 1;
    for (const kw of entry.keywords) {
      if (t.includes(kw) || kw.includes(t)) score += 2;
    }
  }
  return score;
}

export function findBestHelpMatch(userQuestion: string): HelpQAEntry | null {
  let best: HelpQAEntry | null = null;
  let bestScore = 0;
  for (const e of HELP_QA_ENTRIES) {
    const s = scoreHelpMatch(userQuestion, e);
    if (s > bestScore) {
      bestScore = s;
      best = e;
    }
  }
  if (bestScore < 4) return null;
  return best;
}
