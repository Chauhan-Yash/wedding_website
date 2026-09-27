const target = new Date('2026-12-13T18:30:00+05:30').getTime();
const timer = () => {
  const diff = Math.max(0, target - Date.now());
  const pieces = [Math.floor(diff / 86400000), Math.floor(diff / 3600000) % 24, Math.floor(diff / 60000) % 60, Math.floor(diff / 1000) % 60];
  ['days','hours','minutes','seconds'].forEach((id, index) => document.getElementById(id).textContent = String(pieces[index]).padStart(id === 'days' ? 3 : 2, '0'));
};
timer(); setInterval(timer, 1000);

const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('active'); observer.unobserve(entry.target); } }), { threshold: .14 });
document.querySelectorAll('.reveal:not(.active)').forEach(el => observer.observe(el));

const toggle = document.querySelector('.nav-toggle'); const links = document.querySelector('.nav-links');
toggle.addEventListener('click', () => { const open = links.classList.toggle('open'); toggle.setAttribute('aria-expanded', open); });
links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => links.classList.remove('open')));

document.getElementById('rsvp-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = form.querySelector('.form-message');
  const submit = form.querySelector('button[type="submit"]');
  const endpoint = window.RSVP_ENDPOINT;
  if (!endpoint || endpoint.includes('PASTE_YOUR')) {
    message.textContent = 'RSVP collection will be available shortly.';
    return;
  }
  const data = Object.fromEntries(new FormData(form).entries());
  submit.disabled = true;
  submit.innerHTML = 'Sending <span>…</span>';
  message.textContent = '';
  try {
    await fetch(endpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) });
    message.textContent = 'Thank you — your RSVP has been received.';
    form.reset();
  } catch (error) {
    message.textContent = 'We could not send your RSVP. Please try again.';
  } finally {
    submit.disabled = false;
    submit.innerHTML = 'Send RSVP <span>→</span>';
  }
});

const motionSafe = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const progress = document.querySelector('.scroll-progress');
const topFlora = document.querySelector('.flora-top');
let ticking = false;
function animateScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  if (motionSafe) {
    const distance = Math.min(window.scrollY, 800);
    topFlora.style.transform = `rotate(-25deg) translateY(${distance * .045}px)`;
  }
  ticking = false;
}
window.addEventListener('scroll', () => { if (!ticking) { window.requestAnimationFrame(animateScroll); ticking = true; } }, { passive: true });
animateScroll();
