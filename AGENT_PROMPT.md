# Prompt for your AI coding agent

Copy everything below the line into your agent.

---

You are setting up an existing, finished landing page. It is a React 18 + Vite 5 project in the zip file `dinero-sweeps-react.zip`. The design is final and approved. Your job is to install, run, verify and (if asked) integrate it. **Do not redesign anything.**

## 1. Install and run

1. Unzip `dinero-sweeps-react.zip`. The project folder is `dinero-sweeps/`.
2. Make sure Node.js 18 or newer is installed (`node -v`).
3. In `dinero-sweeps/` run:
   - `npm install`
   - `npm run dev` → open http://localhost:5173
4. Make a production build: `npm run build` (output in `dist/`), then check it with `npm run preview`.

## 2. Verify (report the results back to me)

- The page loads with no errors in the browser console.
- Check at widths 375, 390, 402, 440 (iPhone) and 1440 (desktop): no horizontal scrolling, nothing cut off.
- Scroll the whole page: the top progress bar fills, the wish sentences light up word by word, platform rows highlight at mid-screen, the "why" cards stack, cards and sections animate in.
- Dino the genie poofs out from behind the logo (first visit per session, or `?mascot=intro`), floats around and rests on cards, fires coins when tapped, and can be hidden and brought back with the round button at the bottom right.
- Game lobby tabs (All / Slots / Fish & arcade / Table) filter the 12 game cards.
- "Show all 11" reveals the remaining platforms; FAQ items open and close; the welcome bonus card opens its pop-up.
- With "reduce motion" turned on in the OS, the page still shows everything, without animation.

## 3. Strict rules — do not break these

- Do NOT change the design, layout, colours, fonts, spacing, copy, images or animations.
- Do NOT edit `src/mascot/` or `src/lib/motion.js` logic, and do not rename CSS classes; the animations find elements by class name.
- Keep every section inside the `<div className="ds">` wrapper (it is the CSS container used by the responsive rules).
- Keep `<Mascot />` outside `.ds` (it is fixed-position).
- Keep GSAP at 3.12.5 and load it through `src/lib/gsap-setup.js` (it puts gsap and ScrollTrigger on `window`).
- Keep the Google Fonts `<link>` in `index.html` (Bricolage Grotesque, Instrument Serif, Figtree, Montserrat).
- Images live in `public/media/` and are referenced as `/media/<file>`. If the site is deployed under a sub-path, set `base` in `vite.config.js` and update those paths.
- Do not add Tailwind, a CSS reset or a UI library; they would change the look.

## 4. Only if I ask you to integrate it into my existing app

- Copy `src/components`, `src/lib`, `src/mascot`, `src/styles`, `public/media` and `public/mascot` into my project.
- Render the contents of `src/App.jsx` as the landing route, import `src/styles/landing.css` once, and add the Google Fonts link to my HTML head.
- Install `gsap@3.12.5`. `initMotion()` is guarded so it runs once (safe with React StrictMode); call it after the page markup is mounted, as `App.jsx` does. The mascot boots itself from `<Mascot />` and cleans up on unmount.
- For Next.js: put the landing page in a client component (`'use client'`), move `public/media` to Next's `public/`, and keep the same markup and class names.
- Replace placeholder links (`/signup`, `/login`, `/faq`, `/promotions`, social `#` links) with my real routes only when I give them to you.

## 5. Deploy (if asked)

Static site. Build command `npm run build`, output folder `dist`. Works on Vercel, Netlify, Cloudflare Pages or any static host.

## 6. Open items to ask me about (do not guess)

- Leaderboard data source, social media URLs, "Open ticket" link.
- FAQ says "100,000 free Gold Coins" but the welcome offer is 10,000 GC + 2 SC: which is right?
- Footer email support@orionstarsweeps.com: is this the correct address?

When finished, send me: the commands you ran, any errors and how you fixed them, and screenshots at 390px and 1440px.
