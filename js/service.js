/**
 * Smart Security — service.js
 * Shared logic for individual service pages
 */
'use strict';

/* ── Language ── */
let currentLang = localStorage.getItem('ss_lang') || 'ka';

async function loadTranslations() {
  try {
    const r = await fetch('../data/translations.json');
    return await r.json();
  } catch { return {}; }
}

function applyPageTranslations(translations) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key  = el.getAttribute('data-i18n');
    const attr = el.getAttribute('data-i18n-attr');
    const keys = key.split('.');
    let val = translations[currentLang];
    for (const k of keys) val = val?.[k];
    if (!val) return;
    if (attr) el.setAttribute(attr, val);
    else el.textContent = val;
  });
  document.documentElement.lang = currentLang;
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('ss_lang', lang);
  location.reload(); // reload so all data-i18n-service attrs update
}
window.setLang = setLang;

/* ── Mobile Nav ── */
function openMobileNav()  { document.getElementById('mobileNav').classList.add('open'); document.body.style.overflow='hidden'; }
function closeMobileNav() { document.getElementById('mobileNav').classList.remove('open'); document.body.style.overflow=''; }
window.openMobileNav  = openMobileNav;
window.closeMobileNav = closeMobileNav;

/* ── FAQ Toggle ── */
function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ── Scroll Reveal ── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08 });
function observeReveal() {
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
}

/* ── Smooth scroll ── */
function initSmooth() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); closeMobileNav(); }
    });
  });
}

/* ── Navbar scroll ── */
function initNavScroll() {
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 50 ? 'rgba(5,10,15,0.98)' : 'rgba(5,10,15,0.9)';
  }, { passive: true });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', async () => {
  const translations = await loadTranslations();
  applyPageTranslations(translations);
  initFAQ();
  observeReveal();
  initSmooth();
  initNavScroll();
});
