# Dinero Sweeps — “Three Wishes” landing page (Next.js)

A pixel-for-pixel React port of the approved landing page, running on the same Next.js App Router layout as the live Dinero Sweeps user frontend.

## Run it

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build in .next/
npm run start     # serve the production build
```

Node.js 18.18 or newer.

## Structure

```
src/app/                    Next.js App Router (layout, home page, loading, 404)
src/components/HomeGate.jsx Next client entry for the landing page
src/components/landing-page/ Landing page sections, CSS, mascot, and motion
public/assets/              Images
tailwind.config.js           Tailwind (Preflight off to preserve the landing CSS)
postcss.config.mjs           Tailwind and Autoprefixer
```

Google Fonts (Bricolage Grotesque, Instrument Serif, Figtree, Montserrat) load from `src/app/layout.js`.

## Important

- The `.ds` wrapper is the CSS container (`container: page / inline-size`). Every section must stay inside it.
- `<Mascot />` must stay **outside** `.ds` (its layers are `position: fixed`).
- `motion.js` and the mascot find elements by class name. Renaming classes breaks animation.
- Motion turns itself off for `prefers-reduced-motion`. The page is fully readable without JavaScript animation.
- Tailwind is installed for the same setup as the live site. Do not apply Tailwind utilities to the landing markup; landing styles stay in the existing CSS files.
