const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const overlay = document.createElement('div');
overlay.className = 'page-transition';
overlay.setAttribute('aria-hidden', 'true');
const logo = document.createElement('img');
logo.src = './assets/img/meiji-logo.png'; logo.alt = '';
overlay.append(logo); document.body.append(overlay);
let navigating = false;
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.download || (link.target && link.target !== '_self')) return;
  const target = new URL(link.href, location.href);
  if (target.origin !== location.origin || !target.pathname.endsWith('.html') || target.pathname === location.pathname || reducedMotion.matches) return;
  event.preventDefault();
  if (navigating) return;
  navigating = true;
  document.body.classList.add('page-is-leaving');
  window.setTimeout(() => location.assign(target.href), 250);
});
window.addEventListener('pageshow', () => { navigating = false; document.body.classList.remove('page-is-leaving'); });
document.querySelectorAll('[data-share-menu]').forEach((button) => {
  button.addEventListener('click', async () => {
    const feedback = button.closest('footer').querySelector('[data-share-feedback]');
    const url = new URL('./menu.html', location.href).href;
    try {
      if (navigator.share) { await navigator.share({ title: 'Meiji Sushi & Grill · Démo', url }); }
      else if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(url); feedback.textContent = 'Lien copié. Vous pouvez le coller dans votre message.'; }
      else { feedback.textContent = 'Lien à copier : ' + url; }
    } catch (error) { if (error.name !== 'AbortError') feedback.textContent = 'Lien à copier : ' + url; }
  });
});
