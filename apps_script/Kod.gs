/* ============================================================
 *  FIRAT OTOMOTİV — RANDEVU WEBHOOK (ana kod)
 *  ============================================================
 *  Bu dosyayı normalde değiştirme. Kapasite/saat/mesaj gibi
 *  ayarları "Ayarlar.gs" dosyasından düzenle.
 *  ============================================================ */

const SHEET_ID        = '1dgvZg45aWSR3hHBfYuNJqOPaJuF1Se91sUOHSPmdy9U';
const SHEET_NAME      = 'Randevular';
const HEADER_ROW      = 3;
const FIRST_DATA_ROW  = 4;
const DURUM_DEFAULT   = 'Bekliyor';
const VERSION         = 'v5-capacity';

// ─────────────────────────────────────────────────────────
//  POST: site formundan randevu kaydeder
// ─────────────────────────────────────────────────────────
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('"' + SHEET_NAME + '" sayfası bulunamadı');

    const ssTz       = ss.getSpreadsheetTimeZone();
    const wantDate   = normalizeDate(data.date);
    const wantTime   = normalizeTime(data.time);
    const wantReason = String(data.reason || '').trim();

    // 1) Kapalı gün / tatil kontrolü
    const kapali = isKapaliGun(wantDate, ssTz);
    if (kapali === 'KAPALI_GUN') {
      return jsonOut({ status:'error', code:'CLOSED_DAY',  message: AYARLAR.MESAJLAR.KAPALI_GUN });
    }
    if (kapali === 'KAPALI_TARIH') {
      return jsonOut({ status:'error', code:'CLOSED_DATE', message: AYARLAR.MESAJLAR.KAPALI_TARIH });
    }

    // 2) Kapasite kontrolü
    if (wantDate && wantTime && wantReason) {
      const counts = countSlot(sheet, wantDate, wantTime, wantReason);
      const reasonCap = getHizmetKapasitesi(wantReason);

      if (counts.reason >= reasonCap) {
        return jsonOut({
          status: 'error', code: 'REASON_FULL',
          message: AYARLAR.MESAJLAR.HIZMET_DOLU.replace('{hizmet}', wantReason)
        });
      }

      if (AYARLAR.TOPLAM_KAPASITE.ENABLED &&
          counts.total >= AYARLAR.TOPLAM_KAPASITE.MAX_AYNI_SAAT) {
        return jsonOut({
          status:'error', code:'TOTAL_FULL',
          message: AYARLAR.MESAJLAR.TOPLAM_DOLU
        });
      }
    }

    // 3) Satır ekle (A..L)
    const maxRows = sheet.getMaxRows();
    const colA = sheet.getRange(FIRST_DATA_ROW, 1, maxRows - FIRST_DATA_ROW + 1, 1).getValues();
    let lastFilled = FIRST_DATA_ROW - 1;
    for (let i = colA.length - 1; i >= 0; i--) {
      const v = colA[i][0];
      if (v !== '' && v !== null) { lastFilled = FIRST_DATA_ROW + i; break; }
    }
    const targetRow = lastFilled + 1;

    const prevNo = sheet.getRange(lastFilled, 1).getValue();
    const nextNo = (typeof prevNo === 'number' && prevNo > 0)
      ? prevNo + 1
      : (targetRow - FIRST_DATA_ROW + 1);

    const kayitTarihi  = new Date(data.timestamp || new Date());
    const randevuTarih = wantDate
      ? Utilities.parseDate(wantDate, ssTz, 'yyyy-MM-dd')
      : '';

    sheet.getRange(targetRow, 1, 1, 12).setValues([[
      nextNo,
      kayitTarihi,
      randevuTarih,
      data.time     || '',
      data.fullname || '',
      data.email    || '',
      data.phone    || '',
      data.vehicle  || '',
      data.model    || '',
      data.year     || '',
      data.reason   || '',
      DURUM_DEFAULT
    ]]);

    return jsonOut({ status: 'success', row: targetRow });
  } catch (err) {
    return jsonOut({ status: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// ─────────────────────────────────────────────────────────
//  GET: ?date=YYYY-MM-DD&reason=XYZ →
//       {booked:["09:00","14:30"], closed:false}
//  Frontend bu listeyi alıp doğru saatleri gri yapar.
// ─────────────────────────────────────────────────────────
function doGet(e) {
  if (e && e.parameter && e.parameter.date && e.parameter.reason) {
    try {
      const ss = SpreadsheetApp.openById(SHEET_ID);
      const sheet = ss.getSheetByName(SHEET_NAME);
      if (!sheet) return jsonOut({ booked: [], version: VERSION });

      const ssTz = ss.getSpreadsheetTimeZone();
      const wantDate   = normalizeDate(e.parameter.date);
      const wantReason = String(e.parameter.reason).trim();

      // Kapalı gün ise hepsini dolu işaretle
      if (isKapaliGun(wantDate, ssTz)) {
        return jsonOut({ booked: [], closed: true, version: VERSION });
      }

      const reasonCap = getHizmetKapasitesi(wantReason);
      const totalCap  = AYARLAR.TOPLAM_KAPASITE.ENABLED
        ? AYARLAR.TOPLAM_KAPASITE.MAX_AYNI_SAAT
        : Number.POSITIVE_INFINITY;

      const lastRow = sheet.getLastRow();
      const counts = {};  // time → { total, reason }
      if (lastRow >= FIRST_DATA_ROW) {
        const rng = sheet.getRange(FIRST_DATA_ROW, 3, lastRow - FIRST_DATA_ROW + 1, 10).getDisplayValues();
        rng.forEach(row => {
          if (!row[0]) return;
          const cellStatus = String(row[9] || '').trim().toLowerCase();
          if (AYARLAR.IPTAL_SAYILMAZ && cellStatus === 'iptal') return;
          const cellDate = normalizeDate(row[0]);
          if (cellDate !== wantDate) return;
          const cellTime = normalizeTime(row[1]);
          if (!cellTime) return;
          if (!counts[cellTime]) counts[cellTime] = { total: 0, reason: 0 };
          counts[cellTime].total++;
          const cellReason = String(row[8] || '').trim();
          if (cellReason === wantReason) counts[cellTime].reason++;
        });
      }

      const booked = [];
      Object.keys(counts).forEach(time => {
        const c = counts[time];
        if (c.reason >= reasonCap || c.total >= totalCap) booked.push(time);
      });

      return jsonOut({ booked: booked, closed: false, version: VERSION });
    } catch (err) {
      return jsonOut({ booked: [], error: String(err), version: VERSION });
    }
  }
  return ContentService.createTextOutput('Randevu webhook aktif. ' + VERSION);
}

// ─────────────────────────────────────────────────────────
//  Yardımcılar
// ─────────────────────────────────────────────────────────

// Belirli (tarih, saat) için: o saatte toplam ve aynı sebepteki sayıyı döner
function countSlot(sheet, wantDate, wantTime, wantReason) {
  const lastRow = sheet.getLastRow();
  if (lastRow < FIRST_DATA_ROW) return { total: 0, reason: 0 };
  const rng = sheet.getRange(FIRST_DATA_ROW, 3, lastRow - FIRST_DATA_ROW + 1, 10).getDisplayValues();
  let total = 0, reason = 0;
  for (const row of rng) {
    if (!row[0]) continue;
    const cellStatus = String(row[9] || '').trim().toLowerCase();
    if (AYARLAR.IPTAL_SAYILMAZ && cellStatus === 'iptal') continue;
    if (normalizeDate(row[0]) !== wantDate) continue;
    if (normalizeTime(row[1]) !== wantTime) continue;
    total++;
    if (String(row[8] || '').trim() === wantReason) reason++;
  }
  return { total: total, reason: reason };
}

// "08/06/2026" / "08.06.2026" / "2026-06-08" → "2026-06-08"
function normalizeDate(s) {
  if (s instanceof Date) {
    return Utilities.formatDate(s, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const str = String(s || '').trim();
  let m = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (m) return m[3] + '-' + String(m[2]).padStart(2,'0') + '-' + String(m[1]).padStart(2,'0');
  m = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (m) return m[1] + '-' + String(m[2]).padStart(2,'0') + '-' + String(m[3]).padStart(2,'0');
  return str;
}

// "9:00" / "09:00" / Date → "09:00"
function normalizeTime(t) {
  if (t instanceof Date) {
    return String(t.getHours()).padStart(2,'0') + ':' + String(t.getMinutes()).padStart(2,'0');
  }
  const s = String(t || '').trim();
  const m = s.match(/^(\d{1,2}):(\d{2})/);
  return m ? (String(m[1]).padStart(2,'0') + ':' + m[2]) : s;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─────────────────────────────────────────────────────────
//  Ayar yardımcıları (AYARLAR'ı okur — Ayarlar.gs'te tanımlı)
// ─────────────────────────────────────────────────────────

// Bir hizmetin kapasite limitini döner (listede yoksa _VARSAYILAN)
function getHizmetKapasitesi(hizmet) {
  const cap = AYARLAR.HIZMET_KAPASITE[hizmet];
  if (typeof cap === 'number') return cap;
  return AYARLAR.HIZMET_KAPASITE._VARSAYILAN;
}

// Verilen 'YYYY-MM-DD' tarihi kapalı mı?
//   - özel tatil listesindeyse  → 'KAPALI_TARIH'
//   - haftanın kapalı gününüyse → 'KAPALI_GUN'
//   - yoksa                     → false
function isKapaliGun(dateStr, ssTz) {
  if (!dateStr) return false;
  if (AYARLAR.KAPALI_TARIHLER.indexOf(dateStr) !== -1) return 'KAPALI_TARIH';
  try {
    const dateObj = Utilities.parseDate(dateStr, ssTz, 'yyyy-MM-dd');
    const u = parseInt(Utilities.formatDate(dateObj, ssTz, 'u'), 10);
    const dow = (u === 7) ? 0 : u; // 0=Paz, 1=Pzt, ... 6=Cmt
    if (AYARLAR.CALISMA.KAPALI_GUNLER.indexOf(dow) !== -1) return 'KAPALI_GUN';
  } catch (e) { /* yoksay */ }
  return false;
}
