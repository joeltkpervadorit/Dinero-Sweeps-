/* Dinero Sweeps — "Three Wishes" scroll choreography (v6) · GSAP + ScrollTrigger.
   Native scrolling only. Pinned moments use CSS position:sticky, never scroll-jacking.
   The page is fully laid out and readable without this file; motion is added only in a real, scrolling viewport
   and never for visitors who prefer reduced motion. Transforms and opacity only. */
export function initMotion() {
  if (window.__dsMotion) return; window.__dsMotion = true;

  var tries = 0;
  function boot() {
    var root = document.querySelector('.ds');
    if (!root || !window.gsap || !window.ScrollTrigger) { if (tries++ < 300) return requestAnimationFrame(boot); return; }
    start(root);
  }
  function start(root) {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    root.classList.add('js');
    var $ = function (s, c) { return Array.prototype.slice.call((c || root).querySelectorAll(s)); };

    /* ---- always on: split the wish sentences into words (keeps <em> runs intact) ---- */
    $('.wish-t').forEach(function (p) {
      if (p.dataset.split) return; p.dataset.split = '1';
      (function walk(n) {
        Array.prototype.slice.call(n.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var f = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (w) {
              if (!w) return;
              if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(' ')); return; }
              var s = document.createElement('span'); s.className = 'wd'; s.textContent = w; f.appendChild(s);
            });
            n.replaceChild(f, c);
          } else walk(c);
        });
      })(p);
    });
    // testimonial rail: the card in view is "on"
    var rvx = $('.rv-x')[0];
    if (rvx && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('on', e.intersectionRatio > 0.6); }); }, { root: rvx, threshold: [0, 0.6, 1] });
      $('.rvw', rvx).forEach(function (c) { io.observe(c); });
    }

    var mode = '', ctx = null, cleanups = [];
    function want() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return '';
      var vh = window.innerHeight;
      if (vh > 1500) return '';                       // a static full-height frame, not a viewport
      if (root.scrollHeight < vh + 300) return '';
      return root.clientWidth >= 1000 ? 'd' : 'm';
    }
    function apply() {
      var m = want();
      if (m === mode) { if (m) ST.refresh(); return; }
      mode = m;
      cleanups.forEach(function (f) { f(); }); cleanups = [];
      if (ctx) { ctx.revert(); ctx = null; }
      root.classList.remove('mo', 'mo-d', 'mo-m'); root.removeAttribute('data-world');
      $('.rl.on').forEach(function (e) { e.classList.remove('on'); });
      if (!m) return;
      root.classList.add('mo', 'mo-' + m);
      ctx = gsap.context(function () { build(m === 'd'); }, root);
      ST.refresh();
    }

    function build(desk) {
      var E = 'power3.out';

      /* ---- wish meter, header label and colour worlds ---- */
      var acts = [{ el: $('.top')[0], end: $('.c2')[0], w: 'Play' }, { el: $('.c2')[0], end: $('.c3')[0], w: 'Rewards' }, { el: $('.c3')[0], end: $('.nf')[0], w: 'Home' }];
      var bars = $('.meter b'), hn = $('.hd-n')[0], hw = $('.hd-w')[0];
      acts.forEach(function (a, i) {
        if (!a.el || !a.end) return;
        ST.create({ trigger: a.el, start: 'top 55%', endTrigger: a.end, end: 'top 55%',
          onUpdate: function (s) { gsap.set(bars[i], { scaleX: s.progress }); },
          onToggle: function (s) { if (s.isActive) { root.setAttribute('data-world', i + 1); if (hn) hn.textContent = i + 1; if (hw) hw.textContent = a.w; } },
          onLeave: function () { gsap.set(bars[i], { scaleX: 1 }); }, onLeaveBack: function () { gsap.set(bars[i], { scaleX: 0 }); } });
      });
      root.setAttribute('data-world', 1);

      /* ---- atmosphere drifts with the page ---- */
      gsap.to('.atm .a1', { xPercent: 40, yPercent: 30, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 1.2 } });
      gsap.to('.atm .a2', { xPercent: -45, yPercent: -35, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 1.2 } });

      /* ---- hero (v7): the genie emerges from smoke, the headline rises line by line, CTAs land ---- */
      var hin = gsap.timeline({ delay: document.querySelector('.intro') ? 1.75 : 0.1 }); // wait for the loading intro
      hin.from('.hx-img', { scale: 1.12, opacity: 0, filter: 'blur(10px)', duration: 1.6, ease: 'power2.out', clearProps: 'filter' })
        .from('.hx-smk i', { opacity: 0, scale: 0.7, duration: 1.4, ease: 'power2.out', stagger: 0.12 }, 0)
        .from('.hx-eb', { y: 16, opacity: 0, duration: 0.6, ease: E, clearProps: 'transform,opacity' }, 0.35)
        .from('.hx-t .ln>i', { yPercent: 115, duration: 1.05, ease: 'power4.out', stagger: 0.1 }, 0.45)
        .from('.hx-s', { y: 18, opacity: 0, duration: 0.7, ease: E, clearProps: 'transform,opacity' }, 0.85)
        .from('.hx-cta .btn', { y: 26, scale: 0.94, opacity: 0, duration: 0.75, ease: 'back.out(1.7)', stagger: 0.08, clearProps: 'transform,opacity' }, 1.0)
        .from('.hx-bn, .hx-18', { y: 20, opacity: 0, duration: 0.7, ease: E, stagger: 0.08, clearProps: 'transform,opacity' }, 1.15)
        .from('.cn', { scale: 0, rotation: -60, opacity: 0, duration: 0.9, ease: 'back.out(2)', stagger: 0.12 }, 0.6);
      /* idle life: the genie floats, coins bob, the smoke drifts (transforms only) */
      gsap.to('.hx-art', { y: desk ? -14 : -8, duration: 3.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      $('.cn').forEach(function (c, i) {
        gsap.to(c, { y: -10 - i * 4, rotation: i % 2 ? 10 : -8, duration: 2.6 + i * 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 + i * 0.3 });
      });
      $('.hx-smk i').forEach(function (m, i) {
        gsap.to(m, { xPercent: i % 2 ? -12 : 12, yPercent: i === 1 ? -10 : 8, scale: 1.12, duration: 7 + i * 2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });
      /* subtle parallax while leaving the hero */
      var hs = { trigger: '.hx', start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('.hx-bg', { yPercent: desk ? 10 : 14, ease: 'none', scrollTrigger: hs });   // artwork drifts slower than the page
      gsap.to('.hx-fx', { y: desk ? -160 : -110, ease: 'none', scrollTrigger: hs });     // coins drift faster (depth)
      gsap.to('.hx-c', { y: desk ? -40 : -20, ease: 'none', scrollTrigger: hs });

      /* ---- ticker & follow marquee lean into the scroll ---- */
      gsap.to('.tick-in', { xPercent: -12, ease: 'none', scrollTrigger: { trigger: '.tick', start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
      gsap.to('.fol-mq', { xPercent: -14, ease: 'none', scrollTrigger: { trigger: '.fol', start: 'top bottom', end: 'bottom top', scrub: 0.6 } });

      /* ---- wish scenes: the sentence fills in as you scroll, the numeral drifts ---- */
      $('.wish').forEach(function (w) {
        var words = $('.wd', w), num = $('.wish-n', w)[0], deco = $('.wish-d', w)[0];
        gsap.set(words, { opacity: 0.14 });
        // desktop: pinned scene, fill across the pin; phones: unpinned, fill while it crosses the viewport
        gsap.to(words, { opacity: 1, ease: 'none', stagger: 0.5, scrollTrigger: desk
          ? { trigger: w, start: 'top 30%', end: 'bottom 105%', scrub: 0.4 }
          : { trigger: w, start: 'top 80%', end: 'bottom 60%', scrub: 0.4 } });
        gsap.fromTo(num, { yPercent: 12, rotation: -4 }, { yPercent: -18, rotation: 3, ease: 'none', scrollTrigger: { trigger: w, start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.fromTo(deco, { y: 60, rotation: -14, scale: 0.8 }, { y: -30, rotation: 10, scale: 1.08, ease: 'none', scrollTrigger: { trigger: w, start: 'top 60%', end: 'bottom bottom', scrub: 0.8 } });
        gsap.from($('.kick', w), { opacity: 0, x: -20, duration: 0.7, ease: E, scrollTrigger: { trigger: w, start: 'top 45%', toggleActions: 'play none none reverse' } });
      });

      /* ---- headings: lines rise out of their own baseline ---- */
      $('.h2.rv').forEach(function (h) {
        var parts = $('.ln>i, .reel>i', h);
        gsap.from(parts, { yPercent: 118, duration: 1, ease: 'power4.out', stagger: h.querySelector('.reel') ? 0.06 : 0.11, scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
      });
      $('.sh').forEach(function (sh) {
        var rest = $('.kick, .lead, .lnk', sh);
        if (rest.length) gsap.from(rest, { y: 18, opacity: 0, duration: 0.8, ease: E, stagger: 0.08, scrollTrigger: { trigger: sh, start: 'top 86%', once: true } });
      });

      /* ---- platform roll call: the row at the reading line lights up (phones) ---- */
      // ScrollTrigger rather than an IntersectionObserver rootMargin: a cross-origin frame (the canvas Play view on a phone) ignores rootMargin,
      // which lit every row at once
      if (!desk) {
        // one live check against the reading line (rows change height when lit, so per-row trigger positions would go stale)
        var rows = $('.rl'), lit = null;
        var pick = function () {
          var mid = window.innerHeight * 0.5, best = null, bd = 1e9;
          rows.forEach(function (r) {
            if (!r.offsetParent) return;
            var b = r.getBoundingClientRect(), d = mid < b.top ? b.top - mid : mid > b.bottom ? mid - b.bottom : 0;
            if (d < bd) { bd = d; best = r; }
          });
          if (bd > 60) best = null;
          if (best !== lit) { if (lit) lit.classList.remove('on'); if (best) best.classList.add('on'); lit = best; }
        };
        ST.create({ trigger: '.roll', start: 'top bottom', end: 'bottom top', onUpdate: pick, onToggle: pick, onRefresh: pick });
        cleanups.push(function () { if (lit) lit.classList.remove('on'); lit = null; });
      } else gsap.fromTo('.rl', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: E, stagger: 0.05, clearProps: 'transform,opacity', scrollTrigger: { trigger: '.roll', start: 'top 80%', once: true } });

      /* ---- quick actions (phones): pop in after the hero ---- */
      if (!desk) gsap.fromTo('.qa-b', { y: 24, scale: 0.85, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.8)', stagger: 0.07, delay: 0.85, clearProps: 'transform,opacity' });

      /* ---- games: each category grid deals in row by row as it scrolls into view ---- */
      $('.glg').forEach(function (glg) {
        var vis = $('.gc-t', glg).filter(function (c) { return c.offsetParent; });
        gsap.fromTo(vis, { y: 22, scale: 0.94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: E, stagger: { each: 0.04, grid: 'auto', from: 'start' }, clearProps: 'transform,opacity', scrollTrigger: { trigger: glg, start: 'top 88%', once: true } });
      });

      /* ---- why: a deck that stacks (phones) / deals in (desktop) ---- */
      var cards = $('.wp');
      if (!desk) cards.forEach(function (c, i) {
        var next = cards[i + 1]; if (!next) return;
        gsap.to(c, { scale: 0.9, '--dim': 0.55, ease: 'none', scrollTrigger: { trigger: next, start: 'top 85%', end: 'top 90px', scrub: true } });
      });
      else gsap.from(cards, { y: 80, rotation: function (i) { return (i % 2 ? 1 : -1) * 4; }, opacity: 0, duration: 0.9, ease: E, stagger: 0.09, scrollTrigger: { trigger: '.stack', start: 'top 80%', once: true } });
      gsap.to('.wheelx .whl', { rotation: 540, ease: 'none', scrollTrigger: { trigger: '.wp4', start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
      $('.wp .ill').forEach(function (im) { gsap.from(im, { scale: 0.5, rotation: -20, opacity: 0, duration: 0.9, ease: 'back.out(1.8)', scrollTrigger: { trigger: im, start: 'top 90%', once: true } }); });

      /* ---- posters: a spotlight opens, the art floats inside its frame ---- */
      $('.pm').forEach(function (p) {
        gsap.fromTo(p, { clipPath: 'inset(8% 10% 8% 10% round 36px)' }, { clipPath: 'inset(0% 0% 0% 0% round 36px)', ease: 'none', scrollTrigger: { trigger: p, start: 'top 95%', end: 'top 35%', scrub: 0.5 } });
        gsap.fromTo($('.art', p), { yPercent: 8, scale: 1.12 }, { yPercent: -6, scale: 1, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
        gsap.fromTo($('.pm-tx > *', p), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: E, stagger: 0.08, clearProps: 'transform,opacity', scrollTrigger: { trigger: $('.pm-tx', p)[0], start: 'top 86%', once: true } });
      });

      /* ---- how: the line draws itself, each move lands ---- */
      gsap.fromTo('.stl b', desk ? { scaleX: 0 } : { scaleY: 0 }, { scaleX: 1, scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.stp', start: 'top 70%', end: 'bottom 60%', scrub: 0.5 } });
      $('.st').forEach(function (s) {
        var tl = gsap.timeline({ scrollTrigger: { trigger: s, start: 'top 80%', once: true } });
        tl.from($('.stn', s), { scale: 0, duration: 0.5, ease: 'back.out(2.5)' })
          .from($('.st-big', s), { xPercent: -30, opacity: 0, duration: 0.8, ease: E }, 0.05)
          .from($('.st-im', s), { scale: 0.6, rotation: 10, opacity: 0, duration: 0.9, ease: 'back.out(1.6)' }, 0.1)
          .fromTo($('.h3, .stu li, .btn', s), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: E, stagger: 0.06, clearProps: 'transform,opacity' }, 0.25);
      });

      /* ---- three doors swing open ---- */
      gsap.from('.po', { rotationY: -50, x: 60, opacity: 0, transformOrigin: '0% 50%', transformPerspective: 900, duration: 1, ease: E, stagger: 0.14, scrollTrigger: { trigger: '.pox', start: 'top 82%', once: true } });

      /* ---- leaderboard rows flip up like a board ---- */
      gsap.from('.lw', { rotationX: -88, opacity: 0, transformPerspective: 700, duration: 0.7, ease: 'power2.out', stagger: 0.09, scrollTrigger: { trigger: '.lb', start: 'top 78%', once: true } });

      /* ---- trust: hairlines and icons arrive in order ---- */
      $('.tc').forEach(function (t, i) {
        var tl = gsap.timeline({ scrollTrigger: { trigger: t, start: 'top 86%', once: true } });
        tl.from($('.ill', t), { scale: 0.4, rotation: -25, opacity: 0, duration: 0.8, ease: 'back.out(2)' }, desk ? i * 0.1 : 0)
          .from($('.h3, p', t), { x: 24, opacity: 0, duration: 0.7, ease: E, stagger: 0.07 }, '<0.1');
      });

      /* ---- voices, questions, follow ---- */
      gsap.fromTo('.rvw', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: E, stagger: 0.1, clearProps: 'transform,opacity', scrollTrigger: { trigger: '.rv-x', start: 'top 84%', once: true } });
      gsap.from('.fq', { y: 24, opacity: 0, duration: 0.6, ease: E, stagger: 0.07, scrollTrigger: { trigger: '.fqs', start: 'top 84%', once: true } });
      gsap.fromTo('.soc a', { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2.4)', stagger: 0.08, clearProps: 'transform', scrollTrigger: { trigger: '.fol-c', start: 'top 85%', once: true } });
    }

    apply();
    var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(apply, 180); });
    // the script can start before the page has finished parsing: decide again once it has
    window.addEventListener('load', apply);
    document.addEventListener('DOMContentLoaded', apply);
    [300, 1200, 3000].forEach(function (ms) { setTimeout(apply, ms); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(apply);
    $('img').forEach(function (im) { if (!im.complete) im.addEventListener('load', function () { clearTimeout(start._r); start._r = setTimeout(function () { if (mode) ST.refresh(); }, 200); }, { once: true }); });
  }
  boot();
}
