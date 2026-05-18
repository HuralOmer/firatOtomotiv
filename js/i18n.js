/* ============================================
   ÇOKLU DİL (i18n) YÖNETİMİ
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof translations === 'undefined') {
    console.error("translations.js yüklenemedi!");
    return;
  }

  // 1. Elementlerle Çeviri Anahtarlarını (Keys) Eşleştirme (Mapping)
  // HTML'i kirletmemek için DOM selector'ları üzerinden data-i18n atıyoruz.
  const i18nMap = {
    // Navigasyon
    "nav a[href='#anasayfa']": "nav.home",
    "nav a[href='#hizmetler']": "nav.services",
    "nav a[href='#hakkimizda']": "nav.about",
    "nav a[href='#checkup']": "nav.checkup",
    "nav a[href='#iletisim']": "nav.contact",
    ".nav-cta": "nav.appointment",

    // Ticker Bar (Tüm kopyaları için querySelectorAll kullanacağız)
    // Ticker için özel bir logic ekleyeceğiz.

    // Hero Bölümü
    ".hero-badge": "hero.badge",
    ".hero h1": "hero.title",
    ".hero p": "hero.desc",
    ".hero-buttons a[href='#randevu']": "hero.btn.appointment",
    ".hero-buttons a[href='#hizmetler']": "hero.btn.services",
    ".campaign-popup__cta": "nav.appointment",
    ".stat-item:nth-child(1) p": "stats.experience",
    ".stat-item:nth-child(2) p": "stats.happy",
    ".stat-item:nth-child(3) p": "stats.completed",

    // Marka Logoları
    ".brand-strip .section-tag": "brands.tag",
    "#brandStripTitle": "brands.title",

    // Hizmetler Bölümü
    ".services .section-tag": "services.tag",
    ".services h2": "services.title",
    ".services .section-header p": "services.desc",
    ".services-grid article:nth-child(1) h3": "services.maintenance.title",
    ".services-grid article:nth-child(1) p": "services.maintenance.desc",
    ".services-grid article:nth-child(2) h3": "services.diag.title",
    ".services-grid article:nth-child(2) p": "services.diag.desc",
    ".services-grid article:nth-child(3) h3": "services.repair.title",
    ".services-grid article:nth-child(3) p": "services.repair.desc",
    ".services-grid article:nth-child(4) h3": "services.checkup.title",
    ".services-grid article:nth-child(4) p": "services.checkup.desc",
    ".services-grid article:nth-child(5) h3": "services.parts.title",
    ".services-grid article:nth-child(5) p": "services.parts.desc",

    // Hakkımızda
    ".about .section-tag": "about.tag",
    ".about h2": "about.title",
    ".about .about-content > p": "about.desc",
    ".feature-item:nth-child(1) h4": "about.feat1.title",
    ".feature-item:nth-child(1) p": "about.feat1.desc",
    ".feature-item:nth-child(2) h4": "about.feat2.title",
    ".feature-item:nth-child(2) p": "about.feat2.desc",
    ".feature-item:nth-child(3) h4": "about.feat3.title",
    ".feature-item:nth-child(3) p": "about.feat3.desc",

    // Castrol Auto Service
    ".castrol-authority .section-tag": "castrol.tag",
    ".castrol-authority-content h2": "castrol.title",
    ".castrol-authority-content > p": "castrol.desc",
    ".castrol-authority-points div:nth-child(1) span": "castrol.point1",
    ".castrol-authority-points div:nth-child(2) span": "castrol.point2",
    ".castrol-authority-points div:nth-child(3) span": "castrol.point3",
    ".castrol-authority-card strong": "castrol.card.title",
    ".castrol-authority-card p": "castrol.card.desc",

    // Check-Up
    ".checkup .section-tag": "checkup.tag",
    ".checkup h2": "checkup.title",
    ".checkup-content > p": "checkup.desc",
    ".checkup-list li:nth-child(1)": "checkup.list1",
    ".checkup-list li:nth-child(2)": "checkup.list2",
    ".checkup-list li:nth-child(3)": "checkup.list3",
    ".checkup-list li:nth-child(4)": "checkup.list4",
    ".checkup-list li:nth-child(5)": "checkup.list5",
    ".checkup-list li:nth-child(6)": "checkup.list6",
    ".checkup-list li:nth-child(7)": "checkup.list7",
    ".checkup .btn-primary": "checkup.btn",

    // Randevu (Form Label'ları)
    ".appointment .section-tag": "appt.tag",
    ".appointment h2": "appt.title",
    ".appointment .section-header p": "appt.desc",
    ".appointment-form h3": "appt.form.title",
    "label[for='fullname']": "appt.form.fullname",
    "label[for='email']": "appt.form.email",
    "label[for='phone']": "appt.form.phone",
    "label[for='vehicle']": "appt.form.vehicle",
    "label[for='model']": "appt.form.model",
    "label[for='year']": "appt.form.year",
    "label[for='reason']": "appt.form.reason",
    ".date-picker-wrapper label": "appt.form.date",
    ".time-picker-wrapper label": "appt.form.time",
    ".btn-submit": "appt.form.submit",
    ".form-success h3": "appt.form.success.title",
    ".form-success p": "appt.form.success.desc",

    // Harita
    ".map-overlay span": "map.expand",

    // Footer
    ".footer-brand p": "footer.desc",
    ".footer-col:nth-child(2) h4": "footer.links.title",
    ".footer-col:nth-child(3) h4": "footer.services.title",
    ".footer-col:nth-child(4) h4": "footer.contact.title",
    ".footer-bottom p": "footer.copy"
  };

  // İkonlu elementlerdeki ikonları kaybetmemek için yardımcı fonksiyon
  // İçerisinde <i> elementi olanları koruyup text kısmını değiştirir
  function updateElementText(el, newText) {
    if (!el) return;
    
    // Sadece bir <br> veya <span> içeriyorsa (örn. hero.title, footer.copy), innerHTML bas.
    if (newText.includes('<br>') || newText.includes('<span>') || newText.includes('&copy;')) {
        // Eğer içinde ikon (fa-solid) varsa
        const icon = el.querySelector('i');
        if (icon) {
            el.innerHTML = icon.outerHTML + " " + newText;
        } else {
            el.innerHTML = newText;
        }
        return;
    }

    const icon = el.querySelector('i');
    if (icon) {
      el.innerHTML = icon.outerHTML + " " + newText;
    } else {
      el.textContent = newText;
    }
  }

  // Ticker bar içerisindeki özel span yapısını yakalayalım
  const tickerItemsMap = [
    { icon: "fa-star", key: "ticker.auth" },
    { icon: "fa-wrench", key: "ticker.campaign" },
    { icon: "fa-percent", key: "ticker.discount" },
    { icon: "fa-clock", key: "ticker.hours" },
    { icon: "fa-phone", key: "ticker.call" },
    { icon: "fa-location-dot", key: "ticker.address" },
    { icon: "fa-car", key: "ticker.free" },
    { icon: "fa-shield-halved", key: "ticker.warranty" }
  ];

  function translateTicker(lang) {
    const dict = translations[lang];
    if (!dict) return;
    
    document.querySelectorAll('.ticker-track span').forEach(span => {
      const iconEl = span.querySelector('i');
      if (iconEl) {
        // Hangi ikon sınıfına sahip bulalım
        tickerItemsMap.forEach(item => {
          if (iconEl.classList.contains(item.icon)) {
            span.innerHTML = iconEl.outerHTML + " " + dict[item.key];
          }
        });
      }
    });
  }

  const castrolTickerKeys = [
    "castrol.ticker.point",
    "castrol.ticker.standards",
    "castrol.ticker.oil",
    "castrol.ticker.checkup"
  ];

  function translateCastrolTicker(lang) {
    const dict = translations[lang];
    if (!dict) return;

    document.querySelectorAll('.castrol-ticker-text').forEach((span, index) => {
      const key = castrolTickerKeys[index % castrolTickerKeys.length];
      span.textContent = dict[key];
    });
  }

  // Özel Footer Linkleri (Icon + Text)
  const footerLinksMap = [
    { selector: ".footer-col:nth-child(2) ul li:nth-child(1) a", key: "nav.home" },
    { selector: ".footer-col:nth-child(2) ul li:nth-child(2) a", key: "nav.services" },
    { selector: ".footer-col:nth-child(2) ul li:nth-child(3) a", key: "nav.about" },
    { selector: ".footer-col:nth-child(2) ul li:nth-child(4) a", key: "nav.appointment" },
    { selector: ".footer-col:nth-child(3) ul li:nth-child(1) a", key: "services.maintenance.title" },
    { selector: ".footer-col:nth-child(3) ul li:nth-child(2) a", key: "services.diag.title" },
    { selector: ".footer-col:nth-child(3) ul li:nth-child(3) a", key: "nav.checkup" },
    { selector: ".footer-col:nth-child(3) ul li:nth-child(4) a", key: "services.repair.title" }
  ];

  // Placeholder'ı değişecek inputlar
  const placeholderMap = {
    "#fullname": "appt.form.fullname",
    "#email": "appt.form.email",
    "#phone": "appt.form.phone"
  };

  // Dropdown ilk item (default option)
  const selectMap = {
    "#vehicle option[value='']": "appt.form.vehicle",
    "#model option[value='']": "appt.form.model",
    "#year option[value='']": "appt.form.year",
    "#reason option[value='']": "appt.form.reason"
  };

  const languageMeta = {
    tr: { flag: "tr.png" },
    en: { flag: "gb.png" },
    de: { flag: "de.png" },
    es: { flag: "es.png" }
  };

  function getPageLanguage() {
    const pageLang = document.documentElement.getAttribute('data-page-lang') || document.documentElement.lang || 'tr';
    return translations[pageLang] ? pageLang : 'tr';
  }

  function getLanguageUrl(lang) {
    const currentLang = getPageLanguage();
    const hash = window.location.hash || '';
    const indexFile = window.location.protocol === 'file:' ? 'index.html' : '';

    if (currentLang === 'tr') {
      return lang === 'tr' ? `${indexFile || './'}${hash}` : `${lang}/${indexFile}${hash}`;
    }

    return lang === 'tr' ? `../${indexFile}${hash}` : `../${lang}/${indexFile}${hash}`;
  }

  function updateSelectedLanguage(lang) {
    if (!langSelected || !languageMeta[lang]) return;

    langSelected.innerHTML = `
      <img src="https://flagcdn.com/w40/${languageMeta[lang].flag}" alt="${lang}" class="flag-circle">
      <i class="fa-solid fa-chevron-down"></i>
    `;
  }


  // 2. Ana Dil Değiştirme Fonksiyonu
  function changeLanguage(lang) {
    const dict = translations[lang];
    if (!dict) return;

    // A. Genel eşleştirmeleri değiştir
    Object.keys(i18nMap).forEach(selector => {
      const el = document.querySelector(selector);
      if (el) {
        updateElementText(el, dict[i18nMap[selector]]);
      }
    });

    // B. Ticker Bar
    translateTicker(lang);
    translateCastrolTicker(lang);

    // C. Footer Linkleri
    footerLinksMap.forEach(item => {
      const el = document.querySelector(item.selector);
      if (el) {
        updateElementText(el, dict[item.key]);
      }
    });

    // D. Placeholderlar
    Object.keys(placeholderMap).forEach(selector => {
      const el = document.querySelector(selector);
      if (el) {
        // placeholder için * yıldızları atıp koyalım
        el.placeholder = dict[placeholderMap[selector]].replace(' *', '');
      }
    });

    // E. Select Option Defaultları
    Object.keys(selectMap).forEach(selector => {
      const el = document.querySelector(selector);
      if (el) {
        el.textContent = dict[selectMap[selector]];
      }
    });

    // Seçilen dili kaydet ve HTML lang attr güncelle
    localStorage.setItem('selectedLang', lang);
    document.documentElement.lang = lang;
  }

  // 3. Dil Seçici Menü Entegrasyonu
  const langOptions = document.querySelectorAll('.lang-options li');
  const langSelected = document.getElementById('langSelected');

  langOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      const lang = option.getAttribute('data-lang');
      const currentLang = getPageLanguage();
      const shouldReload = currentLang !== lang;

      if (shouldReload) {
        e.preventDefault();
        e.stopImmediatePropagation();
        localStorage.setItem('selectedLang', lang);
        window.location.href = getLanguageUrl(lang);
        return;
      }
      
      // Arayüzde bayrağı güncelle
      updateSelectedLanguage(lang);
      
      // Metinleri çevir
      changeLanguage(lang);
    });
  });

  // 4. Sayfa yüklendiğinde URL'deki dil sürümünü uygula
  const initialLang = getPageLanguage();
  updateSelectedLanguage(initialLang);
  changeLanguage(initialLang);

});
