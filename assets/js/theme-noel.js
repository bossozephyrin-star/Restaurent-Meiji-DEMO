const root = document.documentElement;
if (getComputedStyle(root).getPropertyValue('--theme-noel').trim() === '1') initChristmas();

function initChristmas() {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'meiji-noel-effects';
  let paused = false;
  try { paused = localStorage.getItem(storageKey) === 'off'; } catch { /* Stockage facultatif. */ }
  let pageActive = true;
  let frame = 0;
  let previous = 0;
  const scenes = [];
  const controls = [];
  const snowIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M12 2v20M3.34 7l17.32 10M3.34 17 20.66 7M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4-1-1-4M17 19l-1-4 4-1M4 14l4 1-1 4M17 5l-1 4 4 1"/></svg>';

  const backdrop = mountSnow(document.body, 'backdrop');
  if (backdrop) scenes.push(backdrop);

  for (const host of document.querySelectorAll('.hero--noel, .menu-banner, .page-heading, .site-header, .site-footer')) {
    const banner = host.matches('.hero--noel, .menu-banner, .page-heading');
    const scene = mountSnow(host, host.matches('.site-header') ? 'header' : 'scene');
    if (!scene) continue;
    scenes.push(scene);
    if (banner) {
      const decor = document.createElement('div');
      decor.className = 'noel-decor';
      decor.setAttribute('aria-hidden', 'true');
      decor.innerHTML = '<div class="noel-decor__pine"></div><div class="noel-decor__pine noel-decor__pine--right"></div><div class="noel-lights">' + '<i></i>'.repeat(8) + '</div><span class="noel-bauble"><i></i></span><span class="noel-bauble noel-bauble--gold"><i></i></span><span class="noel-bauble noel-bauble--small"><i></i></span>';
      host.insertBefore(decor, scene.canvas);
      scene.ornaments = [...decor.querySelectorAll('.noel-bauble, .noel-lights i')];
      addControl(host);
    } else if (host.matches('.site-footer')) {
      addControl(host.querySelector('.site-footer__content') || host);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        scene.visible = entry.isIntersecting;
        update();
      }).observe(host);
    }
  }

  function addControl(host) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'noel-effects-control';
    button.innerHTML = snowIcon + '<span></span>';
    host.append(button);
    controls.push({ button, label: button.querySelector('span') });
    button.addEventListener('click', () => {
      paused = !paused;
      try { localStorage.setItem(storageKey, paused ? 'off' : 'on'); } catch { /* Le bouton reste fonctionnel. */ }
      update();
    });
  }

  function draw(time) {
    frame = requestAnimationFrame(draw);
    if (previous && time - previous < 32) return;
    const seconds = previous ? Math.min((time - previous) / 1000, .08) : .033;
    previous = time;
    for (const scene of scenes) {
      if (scene.visible) scene.draw(time, seconds);
    }
  }

  function update() {
    const enabled = !motion.matches && !paused;
    const running = enabled && pageActive && !document.hidden;
    for (const { button, label } of controls) {
      button.disabled = motion.matches;
      label.textContent = motion.matches ? 'Effets réduits' : paused ? 'Relancer la neige' : 'Pause neige';
    }
    for (const scene of scenes) {
      if (!enabled) scene.clear();
      for (const ornament of scene.ornaments) {
        ornament.style.animationPlayState = running && scene.visible ? 'running' : 'paused';
      }
    }
    if (running && !frame) {
      previous = 0;
      frame = requestAnimationFrame(draw);
    } else if (!running && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  motion.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  addEventListener('pagehide', () => { pageActive = false; update(); });
  addEventListener('pageshow', () => { pageActive = true; update(); });
  update();
}

function mountSnow(host, mode) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return null;
  const backdrop = mode === 'backdrop';
  canvas.className = backdrop ? 'noel-snow noel-snow--backdrop' : 'noel-snow';
  canvas.setAttribute('aria-hidden', 'true');
  host.append(canvas);

  let width = 0;
  let height = 0;
  let particles = [];
  const rect = host.getBoundingClientRect();
  const scene = { canvas, visible: backdrop || (rect.top < innerHeight && rect.bottom > 0), ornaments: [], draw, clear };

  function particle(randomY = true) {
    const depth = Math.random();
    return {
      x: Math.random() * width,
      y: randomY ? Math.random() * height : -8,
      radius: .65 + depth * (backdrop ? 2.9 : 2.2),
      speed: 17 + depth * 36,
      alpha: .27 + depth * .62,
      phase: Math.random() * Math.PI * 2
    };
  }

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const scale = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    const density = backdrop ? 3400 : 9600;
    const count = Math.min(backdrop ? 155 : 78, Math.ceil(width * height / density));
    particles = Array.from({ length: count }, () => particle());
  }

  function clear() {
    context.clearRect(0, 0, width, height);
  }

  function draw(time, seconds) {
    clear();
    for (const flake of particles) {
      flake.y += flake.speed * seconds;
      flake.x += (7 + Math.sin(time / 1800 + flake.phase) * 17) * seconds;
      if (flake.y > height + 8) Object.assign(flake, particle(false));
      if (flake.x > width + 8) flake.x = -8;
      if (flake.x < -8) flake.x = width + 8;
      context.beginPath();
      context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      context.fillStyle = 'rgba(255, 252, 240, ' + flake.alpha + ')';
      context.fill();
      if (backdrop) {
        context.lineWidth = .75;
        context.strokeStyle = 'rgba(42, 82, 66, ' + flake.alpha * .45 + ')';
        context.stroke();
      }
    }
  }

  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else addEventListener('resize', resize, { passive: true });
  return scene;
}
