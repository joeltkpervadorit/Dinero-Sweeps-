/* Visual effects for the genie: crown coins, magic bolts from his finger guns, the fake "zap" of a card (shake,
 * flash, cracks, sparkles) that repairs itself after a moment, and puffs of genie smoke. Purely visual: coins
 * are not connected to GC, SC, wallets or rewards, and a zapped card is only animated, never changed.
 * One fixed canvas over the viewport, shown only while something is alive. Positions are document px. */

const GRAVITY = 1500;
const DEBRIS_COLORS = ['#ffd166', '#fe49f3', '#ff85f8', '#7b3cff', '#b303a9', '#fff3c4', '#ffffff'];

// Drawn coin, used until the crown coin from the atlas has loaded.
function coinSprite(r) {
  const c = document.createElement('canvas');
  const s = Math.ceil(r * 2 + 4);
  c.width = c.height = s;
  const g = c.getContext('2d');
  const m = s / 2;
  const body = g.createRadialGradient(m - r * 0.35, m - r * 0.4, r * 0.1, m, m, r);
  body.addColorStop(0, '#fff6c2');
  body.addColorStop(0.35, '#ffd166');
  body.addColorStop(0.8, '#ffb800');
  body.addColorStop(1, '#c97a00');
  g.fillStyle = body;
  g.beginPath(); g.arc(m, m, r, 0, Math.PI * 2); g.fill();
  g.lineWidth = Math.max(1, r * 0.14);
  g.strokeStyle = '#a65f00';
  g.beginPath(); g.arc(m, m, r * 0.68, 0, Math.PI * 2); g.stroke();
  return c;
}

function puffSprite() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(229,140,255,.85)');
  gr.addColorStop(0.55, 'rgba(162,62,232,.4)');
  gr.addColorStop(1, 'rgba(106,15,166,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  return c;
}

function star(g, x, y, r, a) {
  g.globalAlpha = a;
  g.beginPath();
  g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r, y);
  g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r, y);
  g.quadraticCurveTo(x, y, x, y - r);
  g.fill();
}

/** Jagged crack lines from (x, y), kept inside the card rect. */
function crackLines(x, y, rect) {
  const lines = [];
  const reach = Math.min(rect.w, rect.h) * 0.7;
  const n = 6 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) {
    let a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
    let px = x;
    let py = y;
    const pts = [[px, py]];
    const steps = 3 + Math.floor(Math.random() * 3);
    for (let k = 0; k < steps; k++) {
      a += (Math.random() - 0.5) * 0.9;
      const len = (reach / steps) * (0.6 + Math.random() * 0.8);
      px = Math.max(rect.x + 2, Math.min(rect.x + rect.w - 2, px + Math.cos(a) * len));
      py = Math.max(rect.y + 2, Math.min(rect.y + rect.h - 2, py + Math.sin(a) * len));
      pts.push([px, py]);
    }
    lines.push(pts);
  }
  return lines;
}

// Shake, flash, sag while "enchanted", then pop back. Added on top of the card's own transform.
const ZAP_FRAMES = [
  { transform: 'translate(0,0)', filter: 'brightness(1)' },
  { offset: 0.05, transform: 'translate(-7px,2px) rotate(-1.4deg)', filter: 'brightness(2.2) saturate(1.4)' },
  { offset: 0.1, transform: 'translate(6px,-3px) rotate(1.1deg)', filter: 'brightness(1.6) hue-rotate(-25deg)' },
  { offset: 0.16, transform: 'translate(-3px,3px) rotate(-0.8deg) scale(0.96)', filter: 'brightness(0.6) grayscale(0.7)' },
  { offset: 0.74, transform: 'translate(0,4px) rotate(-0.8deg) scale(0.96)', filter: 'brightness(0.6) grayscale(0.7)' },
  { offset: 0.86, transform: 'translate(0,-2px) scale(1.03)', filter: 'brightness(1.35)' },
  { transform: 'translate(0,0)', filter: 'brightness(1)' },
];
const ZAP_MS = 2300;

/** `onClink(strength)` is called when a coin bounces (for the sound); `coin()` returns the atlas coin or null. */
export function createEffects({ zIndex, onClink, coin }) {
  let canvas = null;
  let ctx = null;
  let drawn = null;
  let drawnR = 0;
  let puffImg = null;
  let dpr = 1;
  const coins = [];
  const sparks = [];
  const bolts = [];
  const debris = [];
  const cracks = [];
  const puffs = [];

  function ensure() {
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'ds-genie-fx';
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.zIndex = zIndex;
      document.body.appendChild(canvas);
      ctx = canvas.getContext('2d');
      puffImg = puffSprite();
    }
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = document.documentElement.clientWidth;
    const h = window.innerHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    canvas.style.display = 'block';
  }

  function sparkle(x, y, n, spread) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = spread * (0.4 + Math.random() * 0.6);
      sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - spread * 0.3, life: 0.45 + Math.random() * 0.25, t: 0, r: 2 + Math.random() * 3, gold: Math.random() < 0.6 });
    }
  }

  function zap(el, x, y, floorY) {
    const r = el.getBoundingClientRect();
    const sy = window.scrollY;
    const rect = { x: r.left, y: r.top + sy, w: r.width, h: r.height };
    cracks.push({ x, y, rect, lines: crackLines(x, y, rect), t: 0, life: (ZAP_MS / 1000) * 0.8 });
    for (let i = 0; i < 18; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 120 + Math.random() * 280;
      debris.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 220,
        s: 3 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 18,
        color: DEBRIS_COLORS[i % DEBRIS_COLORS.length], t: 0, life: 1.1 + Math.random() * 0.5, floorY,
      });
    }
    sparkle(x, y, 14, 230);
    try {
      el.animate(ZAP_FRAMES, { duration: ZAP_MS, easing: 'ease-out', composite: 'add' });
    } catch (e) {
      try { el.animate(ZAP_FRAMES, { duration: ZAP_MS, easing: 'ease-out' }); } catch (err) { /* no WAAPI: cracks and sparkles only */ }
    }
  }

  return {
    get active() { return coins.length + sparks.length + bolts.length + debris.length + cracks.length + puffs.length > 0; },
    get count() { return coins.length; },

    /** Burst of coins from (x, y) toward `dir`; `ground(x)` gives the surface they bounce on. */
    burst(x, y, dir, size, ground, gentle) {
      ensure();
      const n = gentle ? 4 : 7;
      for (let i = 0; i < n; i++) {
        coins.push({
          x, y,
          vx: gentle ? dir * (20 + i * 14) : dir * (140 + Math.random() * 260),
          vy: gentle ? -40 - i * 8 : -(260 + Math.random() * 300),
          r: size * (0.85 + Math.random() * 0.3),
          spin: 6 + Math.random() * 8,
          t: Math.random() * 3,
          ground, rest: 0, state: 'fly', gentle,
        });
      }
      sparkle(x, y, gentle ? 4 : 10, gentle ? 60 : 180);
    },

    /** A magic bolt from (x0, y0) to the card's impact point, then the card gets zapped. */
    blast(x0, y0, el, x1, y1, floorY, onHit) {
      ensure();
      const dist = Math.hypot(x1 - x0, y1 - y0);
      bolts.push({ x0, y0, x1, y1, t: 0, dur: Math.max(0.14, dist / 1600), el, floorY, onHit });
      sparkle(x0, y0, 6, 120);
    },

    /** Genie smoke: `n` puffs around (x, y) of about `size` px. */
    puff(x, y, n, size) {
      ensure();
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = size * (0.6 + Math.random() * 1.2);
        puffs.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.5 - size * 0.4, s: size * (0.5 + Math.random() * 0.5), t: 0, life: 0.55 + Math.random() * 0.35 });
      }
    },

    /** A few sparkles (dash trails, little magic). */
    sparkle(x, y, n, spread) {
      ensure();
      sparkle(x, y, n, spread);
    },

    /** Send every coin to the target; `onEach` fires as each one arrives. */
    collect(getTarget, onEach) {
      coins.forEach((c, i) => {
        c.state = 'home';
        c.delay = i * 0.06;
        c.k = 0;
        c.sx = c.x; c.sy = c.y;
        c.target = getTarget;
        c.onArrive = onEach;
      });
    },

    /** True once all coins have stopped bouncing (or after a while). */
    settled() {
      return coins.every((c) => c.state !== 'fly' || c.rest > 0.25 || c.t > 2.4);
    },

    update(dt) {
      if (!canvas) return;
      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i];
        c.t += dt;
        if (c.state === 'fly') {
          if (c.gentle) {
            c.x += c.vx * dt; c.y += c.vy * dt; c.vy *= 0.94; c.vx *= 0.94;
            c.rest = c.t > 0.6 ? c.rest + dt : 0;
            continue;
          }
          c.vy += GRAVITY * dt;
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          const gy = c.ground(c.x) - c.r;
          if (c.y > gy) {
            c.y = gy;
            if (Math.abs(c.vy) > 120) {
              onClink?.(Math.min(1, Math.abs(c.vy) / 600));
              c.vy = -Math.abs(c.vy) * 0.45;
              c.vx *= 0.7;
              if (Math.random() < 0.5) sparkle(c.x, c.y + c.r, 2, 80);
            } else {
              c.vy = 0;
              c.vx *= 0.85;
              c.rest += dt;
            }
          }
          const vw = document.documentElement.clientWidth;
          if (c.x < c.r || c.x > vw - c.r) { c.vx = -c.vx * 0.6; c.x = Math.max(c.r, Math.min(vw - c.r, c.x)); }
        } else {
          if (c.delay > 0) { c.delay -= dt; continue; }
          const tgt = c.target();
          c.k = Math.min(1, c.k + dt / 0.38);
          const e = c.k * c.k * (3 - 2 * c.k);
          c.x = c.sx + (tgt.x - c.sx) * e;
          c.y = c.sy + (tgt.y - c.sy) * e - Math.sin(c.k * Math.PI) * 40;
          if (c.k >= 1) {
            sparkle(tgt.x, tgt.y, 5, 120);
            coins.splice(i, 1);
            c.onArrive?.(coins.length);
          }
        }
      }
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i];
        b.t += dt;
        if (b.t >= b.dur) {
          bolts.splice(i, 1);
          if (b.el.isConnected) zap(b.el, b.x1, b.y1, b.floorY);
          b.onHit?.();
        }
      }
      for (let i = debris.length - 1; i >= 0; i--) {
        const d = debris[i];
        d.t += dt;
        if (d.t >= d.life) { debris.splice(i, 1); continue; }
        d.vy += GRAVITY * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.rot += d.vr * dt;
        if (d.y > d.floorY) { d.y = d.floorY; d.vy = -d.vy * 0.3; d.vx *= 0.6; }
      }
      for (let i = cracks.length - 1; i >= 0; i--) {
        if ((cracks[i].t += dt) >= cracks[i].life) cracks.splice(i, 1);
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.t += dt;
        if (s.t >= s.life) { sparks.splice(i, 1); continue; }
        s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= 0.9; s.vy = s.vy * 0.9 + 160 * dt;
      }
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.t += dt;
        if (p.t >= p.life) { puffs.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy *= 0.92;
      }
    },

    draw() {
      if (!canvas) return;
      if (!this.active) { canvas.style.display = 'none'; return; }
      const sy = window.scrollY;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const p of puffs) {
        const k = p.t / p.life;
        const s = p.s * (0.6 + k * 1.1);
        ctx.globalAlpha = (1 - k) * 0.9;
        ctx.drawImage(puffImg, p.x - s, p.y - sy - s, s * 2, s * 2);
      }

      for (const c of cracks) {
        const k = c.t / c.life;
        const a = k < 0.8 ? 1 : 1 - (k - 0.8) / 0.2;
        if (c.t < 0.35) {
          ctx.globalAlpha = 1 - c.t / 0.35;
          ctx.strokeStyle = '#ffc8fb';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(c.x, c.y - sy, 8 + c.t * 160, 0, Math.PI * 2);
          ctx.stroke();
        }
        for (const [w, color] of [[4, 'rgba(18,4,34,.75)'], [1.6, '#ffd6ff']]) {
          ctx.globalAlpha = a;
          ctx.strokeStyle = color;
          ctx.lineWidth = w;
          ctx.beginPath();
          for (const pts of c.lines) {
            ctx.moveTo(pts[0][0], pts[0][1] - sy);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] - sy);
          }
          ctx.stroke();
        }
      }

      for (const d of debris) {
        ctx.globalAlpha = Math.min(1, (d.life - d.t) / 0.3);
        ctx.fillStyle = d.color;
        ctx.save();
        ctx.translate(d.x, d.y - sy);
        ctx.rotate(d.rot);
        ctx.fillRect(-d.s / 2, -d.s / 2, d.s, d.s * 0.7);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      for (const b of bolts) {
        const k = Math.min(1, b.t / b.dur);
        const hx = b.x0 + (b.x1 - b.x0) * k;
        const hy = b.y0 + (b.y1 - b.y0) * k;
        const tk = Math.max(0, k - 0.4);
        const tx = b.x0 + (b.x1 - b.x0) * tk;
        const ty = b.y0 + (b.y1 - b.y0) * tk;
        for (const [w, color] of [[11, 'rgba(254,73,243,.3)'], [5, '#ff85f8'], [2, '#fff3c4']]) {
          ctx.strokeStyle = color;
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.moveTo(tx, ty - sy);
          ctx.lineTo(hx, hy - sy);
          ctx.stroke();
        }
        ctx.fillStyle = '#ffd166';
        star(ctx, hx, hy - sy, 9, 1);
        ctx.globalAlpha = 1;
      }

      if (coins.length) {
        const art = coin();
        for (const c of coins) {
          const sx = Math.max(0.15, Math.abs(Math.cos(c.t * c.spin)));
          ctx.save();
          ctx.translate(c.x, c.y - sy);
          ctx.scale(sx, 1);
          if (art) {
            const [fx, fy, fw, fh] = art.f;
            ctx.drawImage(art.img, fx, fy, fw, fh, -c.r * 1.25, -c.r * 1.25, c.r * 2.5, c.r * 2.5);
          } else {
            const r = Math.round(c.r);
            if (drawnR !== r) { drawn = coinSprite(r * 2); drawnR = r; }
            ctx.drawImage(drawn, -c.r - 2, -c.r - 2, c.r * 2 + 4, c.r * 2 + 4);
          }
          ctx.restore();
        }
      }
      for (const s of sparks) {
        ctx.fillStyle = s.gold ? '#fff3b0' : '#ff9cf6';
        star(ctx, s.x, s.y - sy, s.r, 1 - s.t / s.life);
      }
      ctx.globalAlpha = 1;
    },

    clear() {
      coins.length = 0;
      sparks.length = 0;
      bolts.length = 0;
      debris.length = 0;
      cracks.length = 0;
      puffs.length = 0;
      if (canvas) canvas.style.display = 'none';
    },

    destroy() {
      canvas?.remove();
      canvas = null;
    },
  };
}
