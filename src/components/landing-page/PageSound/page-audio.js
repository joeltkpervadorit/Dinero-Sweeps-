/* Page sound: a soft genie background tune, a magic chime on every tap/click, and wind blowing while scrolling.
 * Everything is synthesized with Web Audio (no audio files). Browsers only allow sound after the visitor taps,
 * clicks or presses a key, so nothing plays until then; the first gesture starts the music.
 *
 * Music: D hijaz scale (D Eb F# G A Bb C), ~84 BPM. A low drone, an oud-like plucked melody that wanders through
 * the scale in short phrases, a frame-drum pattern (doum / tek) and an occasional bell, all through a small
 * generated reverb. Notes are scheduled a little ahead of time by one timer; the context is suspended while the
 * tab is hidden. */

const MUSIC_VOL = 0.16;
const FX_VOL = 0.32;
const BPM = 84;
const STEP = 60 / BPM / 2; // eighth notes
const LOOKAHEAD = 0.35;

// D hijaz across two octaves (Hz), D3 .. D5
const SCALE = [146.83, 155.56, 185.0, 196.0, 220.0, 233.08, 261.63, 293.66, 311.13, 369.99, 392.0, 440.0, 466.16, 523.25, 587.33];
// maqsum-like 8-step drum pattern: D = doum (low), T = tek (high), . = rest
const DRUM = ['D', 'T', '.', 'T', 'D', '.', 'T', '.'];

export function createPageAudio() {
  let ac = null;
  let out = null; // master for everything
  let music = null; // music bus
  let fx = null; // sound-effects bus
  let wet = null; // reverb send
  let noiseBuf = null;
  let wind = null; // looping wind noise whose strength follows the scroll speed
  let on = false; // user setting
  let playing = false;
  let timer = 0;
  let nextT = 0;
  let step = 0;
  let melodyIdx = 7;
  let phraseLeft = 0;
  let lastScrollY = window.scrollY;
  let lastScrollT = performance.now();
  let scrollStop = 0;
  let lastTap = 0;

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ac = new AC();
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.ratio.value = 5;
    out = ac.createGain();
    out.gain.value = 1;
    out.connect(comp);
    comp.connect(ac.destination);

    music = ac.createGain();
    music.gain.value = 0;
    music.connect(out);
    fx = ac.createGain();
    fx.gain.value = FX_VOL;
    fx.connect(out);

    // Reverb: a short decaying noise impulse.
    const len = Math.floor(ac.sampleRate * 2.2);
    const ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    const verb = ac.createConvolver();
    verb.buffer = ir;
    wet = ac.createGain();
    wet.gain.value = 0.35;
    wet.connect(verb);
    verb.connect(out);

    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const n = noiseBuf.getChannelData(0);
    for (let i = 0; i < n.length; i++) n[i] = Math.random() * 2 - 1;

    // Scroll wind: looping brown noise (deep, airy rumble) through a lowpass that opens as the wind gets
    // stronger, plus a narrow band-pass "whistle" whose pitch wanders with a slow LFO, like gusts through a gap.
    // Both gusts and whistle are always running; only the master wind gain follows the scroll speed.
    const bn = ac.createBuffer(1, ac.sampleRate * 4, ac.sampleRate);
    const bd = bn.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bd.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; bd[i] = last * 3.5; }
    const src = ac.createBufferSource();
    src.buffer = bn;
    src.loop = true;
    const body = ac.createBiquadFilter();
    body.type = 'lowpass';
    body.Q.value = 0.7;
    body.frequency.value = 350;
    const whistle = ac.createBiquadFilter();
    whistle.type = 'bandpass';
    whistle.Q.value = 9;
    whistle.frequency.value = 800;
    const whistleGain = ac.createGain();
    whistleGain.gain.value = 0.5;
    const gust = ac.createGain(); // slow swells, the wind "breathing"
    gust.gain.value = 0.75;
    const g = ac.createGain();
    g.gain.value = 0;
    const lfo = (freq, depth, target) => {
      const o = ac.createOscillator();
      const d = ac.createGain();
      o.frequency.value = freq;
      d.gain.value = depth;
      o.connect(d);
      d.connect(target);
      o.start();
    };
    lfo(0.23, 260, whistle.frequency);
    lfo(0.11, 0.25, gust.gain);
    lfo(0.37, 0.15, whistleGain.gain);
    src.connect(body);
    src.connect(whistle);
    whistle.connect(whistleGain);
    body.connect(gust);
    whistleGain.connect(gust);
    gust.connect(g);
    g.connect(fx);
    g.connect(wet);
    src.start();
    wind = { gain: g, body, whistle };
    return true;
  }

  /* ---------------- instruments ---------------- */

  function env(g, t, vol, attack, dur) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  function pluck(freq, t, vol = 0.22, dur = 0.9) {
    const o = ac.createOscillator();
    const o2 = ac.createOscillator();
    const f = ac.createBiquadFilter();
    const g = ac.createGain();
    o.type = 'sawtooth';
    o2.type = 'triangle';
    o.frequency.value = freq;
    o2.frequency.value = freq * 1.003;
    f.type = 'lowpass';
    f.Q.value = 2;
    f.frequency.setValueAtTime(freq * 7, t);
    f.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.25);
    env(g, t, vol, 0.006, dur);
    o.connect(f);
    o2.connect(f);
    f.connect(g);
    g.connect(music);
    g.connect(wet);
    o.start(t); o2.start(t);
    o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }

  function bell(freq, t, vol = 0.08, dest = music) {
    [1, 2.76, 5.4].forEach((k, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'sine';
      o.frequency.value = freq * k;
      env(g, t, vol / (i + 1), 0.004, 1.6 / (i + 1));
      o.connect(g);
      g.connect(dest);
      g.connect(wet);
      o.start(t);
      o.stop(t + 1.7);
    });
  }

  function doum(t) {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.25);
    env(g, t, 0.5, 0.004, 0.32);
    o.connect(g);
    g.connect(music);
    o.start(t);
    o.stop(t + 0.35);
  }

  function tek(t, vol = 0.16) {
    const s = ac.createBufferSource();
    s.buffer = noiseBuf;
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 3200;
    f.Q.value = 1.4;
    const g = ac.createGain();
    env(g, t, vol, 0.002, 0.07);
    s.connect(f);
    f.connect(g);
    g.connect(music);
    s.start(t, Math.random() * 0.5);
    s.stop(t + 0.1);
  }

  let drone = null;
  function startDrone() {
    const g = ac.createGain();
    g.gain.value = 0.0001;
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 420;
    const lfo = ac.createOscillator();
    const lfoG = ac.createGain();
    lfo.frequency.value = 0.07;
    lfoG.gain.value = 160;
    lfo.connect(lfoG);
    lfoG.connect(f.frequency);
    const oscs = [73.42, 110.0, 146.83].map((fr, i) => {
      const o = ac.createOscillator();
      o.type = i === 0 ? 'triangle' : 'sawtooth';
      o.frequency.value = fr;
      o.detune.value = (i - 1) * 4;
      o.connect(f);
      o.start();
      return o;
    });
    f.connect(g);
    g.connect(music);
    g.connect(wet);
    lfo.start();
    g.gain.exponentialRampToValueAtTime(0.09, ac.currentTime + 3);
    drone = { g, oscs: [...oscs, lfo] };
  }
  function stopDrone() {
    if (!drone) return;
    const d = drone;
    drone = null;
    const t = ac.currentTime;
    d.g.gain.cancelScheduledValues(t);
    d.g.gain.setTargetAtTime(0.0001, t, 0.3);
    d.oscs.forEach((o) => o.stop(t + 1.5));
  }

  /* ---------------- music scheduler ---------------- */

  function nextNote() {
    if (phraseLeft <= 0) {
      phraseLeft = 6 + Math.floor(Math.random() * 6);
      melodyIdx = 4 + Math.floor(Math.random() * 6);
    }
    phraseLeft--;
    const r = Math.random();
    const move = r < 0.35 ? -1 : r < 0.7 ? 1 : r < 0.82 ? -2 : r < 0.94 ? 2 : 0;
    melodyIdx = Math.max(0, Math.min(SCALE.length - 1, melodyIdx + move));
    // phrases tend to come home to D
    if (phraseLeft === 0) melodyIdx = Math.random() < 0.6 ? 7 : 0;
    return SCALE[melodyIdx];
  }

  function schedule() {
    while (nextT < ac.currentTime + LOOKAHEAD) {
      const s = step % 8;
      const bar = Math.floor(step / 8);
      const d = DRUM[s];
      if (d === 'D') doum(nextT);
      else if (d === 'T') tek(nextT, s === 3 ? 0.1 : 0.16);
      // melody on most beats, sparser on off-beats; a rest bar every so often
      const restBar = bar % 8 === 7;
      if (!restBar && (s % 2 === 0 ? Math.random() < 0.8 : Math.random() < 0.35)) {
        const f = nextNote();
        pluck(f, nextT, s === 0 ? 0.24 : 0.17, phraseLeft === 0 ? 1.6 : 0.8);
        // quick ornament (a grace note just before) now and then
        if (Math.random() < 0.12) pluck(f * 1.06, nextT - 0.05, 0.08, 0.15);
      }
      if (s === 0 && bar % 4 === 0) bell(SCALE[7 + (bar % 8 === 0 ? 7 : 4)] * 2, nextT, 0.05);
      nextT += STEP;
      step++;
    }
  }

  function startMusic() {
    if (playing || !ac || ac.state !== 'running') return;
    playing = true;
    music.gain.cancelScheduledValues(ac.currentTime);
    music.gain.setTargetAtTime(MUSIC_VOL, ac.currentTime, 0.8);
    nextT = ac.currentTime + 0.1;
    step = 0;
    startDrone();
    schedule();
    timer = setInterval(schedule, 100);
  }

  function stopMusic() {
    if (!playing) return;
    playing = false;
    clearInterval(timer);
    music.gain.cancelScheduledValues(ac.currentTime);
    music.gain.setTargetAtTime(0, ac.currentTime, 0.25);
    stopDrone();
  }

  /* ---------------- interaction sounds ---------------- */

  // Magic chime: three quick notes up the scale plus a glitter of high bells.
  function tapChime() {
    const t = ac.currentTime;
    const base = 7 + Math.floor(Math.random() * 4);
    [0, 2, 4].forEach((k, i) => {
      const f = SCALE[Math.min(SCALE.length - 1, base + k)] * 2;
      bell(f, t + i * 0.055, 0.11, fx);
    });
    const s = ac.createBufferSource();
    s.buffer = noiseBuf;
    const f = ac.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 6000;
    const g = ac.createGain();
    env(g, t, 0.05, 0.01, 0.35);
    s.connect(f);
    f.connect(g);
    g.connect(fx);
    s.start(t);
    s.stop(t + 0.4);
  }

  // Thunder for the lightning backdrop. Near: a loud crack, a deep boom and a long rolling rumble.
  // Far (scroll flickers): a quiet, muffled roll.
  function thunder(e) {
    if (!active()) return;
    const near = !e || !e.detail || e.detail.near !== false;
    const t = ac.currentTime + (near ? 0.05 : 0.5);
    const vol = near ? 1 : 0.28;
    const len = near ? 5 : 2.6;
    const noise = (start, dur, type, f0, f1, peak, attack) => {
      const s = ac.createBufferSource();
      s.buffer = noiseBuf;
      s.loop = true;
      s.playbackRate.value = 0.5 + Math.random() * 0.3;
      const f = ac.createBiquadFilter();
      f.type = type;
      f.frequency.setValueAtTime(f0, start);
      f.frequency.exponentialRampToValueAtTime(f1, start + dur);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(peak, start + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      s.connect(f); f.connect(g); g.connect(out); g.connect(wet);
      s.start(start); s.stop(start + dur + 0.1);
    };
    if (near) {
      noise(t, 0.35, 'highpass', 2500, 600, 0.9 * vol, 0.005); // crack
      // Sub boom you feel more than hear.
      const o = ac.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(70, t);
      o.frequency.exponentialRampToValueAtTime(32, t + 1.6);
      const og = ac.createGain();
      og.gain.setValueAtTime(0.0001, t);
      og.gain.exponentialRampToValueAtTime(0.9, t + 0.04);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      o.connect(og); og.connect(out);
      o.start(t); o.stop(t + 1.9);
    }
    // Rolling rumble: a few overlapping swells.
    const rolls = near ? 4 : 2;
    for (let i = 0; i < rolls; i++) {
      const st = t + (near ? 0.08 : 0) + i * (0.35 + Math.random() * 0.5);
      noise(st, len - i * 0.6, 'lowpass', near ? 900 : 400, 60, (0.7 - i * 0.12) * vol, 0.08 + i * 0.1);
    }
  }

  // Rub-the-lamp: a rising bell per rub step, then a magic arpeggio when the wish is granted.
  // A short brassy "rub" swish (band-passed noise sweep) for the lamp.
  function swish(t, from, to, vol, dur) {
    const s = ac.createBufferSource();
    s.buffer = noiseBuf;
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 4;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ac.createGain();
    env(g, t, vol, 0.02, dur);
    s.connect(f); f.connect(g); g.connect(fx); g.connect(wet);
    s.start(t); s.stop(t + dur + 0.05);
  }
  function rubChime(e) {
    if (!active()) return;
    const lvl = (e && e.detail && e.detail.level) || 1;
    const t = ac.currentTime;
    swish(t, 900 + lvl * 150, 2600 + lvl * 300, 0.35, 0.28);
    swish(t + 0.14, 2400 + lvl * 300, 1100, 0.25, 0.24);
    bell(SCALE[Math.min(SCALE.length - 1, 6 + lvl)] * 2, t + 0.05, 0.12, fx);
    bell(SCALE[Math.min(SCALE.length - 1, 8 + lvl)] * 2, t + 0.16, 0.08, fx);
  }
  function wishChime() {
    if (!active()) return;
    const t = ac.currentTime;
    swish(t, 300, 5000, 0.5, 0.9); // magic whoosh as the smoke pours out
    for (let i = 0; i < 9; i++) bell(SCALE[Math.min(SCALE.length - 1, 4 + i)] * 2, t + i * 0.07, 0.12, fx);
    [0, 4, 7].forEach((k) => bell(SCALE[Math.min(SCALE.length - 1, 6 + k)], t + 0.7, 0.14, fx));
  }

  function onScroll() {
    if (!active()) { lastScrollY = window.scrollY; return; }
    const now = performance.now();
    const dy = Math.abs(window.scrollY - lastScrollY);
    const dt = Math.max(16, now - lastScrollT);
    lastScrollY = window.scrollY;
    lastScrollT = now;
    const speed = Math.min(1, dy / dt / 3); // px per ms, ~3 px/ms is a fast fling
    const t = ac.currentTime;
    // Faster scroll: louder, brighter wind and a higher whistle. It swells in and dies away slowly, like a gust.
    wind.gain.gain.setTargetAtTime(0.18 + speed * 0.5, t, 0.18);
    wind.body.frequency.setTargetAtTime(300 + speed * 1300, t, 0.25);
    wind.whistle.frequency.setTargetAtTime(650 + speed * 900, t, 0.3);
    clearTimeout(scrollStop);
    scrollStop = setTimeout(() => {
      if (!ac) return;
      wind.gain.gain.setTargetAtTime(0, ac.currentTime, 0.45);
      wind.body.frequency.setTargetAtTime(300, ac.currentTime, 0.6);
    }, 160);
  }

  function active() {
    return on && ac && ac.state === 'running' && !document.hidden;
  }

  /* iPhone: Web Audio plays in the "ambient" audio session, which the ring/silent switch mutes. Two fixes:
   * navigator.audioSession (iOS 16.4+) asks for the "playback" session directly; on older iOS a silent looping
   * <audio> element, started inside the gesture, switches the page to the playback session. */
  let keepAlive = null;
  function silentWav() {
    const rate = 8000;
    const n = rate / 2; // 0.5 s of 8-bit silence
    const buf = new ArrayBuffer(44 + n);
    const v = new DataView(buf);
    const str = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
    str(0, 'RIFF'); v.setUint32(4, 36 + n, true); str(8, 'WAVE'); str(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
    str(36, 'data'); v.setUint32(40, n, true);
    for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
    return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
  }
  function playbackSession() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* not supported */ }
    if (!/iP(hone|ad|od)|Macintosh/.test(navigator.userAgent) || !('ontouchend' in document)) return; // iOS only
    try {
      if (!keepAlive) {
        keepAlive = document.createElement('audio');
        keepAlive.setAttribute('x-webkit-airplay', 'deny');
        keepAlive.preload = 'auto';
        keepAlive.loop = true;
        keepAlive.src = silentWav();
      }
      const p = keepAlive.play();
      if (p) p.catch(() => {});
    } catch (e) { /* ignore */ }
  }

  // Runs inside a user gesture (touchend/click/key): creates or resumes the context and starts the music.
  // iOS only accepts resume() from a gesture that ends a tap, and the context may also be "interrupted"
  // (after a call or a trip to the home screen), so every gesture retries until it is running.
  function unlock() {
    if (!on) return;
    try {
      playbackSession();
      if (!ac && !build()) return;
      if (ac.state !== 'running') ac.resume().then(() => { if (on) startMusic(); }).catch(() => {});
      const b = ac.createBufferSource();
      b.buffer = ac.createBuffer(1, 1, 22050);
      b.connect(ac.destination);
      b.start(0);
      startMusic();
    } catch (e) { /* no audio */ }
  }

  // The chime plays on touch-down (feels instant); unlocking happens on the gesture events below.
  function onTap(e) {
    if (e.button > 0) return;
    if (!active()) return;
    const now = performance.now();
    if (now - lastTap < 90) return;
    lastTap = now;
    try { tapChime(); } catch (err) { /* ignore */ }
  }
  const onGesture = () => {
    if (on && (!ac || ac.state !== 'running' || !playing)) unlock();
  };

  function onVisibility() {
    if (!ac) return;
    if (document.hidden) {
      ac.suspend().catch(() => {});
      keepAlive?.pause();
    } else if (on) {
      ac.resume().catch(() => {});
      if (keepAlive) keepAlive.play()?.catch(() => {});
    }
  }

  const GESTURES = ['pointerup', 'touchend', 'click', 'keydown'];
  window.addEventListener('pointerdown', onTap, { passive: true });
  GESTURES.forEach((t) => window.addEventListener(t, onGesture, { passive: true, capture: true }));
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('ds:thunder', thunder);
  window.addEventListener('ds:rub', rubChime);
  window.addEventListener('ds:wish', wishChime);
  document.addEventListener('visibilitychange', onVisibility);

  return {
    /** Turn all page sound on or off. Turning it on from a button click starts the music right away. */
    setOn(v, fromGesture = false) {
      on = !!v;
      if (on) { if (fromGesture) unlock(); }
      else {
        stopMusic();
        keepAlive?.pause();
        if (ac) wind.gain.gain.setTargetAtTime(0, ac.currentTime, 0.05);
      }
    },
    destroy() {
      stopMusic();
      clearTimeout(scrollStop);
      window.removeEventListener('pointerdown', onTap);
      GESTURES.forEach((t) => window.removeEventListener(t, onGesture, { capture: true }));
      if (keepAlive) { keepAlive.pause(); URL.revokeObjectURL(keepAlive.src); keepAlive = null; }
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('ds:thunder', thunder);
      window.removeEventListener('ds:rub', rubChime);
      window.removeEventListener('ds:wish', wishChime);
      document.removeEventListener('visibilitychange', onVisibility);
      try { ac?.close(); } catch (e) { /* closed */ }
    },
  };
}
