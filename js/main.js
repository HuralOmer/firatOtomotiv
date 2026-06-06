/* ============================================
   FIRAT OTOMOTİV - ANA JAVASCRIPT DOSYASI
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------
     1. HEADER SCROLL EFEKTİ & TİCKER GİZLEME
     Hero'nun yarısına kadar scroll yapılınca:
     - Ticker bar gizlenir
     - Header %100 genişler (kenar boşlukları kalkar)
     ----------------------------------------- */
  const header = document.querySelector('.header');
  const tickerBar = document.querySelector('.ticker-bar');
  const heroSection = document.querySelector('.hero');

  const handleScroll = () => {
    const scrollY = window.scrollY;
    header.classList.toggle('scrolled', scrollY > 50);

    // Scroll başladığında ticker gizle, header genişlet
    if (scrollY > 10) {
      if (tickerBar) tickerBar.classList.add('hidden');
      header.classList.add('full-width');
    } else {
      if (tickerBar) tickerBar.classList.remove('hidden');
      header.classList.remove('full-width');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Sayfa yüklendiğinde kontrol et

  /* -----------------------------------------
     2. MOBİL MENÜ TOGGLE
     Hamburger menü açma/kapama işlevi
     ----------------------------------------- */
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    nav.classList.toggle('open');
    // Menü açıkken sayfanın kaydırılmasını engelle
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });

  // Menü linklerine tıklanınca menüyü kapat
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* -----------------------------------------
     2.1 KAMPANYA POP-UP
     Kullanıcı biraz scroll yaptıktan sonra duyuruyu gösterir.
     ----------------------------------------- */
  const campaignPopup = document.getElementById('campaignPopup');
  const campaignPopupClose = document.getElementById('campaignPopupClose');
  let campaignPopupShown = false;
  let campaignPopupClosed = false;

  const openCampaignPopup = () => {
    if (!campaignPopup || campaignPopupShown || campaignPopupClosed) return;
    campaignPopupShown = true;
    campaignPopup.classList.add('active');
    campaignPopup.setAttribute('aria-hidden', 'false');
  };

  const closeCampaignPopup = () => {
    if (!campaignPopup) return;
    campaignPopupClosed = true;
    campaignPopup.classList.remove('active');
    campaignPopup.setAttribute('aria-hidden', 'true');
  };

  if (campaignPopup) {
    campaignPopup.setAttribute('aria-hidden', 'true');
    campaignPopupClose?.addEventListener('click', closeCampaignPopup);

    campaignPopup.addEventListener('click', (e) => {
      if (e.target === campaignPopup) closeCampaignPopup();
    });

    campaignPopup.querySelectorAll('a[href="#randevu"]').forEach(link => {
      link.addEventListener('click', closeCampaignPopup);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeCampaignPopup();
    });

    window.addEventListener('scroll', () => {
      if (window.scrollY > 140) openCampaignPopup();
    }, { passive: true });
  }

  /* -----------------------------------------
     3. AKTİF MENÜ TAKIBI (Intersection Observer)
     Hangi section görünüyorsa o menü linki aktif olur
     ----------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav a');

  const activateLink = (id) => {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activateLink(entry.target.id);
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' });

  sections.forEach(section => sectionObserver.observe(section));

  /* -----------------------------------------
     4. VIEWPORT ANİMASYONLARI
     Elementler görünür alana girdiğinde animasyon tetiklenir
     ----------------------------------------- */
  const animElements = document.querySelectorAll('.animate-on-scroll');
  document.documentElement.classList.add('animations-ready');

  const isAnimationInViewport = (el) => {
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    return rect.top < viewportHeight * 0.88 && rect.bottom > viewportHeight * 0.12;
  };

  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && isAnimationInViewport(entry.target)) {
        entry.target.classList.add('visible');
        // Bir kez animasyon yaptıktan sonra gözlemlemeyi bırak
        animObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -12% 0px' });

  animElements.forEach(el => {
    if (isAnimationInViewport(el)) {
      el.classList.add('visible');
      return;
    }

    animObserver.observe(el);
  });

  /* -----------------------------------------
     5. SAYAÇ ANİMASYONU
     Hero bölümündeki istatistik sayılarını animasyonla sayar
     ----------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');
  let counterStarted = false;

  const startCounting = () => {
    if (counterStarted) return;
    counterStarted = true;

    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-count'));
      const suffix = counter.getAttribute('data-suffix') || '';
      const duration = 2000; // 2 saniye
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = Math.min(Math.round(increment * step), target);
        counter.textContent = current.toLocaleString('tr-TR') + suffix;
        if (step >= steps) clearInterval(timer);
      }, duration / steps);
    });
  };

  // Hero stats görünür olduğunda sayaçları başlat
  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        startCounting();
        statsObserver.unobserve(statsSection);
      }
    }, { threshold: 0.5 });
    statsObserver.observe(statsSection);
  }

  /* -----------------------------------------
     6. ARAÇ MARKA/MODEL SEÇİMİ
     Marka seçimine göre model listesini günceller
     ----------------------------------------- */
  const vehicleData = {
    'Opel': ['Astra', 'Corsa', 'Insignia', 'Mokka', 'Crossland', 'Grandland', 'Combo', 'Zafira', 'Vectra', 'Meriva'],
    'Chevrolet': ['Aveo', 'Cruze', 'Captiva', 'Spark', 'Trax', 'Lacetti', 'Epica', 'Orlando', 'Camaro', 'Tahoe'],
    'Volkswagen': ['Golf', 'Passat', 'Polo', 'Tiguan', 'T-Roc', 'Arteon', 'Caddy', 'Transporter', 'Jetta'],
    'BMW': ['3 Serisi', '5 Serisi', 'X1', 'X3', 'X5', '1 Serisi', '4 Serisi', '7 Serisi'],
    'Mercedes': ['A Serisi', 'C Serisi', 'E Serisi', 'S Serisi', 'GLA', 'GLC', 'GLE', 'CLA'],
    'Audi': ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'A1', 'TT'],
    'Ford': ['Focus', 'Fiesta', 'Kuga', 'Puma', 'Ranger', 'Transit', 'Mondeo', 'EcoSport'],
    'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Taliant', 'Kangoo', 'Fluence'],
    'Fiat': ['Egea', 'Panda', '500', 'Tipo', 'Doblo', 'Linea'],
    'Toyota': ['Corolla', 'Yaris', 'C-HR', 'RAV4', 'Camry', 'Hilux'],
    'Hyundai': ['i20', 'i30', 'Tucson', 'Kona', 'Bayon', 'Elantra'],
    'Peugeot': ['208', '308', '3008', '2008', '5008', '508', 'Rifter'],
    'Citroen': ['C3', 'C4', 'C5 Aircross', 'Berlingo', 'C-Elysee'],
    'Diger': ['Diğer Model']
  };

  const vehicleSelect = document.getElementById('vehicle');
  const modelSelect = document.getElementById('model');

  if (vehicleSelect && modelSelect) {
    vehicleSelect.addEventListener('change', () => {
      const brand = vehicleSelect.value;
      // Model seçeneklerini temizle
      modelSelect.innerHTML = '<option value="">Model Seçiniz</option>';

      if (brand && vehicleData[brand]) {
        vehicleData[brand].forEach(model => {
          const option = document.createElement('option');
          option.value = model;
          option.textContent = model;
          modelSelect.appendChild(option);
        });
        modelSelect.disabled = false;
      } else {
        modelSelect.disabled = true;
      }
    });
  }

  // Yıl seçici: güncel yıldan 30 yıl geriye
  const yearSelect = document.getElementById('year');
  if (yearSelect) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 30; y--) {
      const option = document.createElement('option');
      option.value = y;
      option.textContent = y;
      yearSelect.appendChild(option);
    }
  }

  /* -----------------------------------------
     7. TARİH & SAAT SEÇİCİ SİSTEMİ
     Test verileriyle dolu/boş tarih ve saatler
     ----------------------------------------- */

  // Tatil veya tam kapalı günler — buraya 'YYYY-MM-DD' ekle
  const bookedDates = [];

  // Tüm saat dilimleri (09:00 - 17:00, 30dk aralık)
  const allTimeSlots = [
    '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  // Türkçe gün isimleri
  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

  const dateGrid = document.getElementById('dateGrid');
  const timeGrid = document.getElementById('timeGrid');
  const timePickerWrapper = document.getElementById('timePickerWrapper');
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');

  let selectedDate = null;
  let selectedTime = null;
  let selectedReason = '';

  // Sebep seçildikçe (veya değiştikçe) saatleri yeniden render et
  const reasonSelect = document.getElementById('reason');
  if (reasonSelect) {
    reasonSelect.addEventListener('change', () => {
      selectedReason = reasonSelect.value;
      if (selectedDate) renderTimeSlots(selectedDate);
    });
  }

  // Sonraki 14 günü oluştur (Pazar hariç - servis kapalı)
  if (dateGrid) {
    const today = new Date();
    let daysAdded = 0;

    for (let i = 1; daysAdded < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Pazar günü atlama (servis kapalı)
      if (date.getDay() === 0) continue;

      const dateStr = date.toISOString().split('T')[0];
      const isBooked = bookedDates.includes(dateStr);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `date-btn${isBooked ? ' booked' : ''}`;
      btn.dataset.date = dateStr;
      btn.innerHTML = `
        <span class="day-name">${dayNames[date.getDay()]}</span>
        <span class="day-num">${date.getDate()}</span>
        <span class="day-name">${monthNames[date.getMonth()]}</span>
      `;

      if (isBooked) {
        // Dolu tarihler tıklanamaz
        btn.disabled = true;
        btn.title = 'Bu tarih dolu';
      } else {
        btn.addEventListener('click', () => selectDate(dateStr, btn));
      }

      dateGrid.appendChild(btn);
      daysAdded++;
    }
  }

  // Tarih seçildiğinde
  function selectDate(dateStr, btnEl) {
    selectedDate = dateStr;
    selectedTime = null;
    dateInput.value = dateStr;
    if (timeInput) timeInput.value = '';

    // Seçili stili güncelle
    document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('selected'));
    btnEl.classList.add('selected');

    // Saat seçiciyi göster ve doldur
    renderTimeSlots(dateStr);
  }

  // Seçilen tarih + sebebe göre saat slotlarını oluştur
  async function renderTimeSlots(dateStr) {
    if (!timeGrid || !timePickerWrapper) return;

    timePickerWrapper.classList.add('show');

    // Sebep henüz seçilmemişse kullanıcıyı yönlendir; saatleri gösterme
    if (!selectedReason) {
      timeGrid.innerHTML = '<div class="time-grid-hint">Lütfen önce <strong>Gelme Sebebi</strong> seçiniz.</div>';
      timePickerWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // Yükleniyor göstergesi
    timeGrid.innerHTML = '<div class="time-grid-hint"><i class="fa-solid fa-spinner fa-spin"></i> Müsait saatler yükleniyor...</div>';

    let booked = [];
    let closedDay = false;
    try {
      const url = new URL(APPOINTMENT_WEBHOOK_URL);
      url.searchParams.set('date', dateStr);
      url.searchParams.set('reason', selectedReason);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.booked)) booked = data.booked;
        if (data.closed === true) closedDay = true;
      }
    } catch (err) {
      console.warn('Müsaitlik bilgisi alınamadı:', err);
    }

    // Kapalı gün ise saat ızgarası yerine bilgi mesajı göster
    if (closedDay) {
      timeGrid.innerHTML = '<div class="time-grid-hint">Seçtiğiniz gün servis <strong>kapalı</strong>. Lütfen farklı bir gün seçin.</div>';
      selectedTime = null;
      if (timeInput) timeInput.value = '';
      timePickerWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    timeGrid.innerHTML = '';
    allTimeSlots.forEach(slot => {
      const isBooked = booked.includes(slot);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `time-btn${isBooked ? ' booked' : ''}`;
      btn.dataset.time = slot;
      btn.innerHTML = `<i class="fa-regular fa-clock"></i> ${slot}`;

      if (isBooked) {
        btn.disabled = true;
        btn.title = 'Bu saat seçtiğiniz hizmet için dolu';
      } else {
        btn.addEventListener('click', () => selectTime(slot, btn));
      }

      timeGrid.appendChild(btn);
    });

    // Önceden seçili saat şimdi dolduysa seçimi temizle
    if (selectedTime && booked.includes(selectedTime)) {
      selectedTime = null;
      if (timeInput) timeInput.value = '';
    }

    timePickerWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Saat seçildiğinde
  function selectTime(slot, btnEl) {
    selectedTime = slot;
    if (timeInput) timeInput.value = slot;

    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
    btnEl.classList.add('selected');
  }

  /* -----------------------------------------
     8. FORM GÖNDERİMİ
     Randevu formunun doğrulaması ve gönderimi
     ----------------------------------------- */
  const form = document.getElementById('appointmentForm');
  const formSuccess = document.querySelector('.form-success');
  // Google Apps Script Web App URL — deploy ettikten sonra buraya yapıştır
  const APPOINTMENT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwWUaeZsNzDsxx30oBPGqL1BeYZW44heUHXu87oneeIp4tIZABbwkxlHeES5H1zp_t8/exec';

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Tüm alanları kontrol et
      const name = document.getElementById('fullname').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const date = document.getElementById('date').value;
      const time = document.getElementById('time') ? document.getElementById('time').value : '';
      const vehicle = document.getElementById('vehicle').value;
      const model = document.getElementById('model').value;
      const year = document.getElementById('year').value;
      const reason = document.getElementById('reason') ? document.getElementById('reason').value : '';

      // Zorunlu alan kontrolü
      if (!name || !email || !phone || !date || !time || !vehicle || !model || !year) {
        showToast('Lütfen tüm zorunlu alanları doldurunuz.', 'error');
        return;
      }

      // E-posta formatı kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('Lütfen geçerli bir e-posta adresi giriniz.', 'error');
        return;
      }

      // Telefon formatı kontrolü
      const phoneClean = phone.replace(/\s/g, '');
      if (phoneClean.length < 10) {
        showToast('Lütfen geçerli bir telefon numarası giriniz.', 'error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gönderiliyor...';

      try {
        const response = await fetch(APPOINTMENT_WEBHOOK_URL, {
          method: 'POST',
          // text/plain → CORS preflight tetiklenmez, Apps Script bunu kabul eder
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            fullname: name,
            email,
            phone,
            vehicle,
            model,
            year,
            reason,
            date,
            time
          })
        });

        const result = await response.json();
        if (!response.ok || result.status !== 'success') {
          // Bilinen bir hata kodu (kapasite dolu, kapalı gün, mükerrer vb.) —
          // sunucudan gelen mesajı göster ve saatleri tazele.
          if (result.code) {
            showToast(result.message || 'Bu randevu için uygun yer bulunamadı. Lütfen farklı bir saat seçin.', 'error');
            if (selectedDate) renderTimeSlots(selectedDate);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
            return;
          }
          throw new Error(result.message || 'Sunucu hatası');
        }

        // Başarı durumu
        form.style.display = 'none';
        formSuccess.classList.add('show');
        showToast(`Randevunuz ${date} tarihinde saat ${time} için oluşturuldu!`, 'success');
      } catch (err) {
        console.error('Randevu gönderim hatası:', err);
        showToast('Randevunuz kaydedilemedi. Lütfen tekrar deneyin.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    });
  }

  /* -----------------------------------------
     8. TOAST BİLDİRİM SİSTEMİ
     Kullanıcıya görsel bildirim gösterir
     ----------------------------------------- */
  function showToast(message, type = 'info') {
    // Varolan toast'ı kaldır
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
      <span>${message}</span>
    `;

    // Toast stil
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: type === 'success' ? '#166534' : '#991b1b',
      color: '#fff',
      padding: '14px 24px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '0.9rem',
      fontWeight: '500',
      zIndex: '9999',
      boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
      transform: 'translateY(20px)',
      opacity: '0',
      transition: 'all 0.3s ease'
    });

    document.body.appendChild(toast);

    // Animasyonla göster
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    // 4 saniye sonra kaldır
    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /* -----------------------------------------
     9. HARİTA BÜYÜTME/KÜÇÜLTME
     Overlay'a tıklayınca harita tam ekran açılır.
     Parent overflow sorununu aşmak için klon body'ye eklenir.
     ----------------------------------------- */
  const mapWrapper = document.querySelector('.map-wrapper');
  const mapBackdrop = document.querySelector('.map-backdrop');
  const mapOverlay = document.querySelector('.map-overlay');

  if (mapWrapper && mapBackdrop) {

    // Overlay'a tıklanınca haritayı büyüt
    if (mapOverlay) {
      mapOverlay.style.cursor = 'pointer';
      mapOverlay.addEventListener('click', (e) => {
        e.stopPropagation();
        openMap();
      });
    }

    function openMap() {
      // Mevcut iframe src'sini al
      const iframe = mapWrapper.querySelector('iframe');
      const iframeSrc = iframe ? iframe.src : '';

      // Tam ekran harita kapsayıcı oluştur
      const fullMap = document.createElement('div');
      fullMap.id = 'fullscreenMap';
      fullMap.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        z-index: 2000; display: flex; align-items: center; justify-content: center;
        padding: 24px;
      `;

      // İçerik
      fullMap.innerHTML = `
        <iframe src="${iframeSrc}" style="width:100%; height:100%; border:none; border-radius:16px;"
          allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"
          title="Fırat Otomotiv Konum"></iframe>
        <button id="fullMapClose" style="
          position:absolute; top:32px; right:32px;
          width:48px; height:48px; border-radius:50%;
          background:#1A1A1A; color:#fff; border:none;
          font-size:1.4rem; cursor:pointer; z-index:2001;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 4px 20px rgba(0,0,0,0.4);
        "><i class="fa-solid fa-xmark"></i></button>
      `;

      document.body.appendChild(fullMap);
      mapBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Kapatma
      document.getElementById('fullMapClose').addEventListener('click', closeMap);
      mapBackdrop.addEventListener('click', closeMap);
    }

    function closeMap() {
      const fullMap = document.getElementById('fullscreenMap');
      if (fullMap) fullMap.remove();
      mapBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }

    // ESC tuşu ile kapat
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMap();
    });
  }

  /* -----------------------------------------
     10. TELEFON INPUT FORMATLAMA
     Otomatik olarak telefon numarasını formatlar
     ----------------------------------------- */
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 11) val = val.slice(0, 11);

      // Format: 0XXX XXX XX XX
      if (val.length > 0) {
        let formatted = val.slice(0, 4);
        if (val.length > 4) formatted += ' ' + val.slice(4, 7);
        if (val.length > 7) formatted += ' ' + val.slice(7, 9);
        if (val.length > 9) formatted += ' ' + val.slice(9, 11);
        e.target.value = formatted;
      }
    });
  }

  /* -----------------------------------------
     11. DİL SEÇİCİ (Language Dropdown)
     Özel tasarlanmış list box işlevselliği
     ----------------------------------------- */
  const langDropdown = document.getElementById('langDropdown');
  if (langDropdown) {
    const langSelected = document.getElementById('langSelected');
    const langOptions = langDropdown.querySelectorAll('.lang-options li');
    
    // Dropdown aç/kapat
    langSelected.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('active');
      const isExpanded = langDropdown.classList.contains('active');
      langDropdown.setAttribute('aria-expanded', isExpanded);
    });

    // Dil seçimi
    langOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Seçilen dil bilgilerini al
        const flag = option.getAttribute('data-flag');
        
        // Seçili alanı güncelle (sadece bayrak görünecek)
        langSelected.innerHTML = `
          <img src="https://flagcdn.com/w40/${flag}" alt="Language" class="flag-circle">
          <i class="fa-solid fa-chevron-down"></i>
        `;
        
        // Aktif sınıfı kaldır ve kapat
        langDropdown.classList.remove('active');
        langDropdown.setAttribute('aria-expanded', 'false');
      });
    });

    // Dışarı tıklanınca kapat
    document.addEventListener('click', (e) => {
      if (!langDropdown.contains(e.target)) {
        langDropdown.classList.remove('active');
        langDropdown.setAttribute('aria-expanded', 'false');
      }
    });
  }

}); // DOMContentLoaded sonu
