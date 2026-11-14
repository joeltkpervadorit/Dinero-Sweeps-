/* Dino, the Dinero Sweeps genie: he floats around the landing page, rests on cards and fires finger-gun magic
 * (decorative crown coins) when clicked. On the first visit of a session he poofs out from behind the logo.
 * The engine is imperative (one rAF loop, no React state per frame) and loads as its own chunk after the
 * first screen has painted; this component only boots it and renders the show/hide toggle. */
import { memo, useEffect, useState } from 'react';
import { afterFirstPaint } from '../lib/idle.js';
import './mascot.css';

const OFF_KEY = 'ds_mascot_off';
const INTRO_KEY = 'ds_mascot_intro';

// Card tops he may rest on. The stacking "why" cards and moving rails are left out on purpose.
export const PERCHES = ['.gc-t', '.pm', '.po', '.st', '.tc', '.rvw'].join(',');

function savedOn() {
  try { return localStorage.getItem(OFF_KEY) !== '1'; } catch (e) { return true; }
}

/** The entrance from behind the logo plays once per browser session; `?mascot=intro` replays it. */
function takeIntro() {
  try {
    if (new URLSearchParams(window.location.search).get('mascot') === 'intro') return true;
    if (sessionStorage.getItem(INTRO_KEY) === '1') return false;
    sessionStorage.setItem(INTRO_KEY, '1');
    return true;
  } catch (e) {
    return false;
  }
}

function prefersReducedMotion() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
}

export default memo(function Mascot({ perches = PERCHES }) {
  const [on, setOn] = useState(savedOn);

  useEffect(() => {
    if (!on) return undefined;
    let mascot = null;
    let cancelled = false;
    // The atlas (~40 KB first, ~80 KB later) and the engine load after the first screen has painted.
    const cancelLate = afterFirstPaint(() => {
      import('./engine/engine.js')
        .then(({ createMascot }) => {
          if (!cancelled) mascot = createMascot({ perchSelector: perches, reducedMotion: prefersReducedMotion(), intro: takeIntro() });
        })
        .catch(() => {});
    }, { delay: 1500 });
    return () => {
      cancelled = true;
      cancelLate();
      mascot?.destroy();
    };
  }, [on, perches]);

  const toggle = () => {
    const next = !on;
    setOn(next);
    try { localStorage.setItem(OFF_KEY, next ? '0' : '1'); } catch (e) { /* private mode: setting lasts this visit */ }
  };

  return (
    <button
      type="button"
      className="ds-genie-toggle"
      aria-pressed={on}
      aria-label={on ? 'Hide Dino the genie' : 'Show Dino the genie'}
      title={on ? 'Hide Dino' : 'Show Dino'}
      onClick={toggle}
    >
      <img src="/mascot/face.webp" alt="" width="40" height="40" decoding="async" loading="lazy" />
    </button>
  );
});
