# Mascot: Dino the genie

The genie who lives on the landing page (`<Mascot />` in `src/App.jsx`, outside `.ds`). Same architecture as the
PlayJuwa mascot, rebuilt for a floating genie drawn as one painted transparent sprite.

```
src/mascot/
  Mascot.jsx         React part: boots the engine after the first paint, renders the show/hide toggle,
                     and lists the card selectors he may rest on (PERCHES)
  mascot.css         toggle, speech bubble and the pointer-events-none canvas layers
  engine/            imperative engine, loaded lazily as its own chunk (~13.5 KB gzip)
    engine.js        behaviour (glide, dash, swoop, rest on cards, react, finger-gun magic, intro) and the rAF loop
    rig.js           the sprite: public/mascot/dino.webp with CSS breathing/sway, head tilt, tail lag, glow and shadow
    world.js         reads the page (hover line, card tops, the welcome pop-up) only when he plans a move
    effects.js       crown coins, magic bolts, the temporary card "zap" (shake, cracks, sparkles), smoke puffs
    sounds.js        Web Audio sound effects (no audio files)
public/mascot/       dino.webp (the genie, transparent, 480 px wide), face.webp (toggle icon), cloud.webp (blank speech cloud)
```

## Behaviour

- **Toggle:** bottom right; the choice is saved in `localStorage` as `ds_mascot_off`.
- **Intro:** once per browser session (replay with `?mascot=intro`). He poofs out from behind the header logo,
  swoops onto a card, says hello, zaps a few cards with his finger guns, celebrates, then plays along the bottom.
  A zapped card only shakes, cracks and greys out for about two seconds; nothing on the page is changed.
- **Moving:** glides (leaning into the motion, smoke trailing behind), dashes with a sparkle trail, swoops in
  arcs, bounces, swoops from card to card, rests on a card with his smoke on its edge (and yawns now and then).
- **Interactions:**
  - Click him: finger-gun magic, a burst of crown coins, and he collects them.
  - Double-click him: super jump with a twirl and a shower of coins.
  - Click or tap empty space in the lower part of the screen: he dashes over and bounces (at most every 4 s).
  - Mouse comes near: he is startled, or bounces and cheers.
  - Short lines in a cloud-shaped speech bubble: greeting and click reactions.
- **Tour:** as each section reaches the middle of the screen he explains it once in plain words (`SECTIONS` in
  `engine.js`, checked every 0.8 s, at least 3.5 s apart).
- **End card:** when the footer comes into view, a card offers "Switch off genie" or "Keep Dino" (Keep hides the
  card for the session, `ds_mascot_bye` in `sessionStorage`).
- **Pointer:** he never takes pointer events. A click counts as a click on him only when nothing clickable is
  underneath, so links, buttons and game cards keep working through him.
- **Hides** while the welcome-bonus pop-up (`#wbx:checked`) or any dialog is open; stands still under
  `prefers-reduced-motion`.
- **Coins** are decorative only and are not connected to GC, SC, wallets or rewards.
- **Sound:** silent while he wanders. Sounds play only for a few seconds after the visitor clicks him.

## Performance

- Nothing loads until the first screen has painted and the browser is idle (+1.5 s): then the engine chunk and
  `core.webp`; `extra.webp` follows when the page is quiet. The old genie loaded ~490 KB of images up front.
- One rAF loop. Each frame writes a single CSS transform (position, facing, lean, squash, hover); the canvas is
  redrawn at most 30 times a second and not at all under reduced motion once drawn.
- The page is measured only when he plans a move; his perch is re-checked twice a second.
- The loop stops while a pop-up is open, and the browser pauses it in background tabs.
