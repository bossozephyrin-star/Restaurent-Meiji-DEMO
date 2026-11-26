// Une vidéo décorative peut être suspendue par Safari même avec muted + playsinline.
export function initHeroVideo(root) {
  const hero = root.querySelector('[data-hero-video]');
  const video = hero?.querySelector('video');
  const control = hero?.querySelector('[data-video-control]');
  if (!video || !control) return;

  const win = root.defaultView;
  const motion = win.matchMedia('(prefers-reduced-motion: reduce)');
  const label = control.querySelector('[data-video-label]');
  const status = hero.querySelector('[data-video-status]');
  let userPaused = false;
  let manualPlayback = false;
  let inView = isOnScreen();
  let pending = false;
  let requestId = 0;
  let mediaFailed = false;

  video.defaultMuted = true;
  video.muted = true;
  video.playsInline = true;
  video.controls = false;
  video.autoplay = !motion.matches;
  control.hidden = false;

  function isOnScreen() {
    const rect = hero.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < win.innerHeight;
  }

  function wantsPlayback() {
    return !root.hidden && inView && !userPaused && (!motion.matches || manualPlayback);
  }

  function showState(state, message = '') {
    hero.dataset.videoState = state;
    const playing = state === 'playing';
    label.textContent = playing ? 'Pause' : mediaFailed ? 'Réessayer la vidéo' : 'Lire la vidéo';
    control.setAttribute('aria-label', playing ? 'Mettre la vidéo en pause' : label.textContent);
    status.textContent = message;
  }

  function suspend() {
    requestId += 1;
    pending = false;
    video.pause();
    showState(userPaused ? 'paused' : 'poster');
  }

  function playFailed(error, id) {
    if (id !== requestId) return;
    if (!wantsPlayback() || error?.name === 'AbortError') {
      showState(userPaused ? 'paused' : 'poster');
    } else if (error?.name === 'NotAllowedError') {
      showState('blocked', 'La lecture automatique est bloquée. Vous pouvez utiliser le bouton Lire la vidéo.');
    } else {
      mediaFailed = true;
      showState('error', 'La vidéo est momentanément indisponible. Vous pouvez réessayer.');
    }
  }

  function play(fromGesture = false) {
    if (fromGesture) {
      userPaused = false;
      manualPlayback = true;
      hero.dataset.videoManual = 'true';
      if (mediaFailed) {
        mediaFailed = false;
        video.load();
      }
    }
    if (!wantsPlayback() || (pending && !fromGesture) || !video.paused) return;
    // L'appel doit rester synchrone dans le geste utilisateur : ne pas le différer.
    const id = ++requestId;
    pending = true;
    video.muted = true;
    let result;
    try {
      result = video.play();
    } catch (error) {
      pending = false;
      playFailed(error, id);
      return;
    }
    Promise.resolve(result).then(() => {
      if (id !== requestId) return;
      if (!wantsPlayback()) suspend();
      else if (!video.paused) showState('playing');
    }).catch((error) => playFailed(error, id)).finally(() => {
      if (id === requestId) pending = false;
    });
  }

  video.addEventListener('playing', () => {
    if (wantsPlayback()) {
      mediaFailed = false;
      showState('playing');
    } else suspend();
  });
  video.addEventListener('pause', () => showState(userPaused ? 'paused' : 'poster'));
  video.addEventListener('error', () => {
    requestId += 1;
    pending = false;
    mediaFailed = true;
    showState('error', 'La vidéo est momentanément indisponible. Vous pouvez réessayer.');
  });

  control.addEventListener('click', () => {
    if (!video.paused) {
      userPaused = true;
      suspend();
    } else play(true);
  });

  function onGesture(event) {
    if (control.contains(event.target) || userPaused || motion.matches || !video.paused) return;
    if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
    play(true);
  }
  root.addEventListener(win.PointerEvent ? 'pointerup' : 'touchend', onGesture, { capture: true, passive: true });
  root.addEventListener('keydown', onGesture, { capture: true });

  root.addEventListener('visibilitychange', () => {
    inView = isOnScreen();
    if (root.hidden) suspend();
    else play();
  });
  win.addEventListener('pagehide', suspend);
  win.addEventListener('pageshow', () => {
    inView = isOnScreen();
    play();
  });
  motion.addEventListener('change', () => {
    manualPlayback = false;
    delete hero.dataset.videoManual;
    video.autoplay = !motion.matches;
    if (motion.matches) suspend();
    else play();
  });

  if (win.IntersectionObserver) {
    const observer = new win.IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) play();
      else suspend();
    });
    observer.observe(hero);
  }
  if (!wantsPlayback()) suspend();
  else if (!video.paused && video.readyState >= 3) showState('playing');
  else play();
}

if (typeof document !== 'undefined') initHeroVideo(document);
