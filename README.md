# Dinero Sweeps — “Three Wishes” landing page (React + Vite)

A pixel-for-pixel React port of the approved landing page (canvas version 19).

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
```

Node 18 or newer.

## Structure

```
index.html                 Google Fonts (Bricolage Grotesque, Instrument Serif, Figtree, Montserrat) + root
public/media/              All images (WebP/PNG/JPG/SVG), referenced as /media/<file>
src/main.jsx               Mounts <App/> and imports the page styles
src/App.jsx                Page order: header → main (3 acts) → footer, plus <Mascot/>
src/components/            One component per section (Hero, Platforms, GameLobby, WhyPlay, Promotions,
                           HowToPlay, Doors, Leaderboard, TrustFeatures, Testimonials, Faq, FollowUs,
                           Disclaimer, SiteFooter, WishOne/Two/Three, Ticker, SiteHeader, IconSprite …)
src/lib/gsap-setup.js      Registers GSAP 3.12.5 + ScrollTrigger and exposes them on window
src/lib/motion.js          Scroll choreography (initMotion) — unchanged logic from the prototype
src/lib/idle.js            afterFirstPaint(): defers non-critical work (the mascot) until the page is idle
src/mascot/                Dino the genie (lazy-loaded engine + toggle); see src/mascot/README.md
public/mascot/             Genie sprite (dino.webp) and toggle icon
scripts/mascot/            Atlas builder (pack.py) and the genie's source layers
src/styles/landing.css     Page styles. Mobile-first; desktop rules live in @container page (min-width:1000px)
```

## Important

- The `.ds` wrapper is the CSS container (`container: page / inline-size`). Every section must stay inside it.
- `<Mascot />` must stay **outside** `.ds` (its layers are `position: fixed`).
- `motion.js` and the mascot find elements by class name (the mascot rests on `.gc-t, .pm, .po, .st, .tc, .rvw`, starts from `.hd .logo`). Renaming classes breaks animation.
- Motion turns itself off for `prefers-reduced-motion`. The page is fully readable without JavaScript animation.
- Tabs in the game lobby, “Show all 11” platforms, the welcome-bonus pop-up and the FAQ are pure CSS (radio/checkbox/details).

## Still placeholder / to confirm

- Leaderboard rows (wire to live data), social links (`href="#"`), “Open ticket” link.
- FAQ #4 says “100,000 free Gold Coins” — welcome offer elsewhere is 10,000 GC + 2 SC.
- Footer email `support@orionstarsweeps.com` (old domain).
- Game categories in the lobby (Slots 7 · Fish & arcade 2 · Table 3).
