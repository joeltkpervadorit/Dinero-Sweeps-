import { useEffect } from 'react';
import { initMotion } from '@/components/landing-page/lib/motion.js';
import { initCardTilt } from '@/components/landing-page/lib/cardTilt.js';

/* Starts the page-wide scroll choreography and the game-card tilt. Renders nothing: the sections themselves
   are server components, so only this effect, the atmosphere and the interactive widgets ship as client code.
   GSAP is loaded after hydration on purpose: ScrollTrigger touches <body> styles when it is imported, which
   must not happen before React has hydrated the document. It also keeps GSAP out of the initial bundle. */
export default function LandingEffects() {
  useEffect(() => {
    let cancelled = false;
    let stopMotion = () => {};
    const stopTilt = initCardTilt();
    import('@/components/landing-page/lib/gsap-setup.js').then(() => {
      if (!cancelled) stopMotion = initMotion();
    });
    return () => {
      cancelled = true;
      stopMotion();
      stopTilt();
    };
  }, []);
  return null;
}
