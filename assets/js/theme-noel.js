// Le décor s'arrête hors écran, dans un onglet caché ou à la demande du visiteur.
const root = document.documentElement;
if (getComputedStyle(root).getPropertyValue('--theme-noel').trim() === '1') initChristmas();

function initChristmas() {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'meiji-noel-effects';
  let preference = null;
  try { preference = localStorage.getItem(storageKey); } catch { /* Stockage facultatif. */ }
  let enabled = !motion.matches && preference !== 'off';
  let pageActive = true;
  const scenes = [];
  const snowIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M12 2v20M3.34 7l17.32 10M3.34 17 20.66 7M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4-1-1-4M17 19l-1-4 4-1M4 14l4 1-1 4M17 5l-1 4 4 1"/></svg>';
  for (const host of document.querySelectorAll('.hero--noel, .menu-banner, .page-heading')) {
    const decor = document.createElement('div');
    decor.className = 'noel-decor';
    decor.setAttribute('aria-hidden', 'true');
    decor.innerHTML = '<div class="noel-decor__pine"></div><div class="noel-decor__pine noel-decor__pine--right"></div><div class="noel-lights">' + '<i></i>'.repeat(8) + '</div><span class="noel-bauble"><i></i></span><span class="noel-bauble noel-bauble--gold"><i></i></span><span class="noel-bauble noel-bauble--small"><i></i></span>';
    const canvas = document.createElement('canvas');
    canvas.className = 'noel-snow';
    canvas.setAttribute('aria-hidden', 'true');
    const control = document.createElement('button');
    control.type = 'button';
    control.className = 'noel-effects-control';
    control.innerHTML = snowIcon + '<span></span>';
    host.append(decor, canvas, control);
    const context = canvas.getContext('2d');
    if (!context) { canvas.remove(); control.remove(); continue; }
    let width = 1, height = 1, particles = [], frame = 0, previous = 0;
    let visible = host.getBoundingClientRect().top < innerHeight && host.getBoundingClientRect().bottom > 0;
    const animatedDecor = decor.querySelectorAll('.noel-bauble, .noel-lights i');
    function particle(randomY = true) {
      const depth = Math.random();
      return { x: Math.random() * width, y: randomY ? Math.random() * height : -8,
        radius: .6 + depth * 2.2, speed: 18 + depth * 35,
        alpha: .2 + depth * .6, phase: Math.random() * Math.PI * 2 };
    }
    function resize() {
      const rect = host.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({length: width < 700 ? 42 : 78}, () => particle());
    }
    function draw(time) {
      if (!enabled || !visible || document.hidden || !pageActive) { frame = 0; return; }
      frame = requestAnimationFrame(draw);
      if (previous && time - previous < 32) return;
      const delta = previous ? Math.min((time - previous) / 1000, .08) : .033;
      previous = time;
      context.clearRect(0, 0, width, height);
      for (const flake of particles) {
        flake.y += flake.speed * delta;
        flake.x += (5 + Math.sin(time / 1800 + flake.phase) * 12) * delta;
        if (flake.y > height + 8) Object.assign(flake, particle(false));
        if (flake.x > width + 8) flake.x = -8;
        if (flake.x < -8) flake.x = width + 8;
        context.beginPath();
        context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(255,250,235,${flake.alpha})`;
        context.fill();
      }
    }
    function sync() {
      control.disabled = motion.matches;
      control.querySelector('span').textContent = motion.matches ? 'Effets réduits' : enabled ? 'Pause neige' : 'Relancer la neige';
      const running = enabled && visible && !document.hidden && pageActive;
      if (running) {
        if (!frame) { previous = 0; frame = requestAnimationFrame(draw); }
      } else {
        cancelAnimationFrame(frame); frame = 0; previous = 0;
        if (!enabled) context.clearRect(0, 0, width, height);
      }
      animatedDecor.forEach(item => { item.style.animationPlayState = running ? 'running' : 'paused'; });
    }
    control.addEventListener('click', () => {
      enabled = !enabled;
      preference = enabled ? 'on' : 'off';
      try { localStorage.setItem(storageKey, preference); } catch { /* Le bouton reste fonctionnel. */ }
      update();
    });
    resize();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);
    else addEventListener('resize', resize, {passive: true});
    if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(host);
    scenes.push(sync);
  }
  function update() { root.classList.toggle('noel-motion-off', !enabled); scenes.forEach(sync => sync()); }
  motion.addEventListener('change', () => { enabled = !motion.matches && preference !== 'off'; update(); });
  document.addEventListener('visibilitychange', update);
  addEventListener('pagehide', () => { pageActive = false; update(); });
  addEventListener('pageshow', () => { pageActive = true; update(); });
  update();
}
