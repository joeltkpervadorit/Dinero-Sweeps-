import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/* Magic lamp in the centre of the footer. Each tap shakes it harder and makes it glow brighter (with a
   rub sound); the 3rd tap (or a quick rub) grants the wish: smoke, a magic chime and a bonus-code popup. */
const TAPS = 3;

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
  // Each tap: a shake that grows stronger, more glow and a rub sound. The last tap grants the wish.
  const onTap = () => {
    const s = st.current;
    if (s.granted) { setOpen(true); return; }
    s.taps = (s.taps || 0) + 1;
    s.power = Math.max(s.power, s.taps / TAPS);
    setPower(s.power);
    const k = s.taps; // shake strength
    lampRef.current?.querySelector('img')?.animate(
      [{ transform: 'rotate(0)' }, { transform: `rotate(${-8 * k}deg) scale(${1 + 0.04 * k})` },
       { transform: `rotate(${7 * k}deg) scale(${1 + 0.04 * k})` }, { transform: `rotate(${-5 * k}deg)` },
       { transform: `rotate(${3 * k}deg)` }, { transform: 'rotate(0)' }],
      { duration: 420 + k * 60, easing: 'ease-out' });
    window.dispatchEvent(new CustomEvent('ds:rub', { detail: { level: k * 2 } }));
    if (s.taps >= TAPS) setTimeout(grant, 380);
  };
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
    if (s.power >= 1 && s.flips >= 2) { s.taps = TAPS; grant(); }
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
