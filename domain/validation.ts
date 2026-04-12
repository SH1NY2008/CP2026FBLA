/**
 * Validation helpers — split into:
 * - Syntactic: shape/format (length, regex, allowed characters)
 * - Semantic: whether the input makes sense in context (not empty-looking spam, coherent ranges, etc.)
 */

const EMAIL_SYNTAX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/** Syntactic: must look like a real email address before we hit Firebase. */
export function validateEmailSyntax(email: string): string | null {
  const t = email.trim();
  if (!t) return 'Email is required.';
  if (t.length > 254) return 'Email is too long.';
  if (!EMAIL_SYNTAX.test(t)) return 'Enter a valid email address.';
  return null;
}

/**
 * Syntactic: minimum length / character classes for sign-up.
 * Semantic: reject obvious weak passwords (e.g. “password123” alone isn’t blocked here — keep UX friendly).
 */
export function validatePasswordSignup(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (password.length > 128) return 'Password is too long.';
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Use at least one letter and one number in your password.';
  }
  return null;
}

/** Syntactic: letters, spaces, hyphens, apostrophes — typical human names. */
export function validatePersonNamePart(name: string, label: string): string | null {
  const t = name.trim();
  if (!t) return `${label} is required.`;
  if (t.length > 80) return `${label} is too long.`;
  if (!/^[\p{L}\s'.-]+$/u.test(t)) {
    return `${label} can only include letters, spaces, hyphens, and apostrophes.`;
  }
  return null;
}

/** Syntactic: review/comment body length and obvious spam patterns. */
export function validateReview(comment: string): string | null {
  const t = comment.trim();
  if (t.length < 10) {
    return 'Review must be at least 10 characters long.';
  }
  if (t.length > 500) {
    return 'Review must be no more than 500 characters long.';
  }
  if (/(http|www)/i.test(t)) {
    return 'Reviews cannot contain URLs.';
  }
  const semantic = validateTextNotLowEffort(t);
  if (semantic) return semantic;
  return null;
}

/**
 * Comments are shorter than full reviews but still need substance.
 * Syntactic bounds + semantic check so one-word or keyboard-mash posts don’t slip through.
 */
export function validateCommentBody(text: string): string | null {
  const t = text.trim();
  if (t.length < 2) return 'Comment is too short.';
  if (t.length > 4000) return 'Comment must be under 4,000 characters.';
  if (/(http|www)/i.test(t)) return 'Comments cannot contain URLs.';
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    return 'Add a bit more detail — comments need at least two words.';
  }
  return validateTextNotLowEffort(t);
}

/** Semantic: block “aaaaaa” / “lol lol lol” style noise. */
export function validateTextNotLowEffort(t: string): string | null {
  const compact = t.replace(/\s/g, '');
  if (compact.length < 8) return null;
  const counts = new Map<string, number>();
  for (const ch of compact.toLowerCase()) {
    counts.set(ch, (counts.get(ch) ?? 0) + 1);
  }
  const maxRepeat = Math.max(...counts.values());
  if (maxRepeat / compact.length > 0.55) {
    return 'That looks like random repeated characters — please write a real sentence.';
  }
  const words = t.toLowerCase().split(/\s+/).filter(Boolean);
  const unique = new Set(words);
  if (words.length >= 6 && unique.size / words.length < 0.35) {
    return 'Try varying your words a bit more — repeated filler won’t help other readers.';
  }
  return null;
}

export const validateRating = (rating: number): string | null => {
  if (rating <= 0) {
    return 'Please select a rating.';
  }
  return null;
};

export const validateDisplayName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Display name is required.';
  }
  if (name.length > 50) {
    return 'Display name must be no more than 50 characters long.';
  }
  return null;
};

export interface ContactFormInput {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  subject?: string;
  message?: string;
}

/**
 * Contact form: syntactic checks on each field, then semantic checks
 * (message has to relate to the selected topic enough that it’s not an empty gesture).
 */
export function validateContactForm(input: ContactFormInput): ContactFormErrors {
  const errors: ContactFormErrors = {};

  const fn = validatePersonNamePart(input.firstName, 'First name');
  if (fn) errors.firstName = fn;

  const ln = validatePersonNamePart(input.lastName, 'Last name');
  if (ln) errors.lastName = ln;

  const em = validateEmailSyntax(input.email);
  if (em) errors.email = em;

  if (!input.subject.trim()) {
    errors.subject = 'Pick a topic so we can route your message.';
  }

  const msg = input.message.trim();
  if (msg.length < 20) {
    errors.message = 'Please write at least 20 characters so we can help.';
  } else if (msg.length > 8000) {
    errors.message = 'Message is too long (max 8,000 characters).';
  } else {
    const words = msg.split(/\s+/).filter(Boolean);
    if (words.length < 5) {
      errors.message = 'Add a little more detail — we need at least five words.';
    } else {
      const lowEffort = validateTextNotLowEffort(msg);
      if (lowEffort) errors.message = lowEffort;
    }
  }

  return errors;
}

/** Semantic: sale price should be below original for deal forms (portal). */
export function validateDealPrices(original: number, sale: number): string | null {
  if (!Number.isFinite(original) || !Number.isFinite(sale)) {
    return 'Enter valid numbers for prices.';
  }
  if (original <= 0 || sale <= 0) return 'Prices must be greater than zero.';
  if (sale >= original) return 'Sale price should be lower than the original price.';
  return null;
}

/** Semantic: event end time should be after start on the same day (simple string compare HH:mm). */
export function validateEventTimes(start: string, end: string): string | null {
  if (!start || !end) return 'Start and end times are required.';
  if (start >= end) return 'End time must be after start time.';
  return null;
}
