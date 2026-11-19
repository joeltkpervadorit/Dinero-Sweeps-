/* The page as the genie sees it: the hover line at the bottom of the viewport, card tops he can rest on,
 * and whether something (the welcome pop-up, a dialog) needs the screen. Coordinates are document px; y grows
 * down. The page is only measured when the genie plans a move or checks his perch, never every frame. */

const INTERACTIVE = 'a,button,input,select,textarea,label,summary,video,iframe,[role="button"],[role="link"],[role="tab"],[contenteditable="true"]';
const DIALOGS = '[aria-modal="true"],[role="dialog"]';
const HEADER = '.hd';

export function isInteractive(el) {
  if (!el || !el.closest) return false;
  if (el.closest(INTERACTIVE)) return true;
  try { return getComputedStyle(el).cursor === 'pointer'; } catch (e) { return false; }
}

export function createWorld({ perchSelector, ignore }) {
  let floorView = window.innerHeight;
  let topView = 0;
  let minX = 0;
  let maxX = document.documentElement.clientWidth;

  /** Re-read the sticky header and the viewport. */
  function measure() {
    const vw = document.documentElement.clientWidth;
    floorView = window.innerHeight - 6;
    const head = document.querySelector(HEADER);
    topView = head ? Math.max(0, head.getBoundingClientRect().bottom) : 0;
    minX = 10;
    maxX = vw - 10;
  }

  function floorY() {
    return window.scrollY + floorView;
  }

  function bounds() {
    return { minX, maxX, top: window.scrollY + topView, floor: floorY() };
  }

  /** True while the welcome-bonus pop-up (a CSS checkbox) or any dialog owns the screen. */
  function blocked() {
    if (document.querySelector('#wbx:checked')) return true;
    for (const m of document.querySelectorAll(DIALOGS)) {
      if (ignore && ignore.contains(m)) continue;
      const r = m.getBoundingClientRect();
      if (r.width && r.height && getComputedStyle(m).visibility !== 'hidden') return true;
    }
    return false;
  }

  // A button or link small enough that his body would hide it. Big cards are fine: he takes no pointer
  // events, so they stay clickable through him.
  function smallControl(hit) {
    if (!isInteractive(hit)) return false;
    const c = hit.closest(INTERACTIVE) || hit;
    const r = c.getBoundingClientRect();
    return r.width * r.height < 12000;
  }

  // Free space above a card edge: no small controls or headings where his body would be.
  function clearAbove(x, viewTop, bodyW, bodyH, el) {
    for (const [fx, fy] of [[0, 0.25], [-0.35, 0.6], [0.35, 0.6], [0, 0.9]]) {
      const px = x + fx * bodyW;
      const py = viewTop - fy * bodyH;
      if (px < 0 || py < topView) return false;
      const hit = document.elementFromPoint(px, py);
      if (!hit || ignore?.contains(hit)) continue;
      if (el.contains(hit) || smallControl(hit) || hit.closest('h1,h2,h3')) return false;
    }
    return true;
  }

  /** Card tops in view with room above them. Each perch is { el, x0, x1, y, left, right, top, spots } (document px). */
  function perches(bodyW, bodyH) {
    const out = [];
    const vw = document.documentElement.clientWidth;
    const sy = window.scrollY;
    for (const el of document.querySelectorAll(perchSelector)) {
      const r = el.getBoundingClientRect();
      if (r.width < bodyW * 1.2 || r.height < 40) continue;
      if (r.top < topView + bodyH * 1.05 || r.top > floorView - 30) continue;
      if (r.left < minX || r.right > Math.min(maxX, vw)) continue;
      // The card's top edge must really be visible (not scrolled away inside a rail or covered).
      const probe = document.elementFromPoint(r.left + r.width / 2, r.top + 4);
      if (!probe || !(el.contains(probe) || probe.contains(el))) continue;
      const inset = Math.min(18, r.width * 0.1) + bodyW * 0.3;
      const x0 = r.left + inset;
      const x1 = r.right - inset;
      if (x1 <= x0) continue;
      const spots = [0.5, 0.25, 0.75].map((k) => x0 + (x1 - x0) * k).filter((x) => clearAbove(x, r.top, bodyW, bodyH, el));
      if (!spots.length) continue;
      out.push({ el, x0, x1, y: r.top + sy, left: r.left, right: r.right, top: r.top + sy, spots });
    }
    return out;
  }

  /** How far a perch's card has moved since it was measured (scroll reveals, hover lifts). */
  function drift(p) {
    if (!p.el.isConnected) return Infinity;
    const r = p.el.getBoundingClientRect();
    return Math.max(Math.abs(r.left - p.left), Math.abs(r.top + window.scrollY - p.top));
  }

  measure();
  return {
    measure, floorY, bounds, blocked, perches, drift,
    get floorView() { return floorView; },
    get topView() { return topView; },
  };
}
