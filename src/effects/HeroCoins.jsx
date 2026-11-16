import { useEffect, useRef } from 'react';

/* Hero coins: gold coins and sparkles float up through the hero and scatter away from the cursor / finger.
   A tap or click sends out a burst. Drawn on one canvas; paused while the hero is off screen. */

const rand = (a, b) => a + Math.random() * (b - a);

export default function HeroCoins() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const host = cv && cv.parentElement;
    if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = cv.getContext('2d');
    const coin = new Image();
    coin.src = '/media/prop-crown-coin.webp';

    let W = 0, H = 0, items = [], bursts = [], raf = 0, last = 0, visible = true;
    let px = -9999, py = -9999;

    const makeItem = (fromBottom) => {
      const isCoin = Math.random() < 0.55;
      const depth = rand(0.45, 1); // smaller + fainter = further away
      return {
        coin: isCoin, depth,
        x: rand(0, W), y: fromBottom ? H + rand(10, 80) : rand(0, H),
        vx: 0, vy: 0,
        rise: rand(10, 26) * depth,
        size: isCoin ? rand(14, 30) * depth : rand(4, 9) * depth,
        ph: rand(0, Math.PI * 2), spin: rand(1.2, 2.6), wob: rand(0.4, 1.1),
      };
    };
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = host.clientWidth; H = host.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = W < 700 ? 16 : 26;
      while (items.length < n) items.push(makeItem(false));
      items.length = n;
    };

    const star = (x, y, r, a) => {
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y);
      ctx.quadraticCurveTo(x, y, x, y - r);
      ctx.fill();
    };

    const frame = (now) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      const t = now / 1000;
      const damp = Math.pow(0.9, dt * 60);
      ctx.clearRect(0, 0, W, H);
      const R = W < 700 ? 110 : 150;

      for (const it of items) {
        const dx = it.x - px, dy = it.y - py, d = Math.hypot(dx, dy);
        if (d < R && d > 0.1) {
          const f = (1 - d / R) * 2600 * dt;
          it.vx += (dx / d) * f; it.vy += (dy / d) * f;
        }
        it.vx *= damp; it.vy *= damp;
        it.x += (it.vx + Math.sin(t * it.wob + it.ph) * 8) * dt;
        it.y += (it.vy - it.rise) * dt;
        if (it.y < -40 || it.x < -60 || it.x > W + 60) Object.assign(it, makeItem(true));

        if (it.coin && coin.complete && coin.naturalWidth) {
          const flip = Math.cos(t * it.spin + it.ph);
          ctx.save();
          ctx.translate(it.x, it.y);
          ctx.scale(Math.max(0.12, Math.abs(flip)), 1);
          ctx.globalAlpha = 0.45 + it.depth * 0.5;
          ctx.drawImage(coin, -it.size / 2, -it.size / 2, it.size, it.size);
          ctx.restore();
        } else if (!it.coin) {
          ctx.fillStyle = '#ffe7a3';
          star(it.x, it.y, it.size, (0.35 + 0.65 * Math.abs(Math.sin(t * 2.2 + it.ph))) * it.depth);
        }
      }

      // Tap bursts: sparks fly out and fade.
      bursts = bursts.filter((b) => (b.life -= dt) > 0);
      for (const b of bursts) {
        b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 260 * dt;
        ctx.fillStyle = b.c;
        star(b.x, b.y, b.r * (0.5 + b.life), Math.min(1, b.life * 1.6));
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf && visible) { last = 0; raf = requestAnimationFrame(frame); } };

    const pos = (e) => { const r = host.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; };
    const onMove = (e) => pos(e);
    const onLeave = () => { px = py = -9999; };
    const onDown = (e) => {
      pos(e);
      for (const it of items) {
        const dx = it.x - px, dy = it.y - py, d = Math.hypot(dx, dy) || 1;
        if (d < 220) { const f = (1 - d / 220) * 700; it.vx += (dx / d) * f; it.vy += (dy / d) * f; }
      }
      for (let i = 0; i < 16; i++) {
        const a = rand(0, Math.PI * 2), s = rand(120, 380);
        bursts.push({ x: px, y: py, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, r: rand(3, 7), life: rand(0.6, 1.1), c: Math.random() < 0.5 ? '#ffd76a' : '#ff9cf7' });
      }
    };

    resize();
    const ro = new ResizeObserver(resize); ro.observe(host);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); });
    io.observe(host);
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerdown', onDown, { passive: true });
    host.addEventListener('pointerleave', onLeave, { passive: true });
    host.addEventListener('pointercancel', onLeave, { passive: true });
    start();

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerdown', onDown);
      host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('pointercancel', onLeave);
    };
  }, []);

  return <canvas className="hx-coins" ref={ref} aria-hidden="true" />;
}
