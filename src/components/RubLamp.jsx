import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/* Magic lamp in the centre of the footer. One tap (or a quick rub) grants a wish: the lamp shakes,
   puffs smoke and opens a bonus-code popup. Rubbing makes it glow brighter first. */

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
    if (st.current.granted) return;
    st.current.granted = true;
    setGranted(true);
    window.dispatchEvent(new CustomEvent('ds:wish'));
    setTimeout(() => setOpen(true), 650);
  };

  const onDown = (e) => {
    if (granted) return;
    const s = st.current;
    s.down = true; s.lastX = e.clientX; s.dir = 0;
  };
  // A tap anywhere on the lamp grants the wish (or reopens it).
  const onTap = () => { if (st.current.granted) setOpen(true); else grant(); };
  const onMove = (e) => {
    const s = st.current;
    if (!s.down || granted) return;
    const dx = e.clientX - s.lastX;
    if (Math.abs(dx) < 4) return;
    const dir = Math.sign(dx);
    if (s.dir && dir !== s.dir) s.flips++;
    s.dir = dir; s.lastX = e.clientX;
    s.power = Math.min(1, s.power + Math.abs(dx) / 450);
    setPower(s.power);
    const step = Math.floor(s.power * 6);
    if (step > s.step) { s.step = step; window.dispatchEvent(new CustomEvent('ds:rub', { detail: { level: step } })); }
    if (s.power >= 1 && s.flips >= 2) grant();
  };
  const onUp = () => { st.current.down = false; st.current.step = Math.floor(st.current.power * 6); };

  const copy = async () => {
    try { await navigator.clipboard.writeText(BONUS_CODE); setCopied(true); } catch (e) { /* clipboard blocked */ }
  };

  return (
    <>
      <div className={`lamp-wrap${granted ? ' granted' : ''}`} style={{ '--p': power }}>
        <button
          ref={lampRef}
          type="button"
          className="lamp-btn"
          aria-label={granted ? 'Show your granted wish' : 'Magic lamp — tap to make a wish'}
          onClick={onTap}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onUp}
        >
          <span className="lamp-halo" aria-hidden="true" />
          <img src="/media/prop-magic-lamp.webp" alt="" width="120" height="120" draggable="false" />
        </button>
        <span className="lamp-hint" aria-hidden="true">Rub me…</span>
        <span className="lamp-puff" aria-hidden="true"><i /><i /><i /><i /></span>
      </div>
      {open && createPortal(
        <div className="lamp-ov" onClick={() => setOpen(false)}>
          <div className="lamp-card" role="dialog" aria-label="Your wish is granted" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="lamp-x" aria-label="Close" onClick={() => setOpen(false)}>&times;</button>
            <img className="lamp-ci" src="/media/prop-magic-lamp.webp" alt="" width="84" height="84" />
            <span className="lamp-k">&#10022; You found the secret lamp</span>
            <p className="lamp-h">Your wish is <em>granted!</em></p>
            <p className="lamp-p">Use this code when you sign up for a little genie magic.</p>
            <button type="button" className="lamp-code" onClick={copy}>
              <b>{BONUS_CODE}</b><span>{copied ? 'Copied!' : 'Tap to copy'}</span>
            </button>
            <a className="lamp-go" href="/signup">Claim my wish</a>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
