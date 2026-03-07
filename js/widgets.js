/**
 * Smart Security — widgets.js
 * WhatsApp floating button + Schema injector + Page Speed helpers
 */

/* ================================================================
   1. WHATSAPP FLOATING BUTTON
   ================================================================ */
function injectWhatsApp() {
  const WA_NUMBER = '995595708300';
  const WA_MSG    = encodeURIComponent('გამარჯობა! მინდა კონსულტაცია.');

  const css = `
    .wa-fab {
      position: fixed; bottom: 28px; right: 28px; z-index: 9000;
      display: flex; flex-direction: column; align-items: flex-end; gap: 12px;
    }
    .wa-btn {
      width: 58px; height: 58px;
      background: #25D366;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 24px rgba(37,211,102,0.45);
      text-decoration: none;
      transition: transform 0.3s, box-shadow 0.3s;
      animation: waPulse 3s ease-in-out infinite;
    }
    .wa-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 10px 36px rgba(37,211,102,0.6);
    }
    .wa-btn svg { width: 30px; height: 30px; fill: white; }
    @keyframes waPulse {
      0%,100% { box-shadow: 0 6px 24px rgba(37,211,102,0.45); }
      50%      { box-shadow: 0 6px 24px rgba(37,211,102,0.45), 0 0 0 10px rgba(37,211,102,0.08); }
    }
    .wa-tooltip {
      background: #111; color: white;
      font-size: 13px; font-weight: 600;
      padding: 8px 14px; border-radius: 8px;
      white-space: nowrap;
      opacity: 0; transform: translateX(8px);
      transition: all 0.3s; pointer-events: none;
    }
    .wa-fab:hover .wa-tooltip { opacity: 1; transform: translateX(0); }

    /* Phone floating CTA — shows after 5s */
    .float-call {
      position: fixed; bottom: 28px; left: 28px; z-index: 9000;
      background: linear-gradient(90deg, #0066FF, #00C8FF);
      color: white;
      display: none; align-items: center; gap: 10px;
      padding: 12px 20px; border-radius: 100px;
      text-decoration: none; font-size: 14px; font-weight: 700;
      box-shadow: 0 6px 24px rgba(0,102,255,0.4);
      transition: transform 0.3s; font-family: sans-serif;
      letter-spacing: 0.5px;
    }
    .float-call.visible { display: flex; }
    .float-call:hover { transform: translateY(-2px); }
    .float-call-close {
      margin-left: 8px; cursor: pointer; opacity: 0.6;
      font-size: 16px; line-height: 1; background: none; border: none;
      color: white; padding: 0;
    }
    @media(max-width:480px) {
      .wa-fab  { bottom: 18px; right: 18px; }
      .float-call { left: 18px; bottom: 18px; font-size: 13px; }
    }
  `;

  // Inject CSS
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // WhatsApp button
  const fab = document.createElement('div');
  fab.className = 'wa-fab';
  fab.innerHTML = `
    <div class="wa-tooltip">💬 WhatsApp-ზე დაწერე</div>
    <a class="wa-btn"
       href="https://wa.me/${WA_NUMBER}?text=${WA_MSG}"
       target="_blank" rel="noopener"
       aria-label="WhatsApp Smart Security"
       title="გამოგვიგზავნე WhatsApp-ზე">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  `;
  document.body.appendChild(fab);

  // Phone CTA — appears after 8 seconds
  const callBtn = document.createElement('a');
  callBtn.className = 'float-call';
  callBtn.href = 'tel:+995595708300';
  callBtn.innerHTML = `📞 +995 595 70 83 00 <button class="float-call-close" title="დახურვა">✕</button>`;
  document.body.appendChild(callBtn);

  setTimeout(() => callBtn.classList.add('visible'), 8000);

  callBtn.querySelector('.float-call-close').addEventListener('click', e => {
    e.preventDefault();
    callBtn.classList.remove('visible');
    callBtn.style.display = 'none';
  });
}

/* ================================================================
   2. INJECT BREADCRUMB SCHEMA (per page)
   ================================================================ */
function injectBreadcrumbSchema(items) {
  // items = [{ name, url }, ...]
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": item.url
    }))
  };
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.textContent = JSON.stringify(schema);
  document.head.appendChild(el);
}

/* ================================================================
   3. LAZY LOAD IMAGES (Page Speed)
   ================================================================ */
function initLazyImages() {
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img:not([loading])').forEach(img => {
      img.loading = 'lazy';
    });
  }
}

/* ================================================================
   4. AUTO-INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  injectWhatsApp();
  initLazyImages();
});

window.injectBreadcrumbSchema = injectBreadcrumbSchema;
