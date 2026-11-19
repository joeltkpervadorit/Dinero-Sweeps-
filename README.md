# Dinero Sweeps — “Three Wishes” landing page (Next.js 15)

A pixel-for-pixel React port of the approved landing page (canvas version 19).

## Run it

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
npm run start     # serve the production build
npm run lint      # ESLint (next/core-web-vitals)
```

Node 18.18 or newer. Optional configuration lives in `.env.example`.

## Structure

```
public/assets/                      All images, referenced as /assets/<file>
public/assets/mascot/               Genie sprite and toggle icon
src/app/layout.js                   Root layout, metadata, globals.css
src/app/page.js                     Thin server page that renders <LandingShell />
src/components/landing-page/        All landing-page-specific code
  LandingShell.jsx                  Server composition of the page; client islands are marked 'use client'
  LandingEffects.jsx                Client effect: starts GSAP scroll motion and card tilt (GSAP loads lazily)
  sections/                         One component per section (Hero, Platforms, GameLobby, WhyPlay, ...)
  components/                       Landing widgets (IconSprite, QuickActions, SocialLinks, RubLamp, HeroCoins)
  constants/                        Social profile URLs and the optional lamp promo code
  mascot/                           Dino the genie and its animation engine
  GenieSmoke/                        Landing-page smoke effect
  PageSound/                         Landing-page sound toggle and audio
  lib/                               Landing-page motion and animation utilities
  styles/                            Landing-page stylesheets
```

## Important

- The `.ds` wrapper is the CSS container (`container: page / inline-size`). Every section must stay inside it.
- `<Mascot />` must stay **outside** `.ds` (its layers are `position: fixed`).
- The landing-page motion and mascot code find elements by class name. Renaming animation classes can break those effects.
- Motion turns itself off for `prefers-reduced-motion`. The page is fully readable without JavaScript animation.
- Only components that need browser APIs are client components (`Atmosphere`, `Intro`, `HeroCoins`, `RubLamp`, `Mascot`, `PageSound`, `GenieSmoke`, `LandingEffects`). Keep the sections server components.
- `initMotion()` and `initCardTilt()` return disposers; call them from an effect cleanup so the page survives remounting.
- Social profile URLs are empty in `constants/index.js` until the real ones are confirmed; those icons render as non-interactive placeholders. The lamp popup shows a promo code only if `NEXT_PUBLIC_LAMP_BONUS_CODE` is set.
- Other website routes are pending and no placeholder auth or content pages are created. Unknown paths return 404.
- Security headers (including a same-origin CSP) are set in `next.config.mjs`.
- Tabs in the game lobby, “Show all 11” platforms, the welcome-bonus pop-up and the FAQ are pure CSS (radio/checkbox/details).

## Pending confirmation

- The welcome-offer amount and terms.
- Promotion, tournament, VIP and referral-program details.
- Social profile URLs and the official support contact.
- Leaderboard data and live source.
- Account, login and registration integrations.
