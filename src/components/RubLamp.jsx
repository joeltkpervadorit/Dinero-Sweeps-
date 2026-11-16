import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/* Hidden magic lamp in the footer. Rub it (drag back and forth) and it glows brighter; rub enough and the
   genie grants a wish: a smoke burst and a bonus-code popup. */

const BONUS_CODE = 'GENIEWISH'; // TODO: replace with the real promo code

export default function RubLamp() {
  const lampRef = useRef(null);
  const st = useRef({ down: false, lastX: 0, dir: 0, flips: 0, power: 0, step: 0 });
  const [power, setPower] = useState(0);
  const [granted, setGranted] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Glow fades back down when you stop rubbing.
  useEffect(() => {
    if (granted) return undefined;
    const id = setInterval(() => {
      const s = st.current;
      if (!s.down && s.power > 0) { s.power = Math.max(0, s.power - 0.03); setPower(s.power); }
    }, 100);
    return () => clearInterval(id);
  }, [granted]);

  const grant = () => {
    setGranted(true);
    window.dispatchEvent(new CustomEvent('ds:wish'));
    setTimeout(() => setOpen(true), 650);
  };

  const onDown = (e) => {
    if (granted) { setOpen(true); return; }
    const s = st.current;
    s.down = true; s.lastX = e.clientX; s.dir = 0;
    lampRef.current.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    const s = st.current;
    if (!s.down || granted) return;
    const dx = e.clientX - s.lastX;
    if (Math.abs(dx) < 4) return;
    const dir = Math.sign(dx);
    if (s.dir && dir !== s.dir) s.flips++;
    s.dir = dir; s.lastX = e.clientX;
    s.power = Math.min(1, s.power + Math.abs(dx) / 1100);
    setPower(s.power);
    const step = Math.floor(s.power * 6);
    if (step > s.step) { s.step = step; window.dispatchEvent(new CustomEvent('ds:rub', { detail: { level: step } })); }
    if (s.power >= 1 && s.flips >= 5) grant();
  };
  const onUp = () => { st.current.down = false; st.current.step = Math.floor(st.current.power * 6); };

  const copy = async () => {
    try { await navigator.clipboard.writeText(BONUS_CODE); setCopied(true); } catch (e) { /* clipboard blocked */ }
  };

  return (
    <>
      <div className={`rl-lamp${granted ? ' granted' : ''}`} style={{ '--p': power }}>
        <button
          ref={lampRef}
          type="button"
          className="rl-btn"
          aria-label={granted ? 'Show your granted wish' : 'Magic lamp — rub it to make a wish'}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (granted) setOpen(true); else grant(); } }}
        >
          <img src="/media/prop-magic-lamp.webp" alt="" width="64" height="64" draggable="false" />
        </button>
        <span className="rl-hint" aria-hidden="true">{granted ? 'Wish granted!' : 'Rub me…'}</span>
        <span className="rl-puff" aria-hidden="true"><i /><i /><i /><i /></span>
      </div>
      {open && createPortal(
        <div className="rl-ov" onClick={() => setOpen(false)}>
          <div className="rl-card" role="dialog" aria-label="Your wish is granted" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="rl-x" aria-label="Close" onClick={() => setOpen(false)}>&times;</button>
            <img className="rl-ci" src="/media/prop-magic-lamp.webp" alt="" width="84" height="84" />
            <span className="rl-k">&#10022; You found the secret lamp</span>
            <p className="rl-h">Your wish is <em>granted!</em></p>
            <p className="rl-p">Use this code when you sign up for a little genie magic.</p>
            <button type="button" className="rl-code" onClick={copy}>
              <b>{BONUS_CODE}</b><span>{copied ? 'Copied!' : 'Tap to copy'}</span>
            </button>
            <a className="rl-go" href="/signup">Claim my wish</a>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
