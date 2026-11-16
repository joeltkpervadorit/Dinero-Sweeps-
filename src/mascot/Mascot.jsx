/* Dino, the Dinero Sweeps genie: he floats around the landing page, rests on cards and fires finger-gun magic
 * (decorative crown coins) when clicked. On the first visit of a session he poofs out from behind the logo.
 * The engine is imperative (one rAF loop, no React state per frame) and loads as its own chunk after the
 * first screen has painted; this component boots it, renders the show/hide toggle, and at the end of the page (the footer) shows a card
 * offering to switch him off. */
import { memo, useEffect, useState } from 'react';
import { afterFirstPaint } from '../lib/idle.js';
import './mascot.css';

const OFF_KEY = 'ds_mascot_off';
const INTRO_KEY = 'ds_mascot_intro';
const BYE_KEY = 'ds_mascot_bye'; // "Keep Dino" on the end card: don't ask again this session
const END = '.nf'; // reaching the footer ends the tour

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

function byeDismissed() {
  try { return sessionStorage.getItem(BYE_KEY) === '1'; } catch (e) { return false; }
}

export default memo(function Mascot({ perches = PERCHES }) {
  const [on, setOn] = useState(savedOn);
  const [atEnd, setAtEnd] = useState(false);
  const [byeDone, setByeDone] = useState(byeDismissed);

  // At the end of the page Dino offers to leave: a small card with a "Switch off" button.
  useEffect(() => {
    if (!on || byeDone) return undefined;
    const end = document.querySelector(END);
    if (!end || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([e]) => setAtEnd(e.isIntersecting), { threshold: 0.15 });
    io.observe(end);
    return () => io.disconnect();
  }, [on, byeDone]);

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

  const setSaved = (next) => {
    setOn(next);
    try { localStorage.setItem(OFF_KEY, next ? '0' : '1'); } catch (e) { /* private mode: setting lasts this visit */ }
  };
  const toggle = () => setSaved(!on);
  const keep = () => {
    setByeDone(true);
    try { sessionStorage.setItem(BYE_KEY, '1'); } catch (e) { /* ignore */ }
  };

  const showBye = on && atEnd && !byeDone;

  return (
    <>
      {showBye && (
        <div className="ds-genie-bye" role="region" aria-label="Dino the genie" aria-live="polite">
          <img src="/mascot/face.webp" alt="" width="40" height="40" decoding="async" />
          <div className="ds-genie-bye-tx">
            <p><b>That’s the whole tour!</b> You’ve seen everything. Want me to go now?</p>
            <div className="ds-genie-bye-btns">
              <button type="button" className="ds-genie-bye-off" onClick={() => setSaved(false)}>Switch off genie</button>
              <button type="button" className="ds-genie-bye-keep" onClick={keep}>Keep Dino</button>
            </div>
            <small>You can bring me back any time with the round button.</small>
          </div>
        </div>
      )}
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
    </>
  );
});
