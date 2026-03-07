# Smart Security — Website

## 📁 პროექტის სტრუქტურა

```
smartsecurity/
│
├── index.html               ← მთავარი HTML (ჩონჩხი)
│
├── css/
│   └── main.css             ← ყველა სტილი (variables, layout, components, responsive)
│
├── js/
│   └── main.js              ← ლოგიკა: ენა, ფორმა, scroll reveal, mobile nav, SEO meta
│
├── data/
│   ├── translations.json    ← ყველა ტექსტი 3 ენაზე (KA / EN / RU)
│   └── services.json        ← სერვისების მონაცემები 3 ენაზე
│
└── assets/
    ├── favicon.svg          ← favicon
    └── og-image.jpg         ← Open Graph სოციალური preview სურათი
```

---

## 🌍 ენის მხარდაჭერა

ენა ინახება `localStorage`-ში (`ss_lang` key).  
`data/translations.json` — ყველა ტექსტი.  
ახალი ტექსტის დამატებისთვის: JSON-ში დაამატე key სამივე ენაზე, HTML-ში `data-i18n="key.path"`.

---

## 🛠 რედაქტირება

| რა გინდა შეცვალო | სად |
|---|---|
| ტელეფონი / ელ-ფოსტა | `index.html` → contact section |
| ტექსტები | `data/translations.json` |
| სერვისები | `data/services.json` |
| ფერები | `css/main.css` → `:root` variables |
| ფორმის endpoint | `js/main.js` → `initContactForm()` |
| SEO | `data/translations.json` → `meta` section |
| სოციალური ბმულები | `index.html` → footer social buttons |

---

## ✅ SEO ჩეკლისტი

- [x] `<title>` და `<meta description>` — 3 ენაზე, JS ახლავს
- [x] Open Graph tags (`og:title`, `og:description`, `og:image`)
- [x] Twitter Card meta
- [x] Canonical URL
- [x] JSON-LD LocalBusiness structured data
- [x] `robots` meta
- [ ] `assets/og-image.jpg` — ატვირთე 1200×630px ბანერი
- [ ] `assets/favicon.svg` — ატვირთე ლოგო

---

## 🚀 გაშვება

პროექტი static website-ია — სერვერი არ სჭირდება.  
უბრალოდ ატვირთე hosting-ზე (Netlify, cPanel, nginx).

> **შენიშვნა:** `fetch()` API-ს გამო JSON ფაილები სჭირდება http/https-ზე გაშვება.  
> ლოკალური ტესტისთვის გამოიყენე: `python3 -m http.server 8080`
