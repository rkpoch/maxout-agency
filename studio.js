(function () {
  var root = document.documentElement;
  root.classList.add('js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- reveals --------------------------------------------------------- */
  var targets = Array.prototype.slice.call(document.querySelectorAll('.rv, .wipe, .rule'));
  var left = targets.length;

  function sweep() {
    if (!left) return;
    var h = window.innerHeight || 0;
    for (var i = 0; i < targets.length; i++) {
      var el = targets[i];
      if (el.classList.contains('in')) continue;
      var r = el.getBoundingClientRect();
      // reveal a little before it arrives, so it is ready when it is looked at
      if (r.top < h * 1.12 && r.bottom > -h * 0.3) { el.classList.add('in'); left--; }
    }
  }

  if (reduce) {
    targets.forEach(function (el) { el.classList.add('in'); });
    left = 0;
  } else {
    sweep();
    var pending = false;
    var onMove = function () {
      if (pending || !left) return;
      pending = true;
      requestAnimationFrame(function () { pending = false; sweep(); });
    };
    window.addEventListener('scroll', onMove, { passive: true });
    window.addEventListener('resize', onMove, { passive: true });
    window.addEventListener('load', sweep);
  }

  /* --- the veil rises once the opening screen is behind you ------------- */
  var MAX = 0.70, ticking = false;
  function paint() {
    var vh = window.innerHeight || 1;
    var p = (window.pageYOffset - vh * 0.35) / (vh * 0.65);
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    root.style.setProperty('--veil', (p * MAX).toFixed(3));
    ticking = false;
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  paint();

  /* --- the footage runs on pointer devices only. On phones and tablets,
     iOS Safari refuses muted autoplay often enough that the viewer is left
     looking at a play button, so there the first frame stands in as a still
     background and the video is never fetched at all. */
  var v = document.getElementById('bg');
  var still = reduce || window.matchMedia('(max-width: 900px), (hover: none) and (pointer: coarse)').matches;
  if (v && still) {
    v.parentNode.removeChild(v);
  } else if (v) {
    [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function (f) {
      var src = document.createElement('source');
      src.src = v.getAttribute('data-' + f[0]);
      src.type = f[1];
      v.appendChild(src);
    });
    v.load();
    var kick = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    kick();
    document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
    window.addEventListener('pageshow', kick);
  }
})();
