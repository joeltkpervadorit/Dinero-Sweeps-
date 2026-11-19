/* Genie Smoke — tap / click / swipe effect (from the Dinero Sweeps landing page).
   Tap or click  → a puff of pink-violet smoke, a soft gold ring and gold sparkles at the pointer.
   Swipe or drag → a smoke trail that follows the finger (or the mouse while the button is held).
   One fixed <canvas> with pointer-events: none — links, buttons and native scrolling are never blocked.
   Runs only while particles are alive. Does nothing for visitors who prefer reduced motion.
   No dependencies. Works in any framework (React, Next.js, Vue, plain HTML).

   Usage:
     import { initGenieSmoke } from './genie-smoke.js';
     const destroy = initGenieSmoke();          // optional: initGenieSmoke({ alpha: 0.4, tapPuffs: 12 })
     // later (e.g. on unmount): destroy();
     // trigger by code:  window.__genieSmokeBurst?.(x, y)
*/
export const GENIE_SMOKE_DEFAULTS = {
  colors: [[254, 73, 243], [176, 92, 255], [255, 133, 248], [123, 60, 255]], // pink · violet · light pink · deep violet (RGB)
  gold: [255, 207, 90],   // ring + sparkles (RGB)
  tapPuffs: 16,           // smoke puffs per tap
  tapSparks: 10,          // gold sparkles per tap
  trailEvery: 14,         // px of finger travel between trail puffs (lower = denser trail)
  life: [0.9, 1.5],       // seconds a puff lives (min, max)
  size: [26, 54],         // starting puff radius in px (min, max)
  grow: 2.4,              // how much a puff expands over its life
  alpha: 0.5,             // peak smoke opacity (the swipe trail uses 60% of this)
  max: 260,               // particle cap (performance)
  zIndex: 55,             // stacking order of the effect canvas
  blend: 'screen',        // mix-blend-mode; 'screen' glows on dark backgrounds — use 'normal' on light pages
  ignore: '.dn-root',     // taps inside elements matching this selector make no burst ('' = none)
  respectReducedMotion: true
};

export function initGenieSmoke(options) {
  if (typeof window === 'undefined') return function () {};          // SSR safe
  if (window.__genieSmokeActive) return window.__genieSmokeActive;   // only one instance per page
  var CFG = Object.assign({}, GENIE_SMOKE_DEFAULTS, options || {});
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (CFG.respectReducedMotion && reduce && reduce.matches) return function () {};
  var cv, cx, W = 0, H = 0, DPR = 1, parts = [], raf = 0, last = 0, sprites = [], spark;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* soft, wispy smoke sprite: many blurred blobs inside one circle */
  function smokeSprite(c) {
    var s = 128, o = document.createElement('canvas'); o.width = o.height = s;
    var g = o.getContext('2d');
    for (var i = 0; i < 30; i++) {                      // wisps: many small soft blobs, denser toward the middle
      var a = Math.random() * Math.PI * 2, d = Math.pow(Math.random(), 0.7) * s * 0.3,
          x = s / 2 + Math.cos(a) * d, y = s / 2 + Math.sin(a) * d, r = rnd(s * 0.07, s * 0.2);
      var gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(' + c + ',' + rnd(0.18, 0.4).toFixed(2) + ')'); gr.addColorStop(1, 'rgba(' + c + ',0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }
    g.globalCompositeOperation = 'destination-out';     // tear holes so it reads as smoke, not a ball
    for (var j = 0; j < 9; j++) {
      var hx = rnd(s * 0.2, s * 0.8), hy = rnd(s * 0.2, s * 0.8), hr = rnd(s * 0.05, s * 0.13);
      var hg = g.createRadialGradient(hx, hy, 0, hx, hy, hr);
      hg.addColorStop(0, 'rgba(0,0,0,0.55)'); hg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = hg; g.beginPath(); g.arc(hx, hy, hr, 0, 7); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
    var core = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s * 0.3);
    core.addColorStop(0, 'rgba(255,235,255,0.14)'); core.addColorStop(1, 'rgba(255,235,255,0)');
    g.fillStyle = core; g.fillRect(0, 0, s, s);
    return o;
  }
  function sparkSprite() {
    var s = 48, o = document.createElement('canvas'); o.width = o.height = s;
    var g = o.getContext('2d'), c = CFG.gold.join(','), h = s / 2;
    var gr = g.createRadialGradient(h, h, 0, h, h, h);
    gr.addColorStop(0, 'rgba(255,250,220,1)'); gr.addColorStop(0.25, 'rgba(' + c + ',0.9)'); gr.addColorStop(1, 'rgba(' + c + ',0)');
    g.fillStyle = gr; g.fillRect(0, 0, s, s);
    g.fillStyle = 'rgba(255,248,215,0.95)';                      // four-point star glint
    g.beginPath(); g.moveTo(h, 2); g.quadraticCurveTo(h + 3, h - 3, s - 2, h); g.quadraticCurveTo(h + 3, h + 3, h, s - 2);
    g.quadraticCurveTo(h - 3, h + 3, 2, h); g.quadraticCurveTo(h - 3, h - 3, h, 2); g.fill();
    return o;
  }

  function setup() {
    cv = document.createElement('canvas');
    cv.className = 'genie-smoke'; cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:' + CFG.zIndex + ';mix-blend-mode:' + CFG.blend;
    document.body.appendChild(cv);
    cx = cv.getContext('2d');
    CFG.colors.forEach(function (c) { for (var v = 0; v < 3; v++) sprites.push(smokeSprite(c.join(','))); });
    spark = sparkSprite();
    size(); window.addEventListener('resize', size);
  }
  function size() {
    DPR = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  }

  function add(p) { if (parts.length >= CFG.max) parts.shift(); parts.push(p); if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }
  function puff(x, y, vx, vy, scale, a) {
    add({ k: 0, a: a || 1, seed: rnd(0, 6.28), x: x, y: y, vx: vx, vy: vy, r: rnd(CFG.size[0], CFG.size[1]) * (scale || 1), t: 0,
          life: rnd(CFG.life[0], CFG.life[1]), rot: rnd(0, 6.28), vr: rnd(-1.2, 1.2), img: sprites[(Math.random() * sprites.length) | 0] });
  }
  function sparkle(x, y, a, sp) {
    add({ k: 1, x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, r: rnd(7, 13), t: 0, life: rnd(0.6, 1.0) });
  }
  function ring(x, y) { add({ k: 2, x: x, y: y, t: 0, life: 0.55 }); }

  function burst(x, y) {
    ring(x, y);
    for (var i = 0; i < CFG.tapPuffs; i++) {
      var a = (i / CFG.tapPuffs) * Math.PI * 2 + rnd(-0.3, 0.3), sp = rnd(60, 200);
      puff(x + rnd(-6, 6), y + rnd(-6, 6), Math.cos(a) * sp, Math.sin(a) * sp - 40, rnd(0.45, 0.95));
    }
    for (var j = 0; j < CFG.tapSparks; j++) sparkle(x, y, rnd(0, 6.28), rnd(120, 300));
  }

  function tick(now) {
    var dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; // rAF time can trail a tap's performance.now()
    cx.setTransform(DPR, 0, 0, DPR, 0, 0); cx.clearRect(0, 0, W, H);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.t += dt;
      var u = p.t / p.life;
      if (u >= 1) { parts.splice(i, 1); continue; }
      if (p.k === 0) {                                   // smoke: slows, rises, swirls, grows, fades
        p.vx *= 1 - 2.2 * dt; p.vy = p.vy * (1 - 2.2 * dt) - 26 * dt; p.x += (p.vx + Math.sin(p.t * 3.2 + p.seed) * 18) * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        var r = p.r * (1 + CFG.grow * (1 - Math.pow(1 - u, 2)));
        cx.globalAlpha = CFG.alpha * p.a * Math.sin(Math.PI * Math.min(1, u * 1.15 + 0.08));
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.drawImage(p.img, -r, -r, r * 2, r * 2); cx.restore();
      } else if (p.k === 1) {                            // sparkle: flies out, falls, twinkles
        p.vx *= 1 - 1.5 * dt; p.vy = p.vy * (1 - 1.5 * dt) + 380 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        var s = p.r * (1 - u * 0.6) * (0.75 + 0.25 * Math.sin(p.t * 40));
        cx.globalAlpha = 1 - u; cx.drawImage(spark, p.x - s, p.y - s, s * 2, s * 2);
      } else {                                           // ring: quick gold shock ring
        var e = 1 - Math.pow(1 - u, 3);
        cx.globalAlpha = (1 - u) * 0.8; cx.lineWidth = 2.5 * (1 - u) + 0.5;
        cx.strokeStyle = 'rgb(' + CFG.gold.join(',') + ')';
        cx.beginPath(); cx.arc(p.x, p.y, 8 + 46 * e, 0, 7); cx.stroke();
      }
    }
    cx.globalAlpha = 1;
    raf = parts.length ? requestAnimationFrame(tick) : 0;
    if (!raf) cx.clearRect(0, 0, W, H);
  }

  /* ---------- input: taps/clicks burst, swipes/drags trail (passive — never blocks scrolling) ---------- */
  var down = false, touching = false, lx = 0, ly = 0, lt = 0, travel = 0, lastTouch = 0;
  var tx = -1, ty = -1, lastScrollY = window.scrollY, scrollAcc = 0;   // last finger point + scroll tracking (touch)
  function fromTouch() { return performance.now() - lastTouch < 900; } // ignore the fake mouse events phones send after a tap
  function ignored(e) { return CFG.ignore && e.target && e.target.closest && e.target.closest(CFG.ignore); }
  function start(x, y) { down = true; lx = x; ly = y; lt = performance.now(); travel = 0; }
  function move(x, y) {
    if (!down) return;
    var dx = x - lx, dy = y - ly, d = Math.hypot(dx, dy), now = performance.now(), dt = Math.max(16, now - lt) / 1000;
    if (d < 2) return;
    travel += d;
    // a finger gets a denser, brighter, bigger trail than a mouse drag
    var every = touching ? CFG.trailEvery * 0.55 : CFG.trailEvery, a = touching ? 0.95 : 0.6, sc = touching ? 1.25 : 1;
    var steps = Math.min(touching ? 6 : 4, Math.floor(d / every) + 1), vx = dx / dt * 0.12, vy = dy / dt * 0.12;
    for (var i = 1; i <= steps; i++) {
      var f = i / steps;
      puff(lx + dx * f + rnd(-10, 10), ly + dy * f + rnd(-10, 10), vx + rnd(-50, 50), vy + rnd(-50, 50), rnd(0.35, 0.75) * sc, a);
    }
    if (Math.random() < (touching ? 0.6 : 0.35)) sparkle(x, y, Math.atan2(dy, dx) + Math.PI + rnd(-0.6, 0.6), rnd(60, 140));
    lx = x; ly = y; lt = now;
  }
  function end(x, y, e) { if (!down) return; down = false; if (travel < (touching ? 30 : 12) && !ignored(e)) burst(x, y); }

  /* touch: instant puff the moment the finger lands, so every touch shows smoke */
  function touchPuff(x, y) {
    ring(x, y);
    for (var i = 0; i < 6; i++) { var a = rnd(0, 6.28), sp = rnd(30, 110); puff(x + rnd(-6, 6), y + rnd(-6, 6), Math.cos(a) * sp, Math.sin(a) * sp - 30, rnd(0.4, 0.8), 0.9); }
    for (var j = 0; j < 3; j++) sparkle(x, y, rnd(0, 6.28), rnd(80, 180));
  }

  /* scrolling (finger drag or momentum after release): smoke streams from where the finger last was */
  function onScroll() {
    var sy = window.scrollY, dy = sy - lastScrollY; lastScrollY = sy;
    if (tx < 0 || performance.now() - lastTouch > 2500) return;          // only after a recent touch (phones/tablets)
    scrollAcc += Math.abs(dy);
    if (scrollAcc < 16) return;
    var n = Math.min(3, Math.floor(scrollAcc / 16)); scrollAcc = 0;
    var dir = dy > 0 ? -1 : 1;                                          // smoke trails behind the scroll direction
    for (var i = 0; i < n; i++) puff(tx + rnd(-18, 18), ty + rnd(-18, 18), rnd(-40, 40), dir * rnd(40, 120), rnd(0.4, 0.8), touching ? 0.5 : 0.75);
    if (Math.random() < 0.3) sparkle(tx, ty, rnd(0, 6.28), rnd(60, 140));
  }

  var L = [
    ['touchstart', function (e) { lastTouch = performance.now(); touching = true; var t = e.touches[0]; if (t) { tx = t.clientX; ty = t.clientY; start(t.clientX, t.clientY); if (!ignored(e)) touchPuff(t.clientX, t.clientY); } }],
    ['touchmove', function (e) { lastTouch = performance.now(); var t = e.touches[0]; if (t) { tx = t.clientX; ty = t.clientY; move(t.clientX, t.clientY); } }],
    ['touchend', function (e) { lastTouch = performance.now(); var t = e.changedTouches[0]; if (t) end(t.clientX, t.clientY, e); if (!e.touches.length) touching = false; }],
    ['touchcancel', function () { down = false; touching = false; }],
    ['scroll', onScroll],
    ['mousedown', function (e) { if (e.button === 0 && !fromTouch()) start(e.clientX, e.clientY); }],
    ['mousemove', function (e) { if (e.buttons & 1) move(e.clientX, e.clientY); }],
    ['mouseup', function (e) { if (e.button === 0 && !fromTouch()) end(e.clientX, e.clientY, e); }]
  ];
  setup();
  L.forEach(function (l) { document.addEventListener(l[0], l[1], { passive: true }); });
  window.__genieSmokeBurst = burst;

  function destroy() {
    L.forEach(function (l) { document.removeEventListener(l[0], l[1], { passive: true }); });
    window.removeEventListener('resize', size);
    if (raf) cancelAnimationFrame(raf); raf = 0; parts = [];
    if (cv && cv.parentNode) cv.parentNode.removeChild(cv);
    delete window.__genieSmokeBurst; window.__genieSmokeActive = null;
  }
  window.__genieSmokeActive = destroy;
  return destroy;
}

export default initGenieSmoke;
