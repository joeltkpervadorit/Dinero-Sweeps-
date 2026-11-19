'use client';

import { useEffect, useState } from 'react';

/* Loading intro (~2s): the magic lamp shakes, smoke pours out, a gold flash, then the page is revealed
   through a growing hole in the dark. Tap anywhere to skip. Skipped entirely for reduced motion. */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const INTRO_MS = 1900; // when the reveal starts; motion.js starts the hero animation at this point

export default function Intro() {
  // Starts as 'in' on the server and the first client render; reduced-motion visitors skip it straight away.
  const [phase, setPhase] = useState('in');

  // Never leave the page scroll-locked if the component unmounts mid-intro (e.g. client-side navigation).
  useEffect(() => () => document.documentElement.classList.remove('intro-lock'), []);

  useEffect(() => {
    if (phase === 'in' && reduced()) { setPhase('done'); return undefined; }
    if (phase === 'done') { document.documentElement.classList.remove('intro-lock'); return undefined; }
    document.documentElement.classList.add('intro-lock');
    if (phase === 'in') {
      const t = setTimeout(() => setPhase('out'), INTRO_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase('done'), 800);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'done') return null;
  return (
    <div className={`intro ${phase}`} aria-hidden="true" onClick={() => setPhase('out')}>
      <div className="intro-glow" />
      <div className="intro-smoke"><i /><i /><i /><i /><i /><i /></div>
      <div className="intro-sparks">{Array.from({ length: 14 }, (_, i) => <b key={i} style={{ '--a': `${i * (360 / 14)}deg`, '--d': `${(i % 4) * 0.05}s` }} />)}</div>
      <img className="intro-lamp" src="/assets/prop-magic-lamp.webp" alt="" width="180" height="180" />
      <p className="intro-word">Make a wish&hellip;</p>
      <div className="intro-flash" />
    </div>
  );
}
