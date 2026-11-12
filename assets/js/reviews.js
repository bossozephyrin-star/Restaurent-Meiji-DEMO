import { reviewsConfig } from './reviews-config.js';
const form = document.getElementById('review-form');
const status = document.getElementById('review-status');
const list = document.getElementById('visitor-reviews');
const listState = document.getElementById('reviews-state');
const submit = form.querySelector('button[type="submit"]');
const configured = reviewsConfig.enabled === true && /^https:\/\//.test(reviewsConfig.url) && Boolean(reviewsConfig.publishableKey);
function headers() { return { apikey: reviewsConfig.publishableKey, 'Content-Type': 'application/json' }; }
function endpoint(query = '') { return reviewsConfig.url.replace(/\/$/, '') + '/rest/v1/reviews' + query; }
function renderReview(review) {
  const card = document.createElement('article'); card.className = 'review-card';
  const stars = document.createElement('p'); stars.className = 'review-stars'; stars.setAttribute('role', 'img'); stars.setAttribute('aria-label', review.rating + ' étoiles sur 5'); stars.textContent = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  const quote = document.createElement('blockquote'); quote.textContent = review.comment;
  const author = document.createElement('p'); author.className = 'review-author'; author.textContent = review.display_name;
  card.append(stars, quote, author); list.append(card);
}
async function loadReviews() {
  listState.textContent = 'Lecture des avis…';
  try {
    const response = await fetch(endpoint('?select=display_name,rating,comment,created_at&status=eq.approved&order=created_at.desc&limit=50'), {headers: headers(), signal: AbortSignal.timeout(12000)});
    if (!response.ok) throw new Error('read');
    const reviews = await response.json();
    if (!Array.isArray(reviews)) throw new Error('format');
    list.replaceChildren();
    reviews.filter(r => Number.isInteger(r.rating) && r.rating >= 1 && r.rating <= 5 && typeof r.comment === 'string' && typeof r.display_name === 'string').forEach(renderReview);
    listState.textContent = list.children.length ? '' : 'Aucun avis publié pour le moment. Partagez votre expérience.';
  } catch { listState.textContent = 'Les avis sont momentanément indisponibles. Réessayez plus tard.'; }
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!configured || submit.disabled || !form.reportValidity()) return;
  const data = new FormData(form);
  const review = { display_name: data.get('display_name').trim(), rating: Number(data.get('rating')), comment: data.get('comment').trim() };
  if (review.display_name.length < 2 || review.comment.length < 10) { status.textContent = 'Indiquez un pseudo et un commentaire suffisamment détaillé.'; return; }
  submit.disabled = true; status.textContent = 'Envoi de votre avis…';
  try {
    const response = await fetch(endpoint(), {method:'POST', headers: {...headers(), Prefer:'return=minimal'}, body:JSON.stringify(review), signal:AbortSignal.timeout(12000)});
    if (!response.ok) throw new Error('send');
    form.reset(); status.textContent = 'Merci ! Votre avis a été reçu et sera publié après validation.';
  } catch { status.textContent = 'L’envoi n’a pas pu être confirmé. Votre texte est conservé dans le formulaire ; réessayez plus tard.'; }
  finally { submit.disabled = false; }
});
if (configured) { form.querySelector('[data-review-fields]').disabled = false; submit.disabled = false; status.textContent = ''; loadReviews(); }
