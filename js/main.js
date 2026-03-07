/**
 * Smart Security — main.js
 * Handles: language switching, DOM rendering from JSON,
 *          scroll reveal, mobile nav, contact form, SEO meta update
 */

'use strict';

/* ================================================================
   1. STATE
   ================================================================ */
let currentLang = localStorage.getItem('ss_lang') || 'ka';
let translations = {};
let services = [];

/* ================================================================
   2. FETCH DATA
   ================================================================ */
async function loadData() {
  try {
    const [tRes, sRes] = await Promise.all([
      fetch('data/translations.json'),
      fetch('data/services.json')
    ]);
    translations = await tRes.json();
    services     = await sRes.json();
  } catch (e) {
    console.error('Data load failed:', e);
  }
}

/* ================================================================
   3. i18n HELPERS
   ================================================================ */
function t(path) {
  const keys = path.split('.');
  let val = translations[currentLang];
  for (const k of keys) val = val?.[k];
  return val ?? path;
}

/* Update all [data-i18n] elements */
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key  = el.getAttribute('data-i18n');
    const attr = el.getAttribute('data-i18n-attr');
    const text = t(key);
    if (attr) { el.setAttribute(attr, text); }
    else       { el.textContent = text; }
  });

  // Update html lang attribute
  document.documentElement.lang = currentLang;

  // Update <title> and meta tags
  document.title = t('meta.title');
  setMeta('description', t('meta.description'));
  setMeta('keywords',    t('meta.keywords'));

  // Update Open Graph
  setOGMeta('og:title',       t('meta.title'));
  setOGMeta('og:description', t('meta.description'));

  // Highlight active lang button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });

  // Re-render dynamic sections that need the current lang
  renderServices();
  renderReviews();
  updateFormServiceOptions();
  renderFooterServices();
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
  el.content = content;
}
function setOGMeta(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
  el.content = content;
}

/* ================================================================
   4. LANGUAGE SWITCHER
   ================================================================ */
function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('ss_lang', lang);
  applyTranslations();
  closeMobileNav();
}
window.setLang = setLang;

/* ================================================================
   5. RENDER SERVICES
   ================================================================ */
function renderServices() {
  const grid = document.getElementById('servicesGrid');
  if (!grid || !services.length) return;

  grid.innerHTML = services.map(s => {
    const tr = s.translations[currentLang] || s.translations['ka'];
    return `
      <div class="service-card reveal">
        <div class="card-num">${s.num}</div>
        <div class="service-icon">${s.icon}</div>
        <div class="service-title">${tr.title}</div>
        <p class="service-desc">${tr.desc}</p>
        <a href="${s.page || '#contact'}" class="service-link">${t('services.learn_more')} →</a>
      </div>
    `;
  }).join('');

  // Re-observe newly added cards
  observeReveal();
}

/* ================================================================
   6. RENDER REVIEWS
   ================================================================ */
function renderReviews() {
  const grid = document.getElementById('reviewsGrid');
  if (!grid) return;

  const reviews = [
    { avatar: 'გ', name: t('reviews.r1_name'), role: t('reviews.r1_role'), text: t('reviews.r1_text') },
    { avatar: 'ნ', name: t('reviews.r2_name'), role: t('reviews.r2_role'), text: t('reviews.r2_text') },
    { avatar: 'D', name: t('reviews.r3_name'), role: t('reviews.r3_role'), text: t('reviews.r3_text') }
  ];

  grid.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-stars">★★★★★</div>
      <p class="review-text">"${r.text}"</p>
      <div class="reviewer">
        <div class="reviewer-avatar">${r.avatar}</div>
        <div>
          <div class="reviewer-name">${r.name}</div>
          <div class="reviewer-role">${r.role}</div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ================================================================
   6B. RENDER FOOTER SERVICE LINKS
   ================================================================ */
function renderFooterServices() {
  document.querySelectorAll('[data-i18n-service]').forEach(el => {
    const id = el.getAttribute('data-i18n-service');
    const service = services.find(s => s.id === id);
    if (service) {
      el.textContent = service.translations[currentLang]?.title
        || service.translations['ka']?.title;
    }
  });
}

/* ================================================================
   7. UPDATE FORM SERVICE OPTIONS
   ================================================================ */
function updateFormServiceOptions() {
  const sel = document.getElementById('formService');
  if (!sel) return;

  const options = [
    { value: '', label: t('contact.form_service_placeholder') },
    { value: 'cctv', label: 'CCTV' },
    { value: 'alarm',      label: currentLang === 'ka' ? 'სიგნალიზაცია'    : currentLang === 'ru' ? 'Сигнализация'    : 'Alarm System' },
    { value: 'fire',       label: currentLang === 'ka' ? 'სახანძრო სისტემა' : currentLang === 'ru' ? 'Пожарная система' : 'Fire System' },
    { value: 'locks',      label: currentLang === 'ka' ? 'ელ. საკეტი'       : currentLang === 'ru' ? 'Электронный замок' : 'Smart Lock' },
    { value: 'barriers',   label: currentLang === 'ka' ? 'შლაგბაუმი'        : currentLang === 'ru' ? 'Шлагбаум'          : 'Barrier' },
    { value: 'turnstiles', label: currentLang === 'ka' ? 'ტურნიკეტი'        : currentLang === 'ru' ? 'Турникет'          : 'Turnstile' },
    { value: 'intercom',   label: currentLang === 'ka' ? 'ინტერკომი'        : currentLang === 'ru' ? 'Домофон'           : 'Intercom' }
  ];

  sel.innerHTML = options.map(o =>
    `<option value="${o.value}">${o.label}</option>`
  ).join('');
}

/* ================================================================
   8. SCROLL REVEAL
   ================================================================ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.1 });

function observeReveal() {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* ================================================================
   9. MOBILE NAV
   ================================================================ */
function openMobileNav() {
  document.getElementById('mobileNav').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  document.getElementById('mobileNav').classList.remove('open');
  document.body.style.overflow = '';
}
window.openMobileNav  = openMobileNav;
window.closeMobileNav = closeMobileNav;

/* ================================================================
   10. CONTACT FORM
   ================================================================ */
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const error   = document.getElementById('formError');
  const btn     = document.getElementById('formSubmit');

  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = '...';
    success.classList.remove('visible');
    error.classList.remove('visible');

    const data = {
      name:    form.querySelector('#formName').value.trim(),
      phone:   form.querySelector('#formPhone').value.trim(),
      service: form.querySelector('#formService').value,
      message: form.querySelector('#formMessage').value.trim(),
      lang:    currentLang,
      time:    new Date().toISOString()
    };

    // Validate
    if (!data.name || !data.phone) {
      error.textContent  = t('contact.form_error');
      error.classList.add('visible');
      btn.disabled = false;
      btn.textContent = t('contact.form_submit');
      return;
    }

    try {
      // Simulate submission (replace with actual endpoint)
      await new Promise(res => setTimeout(res, 800));
      success.textContent = t('contact.form_success');
      success.classList.add('visible');
      form.reset();
    } catch {
      error.textContent = t('contact.form_error');
      error.classList.add('visible');
    } finally {
      btn.disabled = false;
      btn.textContent = t('contact.form_submit');
    }
  });
}

/* ================================================================
   11. SMOOTH SCROLL
   ================================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        closeMobileNav();
      }
    });
  });
}

/* ================================================================
   12. NAVBAR SCROLL EFFECT
   ================================================================ */
function initNavbarScroll() {
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 50
      ? 'rgba(5,10,15,0.98)'
      : 'rgba(5,10,15,0.9)';
  }, { passive: true });
}

/* ================================================================
   13. INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  applyTranslations();
  observeReveal();
  initContactForm();
  initSmoothScroll();
  initNavbarScroll();
});
