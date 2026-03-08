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
   10. CONTACT FORM — triple delivery: WhatsApp + Email + Messenger
   ================================================================ */
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const error   = document.getElementById('formError');
  const btn     = document.getElementById('formSubmit');

  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name    = form.querySelector('#formName').value.trim();
    const phone   = form.querySelector('#formPhone').value.trim();
    const service = form.querySelector('#formService').value;
    const message = form.querySelector('#formMessage').value.trim();

    // Validate
    if (!name || !phone) {
      error.textContent = t('contact.form_error');
      error.classList.add('visible');
      return;
    }
    error.classList.remove('visible');

    // ── Save to localStorage (visible in admin panel) ────
    const contacts = JSON.parse(localStorage.getItem('ss_contacts') || '[]');
    contacts.push({
      name,
      phone,
      service: form.querySelector('#formService').querySelector('option:checked')?.textContent || service,
      message,
      time: new Date().toLocaleString('ka-GE')
    });
    localStorage.setItem('ss_contacts', JSON.stringify(contacts));

    // ── Build message text ──────────────────────────────────
    const serviceLabel = form.querySelector('#formService')
      .querySelector('option:checked')?.textContent || service;

    const msgText = [
      `📋 ახალი განაცხადი — Smart Security`,
      `👤 სახელი: ${name}`,
      `📞 ტელეფ.: ${phone}`,
      `🔧 სერვისი: ${serviceLabel || '—'}`,
      message ? `💬 შენიშვნა: ${message}` : '',
      `🕐 ${new Date().toLocaleString('ka-GE')}`
    ].filter(Boolean).join('\n');

    // ── 1. WhatsApp ─────────────────────────────────────────
    const waUrl = `https://wa.me/995595708300?text=${encodeURIComponent(msgText)}`;

    // ── 2. Email (mailto) ───────────────────────────────────
    const emailSubject = `განაცხადი — ${name} | Smart Security`;
    const emailUrl = `mailto:info@smartsecurity.com.ge?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(msgText)}`;

    // ── 3. Facebook Messenger ───────────────────────────────
    // Opens SMsecurity page chat; pre-fill not possible from web, opens chat tab
    const fbUrl = `https://m.me/SMsecurity`;

    // Show success + action buttons
    success.innerHTML = `
      <div style="font-size:15px;font-weight:700;margin-bottom:14px;color:#00E676">
        ✅ მადლობა ${name}! გამოგვიგზავნე ერთ-ერთი გზით:
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <a href="${waUrl}" target="_blank" rel="noopener"
           style="display:flex;align-items:center;gap:10px;background:#25D366;color:white;padding:13px 18px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
          <span style="font-size:20px">💬</span>
          WhatsApp-ზე გამოგზავნა (რეკომ.)
        </a>
        <a href="${emailUrl}"
           style="display:flex;align-items:center;gap:10px;background:rgba(0,102,255,0.15);border:1px solid rgba(0,102,255,0.4);color:white;padding:13px 18px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
          <span style="font-size:20px">📧</span>
          ელ-ფოსტით გამოგზავნა
        </a>
        <a href="${fbUrl}" target="_blank" rel="noopener"
           style="display:flex;align-items:center;gap:10px;background:rgba(24,119,242,0.15);border:1px solid rgba(24,119,242,0.4);color:white;padding:13px 18px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
          <span style="font-size:20px">💙</span>
          Facebook Messenger-ზე
        </a>
      </div>
      <p style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:12px">
        WhatsApp ყველაზე სწრაფია — ჩვეულებრივ 15 წ-ში ვპასუხობთ.
      </p>
    `;
    success.classList.add('visible');

    // Auto-open WhatsApp in new tab after short delay
    setTimeout(() => window.open(waUrl, '_blank'), 400);

    form.reset();
    btn.disabled = false;
    btn.textContent = t('contact.form_submit');
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
   FAQ ACCORDION
   ================================================================ */
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const arrow  = btn.querySelector('.faq-arr');
  const isOpen = answer.classList.contains('open');

  // Close all others
  document.querySelectorAll('.faq-a.open').forEach(a => {
    a.classList.remove('open');
    a.previousElementSibling.querySelector('.faq-arr').classList.remove('open');
  });

  if (!isOpen) {
    answer.classList.add('open');
    arrow.classList.add('open');
  }
}
window.toggleFaq = toggleFaq;

/* ================================================================
   CAMERA CALCULATOR
   ================================================================ */
const calcState = {};

function calcSelect(step, key, value) {
  calcState[key] = value;
  document.querySelectorAll(`[data-q="${step}"]`).forEach(b => b.classList.remove('active'));
  event.currentTarget.classList.add('active');
  setTimeout(() => {
    document.getElementById('calcStep' + step).style.display = 'none';
    const dot = document.getElementById('dot' + step);
    if (dot) dot.style.background = 'var(--accent)';
    if (step < 3) {
      document.getElementById('calcStep' + (step+1)).style.display = 'block';
      const nd = document.getElementById('dot' + (step+1));
      if (nd) nd.style.background = 'var(--accent)';
    } else {
      showCalcResult();
    }
  }, 350);
}

function showCalcResult() {
  const { type, size, budget } = calcState;
  const results = {
    flat:      { small:  { low:'350–500 ₾', mid:'500–700 ₾',   high:'700–1,000 ₾',    ent:'1,000+ ₾',   cams:2, title:'ბინის სისტ.',     desc:'2 Wi-Fi IP კამ. + Cloud ჩ. + App. სრ. ინ. 1 დ-ში.'  },
                  medium: { low:'500–700 ₾', mid:'700–1,000 ₾', high:'1,000–1,400 ₾',  ent:'1,400+ ₾',   cams:4, title:'ბინის სტ. სისტ.', desc:'4 IP კამ. + NVR 1TB. PoE კ-ბ. + App.'               } },
    house:     { small:  { low:'600–800 ₾', mid:'800–1,100 ₾', high:'1,100–1,600 ₾',  ent:'1,600+ ₾',   cams:4, title:'სახ. სისტ.',      desc:'4 IP (ColorVu) + NVR + ეზ. CCTV. 1–2 დ. ინ.'        },
                  large:  { low:'900–1,200 ₾',mid:'1,200–1,800 ₾',high:'1,800–2,500 ₾',ent:'2,500+ ₾',  cams:8, title:'სახ. პრემ. სისტ.',desc:'6–8 IP 4K + NVR 2TB + Ajax სიგ. + App.'              } },
    office:    { medium: { low:'800–1,200 ₾',mid:'1,200–1,800 ₾',high:'1,800–2,500 ₾',ent:'2,500+ ₾',  cams:8, title:'ოფ. სისტ.',       desc:'8 IP AI + NVR + RFID წვდ. კ. + 24/7 Alert.'         } },
    warehouse: { large:  { low:'1,400–2,000 ₾',mid:'2,000–3,000 ₾',high:'3,000–4,500 ₾',ent:'4,500+ ₾',cams:16,title:'ინდ. სისტ.',     desc:'16+ IP 4K + AI ანალ. + ZKTeco + CAME შლ.'            } }
  };

  const sizeMap = { small:'small', medium:'medium', large:'large', xlarge:'large' };
  const r = (results[type] || results.house);
  const bySize = r[sizeMap[size]] || r[Object.keys(r)[0]];
  const priceEntry = bySize[budget] || bySize.mid;
  const cams = bySize.cams;

  document.getElementById('calcTitle').textContent = bySize.title || 'რეკ. სისტ.';
  document.getElementById('calcPrice').textContent = priceEntry;
  document.getElementById('calcDesc').textContent  = bySize.desc || '';

  const specs = [
    `📷 ${cams} კამ.`,
    budget === 'high' || budget === 'enterprise' ? '4K AI' : 'HD/4MP',
    'App iOS/Android',
    '2 წ. გ-ა',
    'უფ. ი-ა'
  ];
  document.getElementById('calcSpecs').innerHTML = specs.map(s =>
    `<span style="background:rgba(0,200,255,0.08);border:1px solid rgba(0,200,255,0.2);color:var(--accent);padding:5px 14px;border-radius:100px;font-size:13px;font-weight:600">${s}</span>`
  ).join('');

  document.getElementById('calcStep3').style.display = 'none';
  document.getElementById('calcDots').style.display  = 'none';
  document.getElementById('calcResult').style.display = 'block';
}

function calcReset() {
  Object.keys(calcState).forEach(k => delete calcState[k]);
  document.getElementById('calcResult').style.display = 'none';
  document.getElementById('calcDots').style.display = 'flex';
  ['calcStep2','calcStep3'].forEach(id => document.getElementById(id).style.display = 'none');
  document.getElementById('calcStep1').style.display = 'block';
  document.querySelectorAll('.calc-opt').forEach(b => b.classList.remove('active'));
  ['dot2','dot3'].forEach(id => { const el=document.getElementById(id); if(el) el.style.background='rgba(0,200,255,0.2)'; });
}
window.calcSelect = calcSelect;
window.calcReset  = calcReset;

/* ================================================================
   BEFORE / AFTER SLIDERS
   ================================================================ */
function initBASliders() {
  ['bas1','bas2','bas3'].forEach(id => {
    const slider  = document.getElementById(id);
    if (!slider) return;
    const before  = document.getElementById(id + '-before');
    const handle  = document.getElementById(id + '-handle');
    let dragging  = false;

    function setPos(pct) {
      pct = Math.max(5, Math.min(95, pct));
      before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left     = pct + '%';
    }
    function getPos(clientX) {
      const rect = slider.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    slider.addEventListener('mousedown',  e => { dragging = true; setPos(getPos(e.clientX)); });
    slider.addEventListener('touchstart', e => { dragging = true; setPos(getPos(e.touches[0].clientX)); }, {passive:true});
    window.addEventListener('mousemove',  e => { if (dragging) setPos(getPos(e.clientX)); });
    window.addEventListener('touchmove',  e => { if (dragging) setPos(getPos(e.touches[0].clientX)); }, {passive:true});
    window.addEventListener('mouseup',    () => dragging = false);
    window.addEventListener('touchend',   () => dragging = false);
  });
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
  initBASliders();
});
