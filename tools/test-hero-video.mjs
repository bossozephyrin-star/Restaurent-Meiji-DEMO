import test from 'node:test';
import assert from 'node:assert/strict';
import { initHeroVideo } from '../assets/js/hero-video.js';

const settle = () => new Promise((resolve) => setImmediate(resolve));
const error = (name) => Object.assign(new Error(name), { name });

function fixture({ reducedMotion = false, blocked = false, pointer = true } = {}) {
  const root = new EventTarget();
  const win = new EventTarget();
  const motion = new EventTarget();
  const video = new EventTarget();
  const control = new EventTarget();
  const label = { textContent: '' };
  const status = { textContent: '' };
  const hero = { dataset: {}, getBoundingClientRect: () => ({ top: 100, bottom: 700 }) };
  const attributes = {};
  let calls = 0;
  let loads = 0;
  let intersect;
  motion.matches = reducedMotion;
  win.innerHeight = 800;
  win.matchMedia = () => motion;
  win.PointerEvent = pointer;
  win.IntersectionObserver = class {
    constructor(callback) { intersect = callback; }
    observe() {}
  };
  root.defaultView = win;
  root.hidden = false;
  root.querySelector = () => hero;
  hero.querySelector = (selector) => ({
    video, '[data-video-control]': control, '[data-video-status]': status,
  })[selector];
  control.hidden = true;
  control.querySelector = () => label;
  control.setAttribute = (name, value) => { attributes[name] = value; };
  control.contains = (node) => node === control;
  video.paused = true;
  video.readyState = 4;
  video.play = () => {
    calls += 1;
    if (blocked) return Promise.reject(error('NotAllowedError'));
    video.paused = false;
    video.dispatchEvent(new Event('playing'));
    return Promise.resolve();
  };
  video.pause = () => {
    if (video.paused) return;
    video.paused = true;
    video.dispatchEvent(new Event('pause'));
  };
  video.load = () => { loads += 1; };
  return {
    root, win, motion, video, control, label, status, hero, attributes,
    get calls() { return calls; },
    get loads() { return loads; },
    unblock() { blocked = false; },
    intersect(visible) { intersect([{ isIntersecting: visible }]); },
    start() { initHeroVideo(root); },
    tap() { root.dispatchEvent(new Event(pointer ? 'pointerup' : 'touchend')); },
    click() { control.dispatchEvent(new Event('click')); },
    visible(visible) { root.hidden = !visible; root.dispatchEvent(new Event('visibilitychange')); },
  };
}

test('démarre en silence, en ligne et affiche la commande de pause', async () => {
  const f = fixture();
  f.start();
  await settle();
  assert.equal(f.video.muted, true);
  assert.equal(f.video.defaultMuted, true);
  assert.equal(f.video.playsInline, true);
  assert.equal(f.video.controls, false);
  assert.equal(f.hero.dataset.videoState, 'playing');
  assert.equal(f.control.hidden, false);
  assert.equal(f.label.textContent, 'Pause');
});

test('un refus Safari garde le poster puis le premier toucher relance la vidéo', async () => {
  const f = fixture({ blocked: true });
  f.start();
  await settle();
  assert.equal(f.hero.dataset.videoState, 'blocked');
  assert.equal(f.label.textContent, 'Lire la vidéo');
  f.unblock();
  f.tap();
  assert.equal(f.calls, 2, 'play doit être appelé dans le geste, sans délai');
  await settle();
  assert.equal(f.hero.dataset.videoState, 'playing');
  assert.equal(f.status.textContent, '');
});

test('le bouton et le repli touchend relancent aussi une lecture bloquée', async () => {
  for (const useButton of [true, false]) {
    const f = fixture({ blocked: true, pointer: false });
    f.start();
    await settle();
    f.unblock();
    if (useButton) f.click();
    else f.tap();
    await settle();
    assert.equal(f.hero.dataset.videoState, 'playing');
  }
});

test('une pause choisie reste en pause après toucher, visibilité et retour de page', async () => {
  const f = fixture();
  f.start();
  await settle();
  f.click();
  f.tap();
  f.visible(false);
  f.visible(true);
  f.win.dispatchEvent(new Event('pageshow'));
  await settle();
  assert.equal(f.video.paused, true);
  assert.equal(f.calls, 1);
  f.click();
  await settle();
  assert.equal(f.hero.dataset.videoState, 'playing');
});

test('reprend au retour dans un onglet, depuis le cache et dans la zone visible', async () => {
  const f = fixture();
  f.start();
  await settle();
  f.visible(false);
  assert.equal(f.video.paused, true);
  f.visible(true);
  await settle();
  assert.equal(f.hero.dataset.videoState, 'playing');
  f.win.dispatchEvent(new Event('pagehide'));
  f.win.dispatchEvent(new Event('pageshow'));
  await settle();
  assert.equal(f.hero.dataset.videoState, 'playing');
  f.intersect(false);
  assert.equal(f.video.paused, true);
  f.intersect(true);
  await settle();
  assert.equal(f.hero.dataset.videoState, 'playing');
});

test('respecte la réduction des animations et permet un choix explicite', async () => {
  const f = fixture({ reducedMotion: true });
  f.start();
  f.tap();
  assert.equal(f.calls, 0);
  assert.equal(f.video.autoplay, false);
  f.click();
  await settle();
  assert.equal(f.hero.dataset.videoState, 'playing');
  assert.equal(f.hero.dataset.videoManual, 'true');
  f.motion.dispatchEvent(new Event('change'));
  assert.equal(f.video.paused, true);
  assert.equal(f.hero.dataset.videoManual, undefined);
});

test('une erreur réseau peut être réessayée au bouton', async () => {
  const f = fixture();
  f.start();
  await settle();
  f.video.pause();
  f.video.dispatchEvent(new Event('error'));
  assert.equal(f.hero.dataset.videoState, 'error');
  assert.equal(f.label.textContent, 'Réessayer la vidéo');
  f.click();
  await settle();
  assert.equal(f.loads, 1);
  assert.equal(f.hero.dataset.videoState, 'playing');
});

test('une ancienne promesse rejetée ne masque pas une lecture reprise', async () => {
  const f = fixture();
  const normalPlay = f.video.play;
  let rejectOld;
  f.video.play = () => new Promise((resolve, reject) => { rejectOld = reject; });
  f.start();
  f.visible(false);
  f.video.play = normalPlay;
  f.visible(true);
  rejectOld(error('NotAllowedError'));
  await settle();
  assert.equal(f.hero.dataset.videoState, 'playing');
});

test('ne révèle pas un lecteur natif avant que les images soient prêtes', () => {
  const f = fixture();
  f.video.paused = false;
  f.video.readyState = 0;
  f.hero.dataset.videoState = 'poster';
  f.start();
  assert.equal(f.hero.dataset.videoState, 'poster');
});

test('ne touche pas aux pages sans vidéo', () => {
  assert.doesNotThrow(() => initHeroVideo({ querySelector: () => null }));
});
