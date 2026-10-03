(() => {
  const deck = document.getElementById('deck');
  const slides = [...document.querySelectorAll('.slide')];
  const pageNumber = document.getElementById('page-number');
  const STAGE_W = 1920;
  const STAGE_H = 1080;

  let current = 0;

  // 브라우저 크기에 맞춰 1920x1080 무대를 통째로 확대/축소
  function fit() {
    const scale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    deck.style.setProperty('--scale', scale);
  }

  function stepsOf(slide) {
    return [...slide.querySelectorAll('[data-step]')].sort(
      (a, b) => Number(a.dataset.step) - Number(b.dataset.step)
    );
  }

  // 같은 번호의 data-step은 함께 나타난다.
  function nextStepGroup(slide) {
    const hidden = stepsOf(slide).filter((el) => !el.classList.contains('shown'));
    if (!hidden.length) return [];
    const n = hidden[0].dataset.step;
    return hidden.filter((el) => el.dataset.step === n);
  }

  function lastShownGroup(slide) {
    const shown = stepsOf(slide).filter((el) => el.classList.contains('shown'));
    if (!shown.length) return [];
    const n = shown[shown.length - 1].dataset.step;
    return shown.filter((el) => el.dataset.step === n);
  }

  function show(index, { revealAll = false } = {}) {
    current = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === current);
      stepsOf(slide).forEach((el) => el.classList.toggle('shown', i === current && revealAll));
    });
    pageNumber.textContent = `${current + 1} / ${slides.length}`;
    history.replaceState(null, '', `#${current + 1}`);
  }

  function next() {
    const group = nextStepGroup(slides[current]);
    if (group.length) {
      group.forEach((el) => el.classList.add('shown'));
    } else if (current < slides.length - 1) {
      show(current + 1);
    }
  }

  function prev() {
    const group = lastShownGroup(slides[current]);
    if (group.length) {
      group.forEach((el) => el.classList.remove('shown'));
    } else if (current > 0) {
      // 이전 장으로 돌아갈 때는 모든 요소가 보이는 상태로
      show(current - 1, { revealAll: true });
    }
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  }

  function indexFromHash() {
    const n = parseInt(location.hash.slice(1), 10);
    return Number.isNaN(n) ? 0 : n - 1;
  }

  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
      case 'Enter':
        e.preventDefault();
        next();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
      case 'Backspace':
        e.preventDefault();
        prev();
        break;
      case 'Home':
        show(0);
        break;
      case 'End':
        show(slides.length - 1, { revealAll: true });
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
    }
  });

  document.addEventListener('click', next);
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    prev();
  });

  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', () => {
    const i = indexFromHash();
    if (i !== current) show(i);
  });

  fit();
  show(indexFromHash());
})();
