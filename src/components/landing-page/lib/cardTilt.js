/* Game cards tilt in 3D toward the cursor (or finger while pressed) with a holographic glare.
   One set of delegated listeners for every .gc-t card. Returns a cleanup function. */

export function initCardTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  let cur = null;

  const reset = () => { if (cur) { cur.classList.remove('tilt'); cur = null; } };
  const tilt = (card, e) => {
    if (cur !== card) { reset(); cur = card; card.classList.add('tilt'); }
    const r = card.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    card.style.setProperty('--rx', `${((0.5 - y) * 22).toFixed(2)}deg`);
    card.style.setProperty('--ry', `${((x - 0.5) * 26).toFixed(2)}deg`);
    card.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
    card.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
  };

  const onMove = (e) => {
    if (e.pointerType === 'touch' && !cur) return; // touch tilts only while pressed
    const card = e.target.closest && e.target.closest('.gc-t');
    if (card) tilt(card, e); else reset();
  };
  const onDown = (e) => {
    const card = e.target.closest && e.target.closest('.gc-t');
    if (card) tilt(card, e);
  };
  const onUp = (e) => { if (e.pointerType === 'touch') reset(); };

  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerdown', onDown, { passive: true });
  document.addEventListener('pointerup', onUp, { passive: true });
  document.addEventListener('pointercancel', reset, { passive: true });
  window.addEventListener('scroll', reset, { passive: true });
  return () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerdown', onDown);
    document.removeEventListener('pointerup', onUp);
    document.removeEventListener('pointercancel', reset);
    window.removeEventListener('scroll', reset);
  };
}
