/* Sound effects for the genie, synthesized with Web Audio (no audio files to download).
 * The page has no sound switch, so the genie stays silent while he wanders on his own: sounds play only for a
 * few seconds after the visitor clicks him (engage()). Browsers also require a gesture before audio, which that
 * click provides. Everything goes through one quiet master gain and a compressor so a pile of coins stays soft. */

const VOLUME = 0.3;
const WINDOW_S = 7; // seconds of sound after each click on the genie

export function createSounds() {
  let ac = null;
  let master = null;
  let noiseBuf = null;
  let until = 0;
  const lastAt = {};

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ac = new AC();
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 6;
    master = ac.createGain();
    master.gain.value = VOLUME;
    master.connect(comp);
    comp.connect(ac.destination);
    noiseBuf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.5), ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  // Called from inside the click handler (a user gesture), which is what unlocks audio, iOS included.
  function unlock() {
    try {
      if (!ac && !build()) return;
      if (ac.state !== 'running') ac.resume().catch(() => {});
      const src = ac.createBufferSource();
      src.buffer = ac.createBuffer(1, 1, 22050);
      src.connect(ac.destination);
      src.start(0);
    } catch (e) { /* no audio on this browser */ }
  }

  function enabled() {
    return !!ac && ac.state === 'running' && performance.now() < until;
  }

  function ready(name, gap) {
    const now = ac.currentTime;
    if (lastAt[name] && now - lastAt[name] < gap) return false;
    lastAt[name] = now;
    return true;
  }

  function tone({ type = 'sine', from, to = from, dur, vol, at = 0 }) {
    const t = ac.currentTime + at;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(from, t);
    if (to !== from) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.01, dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function noise({ dur, vol, at = 0, type = 'bandpass', freq = 1500, to = freq, q = 1 }) {
    const t = ac.currentTime + at;
    const s = ac.createBufferSource();
    s.buffer = noiseBuf;
    const f = ac.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(freq, t);
    if (to !== freq) f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f);
    f.connect(g);
    g.connect(master);
    s.start(t, Math.random() * 0.3);
    s.stop(t + dur + 0.02);
  }

  const vary = (v, k = 0.08) => v * (1 + (Math.random() * 2 - 1) * k);
  const NOTES = [1047, 1175, 1319, 1568, 1760, 2093, 2349, 2637];

  const sounds = {
    // Magic whoosh up.
    jump() {
      tone({ type: 'sine', from: vary(380), to: 900, dur: 0.18, vol: 0.16 });
      noise({ dur: 0.22, vol: 0.06, freq: 900, to: 3200, q: 0.7 });
    },
    // Soft smoke "poof".
    land() {
      if (!ready('land', 0.12)) return;
      noise({ dur: 0.16, vol: 0.1, type: 'lowpass', freq: 900, to: 300 });
    },
    // A surprised "ooh!".
    surprise() {
      tone({ type: 'triangle', from: 520, to: 1040, dur: 0.12, vol: 0.16 });
      tone({ type: 'sine', from: 1040, to: 880, dur: 0.14, vol: 0.1, at: 0.1 });
    },
    // Finger-gun magic "zing".
    shoot() {
      tone({ type: 'triangle', from: vary(1800), to: 600, dur: 0.18, vol: 0.12 });
      tone({ type: 'sine', from: 2400, to: 3200, dur: 0.1, vol: 0.06, at: 0.02 });
      noise({ dur: 0.05, vol: 0.08, type: 'highpass', freq: 4000 });
    },
    // A card gets zapped: a soft boom and glittery crackle.
    crack() {
      tone({ type: 'sine', from: 140, to: 50, dur: 0.3, vol: 0.3 });
      noise({ dur: 0.22, vol: 0.18, freq: 3600, to: 900, q: 0.8 });
      for (let i = 0; i < 5; i++) tone({ type: 'sine', from: vary(3000, 0.25), dur: 0.05, vol: 0.04, at: 0.05 + i * 0.05 });
    },
    clink(strength = 1) {
      if (!ready('clink', 0.035)) return;
      const f = vary(2600, 0.12);
      tone({ type: 'sine', from: f, dur: 0.09, vol: 0.09 * strength });
      tone({ type: 'sine', from: f * 1.5, dur: 0.06, vol: 0.05 * strength });
    },
    // Each collected coin rings one step higher.
    collect(index = 0) {
      const f = NOTES[Math.min(index, NOTES.length - 1)];
      tone({ type: 'triangle', from: f, dur: 0.12, vol: 0.13 });
      tone({ type: 'sine', from: f * 2, dur: 0.08, vol: 0.05, at: 0.02 });
    },
    celebrate() {
      [1047, 1319, 1568, 2093].forEach((f, i) => tone({ type: 'triangle', from: f, dur: 0.16, vol: 0.12, at: i * 0.09 }));
      for (let i = 0; i < 4; i++) tone({ type: 'sine', from: vary(3200, 0.2), dur: 0.05, vol: 0.04, at: 0.4 + i * 0.05 });
    },
  };

  const api = {
    /** The visitor clicked the genie: unlock audio and allow sounds for a few seconds. */
    engage() {
      unlock();
      until = performance.now() + WINDOW_S * 1000;
    },
    destroy() {
      try { ac?.close(); } catch (e) { /* already closed */ }
    },
  };
  for (const [name, fn] of Object.entries(sounds)) {
    api[name] = (...args) => { if (enabled()) { try { fn(...args); } catch (e) { /* ignore audio errors */ } } };
  }
  return api;
}
