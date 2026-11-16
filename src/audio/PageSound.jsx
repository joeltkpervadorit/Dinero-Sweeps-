/* Sound switch for the page: genie background music, a chime on taps and a whoosh while scrolling
 * (see page-audio.js). Sound is on by default but, as browsers require, nothing plays until the visitor's first
 * tap, click or key press. The choice is saved in localStorage as `ds_sound_off`. */
import { memo, useEffect, useRef, useState } from 'react';
import { createPageAudio } from './page-audio.js';
import './page-sound.css';

const OFF_KEY = 'ds_sound_off';

function savedOn() {
  try { return localStorage.getItem(OFF_KEY) !== '1'; } catch (e) { return true; }
}

export default memo(function PageSound() {
  const [on, setOn] = useState(savedOn);
  const audio = useRef(null);

  useEffect(() => {
    audio.current = createPageAudio();
    audio.current.setOn(on);
    return () => { audio.current?.destroy(); audio.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    audio.current?.setOn(next, true); // inside the click, so turning sound on can start the music right away
    try { localStorage.setItem(OFF_KEY, next ? '0' : '1'); } catch (e) { /* private mode */ }
  };

  return (
    <button
      type="button"
      className="ds-sound-toggle"
      aria-pressed={on}
      aria-label={on ? 'Turn sound and music off' : 'Turn sound and music on'}
      title={on ? 'Sound on' : 'Sound off'}
      onClick={toggle}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" />
        {on ? (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </>
        ) : (
          <path d="M16 9l5 6M21 9l-5 6" />
        )}
      </svg>
    </button>
  );
});
