# Lumen — Firebase Auth Login

A light-themed, Stripe-inspired login/sign-up screen built with Next.js (App Router), Tailwind CSS, and Firebase Authentication. Primary color is purple, with a colorful gradient-mesh signature panel on the left.

## What's included

- Email/password sign-in **and** sign-up (toggled from the same form)
- Google sign-in via popup
- "Forgot password" → sends a Firebase password reset email
- Friendly, mapped error messages (no raw `auth/...` codes shown to users)
- Show/hide password toggle, loading + success states
- Fully responsive: the gradient mesh panel hides below `lg`, form stays centered
- Accessible focus states, `prefers-reduced-motion` respected

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Firebase project** at [console.firebase.google.com](https://console.firebase.google.com), then:
   - Go to **Build → Authentication → Get started**
   - Enable the **Email/Password** provider
   - Enable the **Google** provider
   - Go to **Project settings → General → Your apps**, add a Web app, and copy the config values

3. **Set environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in the six `NEXT_PUBLIC_FIREBASE_*` values from step 2.

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

## Where to hook in your app logic

- `components/LoginForm.tsx` — after a successful sign-in/sign-up, replace the `setNotice(...)` calls with your real redirect (e.g. `router.push("/dashboard")` using `useRouter` from `next/navigation`).
- `lib/firebase.ts` — the initialized `auth` instance; import this anywhere you need `onAuthStateChanged`, sign-out, etc.
- `lib/authErrors.ts` — extend this switch statement if you enable more Firebase auth providers or want different copy.

## Design notes

- **Palette**: primary is `iris` (purple, `#7C5CFC` at 600), background is a warm off-white `canvas` (`#FAFAF9`) — no dark theme.
- **Signature element**: the left panel's animated radial gradient mesh (purple → blue → teal → pink) is the one bold, colorful moment; the form itself stays quiet, neutral, and functional, Stripe-style.
- **Type**: Inter throughout, tight tracking on headings, restrained size scale.
