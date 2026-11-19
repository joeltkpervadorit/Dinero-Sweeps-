'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/* Storm backdrop: drifting clouds + lightning.
   - A full strike (bolt + sky flash) fires each time the page crosses into a new chapter (data-world changes).
   - While scrolling fast, distant flickers light the clouds from behind. */

const rand = (a, b) => a + Math.random() * (b - a);

// Jagged bolt from (x,0) down to ~y; returns an SVG path plus a few branches.
function boltPaths(w, h) {
  const paths = [];
  const walk = (x, y, len, spread, depth) => {
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    const steps = Math.max(4, Math.round(len / 34));
    for (let i = 0; i < steps; i++) {
      x += rand(-spread, spread);
      y += len / steps;
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      if (depth < 2 && Math.random() < 0.2) walk(x, y, len * rand(0.3, 0.55), spread * 0.8, depth + 1);
    }
    paths.push({ d, main: depth === 0 });
  };
  const x0 = rand(w * 0.2, w * 0.8);
  walk(x0, -10, h * rand(0.95, 1.1), Math.max(26, w * 0.06), 0);
  return { paths, x0 };
}

// Random star field as one box-shadow list (cheap: one element per twinkle group).
function starShadows(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (0.4 + Math.random() * 0.6).toFixed(2);
    out.push(`${rand(0, 100).toFixed(1)}vw ${rand(0, 70).toFixed(1)}vh 0 ${Math.random() < 0.15 ? 1 : 0}px rgba(255,255,255,${a})`);
  }
  return out.join(',');
}
const sky = (p) => {
  const c = (v) => Math.min(1, Math.max(0, v));
  return { storm: c(Math.min((p - 0.12) / 0.2, (0.85 - p) / 0.2)), night: c((p - 0.62) / 0.28) };
};

export default function Atmosphere() {
  const ref = useRef(null);
  const fxRef = useRef(null);
  // The full-screen strike layer is portalled into <body>, which only exists in the browser: render it after mount
  // so the server markup and the first client render match.
  const [portalHost, setPortalHost] = useState(null);
  useEffect(() => setPortalHost(document.body), []);

  useEffect(() => {
    const atm = ref.current;
    if (!atm || !portalHost) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const flash = atm.querySelector('.atm-flash');
    const front = fxRef.current; // full-screen layer above the page content
    if (!front) return undefined;
    const svg = front.querySelector('.sfx-bolt');
    const wash = front.querySelector('.sfx-wash');
    const clouds = atm.querySelector('.atm-clouds');
    const root = atm.closest('.ds');
    let lastFlicker = 0, lastY = window.scrollY, lastT = performance.now(), raf = 0;

    const glow = (strength, dur) => {
      flash.animate(
        [{ opacity: 0 }, { opacity: strength, offset: 0.06 }, { opacity: strength * 0.2, offset: 0.18 },
         { opacity: strength * 0.85, offset: 0.26 }, { opacity: 0 }],
        { duration: dur, easing: 'ease-out' });
      clouds.animate(
        [{ filter: 'brightness(1)' }, { filter: `brightness(${1 + strength * 2.2})`, offset: 0.08 },
         { filter: 'brightness(1.1)', offset: 0.2 }, { filter: `brightness(${1 + strength * 1.6})`, offset: 0.28 },
         { filter: 'brightness(1)' }],
        { duration: dur, easing: 'ease-out' });
    };

    const drawBolt = () => {
      const w = window.innerWidth, h = window.innerHeight;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      const { paths, x0 } = boltPaths(w, h);
      svg.replaceChildren(...paths.flatMap(p => ['g', 'c'].map((kind) => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        el.setAttribute('d', p.d);
        el.setAttribute('class', `${kind} ${p.main ? 'm' : 'b'}`);
        return el;
      })));
      return x0 / w;
    };
    const boltFlash = () => svg.animate(
      [{ opacity: 0 }, { opacity: 1, offset: 0.04 }, { opacity: 0.1, offset: 0.14 },
       { opacity: 1, offset: 0.22 }, { opacity: 0.7, offset: 0.5 }, { opacity: 0 }],
      { duration: 1000, easing: 'ease-out' });

    let t2 = 0;
    const strike = () => {
      const fx = drawBolt();
      flash.style.setProperty('--fx', `${fx * 100}%`);
      wash.style.setProperty('--fx', `${fx * 100}%`);
      boltFlash();
      // Whole screen goes white, dips, then flashes again.
      wash.animate(
        [{ opacity: 0 }, { opacity: 0.9, offset: 0.03 }, { opacity: 0.15, offset: 0.12 },
         { opacity: 0.7, offset: 0.2 }, { opacity: 0.25, offset: 0.35 }, { opacity: 0 }],
        { duration: 1300, easing: 'ease-out' });
      // Shake the storm layers a little.
      front.animate(
        [{ transform: 'translate(0,0)' }, { transform: 'translate(-6px,4px)' }, { transform: 'translate(5px,-3px)' },
         { transform: 'translate(-3px,2px)' }, { transform: 'translate(0,0)' }],
        { duration: 380, easing: 'ease-out' });
      glow(1, 1400);
      // Browsers block vibration until the visitor has interacted with the page.
      if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.([40, 60, 80]);
      window.dispatchEvent(new CustomEvent('ds:thunder', { detail: { near: true } }));
      // Second, smaller bolt elsewhere a moment later.
      clearTimeout(t2);
      t2 = setTimeout(() => { drawBolt(); boltFlash(); glow(0.6, 800); }, 420);
    };

    // Strike whenever the chapter (data-world) changes.
    let world = root && root.getAttribute('data-world');
    const mo = root && new MutationObserver(() => {
      const w = root.getAttribute('data-world');
      if (w && world && w !== world) strike();
      world = w;
    });
    mo && mo.observe(root, { attributes: true, attributeFilter: ['data-world'] });

    // Day → storm → night: sky layers follow how far down the page you are.
    const paintSky = (y) => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const k = sky(y / max);
      atm.style.setProperty('--storm', k.storm.toFixed(3));
      atm.style.setProperty('--night', k.night.toFixed(3));
    };
    atm.querySelectorAll('.atm-stars i').forEach((el, i) => { el.style.boxShadow = starShadows(i ? 40 : 70); });
    paintSky(window.scrollY);

    // Fast scrolling → distant flicker; scroll also drifts the clouds.
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const now = performance.now(), y = window.scrollY;
        const v = Math.abs(y - lastY) / Math.max(16, now - lastT); // px per ms
        lastY = y; lastT = now;
        atm.style.setProperty('--sy', y);
        paintSky(y);
        if (v > 1.6 && now - lastFlicker > 2200 && Math.random() < 0.5) {
          lastFlicker = now;
          flash.style.setProperty('--fx', `${rand(10, 90)}%`);
          glow(rand(0.25, 0.4), 600);
          window.dispatchEvent(new CustomEvent('ds:thunder', { detail: { near: false } }));
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      mo && mo.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(t2);
    };
  }, [portalHost]);

  return (
    <div className="atm" aria-hidden="true" ref={ref}>
      <div className="atm-sky"><div className="night" /><div className="atm-stars"><i /><i /></div><div className="moon" /></div>
      <i className="a1" /><i className="a2" />
      <div className="atm-clouds"><b className="k1" /><b className="k2" /><b className="k3" /><b className="k4" /></div>
      <div className="atm-flash" />
      {portalHost && createPortal(
        <div className="sfx" ref={fxRef} aria-hidden="true"><div className="sfx-wash" /><svg className="sfx-bolt" preserveAspectRatio="none" /></div>,
        portalHost)}
    </div>
  );
}
