(() => {
  if (!('IntersectionObserver' in window)) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const states = new Map();

  function sync(video, state) {
    const wantsPlayback = state.userChoice ?? !motion.matches;
    if (!state.visible || document.hidden || !wantsPlayback) {
      if (!video.paused) video.pause();
    } else if (video.paused && !video.error) {
      // A browser can require a gesture even for a muted, inline video.
      video.play().catch(() => {});
    }
  }

  const preload = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!motion.matches) entry.target.preload = 'auto';
      preload.unobserve(entry.target);
    }
  }, {rootMargin: '360px 0px'});

  const playback = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const video = entry.target.querySelector('video');
      const state = states.get(video);
      state.visible = entry.isIntersecting && entry.intersectionRatio >= 0.05;
      sync(video, state);
    }
  }, {threshold: [0, 0.05]});

  for (const video of document.querySelectorAll('.case video')) {
    const card = video.closest('.case');
    const button = card.querySelector('.case-control');
    const label = button.querySelector('.control-label');
    const title = card.querySelector('.case-name').textContent;
    const state = {visible: false, userChoice: null};
    states.set(video, state);

    function labelControl() {
      const playing = !video.paused;
      button.classList.toggle('is-playing', playing);
      label.textContent = playing ? 'Пауза' : 'Смотреть';
      button.setAttribute('aria-label', (playing ? 'Приостановить' : 'Воспроизвести') + ' видео «' + title + '»');
    }

    video.addEventListener('play', labelControl);
    video.addEventListener('pause', labelControl);
    button.addEventListener('click', () => {
      state.userChoice = video.paused;
      if (state.userChoice) video.play().catch(labelControl);
      else video.pause();
      labelControl();
    });
    video.addEventListener('error', () => {
      button.disabled = true;
      label.textContent = 'Видео недоступно';
      button.setAttribute('aria-label', 'Видео «' + title + '» недоступно');
      button.classList.remove('is-playing');
    });

    labelControl();
    video.controls = false;
    button.hidden = false;
    preload.observe(video);
    playback.observe(card);
  }

  function syncAll() {
    for (const [video, state] of states) sync(video, state);
  }
  document.addEventListener('visibilitychange', syncAll);
  motion.addEventListener('change', syncAll);
})();
