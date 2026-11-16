/* The genie's brain: picks what to do next and moves him (glide, dash, swoop, rest on cards, react, finger-gun
 * magic). Page knowledge lives in world.js, the puppet renderer in rig.js, coins and card zaps in effects.js.
 * Positions are document px; (me.x, me.y) is his tail tip, the point that rests on a card or hovers over the
 * bottom of the screen. He never takes pointer events: clicks on him are read from a passive window listener
 * and only count when nothing clickable is under the pointer.
 *
 * One rAF loop. Per frame it only writes one CSS transform (position, facing, lean, squash, hover); the canvas
 * is redrawn at most 30 times a second, and the page is measured only when he plans a move.
 * The intro (first visit of a session): he poofs out from behind the logo onto a card, greets, zaps a few cards
 * (a visual effect; they repair themselves), then floats down to play along the bottom. */
import { createRig, loadAtlas, poseReady, poseAtlas, coinImage, MUZZLE, CHEST } from './rig.js';
import { createWorld, isInteractive } from './world.js';
import { createEffects } from './effects.js';
import { createSounds } from './sounds.js';
import { gsap } from 'gsap';

const Z_INDEX = 45; // above page content, below the sticky header (50), so the intro starts behind the logo
const GRAVITY = 1500; // floatier than a person
const LOGO = '.hd .logo';
const DRAW_EVERY = 1 / 30;

// The tour: one plain-words explanation per section, said once each when the section reaches the middle of
// the screen. The footer has no line here: Mascot.jsx shows the "switch me off" card there instead.
const SECTIONS = [
  { sel: '.hx', t: 'Welcome! Sign up here and grab your free welcome bonus.' },
  { sel: '.w1', t: 'Everyone gets three wishes. Here’s wish number one!' },
  { sel: '.plsec', t: 'Our platforms! Pick one and play right in your browser.' },
  { sel: '.gms', t: 'Game lobby! Use the tabs to find slots, fish or table games.' },
  { sel: '.w2', t: 'Wish number two! Keep scrolling, there’s more.' },
  { sel: '.whys', t: 'Why play here? It’s free to play and full of perks.' },
  { sel: '.pm1', t: 'Promotions! Daily rewards, spins and surprises live here.' },
  { sel: '.pm2', t: 'Tournaments: play others and climb the leaderboard.' },
  { sel: '.how', t: 'How to play: just three easy steps to get started.' },
  { sel: '.pox', t: 'Three doors: welcome gift, daily bonus or tournaments. Pick one!' },
  { sel: '.lbs', t: 'The leaderboard shows top players. Could you be next?' },
  { sel: '.w3', t: 'Wish number three! We’re almost at the end.' },
  { sel: '.tcg', t: 'Why trust us? Safe, secure, and help 24/7.' },
  { sel: '.rvw', t: 'Real players, real reviews. See what they say!' },
  { sel: '.faq', t: 'Got a question? Tap one and the answer opens.' },
  { sel: '.fol', t: 'Follow us on social media for news and updates.' },
];
const TOUR_GAP = 3500; // ms between two explanations, so each one can be read
const LINES = {
  intro: ['Your wish is my command!', 'Hey there! I’m Dino!'],
  click: ['A little magic!', 'Coins for you!', 'Wish granted!', 'Ka-ching!'],
  super: ['Jackpot!', 'Make it rain!'],
  hello: ['Oh! Hi there!', 'Hey you!', 'Need a wish?'],
};

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (v, target, k) => v + (target - v) * Math.min(1, k);

function targetHeight() {
  const w = document.documentElement.clientWidth;
  return w >= 1024 ? 150 : w >= 640 ? 124 : 100;
}

export function createMascot({ perchSelector, reducedMotion = false, intro = false }) {
  const root = document.createElement('div');
  root.className = 'ds-genie';
  root.setAttribute('aria-hidden', 'true');
  root.style.zIndex = Z_INDEX;
  const rig = createRig();
  root.appendChild(rig.canvas);
  const bubble = document.createElement('div');
  bubble.className = 'ds-genie-say';
  bubble.setAttribute('aria-hidden', 'true');
  bubble.style.zIndex = Z_INDEX + 1;
  // The cloud is the supplied artwork (public/mascot/cloud.webp), left blank; the line sits on top of it in its
  // own span. The engine moves the outer box; GSAP only animates the inner one (entrance and a slow float).
  const bubbleIn = document.createElement('div');
  bubbleIn.className = 'ds-genie-say-in';
  const cloud = document.createElement('img');
  cloud.className = 'ds-genie-say-cloud';
  cloud.src = '/mascot/cloud.webp';
  cloud.alt = '';
  cloud.decoding = 'async';
  const bubbleText = document.createElement('span');
  bubbleText.className = 'ds-genie-say-tx';
  bubbleIn.append(cloud, bubbleText);
  bubble.appendChild(bubbleIn);
  const cloudFloat = reducedMotion ? null
    : gsap.to(bubbleIn, { y: -4, rotation: 0.6, duration: 1.9, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });

  const world = createWorld({ perchSelector, ignore: root });
  const sfx = createSounds();
  const fx = createEffects({ zIndex: Z_INDEX, onClink: (k) => sfx.clink(k), coin: coinImage });

  let bodyH = 150;
  let bodyW = 80;
  let S = 0.2;

  // Where he is and what he is doing.
  const me = {
    x: 0, y: 0, vx: 0, vy: 0, facing: -1,
    perch: null, // null = hovering over the bottom of the screen
    mode: 'idle', timer: 0, t: 0,
    then: null, // what to do after the current move
    air: null, // swoop plan
    tx: 0, speed: 0, dash: false,
    fired: false,
    target: null, // card being zapped
    intro: false,
    floorTime: 0, // seconds left playing along the bottom before he looks for cards again
  };
  // What the canvas draws (read by rig.draw) ...
  const look = {
    pose: 'happy', prev: '', mix: 1, t: 0, breathe: 0, headRot: 0, headY: 0, jaw: 0, blink: 0,
    wave: 0.6, shimmer: 0, lagX: 0, swirl: 0, glow: 0.7, shadow: 0, hover: 0,
  };
  // ... and what the CSS transform does.
  const body = { lean: 0, squash: 1, scale: 1, ox: 0, oy: 0, bob: 0, lift: 0 };

  let raf = 0;
  let last = 0;
  let drawAcc = 1;
  let dirty = true;
  let lastTransform = '';
  let hidden = false;
  let destroyed = false;
  let checkPerchIn = 0;
  let reactCooldown = 2;
  let lastHerClick = 0;
  let callUntil = 0;
  let pointer = null;
  const timers = [];

  // life
  let blinkIn = 2;
  let blinkT = -1;
  let blinkTwice = false;
  let nodIn = 1;
  let headT = 0;
  let headYT = 0;
  let jawIn = 0;
  let jawT = 0;
  let talkUntil = 0;
  let yawnUntil = 0;
  let magicUntil = 0;
  let spinT = -1;
  let spinDur = 1;
  let spinLean = 0;
  let spawnT = -1;
  let recoil = 0;
  let lastX = 0;
  let velX = 0;
  let trailIn = 0;

  // speech
  let sayUntil = 0;
  let lastQuip = 0;
  let bw = 0;
  let bh = 0;
  let lastBubble = '';
  const seen = new Set();

  /* ---------------- size ---------------- */

  function resize() {
    world.measure();
    bodyH = targetHeight();
    bodyW = bodyH * 0.55;
    rig.resize(bodyH);
    S = rig.S;
    root.style.transformOrigin = `${rig.ax}px ${rig.waistY}px`;
    lastTransform = '';
    dirty = true;
    const b = world.bounds();
    me.x = clamp(me.x, b.minX + bodyW * 0.6, b.maxX - bodyW * 0.6);
    lastX = me.x;
    if (me.perch && world.drift(me.perch) > 3) dropIn();
  }

  /* ---------------- look ---------------- */

  function pose(name) {
    if (!poseReady(name)) { if (name !== 'happy') loadExtra(); name = 'happy'; }
    if (look.pose === name) return;
    look.prev = look.pose;
    look.pose = name;
    look.mix = reducedMotion ? 1 : 0;
    dirty = true;
  }

  function spin(dur = 1) {
    if (reducedMotion) return;
    spinT = 0;
    spinDur = dur;
  }

  function quip(text, sec = 2.6) {
    if (!text || hidden) return;
    const now = performance.now();
    lastQuip = now;
    bubbleText.textContent = text;
    fitCloud();
    bubble.classList.add('on');
    if (!reducedMotion) {
      gsap.fromTo(bubbleIn, { scale: 0.55, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.6)', overwrite: 'auto' });
      cloudFloat.play();
    }
    bw = bubble.offsetWidth;
    bh = bubble.offsetHeight;
    lastBubble = '';
    sayUntil = now + sec * 1000;
    talkUntil = now + Math.min(3500, 300 + text.length * 45);
    if (!reducedMotion && (me.mode === 'idle' || me.mode === 'look' || me.mode === 'rest')) pose('talk');
  }

  /** Keep the line to two rows inside the cloud body: widen the cloud (it keeps its 3:1 shape) until it fits,
   * up to the viewport width. Without this a long line ran into the lamp and the rounded ends. */
  function fitCloud() {
    bubble.style.removeProperty('--w');
    const maxW = document.documentElement.clientWidth - 16;
    let w = bubble.offsetWidth;
    if (w > maxW) { w = maxW; bubble.style.setProperty('--w', `${w}px`); }
    const lh = parseFloat(getComputedStyle(bubbleText).lineHeight) || 17;
    while (bubbleText.offsetHeight > lh * 2.2 && w < maxW) {
      w = Math.min(maxW, w + 24);
      bubble.style.setProperty('--w', `${w}px`);
    }
  }

  function hush() {
    sayUntil = 0;
    bubble.classList.remove('on');
    cloudFloat?.pause();
  }

  /** Explain the section nearest the middle of the screen, once per section. Runs from housekeeping, so it
   * works whatever he is doing; it waits while a line is still up or one was said a moment ago. */
  function sectionQuip() {
    const now = performance.now();
    if (me.intro || introPending || hidden || now < sayUntil || now - lastQuip < TOUR_GAP) return;
    const vh = window.innerHeight;
    let best = null;
    let bestD = Infinity;
    for (const s of SECTIONS) {
      if (seen.has(s.sel)) continue;
      const el = document.querySelector(s.sel);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top > vh * 0.65 || r.bottom < vh * 0.35) continue;
      const d = Math.abs((r.top + r.bottom) / 2 - vh / 2);
      if (d < bestD) { bestD = d; best = s; }
    }
    if (best) { seen.add(best.sel); quip(best.t, clamp(best.t.length * 0.07, 3.2, 6)); }
  }

  /* ---------------- actions ---------------- */

  function setMode(mode, timer = 0) {
    me.mode = mode;
    me.timer = timer;
    me.t = 0;
  }

  /** Run the step queued in `me.then`, or `fallback` when there is none. */
  function next(fallback) {
    const then = me.then;
    me.then = null;
    if (then) then(); else fallback();
  }

  function idle(sec, then = null) {
    pose('happy');
    setMode('idle', sec);
    me.then = then;
  }

  function lookAround() {
    pose('happy');
    setMode('look', rand(1.6, 2.6));
  }

  function moveTo(x, dash, then) {
    const b = me.perch ? { minX: me.perch.x0, maxX: me.perch.x1 } : world.bounds();
    me.tx = clamp(x, b.minX + (me.perch ? 0 : bodyW * 0.6), b.maxX - (me.perch ? 0 : bodyW * 0.6));
    me.speed = (dash ? 2.6 : 0.9) * bodyH;
    me.dash = dash;
    me.then = then || null;
    pose('happy');
    setMode('move');
  }

  function wander(dash) {
    world.measure();
    const b = world.bounds();
    let x = rand(b.minX + bodyW, b.maxX - bodyW);
    if (Math.abs(x - me.x) < bodyH * 1.2) x = me.x + (x > me.x ? 1 : -1) * bodyH * 2;
    // A long dash often has a swoop in the middle of it.
    const far = Math.abs(x - me.x);
    if (dash && far > bodyH * 3.5 && Math.random() < 0.8) {
      const side = Math.sign(x - me.x);
      moveTo(me.x + side * far * rand(0.3, 0.55), true, () => hop(bodyH * 0.9, side * bodyH * 3, () => moveTo(x, true)));
      return;
    }
    moveTo(x, dash);
  }

  /** A swoop on the spot or along the ground: up by `h` px, sideways at `vx` px/s, back onto what he was on. */
  function hop(h, vx = 0, then = null) {
    me.air = { vx, vy: -Math.sqrt(2 * GRAVITY * h), onto: me.perch };
    if (Math.abs(vx) > 5) me.facing = Math.sign(vx);
    me.then = then;
    setMode('crouch', 0.12);
  }

  /** One to three happy bounces in a row. */
  function happyHops(n = 1 + Math.floor(Math.random() * 3), then = null) {
    if (n <= 0) { idle(rand(0.6, 1.4), then); return; }
    hop(bodyH * rand(0.45, 0.8), 0, () => happyHops(n - 1, then));
  }

  /** Swoop from card to card, `n` times in a row, then rest. */
  function chainHops(n) {
    const options = n > 0 ? findPerches().filter((p) => {
      const dx = Math.abs(p.spots[0] - me.x);
      return dx < bodyH * 4.2 && dx > bodyW && me.y - p.y < bodyH * 2.4;
    }) : [];
    if (!options.length) { rest(rand(4, 8)); return; }
    const p = pick(options);
    jumpTo(pick(p.spots), p.y, p, () => chainHops(n - 1));
  }

  /** The big one: way up with a twirl, then a shower of coins on the way down that he collects. */
  function superJump() {
    spin(1.1);
    magicUntil = performance.now() + 1400;
    hop(bodyH * 2.4, 0, () => {
      if (reducedMotion) { idle(0.8); return; }
      fx.burst(me.x, me.y + CHEST.y * S, me.facing, bodyH * 0.07, groundAt, false);
      setMode('coins');
    });
  }

  /** The visitor tapped empty space near the bottom: he dashes over and bounces. */
  function comeHere(x) {
    me.then = null;
    world.measure();
    const b = world.bounds();
    moveTo(clamp(x, b.minX + bodyW, b.maxX - bodyW), true, () => happyHops(1 + Math.floor(Math.random() * 2)));
  }

  /** Rest on the spot (on a card he settles his smoke on its edge); now and then a yawn. */
  function rest(sec, then = null) {
    pose('happy');
    setMode('rest', sec);
    me.then = then;
  }

  function celebrate(sec, then = null) {
    sfx.celebrate();
    spin(0.9);
    magicUntil = performance.now() + 900;
    fx.sparkle(me.x, me.y - bodyH * 0.55, 14, bodyH * 1.6);
    setMode('celebrate', sec);
    me.then = then;
  }

  /** Swoop from where he is to (tx, ty). `onto` is the perch to land on (null = the bottom).
   *  `then` runs after he has landed. */
  function jumpTo(tx, ty, onto, then = null) {
    me.then = then;
    const apex = Math.min(me.y, ty) - (bodyH * 0.3 + Math.abs(tx - me.x) * 0.12);
    const rise = Math.max(4, me.y - apex);
    const vy = -Math.sqrt(2 * GRAVITY * rise);
    const t1 = -vy / GRAVITY;
    const t2 = Math.sqrt((2 * Math.max(0, ty - apex)) / GRAVITY);
    const vx = (tx - me.x) / Math.max(0.15, t1 + t2);
    me.air = { vx, vy, onto };
    if (Math.abs(vx) > 5) me.facing = Math.sign(vx);
    setMode('crouch', 0.12);
  }

  function fallFrom(x, y, vx, vy) {
    me.perch = null;
    me.x = x; me.y = y;
    me.vx = vx; me.vy = vy;
    me.air = { onto: null };
    setMode('air');
  }

  /** His card scrolled away: drop him back to the bottom (from the top of the screen if it went up). */
  function dropIn() {
    const above = me.perch && me.perch.y - window.scrollY < world.topView + bodyH;
    me.perch = null;
    me.then = null;
    endIntro();
    fx.clear();
    if (above) {
      fallFrom(me.x, window.scrollY + world.topView - 10, 0, 0);
    } else {
      me.y = world.floorY();
      land();
    }
  }

  function land() {
    sfx.land();
    me.vx = me.vy = 0;
    body.squash = 0.9;
    if (!reducedMotion) fx.puff(me.x, me.y - bodyH * 0.04, 5, bodyH * 0.16);
    setMode('land', 0.18);
  }

  function findPerches() {
    world.measure();
    return world.perches(bodyW, bodyH).filter((p) => p !== me.perch && (!me.perch || p.el !== me.perch.el));
  }

  /** From the bottom: glide under a card and swoop up onto it. */
  function goPerch() {
    const floor = world.floorY();
    const options = findPerches().filter((p) => floor - p.y > bodyH * 0.3 && floor - p.y < bodyH * 5.5);
    if (!options.length) return false;
    loadExtra();
    options.sort((a, b) => Math.abs(a.spots[0] - me.x) - Math.abs(b.spots[0] - me.x));
    const p = pick(options.slice(0, 3));
    const spot = pick(p.spots);
    const side = spot >= me.x ? 1 : -1;
    const takeoff = spot - side * bodyW * 0.6;
    moveTo(takeoff, Math.abs(takeoff - me.x) > bodyH * 2.5, () => {
      if (world.drift(p) > 3) { idle(1); return; }
      jumpTo(spot, p.y, p);
    });
    return true;
  }

  /** Glide to the nearer end of the card and float down to the bottom; `then` runs after landing. */
  function leavePerch(then = null) {
    const p = me.perch;
    const side = me.x - p.x0 < p.x1 - me.x ? -1 : 1;
    moveTo(side < 0 ? p.x0 : p.x1, false, () => {
      me.facing = side;
      me.air = { onto: null, vx: side * bodyH * 1.1, vy: -bodyH * 2.8 };
      me.then = then;
      setMode('crouch', 0.12);
    });
  }

  /** Choose the next thing to do. Long idles keep him from pulling attention from the page. */
  function think() {
    if (reducedMotion) { setMode('idle', 1e9); return; }
    const r = Math.random();
    if (!me.perch) {
      if (r < 0.42 && me.floorTime <= 0 && goPerch()) return;
      if (r < 0.55) return wander(false);
      if (r < 0.73) return wander(true);
      if (r < 0.85) return happyHops();
      if (r < 0.91) return lookAround();
      if (r < 0.95) return celebrate(1.3);
      return idle(rand(0.8, 1.8));
    }
    if (r < 0.32) return rest(rand(4, 8));
    if (r < 0.4) return moveTo(rand(me.perch.x0, me.perch.x1), false);
    if (r < 0.62) return chainHops(2 + Math.floor(Math.random() * 3));
    if (r < 0.74) return happyHops(1 + Math.floor(Math.random() * 2), () => rest(rand(4, 8)));
    if (r < 0.9) return leavePerch();
    return lookAround();
  }

  /* ---------------- finger-gun magic ---------------- */

  function groundAt(x) {
    const p = me.perch;
    if (p && x >= p.left && x <= p.right) return p.y;
    return world.floorY();
  }

  function muzzle() {
    return { x: me.x + me.facing * MUZZLE.x * S, y: me.y - body.lift + body.bob + MUZZLE.y * S };
  }

  function shoot() {
    if (!poseReady('wink')) { loadExtra().then(() => { if (!destroyed && !hidden) shoot(); }); return; }
    const b = world.bounds();
    me.facing = me.x < (b.minX + b.maxX) / 2 ? 1 : -1;
    me.fired = false;
    pose('wink');
    setMode('shoot');
  }

  function fire() {
    if (fx.count > 14) return;
    const m = muzzle();
    sfx.shoot();
    recoil = -me.facing * 7;
    magicUntil = performance.now() + 700;
    fx.burst(m.x, m.y, me.facing, bodyH * 0.07, groundAt, reducedMotion);
  }

  function chest() {
    return { x: me.x, y: me.y - body.lift + body.bob + CHEST.y * S };
  }

  function collect() {
    pose('happy');
    setMode('collect');
    const total = fx.count;
    fx.collect(chest, (left) => {
      sfx.collect(total - left - 1);
      if (left === 0 && me.mode === 'collect') {
        if (Math.random() < 0.6 && !reducedMotion) celebrate(1.2);
        else idle(1.2);
      }
    });
  }

  /** Cards fully in view, nearest first, that he can zap (never the one he rests on). */
  function blastTargets(n) {
    const vw = document.documentElement.clientWidth;
    const sy = window.scrollY;
    const out = [];
    for (const el of document.querySelectorAll(perchSelector)) {
      if (me.perch && me.perch.el === el) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 60 || r.height < 40 || r.width * r.height > 700 * 450) continue;
      if (r.top < world.topView + 8 || r.bottom > world.floorView || r.left < 0 || r.right > vw) continue;
      const probe = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (!probe || !(el.contains(probe) || probe.contains(el))) continue;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2 + sy;
      out.push({ el, x: cx, y: cy, d: Math.hypot(cx - me.x, cy - (me.y - bodyH * 0.6)) });
    }
    out.sort((a, b) => a.d - b.d);
    // Skip neighbours of a card already picked, so the zaps spread over the page a little.
    const picked = [];
    for (const t of out) {
      if (picked.length >= n) break;
      if (picked.every((p) => Math.hypot(p.x - t.x, p.y - t.y) > bodyH * 1.5)) picked.push(t);
    }
    return picked;
  }

  /** Turn to a card, point the finger guns and zap it (effects.js shakes it; it repairs itself). */
  function blastCard(target, then) {
    if (!poseReady('wink') || !target.el.isConnected) { idle(0.3, then); return; }
    me.facing = target.x >= me.x ? 1 : -1;
    me.target = target;
    me.fired = false;
    me.then = then;
    pose('wink');
    setMode('blast');
  }

  function fireAt(target) {
    const m = muzzle();
    const r = target.el.getBoundingClientRect();
    const tx = r.left + r.width * rand(0.35, 0.65);
    const ty = r.top + window.scrollY + r.height * rand(0.35, 0.65);
    sfx.shoot();
    recoil = -me.facing * 7;
    magicUntil = performance.now() + 700;
    fx.blast(m.x, m.y, target.el, tx, ty, world.floorY(), () => sfx.crack());
  }

  /* ---------------- intro ---------------- */

  function introPerch(fromX, fromY) {
    const options = findPerches().filter((p) => p.y > fromY + bodyH * 0.5);
    options.sort((a, b) => Math.hypot(a.spots[0] - fromX, a.y - fromY) - Math.hypot(b.spots[0] - fromX, b.y - fromY));
    return options[0] || null;
  }

  /** Poof out from behind the logo, greet, zap a few cards, then go play along the bottom. */
  function runIntro() {
    const logo = document.querySelector(LOGO);
    const r = logo && logo.getBoundingClientRect();
    if (!r || !r.width || r.left < 0 || r.top < 0) return false;
    me.intro = true;
    me.perch = null;
    me.x = r.left + r.width / 2;
    me.y = r.bottom + window.scrollY + bodyH * 0.3;
    lastX = me.x;
    me.facing = 1;
    body.scale = 0.01;
    spawnT = 0;
    look.swirl = 1;
    magicUntil = performance.now() + 1500;
    fx.puff(me.x, me.y - bodyH * 0.45, 10, bodyH * 0.22);
    fx.sparkle(me.x, me.y - bodyH * 0.5, 12, bodyH * 1.4);
    const p = introPerch(me.x, me.y);
    const landed = () => {
      quip(pick(LINES.intro), 2.8);
      rest(2.6, () => idle(0.4, () => blastRound(blastTargets(3))));
    };
    pose('happy');
    setMode('hide', 0.85);
    me.then = () => {
      if (p) jumpTo(pick(p.spots), p.y, p, landed);
      else jumpTo(me.x + bodyH * 2.5, world.floorY(), null, landed);
    };
    return true;
  }

  function blastRound(targets) {
    const t = targets.shift();
    if (t) { blastCard(t, () => idle(0.25, () => blastRound(targets))); return; }
    celebrate(1.3, () => {
      if (me.perch) leavePerch(toBottom);
      else toBottom();
    });
  }

  // Finish along the bottom: a dash across, then normal play there for a while.
  function toBottom() {
    endIntro();
    me.floorTime = 20;
    const b = world.bounds();
    moveTo(me.x < (b.minX + b.maxX) / 2 ? b.maxX - bodyH : b.minX + bodyH, true);
  }

  function endIntro() {
    me.intro = false;
  }

  /* ---------------- per-frame update ---------------- */

  function grounded() {
    return me.mode !== 'air' && me.mode !== 'crouch' && me.mode !== 'hide';
  }

  function update(dt) {
    me.t += dt;
    reactCooldown -= dt;
    me.floorTime -= dt;
    fx.update(dt);

    if (grounded()) {
      if (me.perch) {
        me.y = me.perch.y;
        const top = me.perch.y - window.scrollY;
        if (top < world.topView + bodyH * 0.6 || top > world.floorView + 4) { dropIn(); return; }
        if ((checkPerchIn -= dt) <= 0) {
          checkPerchIn = 0.5;
          if (world.drift(me.perch) > 3) { dropIn(); return; }
        }
      } else {
        me.y = world.floorY();
      }
    }

    switch (me.mode) {
      case 'idle':
      case 'look':
        if (me.mode === 'look' && me.t > 0.9) { headT = headT > 0 ? -8 : 8; me.t = 0; }
        if ((me.timer -= dt) <= 0) next(think);
        break;
      case 'hide':
        if ((me.timer -= dt) <= 0) next(think);
        break;
      case 'rest':
        if (!reducedMotion && me.t > 2.5 && Math.random() < dt * 0.08) yawnUntil = performance.now() + 900;
        if ((me.timer -= dt) <= 0) next(think);
        break;
      case 'celebrate':
        pose(Math.floor(me.t / 0.45) % 2 ? 'wink' : 'happy');
        if ((me.timer -= dt) <= 0) next(() => idle(rand(1, 2.5)));
        break;
      case 'move': {
        const d = me.tx - me.x;
        if (Math.abs(d) < 2) {
          me.x = me.tx;
          me.dash = false;
          const then = me.then;
          me.then = null;
          if (then) then(); else idle(rand(0.8, 2.4));
          break;
        }
        me.facing = Math.sign(d);
        me.x += Math.sign(d) * Math.min(Math.abs(d), me.speed * dt);
        if (me.dash && (trailIn -= dt) <= 0) {
          trailIn = 0.06;
          fx.sparkle(me.x - me.facing * bodyW * 0.4, me.y - bodyH * 0.12, 1, bodyH * 0.3);
        }
        break;
      }
      case 'crouch':
        if ((me.timer -= dt) <= 0) {
          me.vx = me.air.vx;
          me.vy = me.air.vy;
          me.perch = null;
          sfx.jump();
          setMode('air');
        }
        break;
      case 'air': {
        me.vy += GRAVITY * dt;
        me.x += me.vx * dt;
        me.y += me.vy * dt;
        const a = me.air;
        const vw = document.documentElement.clientWidth;
        if (me.x < bodyW * 0.5 || me.x > vw - bodyW * 0.5) { me.vx = 0; me.x = clamp(me.x, bodyW * 0.5, vw - bodyW * 0.5); }
        if ((trailIn -= dt) <= 0 && Math.abs(me.vy) > bodyH * 2) {
          trailIn = 0.07;
          fx.sparkle(me.x, me.y - bodyH * 0.1, 1, bodyH * 0.25);
        }
        if (a.onto && (a.onto.y - window.scrollY < world.topView || world.drift(a.onto) > 6)) a.onto = null;
        if (a.onto && me.vy > 0 && me.y >= a.onto.y && me.y - me.vy * dt <= a.onto.y + 2 && me.x >= a.onto.x0 - 12 && me.x <= a.onto.x1 + 12) {
          me.perch = a.onto;
          me.y = a.onto.y;
          me.x = clamp(me.x, a.onto.x0, a.onto.x1);
          land();
          break;
        }
        const floor = world.floorY();
        if (me.vy > 0 && me.y >= floor) {
          me.y = floor;
          me.perch = null;
          land();
        } else if (me.t > 4) {
          me.y = floor;
          land();
        }
        break;
      }
      case 'land':
        if ((me.timer -= dt) <= 0) {
          if (me.then) next();
          else if (reducedMotion) think();
          else if (me.perch && Math.random() < 0.7) rest(rand(4, 8));
          else idle(rand(0.4, 1.4));
        }
        break;
      case 'blast':
        if (!me.fired && me.t >= 0.25) { me.fired = true; fireAt(me.target); }
        if (me.t >= 0.6) { me.target = null; next(() => idle(1)); }
        break;
      case 'react':
        if (me.t >= 0.8) idle(rand(1.2, 2));
        break;
      case 'shoot':
        if (!me.fired && me.t >= 0.25) { me.fired = true; fire(); }
        if (me.t >= 0.6) { pose('happy'); setMode('coins'); }
        break;
      case 'coins':
        if (fx.settled() || me.t > 2.2) {
          if (fx.count) collect();
          else idle(1);
        }
        break;
      case 'collect':
        if (me.t > 3) idle(1);
        break;
    }

    reactToPointer();
    life(dt);
  }

  /** Breathing, blinks, nods, talking, smoke and the body motion that the CSS transform shows. */
  function life(dt) {
    const now = performance.now();
    if (look.mix < 1) { look.mix = Math.min(1, look.mix + dt / 0.16); if (look.mix >= 1) look.prev = ''; }
    if (sayUntil && now > sayUntil) hush();
    if (look.pose === 'talk' && now > talkUntil + 300 && (me.mode === 'idle' || me.mode === 'look' || me.mode === 'rest')) pose('happy');
    if (reducedMotion) return;

    look.t += dt;
    look.breathe = Math.sin(look.t * (me.mode === 'rest' ? 1.3 : 1.85));

    // blink (sometimes twice)
    if (blinkT < 0 && (blinkIn -= dt) <= 0) { blinkT = 0; blinkTwice = Math.random() < 0.25; }
    if (blinkT >= 0) {
      blinkT += dt;
      const len = blinkTwice ? 0.5 : 0.22;
      const k = blinkT % 0.25;
      look.blink = k < 0.07 ? k / 0.07 : k < 0.12 ? 1 : Math.max(0, 1 - (k - 0.12) / 0.1);
      if (blinkT >= len) { blinkT = -1; look.blink = 0; blinkIn = rand(2.2, 5); }
    }

    // head nods
    if (me.mode !== 'look' && (nodIn -= dt) <= 0) { headT = rand(-3, 3); headYT = rand(-3, 1); nodIn = rand(1.4, 3.4); }
    look.headRot = ease(look.headRot, headT, dt * 3);
    look.headY = ease(look.headY, headYT, dt * 3);

    // jaw: chatter while a line is being said, a slow yawn while resting
    if (now < talkUntil) {
      if ((jawIn -= dt) <= 0) { jawT = jawT > 0.2 ? 0 : rand(0.4, 1); jawIn = rand(0.06, 0.11); }
    } else jawT = now < yawnUntil ? 1 : 0;
    look.jaw = ease(look.jaw, jawT, dt * (now < yawnUntil ? 4 : 25));

    // speed -> lean and trailing smoke
    const step = me.x - lastX;
    lastX = me.x;
    if (Math.abs(step) < bodyH) velX = ease(velX, step / Math.max(dt, 1e-3), dt * 10);
    const k = clamp(velX / (2.6 * bodyH), -1.2, 1.2);
    recoil = ease(recoil, 0, dt * 6);

    // spin: a little loop-de-loop of the whole genie
    if (spinT >= 0) {
      spinT += dt / spinDur;
      const p = Math.min(1, spinT);
      const a = (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2) * Math.PI * 2;
      body.ox = Math.sin(a) * bodyH * 0.14;
      body.oy = (Math.cos(a) - 1) * bodyH * 0.12;
      spinLean = Math.sin(a) * 12;
      look.swirl = Math.sin(p * Math.PI);
      if (spinT >= 1) { spinT = -1; body.ox = body.oy = 0; spinLean = 0; }
    } else if (me.mode === 'react') {
      body.ox = Math.sin(me.t * 55) * 3 * Math.max(0, 1 - me.t / 0.6);
    } else {
      body.ox = 0;
      look.swirl = ease(look.swirl, 0, dt * 2);
    }

    // spawn (intro): grows out of a puff of smoke
    if (spawnT >= 0) {
      spawnT += dt / 0.6;
      const p = Math.min(1, spawnT);
      const c = 1.70158;
      body.scale = Math.max(0.01, 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2);
      if (spawnT >= 1) { spawnT = -1; body.scale = 1; }
    }

    body.lean = ease(body.lean, k * 10 + recoil + spinLean, dt * 8);
    look.lagX = ease(look.lagX, clamp(-k * 85, -95, 95) * me.facing, dt * 5);

    const magic = now < magicUntil;
    const flying = me.mode === 'air' || (me.mode === 'move' && me.dash);
    look.wave = ease(look.wave, magic ? 2.2 : flying ? 1.5 : me.mode === 'rest' ? 0.4 : 0.6, dt * 3);
    look.shimmer = ease(look.shimmer, magic ? 0.35 : flying ? 0.2 : 0, dt * 4);
    look.glow = ease(look.glow, magic ? 1.2 : 0.7, dt * 3);

    // hover and bob: over the bottom he floats a little higher; on a card his smoke rests on the edge
    const up = grounded();
    const amp = !up ? 0 : me.mode === 'rest' ? bodyH * 0.02 : bodyH * 0.04;
    const speed = me.mode === 'rest' ? 1.4 : 2.1;
    body.bob = ease(body.bob, -amp * (0.5 + 0.5 * Math.sin(look.t * speed)), dt * 6);
    body.lift = ease(body.lift, up && !me.perch ? bodyH * 0.05 : 0, dt * 6);
    look.hover = -(body.bob - body.lift) / S;
    look.shadow = ease(look.shadow, !up || me.mode === 'land' ? 0 : me.perch ? 0.35 : 0.55, dt * 8);

    let sq = 1;
    if (me.mode === 'crouch') sq = 0.9;
    else if (me.mode === 'air') sq = 1 + Math.min(0.06, Math.abs(me.vy) / (bodyH * 25));
    body.squash = ease(body.squash, sq, dt * 14);
  }

  function reactToPointer() {
    if (!pointer || reducedMotion || me.intro) return;
    const px = pointer.x;
    const py = pointer.y + window.scrollY;
    const cx = me.x;
    const cy = me.y - bodyH * 0.5;
    if (Math.hypot(px - cx, py - cy) >= bodyH * 1.1) return;
    if (me.mode === 'idle' || me.mode === 'look' || me.mode === 'rest') me.facing = px >= cx ? 1 : -1;
    if (reactCooldown > 0 || !(me.mode === 'idle' || me.mode === 'look' || me.mode === 'move')) return;
    reactCooldown = 7;
    me.then = null;
    me.facing = px >= cx ? 1 : -1;
    if (Math.random() < 0.3) quip(pick(LINES.hello), 2);
    if (Math.random() < 0.5) {
      // Happy to see you: a bounce and a cheer.
      hop(bodyH * 0.7, 0, () => celebrate(1.1));
      return;
    }
    sfx.surprise();
    pose('talk');
    setMode('react');
  }

  /* ---------------- render ---------------- */

  function render(dt) {
    drawAcc += dt;
    if (dirty || (!reducedMotion && drawAcc >= DRAW_EVERY)) {
      drawAcc = 0;
      if (rig.draw(look)) dirty = false;
    }
    const sy = window.scrollY;
    const tx = me.x - rig.ax + body.ox;
    const ty = me.y - sy - rig.ay + body.bob - body.lift + body.oy;
    const sx = me.facing * body.scale;
    const t = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) rotate(${body.lean.toFixed(2)}deg) scale(${sx.toFixed(3)},${(body.scale * body.squash).toFixed(3)})`;
    if (t !== lastTransform) {
      lastTransform = t;
      root.style.transform = t;
    }
    if (sayUntil) {
      const vw = document.documentElement.clientWidth;
      const bx = Math.round(clamp(me.x - bw / 2, 8, vw - bw - 8));
      const by = Math.round(Math.max(world.topView + 4, ty + rig.ay - bodyH * 1.04 - bh + 6)); // the cloud's tail points at his head
      const p = `translate3d(${bx}px,${by}px,0)`;
      if (p !== lastBubble) { lastBubble = p; bubble.style.transform = p; }
    }
    fx.draw();
  }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    // The first rAF timestamp after start() can be earlier than the performance.now() taken there.
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000 || 0));
    last = now;
    update(dt);
    render(dt);
  }

  function start() {
    if (raf || hidden || destroyed) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  /* ---------------- page events ---------------- */

  function onPointerMove(e) {
    if (e.pointerType === 'mouse') pointer = { x: e.clientX, y: e.clientY };
  }

  function onPointerLeave() {
    pointer = null;
  }

  function onClick(e) {
    if (hidden || me.intro || e.button !== 0) return;
    // Whatever is under the pointer keeps working: a click on a link or button never counts as a click
    // on him, and never calls him over.
    if (isInteractive(e.target)) return;
    const px = e.clientX;
    const py = e.clientY + window.scrollY;
    const feet = me.y - body.lift + body.bob;
    const onHim = Math.abs(px - me.x) <= bodyW * 0.7 && py <= feet + 4 && py >= feet - bodyH * 0.98;
    const now = performance.now();
    if (onHim) {
      sfx.engage();
      const twice = now - lastHerClick < 500;
      lastHerClick = now;
      if (twice && !reducedMotion && (me.mode === 'shoot' || me.mode === 'coins' || grounded())) { superJump(); quip(pick(LINES.super), 1.8); return; }
      if (!grounded() || me.mode === 'shoot') return;
      me.then = null;
      shoot();
      quip(pick(LINES.click), 1.8);
      return;
    }
    // Empty space in the lower part of the screen: he dashes over and bounces (bottom only, not too often).
    if (reducedMotion || now < callUntil || me.perch || e.clientY < window.innerHeight * 0.55) return;
    if (me.mode !== 'idle' && me.mode !== 'look' && me.mode !== 'move') return;
    callUntil = now + 4000;
    comeHere(px);
  }

  // The welcome pop-up and dialogs get the screen to themselves.
  function housekeeping() {
    const block = world.blocked();
    if (block && !hidden) {
      hidden = true;
      root.style.visibility = 'hidden';
      hush();
      fx.clear();
      stop();
    } else if (!block && hidden) {
      hidden = false;
      root.style.visibility = '';
      start();
    }
    maybeStartIntro();
    sectionQuip();
  }

  let introPending = false;
  function maybeStartIntro() {
    if (!introPending || hidden || !poseReady('wink')) return;
    introPending = false;
    root.style.opacity = '';
    if (!runIntro()) moveTo(world.bounds().maxX - bodyH * 2, false);
  }

  let extraPromise = null;
  function loadExtra() {
    if (!extraPromise) extraPromise = loadAtlas(poseAtlas('wink')).catch(() => { extraPromise = null; });
    return extraPromise;
  }

  /* ---------------- boot ---------------- */

  document.body.appendChild(root);
  document.body.appendChild(bubble);
  resize();
  const b = world.bounds();
  me.y = world.floorY();
  me.facing = -1;
  // Glide in from the right edge (or just be there, with reduced motion).
  me.x = reducedMotion ? b.maxX - bodyW * 1.2 : b.maxX + bodyW;
  lastX = me.x;

  // The intro waits for both atlases and for the screen to be free of pop-ups (see housekeeping).
  introPending = intro && !reducedMotion;
  if (introPending) {
    root.style.opacity = '0';
    setMode('idle', 1e9);
  }
  Promise.all([loadAtlas('core'), introPending ? loadExtra() : null]).then(() => {
    if (destroyed) return;
    if (introPending && !poseReady('wink')) { introPending = false; root.style.opacity = ''; }
    if (!introPending) {
      if (reducedMotion) think();
      else moveTo(b.maxX - rand(bodyH * 1.5, bodyH * 4), false);
    }
    housekeeping();
    start();
  }).catch(() => {});
  // The other poses and the coin arrive shortly after, once the page is quiet.
  timers.push(setTimeout(() => {
    const idleCb = window.requestIdleCallback || ((fn) => setTimeout(fn, 1));
    idleCb(() => { if (!destroyed) loadExtra(); });
  }, 2000));
  timers.push(setInterval(housekeeping, 800));

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('click', onClick, { capture: true, passive: true });

  return {
    destroy() {
      destroyed = true;
      stop();
      timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('click', onClick, { capture: true });
      fx.destroy();
      sfx.destroy();
      root.remove();
      gsap.killTweensOf(bubbleIn);
      cloudFloat?.kill();
      bubble.remove();
    },
  };
}
