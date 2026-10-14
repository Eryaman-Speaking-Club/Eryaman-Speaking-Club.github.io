/**
 * Eryaman Speaking Club | Self-running weekly event calendar.
 *
 * Only Etkinlikler columns B:G, M:N are filled in PRE-EXISTING,
 * pre-numbered event rows (ETK-001..ETK-200). Never touches A / H:L,
 * rosters, finances, historical events or email settings.
 *
 * Install once: ESC_CALENDAR_setup().
 * Preview only: ESC_CALENDAR_preview().
 * Enable via Etkinlik Takvimi!B2 = AÇIK.
 * Optional immediate first run: ESC_CALENDAR_sync().
 * Automatic updates thereafter: ESC_CALENDAR_runDaily() daily trigger.
 *
 * This file NEVER sends participant messages.
 */
const ESC_CALENDAR = Object.freeze({
  settings: 'Etkinlik Takvimi',
  events: 'Etkinlikler',
  timeZone: 'Europe/Istanbul',
  maxSlots: 200,
  rosterBlockSize: 500,
  marker: 'ESC-AUTO:',
  admin: 'eryamanspeakingclub@gmail.com'
});

function ESC_CALENDAR_setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  escCalendarSettings_(ss); // Validate; do not create events.
  if (!ss.getSheetByName(ESC_CALENDAR.events)) {
    throw new Error('Etkinlikler sekmesi bulunamadı.');
  }
  const list = ScriptApp.getProjectTriggers().filter(function (t) {
    return t.getHandlerFunction() === 'ESC_CALENDAR_runDaily';
  });
  if (!list.length) {
    ScriptApp.newTrigger('ESC_CALENDAR_runDaily')
      .timeBased().everyDays(1).atHour(3)
      .inTimezone(ESC_CALENDAR.timeZone).create();
  }
  // Leave any existing trigger untouched; no duplicate creation.
  Logger.log('Otomatik etkinlik takvimi kuruldu: her gün 03.00 civarında kontrol.');
  Logger.log('Etkinlik Takvimi!B2 açma/kapatma kontrolüdür. ' +
    'Kurulum hiçbir etkinlik oluşturmadı ve e-posta göndermedi.');
}

function ESC_CALENDAR_preview() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const result = escCalendarPlan_(ss);
  Logger.log('GÖNDERİMSİZ/DEĞİŞİKLİKSİZ TAKVİM ÖNİZLEMESİ');
  Logger.log('Otomatik oluşturma: ' +
    (result.enabled ? 'AÇIK' : 'KAPALI') +
    ', ileri gün: ' + result.horizon +
    ', mevcut tarihler atlandı: ' + result.existing +
    ', kullanılabilir yuva: ' + result.freeSlots);
  Logger.log('Yeni oluşturulabilecek etkinlikler: ' +
    JSON.stringify(result.creations.map(function (v) {
      return { id: v.id, tarih: v.date, saat: v.rule.hours,
        tur: v.rule.type, mekan: v.rule.venue };
    })));
  Logger.log('Bu önizleme hiçbir hücreyi değiştirmedi ve e-posta göndermedi.');
}

function ESC_CALENDAR_sync() {
  // One-time immediate run after enabling B2; afterwards daily trigger runs.
  ESC_CALENDAR_runDaily();
}

function ESC_CALENDAR_runDaily() {
  try {
    const report = escCalendarSync_();
    const status = report.busy ? 'MEŞGUL | sonraki kontrolde yeniden denenecek' :
      report.disabled ? 'KAPALI' :
      ('ÇALIŞIYOR | ' + report.created + ' yeni, ' +
       report.existing + ' mevcut, ' + report.remaining + ' boş yuva');
    escCalendarStatus_(status);
    Logger.log('TAKVİM: ' + status +
      '. Katılımcılara hiçbir e-posta gönderilmedi.');
    if (!report.disabled && !report.busy && report.remaining <= 12) {
      escCalendarAlert_('Etkinlik yuvaları azalıyor: ' +
        report.remaining + ' boş yuva kaldı. Katılım blokları ' +
        'genişletilmeden 200 etkinlik sınırı aşılmamalıdır.');
    }
  } catch (error) {
    escCalendarStatus_('HATA: ' + String(error).slice(0, 140));
    escCalendarAlert_(error);
    throw error;
  }
}

function escCalendarSync_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) {
    Logger.log('Takvim kilitli; sonraki günlük kontrolde yeniden denenecek.');
    return { busy: true, disabled: false, created: 0, existing: 0, remaining: -1 };
  }
  try {
    const plan = escCalendarPlan_(ss);
    if (!plan.enabled) {
      return { disabled: true, created: 0, existing: plan.existing,
        remaining: plan.freeSlots };
    }
    const sheet = ss.getSheetByName(ESC_CALENDAR.events);
    let created = 0;
    plan.creations.forEach(function (item) {
      const rowIndex = item.row;
      const check = sheet.getRange(rowIndex, 2, 1, 6).getValues()[0];
      const last = sheet.getRange(rowIndex, 13, 1, 3).getValues()[0];
      // Fail closed on concurrent user changes or partial writes.
      if (check.slice(0, 5).some(escCalendarHasValue_) ||
          last.some(escCalendarHasValue_)) {
        throw new Error('Etkinlik satırı işlem sırasında değişti: ' +
          item.id + ', satır ' + rowIndex + '. Hiçbir alan üzerine yazılmadı.');
      }
      if (!escCalendarHasValue_(check[5]) &&
          !(Number.isInteger(item.rule.capacity) && item.rule.capacity > 0)) {
        throw new Error('Kapasite geçersiz: ' + item.id);
      }
      const dateParts = item.date.split('-').map(Number);
      // Midday UTC preserves the intended Turkey calendar date.
      const dateValue = new Date(Date.UTC(dateParts[0], dateParts[1] - 1,
        dateParts[2], 9, 0, 0));
      const count = item.rule.capacity;
      // Never overwrite event ID A or calculated finance H:L.
      sheet.getRange(rowIndex, 2, 1, 6).setValues([[
        dateValue, item.rule.hours, item.rule.type, item.rule.theme,
        item.rule.venue, count
      ]]);
      sheet.getRange(rowIndex, 13, 1, 2).setValues([[
        'Planlandı',
        ESC_CALENDAR.marker + item.date + '|' + item.rule.dayName
      ]]);
      created++;
    });
    Logger.log('Oluşturulanlar: ' +
      JSON.stringify(plan.creations.map(function (i) {
        return i.id + ' ' + i.date;
      })));
    return { disabled: false, created: created,
      existing: plan.existing, remaining: plan.freeSlots - created };
  } finally {
    lock.releaseLock();
  }
}

function escCalendarPlan_(ss) {
  const config = escCalendarSettings_(ss);
  const eventSheet = ss.getSheetByName(ESC_CALENDAR.events);
  if (!eventSheet) throw new Error('Etkinlikler sekmesi bulunamadı.');
  const first = eventSheet.getRange(5, 1, ESC_CALENDAR.maxSlots, 7).getValues();
  const last = eventSheet.getRange(5, 13, ESC_CALENDAR.maxSlots, 3).getValues();

  const occupied = new Set();
  const free = [];
  for (let i = 0; i < ESC_CALENDAR.maxSlots; i++) {
    const row = first[i];
    const status = last[i];
    const id = String(row[0] || '').trim();
    const expected = 'ETK-' + String(i + 1).padStart(3, '0');
    if (id !== expected) {
      if (i < 12 || first[i].slice(1).some(escCalendarHasValue_)) {
        throw new Error('Etkinlik numarası beklenmedik: satır ' +
          (i + 5) + ', beklenen ' + expected);
      }
      // Beyond pre-numbered slots is NOT safe to populate.
      continue;
    }
    const hasDate = escCalendarHasValue_(row[1]);
    if (!hasDate && String(status[0] || '').trim() === 'Planlandı') {
      throw new Error('Planlanan etkinlikte tarih eksik: ' + id);
    }
    if (hasDate) {
      if (!escCalendarHasValue_(row[2]) ||
          !escCalendarHasValue_(row[3]) ||
          !escCalendarHasValue_(row[5]) ||
          !escCalendarHasValue_(status[0])) {
        throw new Error('Tarihi olan etkinlikte saat, tür, mekân ' +
          'veya durum eksik: ' + id);
      }
      const dateKey = escCalendarDateKey_(row[1]);
      if (!dateKey) throw new Error('Etkinlik tarihi okunamıyor: ' + id);
      occupied.add(dateKey);
    }
    const marker = String(status[1] || '').trim();
    if (marker.indexOf(ESC_CALENDAR.marker) === 0) {
      const original = marker.slice(ESC_CALENDAR.marker.length,
        ESC_CALENDAR.marker.length + 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(original)) occupied.add(original);
    }
    // A pre-filled capacity is allowed, all other event input fields must
    // be blank; reservations, manual edits and cancellations are preserved.
    const empty = !hasDate && row.slice(2, 6)
      .every(function (v) { return !escCalendarHasValue_(v); }) &&
      status.every(function (v) { return !escCalendarHasValue_(v); });
    if (empty) free.push({ row: i + 5, id: id, index: i });
  }

  const now = new Date();
  const today = escCalendarDateKey_(now);
  const minDate = today > config.firstDate ? today : config.firstDate;
  const candidates = [];
  const days = escCalendarUtcDay_(today);
  const usedDays = new Set();
  for (let offset = 0; offset <= config.horizon; offset++) {
    const date = new Date(days.getTime() + offset * 86400000);
    const key = date.toISOString().slice(0, 10);
    if (key < minDate) continue;
    const day = date.getUTCDay();
    const rule = config.rules.find(function (r) { return r.day === day; });
    if (!rule || occupied.has(key) || usedDays.has(key)) continue;
    const startMillis = Date.UTC(date.getUTCFullYear(),
      date.getUTCMonth(), date.getUTCDate(),
      rule.startHour - 3, rule.startMinute);
    if (startMillis <= now.getTime()) continue; // Never create past events.
    usedDays.add(key);
    candidates.push({ date: key, rule: rule });
  }
  // Validate every candidate and its roster block BEFORE any sheet writes.
  if (candidates.length > free.length) {
    throw new Error('Yeterli boş etkinlik yuvası yok: ' +
      candidates.length + ' gereken, ' + free.length +
      ' mevcut. Katılım tabloları genişletilmeli.');
  }
  const creations = candidates.map(function (c, i) {
    const slot = free[i];
    const rosterName = c.rule.type === 'Online' ?
      'Katılım Online' : 'Katılım Yüz Yüze';
    const roster = ss.getSheetByName(rosterName);
    if (!roster) throw new Error('Katılım sayfası eksik: ' + rosterName);
    const rosterStart = 4 + slot.index * ESC_CALENDAR.rosterBlockSize;
    if (rosterStart + ESC_CALENDAR.rosterBlockSize - 1 >
        roster.getMaxRows()) {
      throw new Error('Etkinlik için katılım bloğu yok: ' + slot.id);
    }
    const actualId = String(roster.getRange(rosterStart, 1)
      .getDisplayValue() || '').trim();
    if (actualId !== slot.id) {
      throw new Error('Katılım bloğu uyumsuz: ' + slot.id +
        ' / bulunan ' + actualId);
    }
    return { row: slot.row, id: slot.id, date: c.date, rule: c.rule };
  });
  return { enabled: config.enabled, horizon: config.horizon,
    existing: occupied.size, freeSlots: free.length, creations: creations };
}

function escCalendarSettings_(ss) {
  const sheet = ss.getSheetByName(ESC_CALENDAR.settings);
  if (!sheet) throw new Error('Etkinlik Takvimi sekmesi bulunamadı.');
  const values = sheet.getRange('B2:B4').getValues();
  const active = escCalendarState_(values[0][0]);
  if (!active) {
    throw new Error('Etkinlik Takvimi!B2 AÇIK veya KAPALI olmalı.');
  }
  const horizon = values[1][0];
  if (!Number.isInteger(horizon) || horizon < 7 || horizon > 90) {
    throw new Error('Etkinlik Takvimi!B3 7–90 arası tam sayı olmalı.');
  }
  const start = escCalendarDateKey_(values[2][0]);
  if (!start) throw new Error('Etkinlik Takvimi!B4 geçerli tarih olmalı.');
  const rowValues = sheet.getRange('A10:H16').getValues();
  const byDay = new Set();
  const rules = [];
  const days = {
    pazar: 0, pazartesi: 1, 'salı': 2, 'çarşamba': 3,
    'perşembe': 4, cuma: 5, cumartesi: 6
  };
  rowValues.forEach(function (r, i) {
    if (r.every(function (v) { return !escCalendarHasValue_(v); })) return;
    const status = escCalendarState_(r[0]);
    if (!status) throw new Error('Takvim satırı ' + (i + 10) +
      ' aktif değeri AÇIK veya KAPALI olmalı.');
    if (status === 'KAPALI') return; // Inactive rules are ignored.
    const dayName = String(r[1] || '').trim();
    const day = days[dayName.toLocaleLowerCase('tr-TR')];
    if (day === undefined) throw new Error('Geçersiz gün: ' + dayName);
    if (byDay.has(day)) throw new Error('Aynı gün için iki aktif kural: ' + dayName);
    byDay.add(day);
    const range = String(r[2] || '').trim()
      .match(/^(\d{1,2})[.:](\d{2})\s*[-–]\s*(\d{1,2})[.:](\d{2})$/);
    if (!range) throw new Error('Saat aralığı geçersiz: satır ' + (i + 10));
    const fromHour = +range[1], fromMinute = +range[2];
    const toHour = +range[3], toMinute = +range[4];
    if (fromHour > 23 || toHour > 23 ||
        fromMinute > 59 || toMinute > 59 ||
        toHour * 60 + toMinute <= fromHour * 60 + fromMinute) {
      throw new Error('Etkinlik saati geçersiz: satır ' + (i + 10));
    }
    const type = String(r[3] || '').trim();
    if (type !== 'Online' && type !== 'Face to face') {
      throw new Error('Etkinlik türü Online veya Face to face olmalı: satır ' + (i + 10));
    }
    const venue = String(r[4] || '').trim();
    const capacity = r[5];
    if (!venue || !Number.isInteger(capacity) ||
        capacity < 1 || capacity > 500) {
      throw new Error('Mekân veya kapasite geçersiz: satır ' + (i + 10));
    }
    rules.push({ day: day, dayName: dayName, hours:
      String(fromHour).padStart(2, '0') + '.' +
        String(fromMinute).padStart(2, '0') + '-' +
        String(toHour).padStart(2, '0') + '.' +
        String(toMinute).padStart(2, '0'),
      startHour: fromHour, startMinute: fromMinute,
      type: type, venue: venue, capacity: capacity,
      theme: String(r[6] || '').trim() });
  });
  if (!rules.length && active === 'AÇIK') {
    throw new Error('Otomatik etkinlik açık, fakat etkin kural yok.');
  }
  return { enabled: active === 'AÇIK', horizon: horizon,
    firstDate: start, rules: rules };
}

function escCalendarDateKey_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, ESC_CALENDAR.timeZone, 'yyyy-MM-dd');
  }
  const str = String(value || '').trim();
  let m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return escCalendarDateValid_(+m[1], +m[2], +m[3]);
  m = str.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/);
  if (m) return escCalendarDateValid_(+m[3], +m[2], +m[1]);
  return '';
}

function escCalendarDateValid_(y, m, d) {
  const candidate = new Date(Date.UTC(y, m - 1, d));
  if (candidate.getUTCFullYear() !== y ||
      candidate.getUTCMonth() !== m - 1 ||
      candidate.getUTCDate() !== d) return '';
  return String(y).padStart(4, '0') + '-' +
    String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
}

function escCalendarUtcDay_(str) {
  const chunks = str.split('-').map(Number);
  return new Date(Date.UTC(chunks[0], chunks[1] - 1, chunks[2]));
}

function escCalendarState_(value) {
  const v = String(value || '').trim().toLocaleLowerCase('tr-TR');
  if (v === 'açık' || v === 'acik') return 'AÇIK';
  if (v === 'kapalı' || v === 'kapali') return 'KAPALI';
  return '';
}

function escCalendarHasValue_(value) {
  return value !== '' && value !== null && value !== undefined;
}

function escCalendarStatus_(status) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(ESC_CALENDAR.settings);
    if (!sheet) return;
    const raw = String(status);
    const segments = raw.split(' | ');
    const label = raw.indexOf('HATA:') === 0 ? 'HATA' : segments[0];
    const detail = raw.indexOf('HATA:') === 0 ?
      raw.slice(5).trim() :
      segments.length > 1 ? segments.slice(1).join(' | ') :
      label === 'KAPALI' ? 'Etkinlikler otomatik oluşturulmuyor.' : '';
    sheet.getRange('B5').setValue(new Date());
    sheet.getRange('B6:C6').setValues([[label, detail]]);
  } catch (error) {
    Logger.log('Takvim durum alanı güncellenemedi: ' + String(error));
  }
}

function escCalendarAlert_(error) {
  try {
    const key = 'ESC_CALENDAR_LAST_ADMIN_ALERT';
    const today = Utilities.formatDate(new Date(),
      ESC_CALENDAR.timeZone, 'yyyy-MM-dd');
    const properties = PropertiesService.getScriptProperties();
    if (properties.getProperty(key) === today) return;
    if (MailApp.getRemainingDailyQuota() < 1) return;
    MailApp.sendEmail({
      to: ESC_CALENDAR.admin,
      subject: '[ESC] Otomatik etkinlik takvimi kontrol gerekli',
      body: 'Etkinlik takviminde kontrol gereken durum:\n\n' +
        String(error).slice(0, 1300) +
        '\n\nGoogle Sheets > Etkinlik Takvimi / Apps Script > Yürütmeler',
      name: 'Eryaman Speaking Club'
    });
    properties.setProperty(key, today);
  } catch (notifyError) {
    Logger.log('Takvim yönetici uyarısı gönderilemedi: ' + notifyError);
  }
}
