/* ============================================================
 *  FIRAT OTOMOTİV — RANDEVU SİSTEMİ AYAR DOSYASI
 *  ============================================================
 *  Bu dosyadaki değerleri serbestçe değiştirebilirsin.
 *  Değişiklikleri canlıya çıkarmak için:
 *    Ctrl + S → Distribute → Manage deployments → ✏️ →
 *    Version: New version → Deploy
 *  URL aynı kalır, main.js'i tekrar güncellemen GEREKMEZ.
 *  ============================================================ */

const AYARLAR = {

  // ─────────────────────────────────────────────────────────
  //  ÇALIŞMA SAATLERİ
  //  (Şimdilik bilgi amaçlı; saat ızgarasının başlangıç/bitiş'i
  //   site tarafında index.html üzerinden ayarlı.)
  // ─────────────────────────────────────────────────────────
  CALISMA: {
    SAAT_BAS:         '09:00',
    SAAT_BIT:         '17:00',
    ARALIK_DAKIKA:    30,           // 30 → her yarım saatte bir slot

    // Hangi günler servis kapalı? (0=Pazar, 1=Pzt, 2=Sal, ...)
    // Örn. sadece Pazar kapalı:           [0]
    // Örn. Cumartesi + Pazar kapalı:      [0, 6]
    // Örn. hiçbir gün kapalı değil:       []
    KAPALI_GUNLER:    [0],
  },

  // ─────────────────────────────────────────────────────────
  //  TOPLAM KAPASİTE (LİFT SAYISI MANTIĞI)
  //
  //  Aynı tarih+saat'te HANGİ HİZMET olursa olsun toplamda
  //  kaç randevu alınabilir? (Örn. 5 liftin varsa 5)
  //
  //  Örnek senaryo: 5 liftin var → MAX_AYNI_SAAT: 5 yap.
  //  Bir liftte Periyodik Bakım, bir başkasında Fren, bir
  //  başkasında Lastik vb. paralel hizmet verebilirsin.
  // ─────────────────────────────────────────────────────────
  TOPLAM_KAPASITE: {
    ENABLED:          true,         // false → toplam sınır kalkar (sınırsız)
    MAX_AYNI_SAAT:    5,            // Aynı saatte max toplam randevu sayısı
  },

  // ─────────────────────────────────────────────────────────
  //  HİZMET BAZINDA KAPASİTE
  //
  //  Aynı saatte, aynı hizmet için kaç randevu kabul edersin?
  //  (Örn. mekanik onarım uzman ister, max 2; yedek parça
  //   hızlı bir işlem, max 10.)
  //
  //  - 1  → aynı saatte sadece 1 tane (eski "duplicate" davranışı)
  //  - 5  → aynı saatte aynı hizmetten 5'e kadar (lift varsa)
  //
  //  Burada listelenmemiş bir hizmet için _VARSAYILAN kullanılır.
  // ─────────────────────────────────────────────────────────
  HIZMET_KAPASITE: {
    'Periyodik Bakım':   5,
    'Arıza Tespit':      3,
    'Mekanik Onarım':    2,
    'Check-Up Kontrol':  4,
    'Yedek Parça':       10,
    'Diğer':             3,
    _VARSAYILAN:         3,         // listede olmayan hizmetler için
  },

  // ─────────────────────────────────────────────────────────
  //  İPTAL EDİLEN RANDEVULAR
  //  true  → tabloda "Durum=İptal" olan satırlar kapasiteye
  //          sayılmaz (iptal olunca yer açılır)
  //  false → iptaller bile sayılır (yer kapalı kalır)
  // ─────────────────────────────────────────────────────────
  IPTAL_SAYILMAZ:        true,

  // ─────────────────────────────────────────────────────────
  //  KAPALI / TATİL TARİHLERİ
  //  Belirli tek tarihleri tam gün kapatmak için
  //  Format: 'YYYY-MM-DD'
  //
  //  Örnek satırların başındaki // işaretini silersen aktif olur.
  // ─────────────────────────────────────────────────────────
  KAPALI_TARIHLER: [
    // '2026-04-23',  // 23 Nisan Ulusal Egemenlik
    // '2026-05-01',  // 1 Mayıs İşçi Bayramı
    // '2026-05-19',  // 19 Mayıs Gençlik ve Spor
    // '2026-08-30',  // 30 Ağustos Zafer Bayramı
    // '2026-10-29',  // 29 Ekim Cumhuriyet Bayramı
  ],

  // ─────────────────────────────────────────────────────────
  //  KULLANICIYA GÖSTERİLECEK MESAJLAR
  //  {hizmet} → seçilen hizmet adıyla otomatik değiştirilir
  // ─────────────────────────────────────────────────────────
  MESAJLAR: {
    HIZMET_DOLU:    'Bu tarih ve saat için "{hizmet}" hizmetinde uygun yer kalmadı. Lütfen farklı bir saat seçin.',
    TOPLAM_DOLU:    'Bu tarih ve saatte tüm randevu kapasitesi dolmuş. Lütfen başka bir saat seçin.',
    KAPALI_GUN:     'Seçtiğiniz gün servis kapalı. Lütfen farklı bir gün seçin.',
    KAPALI_TARIH:   'Seçtiğiniz tarih tatil olarak işaretli. Lütfen farklı bir gün seçin.',
  },
};
// ============================================================
//  Ayar dosyasının sonu. Buradan aşağıya kod EKLENMEZ —
//  yardımcı fonksiyonlar Kod.gs'in altındadır.
// ============================================================
