# Byte-Sized Business Boost

A Next.js application for discovering local businesses, deals, maps, and owner portal features. It combines **Firebase** (authentication, Firestore, Storage), **Google Maps Platform** (Places, Routes, Maps JavaScript API usage patterns), **Google Gemini** (AI summaries and exploration), and **reCAPTCHA** on auth flows.

The repository is organized for clarity between UI, domain logic, data access, and API routes.

## Table of contents

- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Source code layout](#source-code-layout)
- [Application routes](#application-routes)
- [API routes](#api-routes)
- [Data model (Firestore)](#data-model-firestore)
- [Templates, UI kit, and libraries](#templates-ui-kit-and-libraries)
- [Third-party services and compliance](#third-party-services-and-compliance)
- [Copyright and licensing](#copyright-and-licensing)

## Requirements

- **Node.js** 20+ (Next.js 16 targets current Node LTS; Node 24 is the platform default on many hosts)
- **npm** (or compatible package manager)
- Accounts and API keys for: Firebase, Google Maps Platform, Gemini (optional for AI routes), reCAPTCHA (optional; auth degrades gracefully when unset)

## Quick start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your keys (never commit real secrets)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # run production server (after build)
npm run lint    # ESLint (ensure eslint is installed/configured in your environment)
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in values. **Do not commit `.env.local`.**

| Variable | Scope | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Public (bundled) | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Public | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Public | Firebase project id |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Public | Firebase Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Public | FCM sender id (if used) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Public | Firebase app id |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Public | Analytics measurement id |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Public | Optional Realtime Database URL |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | Public | Google Maps / Places / related APIs (also used server-side where referenced) |
| `GEMINI_API_KEY` | Server | Google Gemini for `/api/ai-summary`, `/api/ai-explore` |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Public | reCAPTCHA v3 site key (client) |
| `RECAPTCHA_SECRET_KEY` | Server | reCAPTCHA secret |
| `RECAPTCHA_MIN_SCORE` | Server | Optional numeric threshold for verification |

Firebase public keys are intentionally client-exposed by Firebase’s model; **restrict keys** in Google Cloud and Firebase consoles (HTTP referrers, APIs enabled, App Check where appropriate). Server-only secrets must never use the `NEXT_PUBLIC_` prefix.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint on the project |

## Source code layout

| Path | Role |
|------|------|
| `app/` | Next.js App Router: `layout.tsx`, `globals.css`, pages, and `app/api/*` Route Handlers |
| `presentation/components/` | React components (including shadcn-style UI under `ui/`) |
| `presentation/hooks/` | Client hooks (auth, toasts, mobile, businesses, etc.) |
| `presentation/context/` | React context (e.g. app-wide state) |
| `presentation/lib/` | Client utilities (e.g. reCAPTCHA helper, `cn` via `utils.ts`) |
| `domain/` | Pure domain types, validation, static data, schemas |
| `data/` | Firebase init, Firestore schema/helpers, Google Places services, server-only Google helpers |
| `public/` | Static assets (icons, placeholders) |

Path aliases are defined in `tsconfig.json` (for example `@/components/*` → `presentation/components/*`, `@/lib/server/*` → `data/server/*`).

### Notable files

- `data/firebase.ts` — Firebase app, Auth, Firestore, Storage, Analytics
- `data/firestore/schema.ts` — Collection names and document shape documentation
- `presentation/hooks/useAuth.tsx` — Authentication state and flows
- `components.json` — shadcn/ui configuration (style: New York, Lucide icons)

## Application routes

| Route | Description |
|-------|-------------|
| `/` | Marketing landing (featured businesses, links into product) |
| `/browse` | Search and filter local businesses |
| `/explore` | AI-assisted discovery |
| `/deals` | Deals browsing |
| `/trip-planner` | Route and trip planning UI |
| `/bookmarks` | Saved places (Firestore-backed) |
| `/dashboard` | User dashboard |
| `/business/[placeId]` | Business detail |
| `/portal` | Business owner portal entry |
| `/portal/[placeId]` | Owner tools for a place |
| `/login`, `/signup` | Auth with optional reCAPTCHA |
| `/help`, `/contact`, `/accessibility`, `/resources` | Information and support pages |

## API routes

Server Route Handlers under `app/api/`:

| Endpoint | Role |
|----------|------|
| `GET /api/places/details` | Place details (Google Places) |
| `GET /api/places/nearby` | Nearby search |
| `GET /api/places/geocode` | Geocoding |
| `GET /api/places/reverse-geocode` | Reverse geocoding |
| `POST /api/route-optimize` | Route optimization |
| `GET /api/routes` | Directions-related data |
| `GET /api/map-session` | Map session token flow |
| `GET /api/weather` | Weather (via Google-related pipeline) |
| `GET /api/area-insights` | Area insights |
| `GET /api/solar` | Solar / building insights |
| `POST /api/ai-explore` | AI exploration (Places + Gemini) |
| `POST /api/ai-summary` | AI summaries (Gemini) |
| `POST /api/verify-recaptcha` | reCAPTCHA verification |

## Data model (Firestore)

Collections and design notes are documented in code:

```1:41:data/firestore/schema.ts
/**
 * 
 *
 * Design choices (good for demos / rubrics):
 * - User-private lists (bookmarks, saved deal ids) live in one doc per uid so reads are O(1).
 *   Those docs use arrays (`placeIds`, `dealIds`) instead of a subcollection per bookmark.
 * - Per-place data (claimed profile, aggregate rating, check-in rollups) uses Google `placeId` as the doc id.
 * - Social data (comments, photos) is top-level with `placeId` / `authorId` fields so we can query
 *   by place for a business page or by author for a dashboard without duplicating writes.
 * - Owner-created portal content (deals, events, …) is separate collections keyed by auto-id,
 *   with `placeId` on each document for filtering.
 *
 * Where we use complex fields: arrays for membership lists, maps (`placeTypes`) for histograms,
 * and nested arrays on claimed businesses (`menuCategories[].items`, `hoursOverride`, `teamMembers`).
 */
import { doc, type Firestore } from 'firebase/firestore';

/** Every root collection name — use these instead of string literals so renames stay safe. */
export const COLLECTIONS = {
  /** Owner-editable profile; doc id = Google placeId */
  claimedBusinesses: 'claimedBusinesses',
  /** One doc per user: `{ placeIds: string[] }` */
  bookmarks: 'bookmarks',
  /** One doc per user: `{ dealIds: string[] }` */
  savedDeals: 'savedDeals',
  /** Per-user engagement: arrays + `placeTypes` map — see UserActivityDocument */
  userActivity: 'userActivity',
  /** Rollup: `{ count, userIds[] }` per place */
  checkins: 'checkins',
  /** Aggregated stars + count; optional overlay on Google ratings */
  businessRatings: 'businessRatings',
  /** Flat thread: use `parentId` to nest replies in the UI */
  comments: 'comments',
  /** User uploads tied to a place */
  communityPhotos: 'communityPhotos',
  businessDeals: 'businessDeals',
  businessAnnouncements: 'businessAnnouncements',
  businessEvents: 'businessEvents',
  ownerReplies: 'ownerReplies',
  businessInquiries: 'businessInquiries',
} as const;
```

## Templates, UI kit, and libraries

- **Framework**: [Next.js](https://nextjs.org/) 16 (App Router), [React](https://react.dev/) 19
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4, `tw-animate-css`, custom globals in `app/globals.css`
- **UI components**: [shadcn/ui](https://ui.shadcn.com/) pattern (Radix UI primitives, `class-variance-authority`, `tailwind-merge`, `clsx`) — see `components.json`
- **Icons**: [Lucide React](https://lucide.dev/), [Tabler Icons](https://tabler.io/icons) (`@tabler/icons-react`)
- **Motion / UX**: [Framer Motion](https://www.framer.com/motion/), [Lenis](https://lenis.darkroom.engineering/) (smooth scroll), [Sonner](https://sonner.emilkowal.ski/) (toasts), [Vaul](https://vaul.emilkowal.ski/) (drawers)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) + `@hookform/resolvers`
- **Charts / carousel / misc UI**: [Recharts](https://recharts.org/), [Embla Carousel](https://www.embla-carousel.com/), [cmdk](https://cmdk.paco.me/), [react-day-picker](https://react-day-picker.js.org/), [input-otp](https://input-otp.rodz.dev/), [next-themes](https://github.com/pacocoursey/next-themes)
- **Backend client**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Storage, Analytics)
- **Analytics (hosting)**: [@vercel/analytics](https://vercel.com/docs/analytics)

Site metadata in `app/layout.tsx` includes `generator: 'v0.app'`, indicating initial scaffolding or design assistance from [v0](https://v0.app); the application logic, data layer, and integrations in this repository are implemented as described above.

A full dependency list with versions is in `package.json`. License classification for the npm dependency tree is summarized in [docs/THIRD_PARTY_AND_LICENSES.md](docs/THIRD_PARTY_AND_LICENSES.md).

## Third-party services and compliance

This project calls **Google** services (Maps Platform, Places, routing-related APIs, Gemini), **Firebase**, and **reCAPTCHA**. Use of those services is subject to each provider’s **terms of service**, **acceptable use policies**, and **attribution** requirements. Obtain your own API keys and configure billing and quotas in Google Cloud / Firebase consoles.

## Copyright and licensing

- **Application source** in this repository (original files authored for this project) is contributed for competition / submission purposes unless otherwise noted in repository metadata.
- **Third-party open-source software** is redistributed under their respective licenses; see [docs/THIRD_PARTY_AND_LICENSES.md](docs/THIRD_PARTY_AND_LICENSES.md).
- **Trademarks** (Google, Firebase, Vercel, etc.) belong to their owners; this project is not affiliated with or endorsed by them.

To regenerate a machine-readable list of all npm package licenses:

```bash
npx license-checker --csv > third-party-licenses.csv
```

---

For deeper legal and attribution detail, read [docs/THIRD_PARTY_AND_LICENSES.md](docs/THIRD_PARTY_AND_LICENSES.md).
