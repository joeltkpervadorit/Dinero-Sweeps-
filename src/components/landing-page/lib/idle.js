/* Run `fn` once the first screen has painted and the browser is idle, so non-critical features (the mascot)
 * don't compete with the content the visitor came for. Returns a cancel function. */
export function afterFirstPaint(fn, { delay = 0, timeout = 3000 } = {}) {
  let cancelled = false;
  let timer = 0;
  let idle = 0;
  const run = () => {
    if (cancelled) return;
    if (typeof window.requestIdleCallback === 'function') idle = window.requestIdleCallback(() => { if (!cancelled) fn(); }, { timeout });
    else timer = setTimeout(() => { if (!cancelled) fn(); }, 200);
  };
  // two frames: the first paint has been committed by the second callback
  const raf = requestAnimationFrame(() => requestAnimationFrame(() => { timer = setTimeout(run, delay); }));
  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    if (idle && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle);
  };
}
