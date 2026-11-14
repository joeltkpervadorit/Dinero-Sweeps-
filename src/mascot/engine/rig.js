/* The genie's body: atlas loading and the puppet renderer. Knows nothing about the page.
 * The genie is the original painted artwork split into layers (tail, body, head, jaw) per pose. There are no
 * frame sequences: life comes from rippling the smoke tail row by row, breathing, head nods, blinks and the
 * talking jaw. Everything is drawn in "rig units" (the 700 x 800 painting) at the size set by resize().
 *
 * The canvas holds the genie upright and unmirrored. Facing, lean, squash, hover and spin are applied by the
 * engine as a CSS transform on the wrapper (GPU-composited), so the canvas only redraws for things that
 * really change pixels, at most 30 times a second. */
import ATLAS from './atlas.json';

const BASE = '/mascot/';

// Rig points in rig units. CENTER is the figure's middle and the tail tip, the point that rests on a card.
export const CENTER = { x: 350, y: 748 };
export const WAIST = { x: 350, y: 540 };
export const SPAN = 720;                                      // head top to tail tip
export const MUZZLE = { x: 540 - CENTER.x, y: 330 - CENTER.y }; // wink pose: tip of the pointing finger
export const CHEST = { x: 0, y: 420 - CENTER.y };

// Per pose: neck pivot, jaw top (the jaw opens downward from here), eyelids [x, y, rx, ry, colour].
const RIG = {
  happy: { neck: [350, 372], jawTop: 249, lids: [[315, 207, 17, 18, '#b4319f'], [378, 205, 17, 18, '#b9339f']] },
  talk: { neck: [310, 330], jawTop: 206, lids: [[275, 160, 17, 19, '#b02ca2'], [342, 150, 16, 18, '#c637bb']] },
  wink: { neck: [300, 350], jawTop: 230, lids: [[315, 170, 17, 18, '#b737b5']] },
};

// Canvas reach around CENTER, in rig units (room for the smoke lag and the glow).
const LEFT = 440;
const UP = 808;
const DOWN = 92;
const TAIL_MARGIN = 110; // the rippled tail may sway this far sideways

const images = {};
const loading = {};

export function loadAtlas(name) {
  if (!loading[name]) {
    loading[name] = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => { images[name] = img; resolve(img); };
      img.onerror = () => { loading[name] = null; reject(new Error('genie atlas ' + name)); };
      img.src = BASE + name + '.webp';
    });
  }
  return loading[name];
}

/** True once the atlas holding this pose has arrived. */
export function poseReady(pose) {
  const p = ATLAS.parts[pose];
  return !!(p && images[p.atlas]);
}

export function poseAtlas(pose) {
  return ATLAS.parts[pose].atlas;
}

/** The crown coin from the atlas, for effects.js: { img, f: [x, y, w, h] } or null until it loads. */
export function coinImage() {
  const img = images[ATLAS.coin.atlas];
  return img ? { img, f: ATLAS.coin.f } : null;
}

// Soft glows drawn once, then stretched.
function radial(stops) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  return c;
}
let AURA = null;
let BASE_GLOW = null;

export function createRig() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!AURA) {
    AURA = radial([[0, 'rgba(224,123,255,.42)'], [0.6, 'rgba(154,53,224,.16)'], [1, 'rgba(90,15,160,0)']]);
    BASE_GLOW = radial([[0, 'rgba(255,106,242,.55)'], [0.5, 'rgba(162,62,232,.2)'], [1, 'rgba(90,15,160,0)']]);
  }

  let S = 0.2; // CSS px per rig unit
  let dpr = 1;
  let D = 0.2; // device px per rig unit
  let cw = 0;
  let ch = 0;
  const tails = {}; // pose -> { src, buf, w, h, ox, oy } at device scale

  function resize(bodyH) {
    S = bodyH / SPAN;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    D = S * dpr;
    cw = Math.ceil(LEFT * 2 * S);
    ch = Math.ceil((UP + DOWN) * S);
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    for (const k of Object.keys(tails)) delete tails[k];
  }

  // The tail is pre-scaled once to device pixels; each redraw shifts its 2 px rows sideways 1:1 into a buffer
  // (no seams), and the buffer is drawn into the genie like any other layer.
  function tailFor(pose) {
    if (tails[pose]) return tails[pose];
    const P = ATLAS.parts[pose];
    const [x, y, w, h, ox, oy] = P.tail;
    const k = ATLAS.k;
    const uw = w / k;
    const uh = h / k;
    const W = Math.ceil((uw + TAIL_MARGIN * 2) * D);
    const H = Math.ceil(uh * D);
    const src = document.createElement('canvas');
    src.width = W; src.height = H;
    const g = src.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(images[P.atlas], x, y, w, h, TAIL_MARGIN * D, 0, uw * D, uh * D);
    const buf = document.createElement('canvas');
    buf.width = W; buf.height = H;
    tails[pose] = { src, buf, bctx: buf.getContext('2d'), W, H, ox: ox - TAIL_MARGIN, oy, uw: uw + TAIL_MARGIN * 2, uh };
    return tails[pose];
  }

  function part(pose, name, dy = 0) {
    const P = ATLAS.parts[pose];
    const r = P[name];
    if (!r) return;
    const k = ATLAS.k;
    ctx.drawImage(images[P.atlas], r[0], r[1], r[2], r[3], r[4], r[5] + dy, r[2] / k, r[3] / k);
  }

  function drawTail(pose, st, alpha) {
    const T = tailFor(pose);
    const g = T.bctx;
    g.clearRect(0, 0, T.W, T.H);
    const t = st.t;
    for (let py = 0; py < T.H; py += 2) {
      const y = T.oy + py / D;
      const f = Math.max(0, Math.min(1, (y - 505) / 250));
      const fe = f ** 1.25;
      let off = (Math.sin(y * 0.045 - t * 2.3) * 9 + Math.sin(y * 0.019 + t * 1.2) * 6) * fe * st.wave + st.lagX * f * f;
      if (st.swirl) off += Math.sin(y * 0.03 + t * 6) * 26 * st.swirl * fe;
      const h = Math.min(2, T.H - py);
      g.drawImage(T.src, 0, py, T.W, h, off * D, py, T.W, h);
    }
    ctx.globalAlpha = alpha;
    ctx.drawImage(T.buf, T.ox, T.oy, T.uw, T.uh);
    if (st.shimmer > 0.02) {
      // The same smoke added lightly on top: it glows while he flies or does magic.
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = alpha * st.shimmer;
      ctx.drawImage(T.buf, T.ox + 3, T.oy, T.uw, T.uh);
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  function drawPose(pose, st, alpha) {
    const r = RIG[pose];
    drawTail(pose, st, alpha);
    ctx.globalAlpha = alpha;
    ctx.save();
    ctx.translate(WAIST.x, WAIST.y);
    ctx.scale(1, 1 + st.breathe * 0.014);
    ctx.translate(-WAIST.x, -WAIST.y);
    part(pose, 'body');
    ctx.restore();

    ctx.save();
    ctx.translate(r.neck[0], r.neck[1] + st.headY);
    ctx.rotate((st.headRot * Math.PI) / 180);
    ctx.translate(-r.neck[0], -r.neck[1]);
    part(pose, 'head');
    if (st.jaw > 0.001) {
      ctx.save();
      ctx.translate(0, r.jawTop + 9);
      ctx.scale(1, 1 + st.jaw * 0.07);
      part(pose, 'jaw', -(r.jawTop + 9));
      ctx.restore();
    }
    if (st.blink > 0.02) {
      for (const [lx, ly, rx, ry, col] of r.lids) {
        const hh = (ry + 4) * 2 * st.blink;
        const top = ly - ry - 4;
        const gr = ctx.createLinearGradient(0, top, 0, top + hh);
        gr.addColorStop(0, col);
        gr.addColorStop(1, '#8a2186');
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.ellipse(lx, top + hh / 2, rx + 4, Math.max(1, hh / 2), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(40,8,46,.85)';
        ctx.beginPath();
        ctx.ellipse(lx, top + hh - 1, rx + 2, 2.5, 0, 0, Math.PI);
        ctx.stroke();
      }
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /** Draw the genie for state `st` (see engine.js `look`). Returns false until the pose's atlas is loaded. */
  function draw(st) {
    const pose = poseReady(st.pose) ? st.pose : 'happy';
    if (!poseReady(pose)) return false;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // rig units -> device px, with CENTER at (LEFT, UP) in canvas units
    ctx.setTransform(D, 0, 0, D, (LEFT - CENTER.x) * D, (UP - CENTER.y) * D);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (st.shadow > 0.01) {
      ctx.globalAlpha = st.shadow;
      ctx.fillStyle = 'rgba(16,2,34,.55)';
      ctx.beginPath();
      ctx.ellipse(CENTER.x - 10, CENTER.y + 8 + st.hover, 170, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = Math.min(1, st.glow);
    ctx.drawImage(AURA, 20, 40, 660, 720);
    ctx.globalAlpha = Math.min(1, 0.5 + 0.2 * st.wave);
    ctx.drawImage(BASE_GLOW, 70, 500, 520, 300);
    ctx.globalAlpha = 1;

    drawPose(pose, st, 1);
    // The previous pose fades out on top, so a pose change never dips in opacity.
    if (st.prev && st.prev !== pose && st.mix < 1 && poseReady(st.prev)) drawPose(st.prev, st, 1 - st.mix);
    return true;
  }

  return {
    canvas,
    resize,
    draw,
    /** CSS px per rig unit. */
    get S() { return S; },
    /** Canvas px of CENTER (the tail tip) and of the waist (the transform origin). */
    get ax() { return LEFT * S; },
    get ay() { return UP * S; },
    get waistY() { return (UP - (CENTER.y - WAIST.y)) * S; },
  };
}
