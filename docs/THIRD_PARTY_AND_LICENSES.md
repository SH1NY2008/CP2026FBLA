# Third-party software, copyrights, and licenses

This document supports competition or audit requirements for **documenting copyrighted or licensed materials** used in this project: **npm dependencies**, **transitive packages with non-MIT licenses**, **external APIs**, and **how to reproduce a full license inventory**.

## 1. Open-source dependencies (npm)

All runtime and build-time dependencies are installed via `package.json` and `package-lock.json` (if present). They are **not** authored by this project’s team unless explicitly stated in file headers.

### 1.1 Direct dependencies (summary)

The following table lists **direct** `dependencies` and `devDependencies` from `package.json` with typical **SPDX** license identifiers. Confirm exact versions and license text in each package’s `node_modules/<name>/LICENSE*` after `npm install`.

| Package | Typical license | Notes |
|---------|-----------------|--------|
| `next` | MIT | Framework |
| `react`, `react-dom` | MIT | UI library |
| `typescript` | Apache-2.0 | Compiler |
| `firebase` | Apache-2.0 | Client SDK |
| `@radix-ui/*` | MIT | UI primitives (shadcn stack) |
| `@hookform/resolvers` | MIT | Form validation bridge |
| `react-hook-form` | MIT | Forms |
| `zod` | MIT | Schema validation |
| `tailwindcss`, `@tailwindcss/postcss` | MIT | CSS framework |
| `postcss`, `autoprefixer` | MIT | CSS tooling |
| `class-variance-authority` | Apache-2.0 | Component variants |
| `clsx`, `tailwind-merge` | MIT | Class name utilities |
| `lucide-react` | ISC | Icons |
| `@tabler/icons-react` | MIT | Icons |
| `framer-motion` | MIT | Animation |
| `lenis` | MIT | Smooth scrolling |
| `sonner` | MIT | Toasts |
| `vaul` | MIT | Drawer |
| `cmdk` | MIT | Command palette |
| `date-fns` | MIT | Dates |
| `react-day-picker` | MIT | Calendar |
| `embla-carousel-react` | MIT | Carousel |
| `recharts` | MIT | Charts |
| `react-resizable-panels` | MIT | Layout panels |
| `input-otp` | MIT | OTP input |
| `next-themes` | MIT | Theme switching |
| `@vercel/analytics` | MPL-2.0 | Vercel Analytics |
| `tw-animate-css` | MIT | Animations (verify in package) |

If any entry above differs from the version you installed, **trust the license file inside `node_modules`**.

### 1.2 Notable transitive licenses (full tree)

A scan of the installed tree (development machine, date of scan) reported these **non-MIT** categories among transitive dependencies:

| License (SPDX) | Example packages | Relevance |
|----------------|------------------|-----------|
| **Apache-2.0** | Many (e.g. Firebase, TypeScript ecosystem) | Common; permissive |
| **ISC** | Various utilities | Permissive |
| **BSD-3-Clause** | Various | Permissive |
| **MPL-2.0** | `@vercel/analytics`, `lightningcss` | Weak copyleft at file level — review if you redistribute binaries |
| **LGPL-3.0-or-later** | `@img/sharp-libvips-darwin-arm64` (platform-specific; may vary by OS) | Native image stack used by tooling/build pipeline on some platforms |
| **CC-BY-4.0** | `caniuse-lite` (browser data) | Attribution-style data license |

This list is **illustrative**; your OS and lockfile may pull different optional dependencies.

### 1.3 Generating a complete license report

From the repository root after `npm install`:

```bash
npx license-checker --summary
npx license-checker --csv > third-party-licenses.csv
```

Store `third-party-licenses.csv` alongside submissions if auditors require a **complete** inventory. Do not commit it if your process prefers generating it in CI.

## 2. External services (APIs, hosted products)

These services are **not** shipped as npm source but are **used at runtime** subject to vendor terms:

| Service | Usage in project | Documentation / terms |
|---------|------------------|------------------------|
| **Google Maps Platform** | Places, geocoding, maps, routing-related Route Handlers and client map components | [Google Maps Platform Terms](https://cloud.google.com/maps-platform/terms) |
| **Firebase** | Authentication, Firestore, Storage, Analytics | [Firebase Terms](https://firebase.google.com/terms) |
| **Google Gemini API** | AI summary / explore routes | [Google AI / Gemini terms](https://ai.google.dev/terms) (verify current URL in console) |
| **Google reCAPTCHA** | Bot mitigation on auth | [reCAPTCHA](https://www.google.com/recaptcha) / Google policies |
| **Vercel** (optional host) | Deployment, Analytics | [Vercel Legal](https://vercel.com/legal) |

You are responsible for **API key security**, **quota**, **billing**, and **compliance** with each provider’s policies.

## 3. Fonts and assets

- **Geist** and **Geist Mono** are loaded via `next/font/google` in `app/layout.tsx`. Usage is subject to [Google Fonts](https://fonts.google.com/) / font licensing as provided by that pipeline.
- Files under `public/` (e.g. `icon.svg`, placeholders) are project assets; verify any imported third-party graphics before redistributing.

## 4. Original work

Source files under `app/`, `presentation/`, `domain/`, and `data/` that do not contain third-party headers or copied snippets are **original implementations** for this application, built on top of the libraries listed above.

## 5. Disclaimer

This file is **informational** and does not constitute legal advice. For commercial distribution or strict compliance programs, have counsel review the full `license-checker` output and any **optional** or **platform-specific** native dependencies.
