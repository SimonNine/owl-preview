/* ============================================================
   OW LOGISTICS — GLOBAL JS
   Shared behaviours used across every page.
   Load AFTER gsap + ScrollTrigger (from /vendor/), e.g.:
     <script src="../vendor/gsap.min.js"></script>
     <script src="../vendor/ScrollTrigger.min.js"></script>
     <script src="../assets/js/global.js"></script>
   Degrades gracefully if GSAP is absent (content just shows).
   Designed & built by Studio Nine — https://studionine.agency
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);

  initCarousels();                 // manual carousels — no GSAP needed
  var wordSets = wrapRevealWords();// split [data-reveal-words] into word spans (always)

  // Fallback: no GSAP or reduced motion → just show everything, no animation.
  if (!hasGSAP || reduce) {
    document.querySelectorAll('.rv').forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; });
    wordSets.forEach(function (s) { s.words.forEach(function (w) { w.style.opacity = 1; }); });
    if (hasGSAP) runCounters(false);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---- reveal-on-scroll ----
     .rv → individual reveal · [data-rv-group] → staggers its .rv children */
  gsap.utils.toArray('[data-rv-group]').forEach(function (group) {
    gsap.to(group.querySelectorAll('.rv'), {
      y: 0, opacity: 1, duration: .8, ease: 'power3.out', stagger: .1,
      scrollTrigger: { trigger: group, start: 'top 80%' }
    });
  });
  gsap.utils.toArray('.rv').forEach(function (el) {
    if (el.closest('[data-rv-group]')) return;
    gsap.to(el, { y: 0, opacity: 1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  runCounters(true);

  /* ---- scroll-fill text ----
     Each word darkens from its dim resting state to full as you scroll. The scrub
     range is set so the whole block finishes revealing while still in the viewport. */
  wordSets.forEach(function (set) {
    gsap.to(set.words, {
      opacity: 1, ease: 'none', duration: 1, stagger: { each: .4 },
      scrollTrigger: { trigger: set.el, start: 'top 82%', end: 'bottom 78%', scrub: .4 }
    });
  });

  /* ---- horizontal scroll parallax ----
     [data-px="-300"] drifts the element left by 300px as its section scrolls past
     (and back right on the way up). */
  gsap.utils.toArray('[data-px]').forEach(function (el) {
    var dist = parseFloat(el.getAttribute('data-px')) || 0;
    var trig = el.closest('section') || el.parentElement;
    gsap.fromTo(el, { x: 0 }, {
      x: dist, ease: 'none',
      scrollTrigger: { trigger: trig, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- helpers ---------- */

  // count-up stats: <b data-count="100" data-suffix="%" data-prefix="" data-decimals="0">
  function runCounters(animate) {
    gsap.utils.toArray('[data-count]').forEach(function (el) {
      var to = parseFloat(el.getAttribute('data-count')) || 0;
      var suf = el.getAttribute('data-suffix') || '';
      var pre = el.getAttribute('data-prefix') || '';
      var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var fmt = function (v) { return pre + v.toFixed(dec) + suf; };
      if (!animate) { el.textContent = fmt(to); return; }
      el.textContent = fmt(0);
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: function () { var o = { v: 0 }; gsap.to(o, { v: to, duration: 1.2, ease: 'power2.out', onUpdate: function () { el.textContent = fmt(o.v); } }); }
      });
    });
  }

  // Split [data-reveal-words] into <span class="rw"> words, preserving <em> (→ .rw-em).
  function wrapRevealWords() {
    var sets = [];
    document.querySelectorAll('[data-reveal-words]').forEach(function (el) {
      var words = [];
      (function walk(node, em) {
        Array.prototype.slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (tok) {
              if (tok === '') return;
              if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
              var s = document.createElement('span');
              s.className = 'rw' + (em ? ' rw-em' : '');
              s.textContent = tok;
              frag.appendChild(s); words.push(s);
            });
            c.parentNode.replaceChild(frag, c);
          } else if (c.nodeType === 1) {
            walk(c, em || c.tagName === 'EM');
          }
        });
      })(el, false);
      sets.push({ el: el, words: words });
    });
    return sets;
  }

  // Manual carousel: [data-carousel] > .carousel-track > slides; buttons [data-car-prev]/[data-car-next] in the same section.
  // Optional auto-advance: data-carousel-autoplay="15000" (ms). Manual nav restarts the clock;
  // pauses on hover and when the tab is hidden; off under reduced-motion.
  function initCarousels() {
    var reduceMo = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    document.querySelectorAll('[data-carousel]').forEach(function (car) {
      var track = car.querySelector('.carousel-track');
      if (!track) return;
      var slides = track.children, n = slides.length, i = 0;
      var scope = car.closest('section') || car.parentNode || document;
      var delay = parseInt(car.getAttribute('data-carousel-autoplay') || '0', 10);
      var timer = null;
      function go(x) {
        i = ((x % n) + n) % n;
        track.style.transform = 'translateX(-' + (i * 100) + '%)';
        Array.prototype.forEach.call(slides, function (s, k) { s.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
      }
      function start() { if (delay > 0 && !reduceMo && !timer) timer = setInterval(function () { if (!document.hidden) go(i + 1); }, delay); }
      function stop() { if (timer) { clearInterval(timer); timer = null; } }
      function reset() { stop(); start(); }   // restart the 15s clock after a manual move
      scope.querySelectorAll('[data-car-prev]').forEach(function (b) { b.addEventListener('click', function () { go(i - 1); reset(); }); });
      scope.querySelectorAll('[data-car-next]').forEach(function (b) { b.addEventListener('click', function () { go(i + 1); reset(); }); });
      car.addEventListener('mouseenter', stop);   // pause while a visitor is reading
      car.addEventListener('mouseleave', start);
      go(0); start();
    });
  }
})();
