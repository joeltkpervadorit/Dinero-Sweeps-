/* The genie's body: one painted sprite (public/mascot/dino.webp, transparent) and the code that brings it to life.
 * Knows nothing about the page.
 *
 * There are no frames: life comes from CSS on the sprite (breathing, a gentle sway) plus variables the engine sets
 * (head tilt, tail lag while he flies, glow, shadow). Same contract as before, so engine.js only sees createRig().
 * The figure is upright and unmirrored in a box measured in "rig units" (head top to tail tip = SPAN); facing, lean,
 * squash and hover are a CSS transform on the wrapper, applied by the engine. */

const SRC = '/assets/mascot/dino.webp';
const ASPECT = 480 / 550; // sprite width / height

export const SPAN = 720;                       // head top to tail tip, in rig units
const W = SPAN * ASPECT;                        // sprite width in rig units
const TIP = 0.45;                               // fraction of the width where the tail tip is (rests on a card)
export const CENTER = { x: 350, y: 748 };
export const WAIST = { x: 350, y: CENTER.y - SPAN * 0.4 };
export const MUZZLE = { x: W * (0.88 - TIP), y: -SPAN * 0.62 }; // his right hand, where the finger-gun magic starts
export const CHEST = { x: 0, y: -SPAN * 0.55 };

// Box reach around CENTER, in rig units (room for the glow and the tail lag).
const LEFT = 440;
const UP = 808;
const DOWN = 92;

let coinPromise = null;
let coin = null;
let spritePromise = null;

/** 'core' preloads the sprite; 'extra' loads the crown coin the effects throw. */
export function loadAtlas(name) {
  if (name === 'extra') {
    if (!coinPromise) {
      coinPromise = new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => { coin = { img, f: [0, 0, img.naturalWidth, img.naturalHeight] }; resolve(img); };
        img.onerror = () => { coinPromise = null; reject(new Error('genie coin')); };
        img.src = '/assets/prop-crown-coin.webp';
      });
    }
    return coinPromise;
  }
  if (!spritePromise) {
    spritePromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => { spritePromise = null; reject(new Error('genie sprite')); };
      img.src = SRC;
    });
  }
  return spritePromise;
}

/** One sprite serves every pose. */
export function poseReady(pose) {
  return pose === 'happy' || pose === 'talk' || pose === 'wink';
}

export function poseAtlas() {
  return 'extra';
}

/** The crown coin for effects.js: { img, f: [x, y, w, h] } or null until it loads. */
export function coinImage() {
  return coin;
}

export function createRig() {
  const box = document.createElement('div'); // appended by the engine
  box.className = 'ds-genie-rig';
  box.style.position = 'relative';
  const aura = document.createElement('div');
  const shadow = document.createElement('div');
  const img = document.createElement('img');
  img.className = 'ds-genie-sprite';
  img.src = SRC;
  img.alt = '';
  img.draggable = false;
  img.decoding = 'async';
  for (const el of [aura, shadow, img]) { el.style.position = 'absolute'; box.appendChild(el); }
  aura.style.background = 'radial-gradient(closest-side,rgba(224,123,255,.42),rgba(154,53,224,.16) 60%,rgba(90,15,160,0))';
  shadow.style.background = 'radial-gradient(closest-side,rgba(16,2,34,.6),rgba(16,2,34,0))';

  let S = 0.2; // CSS px per rig unit
  const last = {};

  function place(el, rx, ry, rw, rh) { // rig-unit rectangle -> px in the box (CENTER sits at (LEFT, UP))
    el.style.left = (LEFT + rx - CENTER.x) * S + 'px';
    el.style.top = (UP + ry - CENTER.y) * S + 'px';
    el.style.width = rw * S + 'px';
    el.style.height = rh * S + 'px';
  }

  function resize(bodyH) {
    S = bodyH / SPAN;
    box.style.width = Math.ceil(LEFT * 2 * S) + 'px';
    box.style.height = Math.ceil((UP + DOWN) * S) + 'px';
    place(img, CENTER.x - W * TIP, CENTER.y - SPAN, W, SPAN);
    place(aura, 20, 40, 660, 720);
    for (const k of Object.keys(last)) delete last[k];
  }

  const n = (v, d) => (+v).toFixed(d);

  function draw(st) {
    const rot = n(st.headRot * 0.5, 1);
    const lag = n(-st.lagX * 0.02, 2);
    const key = rot + '|' + lag;
    if (last.t !== key) { last.t = key; img.style.setProperty('--rot', rot + 'deg'); img.style.setProperty('--skew', lag + 'deg'); }
    const g = n(Math.min(1, st.glow + st.shimmer * 0.4), 2);
    if (last.g !== g) { last.g = g; aura.style.opacity = g; }
    const sh = n(st.shadow, 2) + '|' + n(st.hover, 0);
    if (last.sh !== sh) {
      last.sh = sh;
      shadow.style.opacity = n(st.shadow, 2);
      place(shadow, CENTER.x - 10 - 170, CENTER.y + 8 + st.hover - 20, 340, 40);
    }
    return true;
  }

  return {
    canvas: box,
    resize,
    draw,
    get S() { return S; },
    get ax() { return LEFT * S; },
    get ay() { return UP * S; },
    get waistY() { return (UP - (CENTER.y - WAIST.y)) * S; },
  };
}
