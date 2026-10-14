/**
 * Eryaman Speaking Club - kayıt ve etkinlik e-posta otomasyonu
 * Güvenli zamanlama: geçmişe hatırlatma yok, tekil alıcı, hata bildirimi.
 * Google Sheets > Uzantılar > Apps Script bölümünde AYRI bir
 * ESC_Email.gs dosyasına eklenir. Mevcut kodlar silinmez.
 *
 * Önce ESC_EMAIL_setup(), sonra ESC_EMAIL_test() çalıştırılır.
 * Yeni kayıt ve zamanlı gönderim yalnızca
 * "E-posta Otomasyonu"!B2 = AÇIK iken çalışır.
 */
const ESC_EMAIL = Object.freeze({
  account: 'eryamanspeakingclub@gmail.com',
  timeZone: 'Europe/Istanbul',
  form: 'Kayıt Formu',
  members: 'Kayıtlar',
  events: 'Etkinlikler',
  rosters: ['Katılım Yüz Yüze', 'Katılım Online'],
  settings: 'E-posta Otomasyonu',
  log: 'E-posta Günlüğü',
  blocked: 'E-posta Engelleme',
  templates: 'E-posta Şablonları',
  maxPerRun: 35,
  rosterBlockSize: 500
});

function ESC_EMAIL_setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  [ESC_EMAIL.form, ESC_EMAIL.members, ESC_EMAIL.events]
    .concat(ESC_EMAIL.rosters)
    .forEach(function (name) {
      if (!ss.getSheetByName(name)) throw new Error('Eksik sekme: ' + name);
    });

  escEmailEnsureSheet_(ss, ESC_EMAIL.settings, [
    ['Ayar', 'Değer', 'Açıklama'],
    ['GONDERIM_AKTIF', 'KAPALI', 'Önce ESC_EMAIL_test; hazır olduğunda AÇIK yap.'],
    ['GONDERICI', ESC_EMAIL.account, 'Apps Script bu Gmail hesabıyla yetkilendirilmeli.']
  ]);
  // Eski etkinliklere yanlışlıkla bildirim gitmesini önleyen başlangıç tarihi.
  // Tekrar kurulum yapılırsa mevcut değer değiştirilmez.
  const configSheet = ss.getSheetByName(ESC_EMAIL.settings);
  if (!String(configSheet.getRange('A4').getDisplayValue()).trim()) {
    configSheet.getRange('A4:C4').setValues([[
      'ETKINLIK_ILK_TARIH',
      Utilities.formatDate(new Date(), ESC_EMAIL.timeZone, 'dd.MM.yyyy'),
      'Bu tarihten önce başlayan etkinliklere hatırlatma veya teşekkür gönderilmez.'
    ]]);
  }

  // Ayarlar ilk kez kurulurken doldurulur; sonraki çalışmalarda kullanıcı
  // tarafından değiştirilmiş değerleri kesinlikle üzerine yazma.
  const scheduleDefaults = [
    ['HATIRLATMA_SAAT_ONCE', 24,
      'Etkinlikten kaç saat önce? 24 = 1 gün. 1-168 arası tam sayı.'],
    ['TESEKKUR_SAAT_SONRA', 1,
      'Etkinlik bitiminden kaç saat sonra? 1 = 1 saat. 0-72 arası tam sayı.']
  ];
  scheduleDefaults.forEach(function (row, index) {
    const targetRow = 5 + index;
    const key = String(configSheet.getRange(targetRow, 1).getValue() || '').trim();
    if (!key) {
      configSheet.getRange(targetRow, 1, 1, 3).setValues([row]);
    } else if (key !== row[0]) {
      throw new Error('E-posta Otomasyonu!A' + targetRow +
        ' alanı beklenenden farklı. Veriler değiştirilmedi.');
    }
  });

  escEmailEnsureSheet_(ss, ESC_EMAIL.log, [
    ['İşlem Zamanı', 'Tekil Anahtar', 'Tür', 'E-posta', 'Üye No',
      'Etkinlik No', 'Durum', 'Hata / Not']
  ]);
  escEmailEnsureSheet_(ss, ESC_EMAIL.blocked, [
    ['E-posta', 'Açıklama', 'Tarih']
  ]);

  const triggers = ScriptApp.getProjectTriggers();
  if (!triggers.some(function (trigger) {
    return trigger.getHandlerFunction() === 'ESC_EMAIL_onFormSubmit';
  })) {
    ScriptApp.newTrigger('ESC_EMAIL_onFormSubmit')
      .forSpreadsheet(ss).onFormSubmit().create();
  }

  // Eski saatlik tetikleyiciyi SADECE ESC fonksiyonu için yenile.
  // Önce yeni tetikleyiciyi oluştur: oluşturma başarısız olursa eskisi kalsın.
  const oldTimers = triggers.filter(function (trigger) {
    return trigger.getHandlerFunction() === 'ESC_EMAIL_runScheduled';
  });
  ScriptApp.newTrigger('ESC_EMAIL_runScheduled')
    .timeBased().everyMinutes(15).create();
  oldTimers.forEach(function (trigger) { ScriptApp.deleteTrigger(trigger); });

  Logger.log('Kurulum hazır. Hatırlatmalar 15 dakikada bir kontrol edilecek. ' +
    'Gerçek gönderim durumu: ' + (escEmailActive_(ss) ? 'AÇIK' : 'KAPALI'));

}

function ESC_EMAIL_test() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  escEmailAssertSender_(ss);
  MailApp.sendEmail({
    to: escEmailSender_(ss),
    subject: '[TEST] Eryaman Speaking Club e-posta otomasyonu',
    body: 'Bu mesaj yalnızca sistem testidir. Katılımcılara e-posta gönderilmedi.',
    name: 'Eryaman Speaking Club',
    replyTo: escEmailSender_(ss)
  });
  Logger.log('Test mesajı yalnızca ' + escEmailSender_(ss) + ' adresine gönderildi.');
}

function ESC_EMAIL_preview() {
  escEmailProcessScheduled_(true);
}

/**
 * Yalnızca gelecek etkinlikler için planlanan gönderimleri listeler.
 * Gmail'e bağlanmaz, hiçbir mesaj göndermez ve günlükte kayıt oluşturmaz.
 */
function ESC_EMAIL_plan() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const firstEventTime = escEmailFirstEventTime_(ss);
  const schedule = escEmailScheduleSettings_(ss);
  const members = escEmailReadMembers_(ss);
  const blocked = escEmailBlocked_(ss);
  const eventSheet = ss.getSheetByName(ESC_EMAIL.events);
  const events = escEmailReadEvents_(ss);
  const pending = [];
  const now = Date.now();

  // Katılım tabloları her etkinlik için 500 satırlık bloklardan oluşur.
  // Sadece gelecekteki PLANLANDI etkinliklerinin bloklarını oku.
  const specs = [];
  events.forEach(function (row, index) {
    const eventId = String(row[0] || '').trim();
    if (!eventId || escEmailSimplify_(row[12]) !== 'planlandi') return;
    const times = escEmailParseEventTime_(row[1], row[2]);
    if (!times || times.start < firstEventTime || times.start <= now) return;
    if (!String(row[3] || '').trim() || !String(row[5] || '').trim()) return;
    specs.push({ id: eventId, index: index, type: row[3] });
  });
  const rosters = escEmailReadRosters_(ss, specs);

  specs.forEach(function (spec) {
    const eventId = spec.id;
    if (!rosters.has(eventId)) return;
    const row = events[spec.index];
    const times = escEmailParseEventTime_(row[1], row[2]);
    const planned = times.start - schedule.reminderHoursBefore * 3600000;
    const alreadyQueued = new Set();
    const recipients = rosters.get(eventId).filter(function (entry) {
      if (!entry.listed) return false;
      const member = members.get(entry.memberId);
      if (!member || !member.email || !member.consent) return false;
      if (blocked.has(member.email)) return false;
      if (alreadyQueued.has(member.email)) return false;
      alreadyQueued.add(member.email);
      return true;
    }).length;

    pending.push({
      event: eventId,
      reminderAt: Utilities.formatDate(new Date(planned),
        ESC_EMAIL.timeZone, 'dd.MM.yyyy HH:mm'),
      thanksEarliestAt: Utilities.formatDate(
        new Date(times.end + schedule.thanksHoursAfter * 3600000),
        ESC_EMAIL.timeZone, 'dd.MM.yyyy HH:mm'),
      recipients: recipients
    });
  });

  Logger.log('GÖNDERİMSİZ PLAN: ' + JSON.stringify(pending));
  Logger.log('Bu fonksiyon hiçbir e-posta göndermedi. ' +
    'B2 gönderim anahtarı: ' +
    (escEmailActive_(ss) ? 'AÇIK' : 'KAPALI'));
}

/**
 * KATILIMCILARA E-POSTA GÖNDERMEZ. Ayar, şablon, yaklaşan etkinlik,
 * katılım bloğu ve alıcı koşullarının toplu kontrolüdür.
 */
function ESC_EMAIL_selfTest() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const before = escEmailFirstEventTime_(ss);
  const schedule = escEmailScheduleSettings_(ss);
  const members = escEmailReadMembers_(ss);
  const ctx = escEmailContext_(ss);
  const rows = escEmailReadEvents_(ss);
  const now = Date.now();
  const specs = [];
  rows.forEach(function (row, index) {
    const id = String(row[0] || '').trim();
    if (!id || (!row[1] && !row[2])) return; // Boş gelecek şablonları
    const times = escEmailParseEventTime_(row[1], row[2]);
    if (!times) throw new Error('Geçersiz etkinlik zamanı: ' + id);
    if (times.start < before || times.end <= now) return; // Tarihi geçenler
    const state = escEmailSimplify_(row[12]);
    if (state === 'iptal' || state === 'iptal edildi') return;
    if (state !== 'planlandi') {
      throw new Error('Gelecek etkinlik Planlandı olmalı: ' + id);
    }
    if (!String(row[3] || '').trim() || !String(row[5] || '').trim()) {
      throw new Error('Gelecek etkinlik türü veya mekânı eksik: ' + id);
    }
    specs.push({ id: id, index: index, type: row[3] });
  });
  const rosters = escEmailReadRosters_(ss, specs);
  const sample = {
    ad: 'Örnek', tarih: '18.10.2026', saat: '18.00-20.00',
    mekan: 'Örnek mekân', tur: 'Online', tema: '', etkinlik: 'TEST'
  };
  ['welcome', 'reminder', 'thanks'].forEach(function (kind) {
    const t = escEmailTemplate_(ss, kind, sample);
    if (!t) return; // PASİF şablon bilinçli olarak gönderilmez.
    if (!t.subject || !t.body || /\{\{[a-z]+\}\}/.test(t.body)) {
      throw new Error('Şablon eksik veya çözülmemiş değişken var: ' + kind);
    }
  });
  const summary = specs.map(function (spec) {
    const emails = new Set();
    (rosters.get(spec.id) || []).forEach(function (entry) {
      const member = members.get(entry.memberId);
      if (entry.listed && member && member.email && member.consent &&
          !ctx.blocked.has(member.email)) emails.add(member.email);
    });
    return { etkinlik: spec.id, hatırlatmaAdayı: emails.size };
  });
  Logger.log('GÖNDERİMSİZ GÜVENLİK TESTİ BAŞARILI. ' +
    'Başlangıç tarihi=' + Utilities.formatDate(new Date(before),
      ESC_EMAIL.timeZone, 'dd.MM.yyyy') +
    ', hatırlatma saat önce=' + schedule.reminderHoursBefore +
    ', teşekkür saat sonra=' + schedule.thanksHoursAfter +
    ', gönderim anahtarı=' + (escEmailActive_(ss) ? 'AÇIK' : 'KAPALI'));
  Logger.log('Gelecek etkinlik ve adaylar: ' + JSON.stringify(summary));
  Logger.log('Katılımcılara hiçbir test e-postası gönderilmedi.');
}

function ESC_EMAIL_onFormSubmit(e) {
  if (!e || !e.range || e.range.getSheet().getName() !== ESC_EMAIL.form) return;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return;
  try {
    const ss = e.source || SpreadsheetApp.getActiveSpreadsheet();
    if (!escEmailActive_(ss)) return;
    escEmailAssertSender_(ss);

    // Kayıt Formu: B=ad, E veya O=e-posta, N=iletişim onayı.
    const values = e.values || e.range.getSheet()
      .getRange(e.range.getRow(), 1, 1, 16).getDisplayValues()[0];
    const fullName = String(values[1] || '').trim();
    const email = escEmailNormalizeAddress_(values[4]) ||
      escEmailNormalizeAddress_(values[14]);
    if (!email || !escEmailConsent_(values[13])) return;
    const ctx = escEmailContext_(ss);
    if (ctx.blocked.has(email)) return;
    const firstName = fullName.split(/\s+/)[0] || 'Merhaba';
    const message = escEmailTemplate_(ss, 'welcome', { ad: firstName });
    if (!message) return;
    escEmailSend_(ctx, 'welcome:' + email, 'Kayıt alındı', email,
      '', '', message.subject, message.body);
  } catch (error) {
    escEmailAlert_('Yeni kayıt işlemi', error);
    throw error;
  } finally {
    lock.releaseLock();
  }
}

function ESC_EMAIL_runScheduled() {
  try {
    const summary = escEmailProcessScheduled_(false);
    const active = escEmailActive_(SpreadsheetApp.getActiveSpreadsheet());
    const failed = summary ? summary.attempted - summary.delivered : 0;
    escEmailHealth_(active ? (failed ? 'KONTROL GEREKİYOR' : 'ÇALIŞIYOR')
      : 'KAPALI', failed ? failed + ' e-posta işlenemedi.' : '');
  } catch (error) {
    escEmailHealth_('HATA', String(error));
    escEmailAlert_('Zamanlanmış e-posta işlemi', error);
    throw error;
  }
}

function escEmailProcessScheduled_(preview) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!preview && !escEmailActive_(ss)) return;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return;
  try {
    if (!preview) escEmailAssertSender_(ss);
    const ctx = escEmailContext_(ss);
    const firstEventTime = escEmailFirstEventTime_(ss);
    const schedule = escEmailScheduleSettings_(ss);
    const byEvent = {};
    const members = escEmailReadMembers_(ss);
    const rows = escEmailReadEvents_(ss);
    const now = Date.now();
    // Zamanı henüz gelmemiş etkinlikler için devasa katılım tablolarını tarama.
    const due = [];
    rows.forEach(function (row, index) {
      const eventId = String(row[0] || '').trim();
      if (!eventId) return;
      const times = escEmailParseEventTime_(row[1], row[2]);
      if (!times) {
        if (escEmailSimplify_(row[12]) === 'planlandi' && (row[1] || row[2])) {
          escEmailAlert_('Geçersiz etkinlik zamanı',
            new Error(eventId + ': tarih veya saat geçersiz.'));
        }
        return;
      }
      if (times.start < firstEventTime) return;
      const status = escEmailDueKinds_(
        escEmailSimplify_(row[12]), times, now, schedule);
      if (status.reminder || status.thanks) {
        if (!String(row[3] || '').trim() || !String(row[5] || '').trim()) {
          escEmailAlert_('Eksik etkinlik bilgisi',
            new Error(eventId + ': etkinlik türü veya mekân boş.'));
          return;
        }
        due.push({ id: eventId, index: index, type: row[3] });
      }
    });
    const rosters = escEmailReadRosters_(ss, due);
    let dueCount = 0;
    let attempted = 0;
    let delivered = 0;
    const seen = new Set(ctx.keys);
    const seenAddresses = new Set(ctx.eventEmails);

    rows.forEach(function (row) {
      const eventId = String(row[0] || '').trim();
      if (!eventId || !rosters.has(eventId)) return;
      const times = escEmailParseEventTime_(row[1], row[2]);
      if (!times || times.start < firstEventTime) return;
      const state = escEmailSimplify_(row[12]);
      if (state === 'iptal' || state === 'iptal edildi') return;

      const status = escEmailDueKinds_(state, times, now, schedule);
      if (!status.reminder && !status.thanks) return;

      const kind = status.reminder ? 'reminder' : 'thanks';
      const dateText = Utilities.formatDate(new Date(times.start),
        ESC_EMAIL.timeZone, 'dd.MM.yyyy');
      const hoursText = String(row[2] || '').trim();
      const title = String(row[4] || '').trim();
      const venue = String(row[5] || '').trim();
      const format = String(row[3] || '').trim();
      if (!venue || !format) return; // Eksik etkinlik bilgisiyle e-posta gönderme.

      rosters.get(eventId).forEach(function (entry) {
        if (attempted >= ESC_EMAIL.maxPerRun) return;
        // Uzun bir işlem etkinlik başlangıcını aşarsa hatırlatmayı DURDUR.
        if (kind === 'reminder' && Date.now() >= times.start) return;
        if (kind === 'reminder' && !entry.listed) return;
        if (kind === 'thanks' &&
            (!entry.listed || !entry.attended || !entry.isNew)) return;
        const member = members.get(entry.memberId);
        if (!member || !member.email || !member.consent) return;
        if (ctx.blocked.has(member.email)) return;
        const key = kind + ':' + eventId + ':' + entry.memberId;
        const addressKey = kind + '|' + eventId + '|' + member.email;
        if (seen.has(key) || seenAddresses.has(addressKey)) return;
        seen.add(key);
        seenAddresses.add(addressKey);
        dueCount += 1;
        const eventKey = kind + ':' + eventId;
        byEvent[eventKey] = (byEvent[eventKey] || 0) + 1;
        if (preview) return;
        const message = escEmailTemplate_(ss, kind, {
          ad: member.firstName,
          tarih: dateText,
          saat: hoursText,
          mekan: venue,
          tur: format,
          tema: title,
          etkinlik: eventId
        });
        if (!message) return;
        attempted += 1;
        if (escEmailSend_(ctx, key, kind, member.email,
            entry.memberId, eventId, message.subject, message.body)) delivered += 1;
      });
    });
    Logger.log((preview ? 'Önizleme' : 'Gönderim') +
      ': uygun=' + dueCount + ', denenen=' + attempted +
      ', başarılı=' + delivered);
    Logger.log('Etkinlik bazında adaylar (kişisel veri içermez): ' +
      JSON.stringify(byEvent));
    return { dueCount: dueCount, attempted: attempted, delivered: delivered };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Şablonlar özel Google Sheets dosyasında tutulur; banka bilgileri
 * herkese açık GitHub deposuna yazılmaz.
 */
function escEmailTemplate_(ss, kind, replacements) {
  const sheet = ss.getSheetByName(ESC_EMAIL.templates);
  if (!sheet) throw new Error('E-posta Şablonları sekmesi bulunamadı. Gönderim durduruldu.');
  const lastRow = Math.min(sheet.getLastRow(), 30);
  if (lastRow < 2) throw new Error('E-posta Şablonları boş.');
  const templates = sheet.getRange(2, 1, lastRow - 1, 4).getDisplayValues();
  const match = templates.find(function (row) {
    return String(row[0] || '').trim().toLowerCase() === kind;
  });
  if (!match) throw new Error('E-posta şablonu bulunamadı: ' + kind);
  const enabled = escEmailSimplify_(match[3]);
  if (enabled === 'pasif') return null; // Kullanıcı şablonu kapattı.
  if (enabled !== 'aktif' ||
      !String(match[1]).trim() || !String(match[2]).trim()) {
    throw new Error('E-posta şablonu geçersiz veya eksik: ' + kind);
  }
  const fill = function (value) {
    return String(value).replace(/\{\{([a-z]+)\}\}/g, function (_, key) {
      if (!Object.prototype.hasOwnProperty.call(replacements, key)) {
        throw new Error('Bilinmeyen e-posta değişkeni: ' + key);
      }
      return String(replacements[key] || '');
    });
  };
  return { subject: fill(match[1]), body: fill(match[2]) };
}

/**
 * Saat ayarları E-posta Otomasyonu!B5:B6 alanlarından okunur.
 * Eksik veya geçersiz değer varken e-posta göndermeyi reddeder.
 */
function escEmailScheduleSettings_(ss) {
  const sheet = ss.getSheetByName(ESC_EMAIL.settings);
  if (!sheet) throw new Error('E-posta Otomasyonu sekmesi bulunamadı.');
  const rows = sheet.getRange('A5:B6').getValues();
  const expected = ['HATIRLATMA_SAAT_ONCE', 'TESEKKUR_SAAT_SONRA'];
  rows.forEach(function (row, index) {
    const value = row[1];
    const min = index === 0 ? 1 : 0;
    const max = index === 0 ? 168 : 72;
    if (String(row[0] || '').trim() !== expected[index] ||
        typeof value !== 'number' || !Number.isInteger(value) ||
        value < min || value > max) {
      throw new Error('Geçersiz e-posta zaman ayarı: E-posta Otomasyonu!B' +
        (index + 5) + '. Lütfen ' + min + '-' + max +
        ' aralığında tam sayı girin. Gönderim yapılmadı.');
    }
  });
  return { reminderHoursBefore: rows[0][1], thanksHoursAfter: rows[1][1] };
}

/**
 * Hem ön seçimde hem gerçek gönderimde AYNI zaman kontrolünü kullan.
 * Hatırlatma, hedef saatten itibaren etkinlik başlayana kadar telafi edilebilir;
 * teşekkür ise hedef saatten itibaren en fazla 24 saat içinde işlenir.
 * Etkinlik durumu uygun değilse asla gönderilmez.
 */
function escEmailDueKinds_(state, times, now, schedule) {
  const hour = 3600000;
  const reminderAt = times.start - schedule.reminderHoursBefore * hour;
  const thanksAt = times.end + schedule.thanksHoursAfter * hour;
  return {
    // Zamanlayıcı geçici olarak çalışmazsa yalnızca etkinlik BAŞLAMADAN
    // önce gecikmiş hatırlatmayı telafi et. Geçmiş etkinlik hatırlatması yok.
    reminder: state === 'planlandi' &&
      now >= reminderAt && now < times.start,
    // "Planlandı" olarak kalan etkinliklerde de sadece gerçekten
    // Katıldı + Yeni işaretli kişiye, etkinlik bitince teşekkür gönder.
    thanks: (state === 'tamamlandi' || state === 'planlandi') &&
      !!times.end && now >= thanksAt && now < thanksAt + 24 * hour
  };
}

function escEmailFirstEventTime_(ss) {
  const settings = ss.getSheetByName(ESC_EMAIL.settings);
  if (!settings) throw new Error('E-posta Otomasyonu sekmesi bulunamadı.');
  const value = settings.getRange('B4').getValue();
  const parsed = escEmailParseEventTime_(value, '00.00-23.59');
  if (!parsed) {
    throw new Error('Güvenlik: E-posta Otomasyonu!B4 geçerli başlangıç ' +
      'tarihi olmalı (ör. 14.10.2026). Gönderim durduruldu.');
  }
  return parsed.start;
}

/** Tek etkinlik kaynağı: sıradaki tüm kayıtlı etkinlikleri otomatik tara. */
function escEmailReadEvents_(ss) {
  const sheet = ss.getSheetByName(ESC_EMAIL.events);
  if (!sheet) throw new Error('Etkinlikler sekmesi bulunamadı.');
  const count = Math.max(0, sheet.getLastRow() - 4);
  if (count > 1000) {
    throw new Error('Etkinlik sayısı 1000 sınırını aştı; gönderimler durduruldu.');
  }
  return count ? sheet.getRange(5, 1, count, 15).getValues() : [];
}

function escEmailReadMembers_(ss) {
  const sheet = ss.getSheetByName(ESC_EMAIL.members);
  const n = Math.min(Math.max(0, sheet.getLastRow() - 4), 6000);
  const rows = n ? sheet.getRange(5, 1, n, 17).getValues() : [];
  const members = new Map();
  rows.forEach(function (r) {
    const id = String(r[0] || '').trim();
    if (!id) return;
    const address = escEmailNormalizeAddress_(r[3]);
    const fullName = String(r[2] || '').trim();
    members.set(id, {
      email: address,
      firstName: fullName.split(/\s+/)[0] || 'Merhaba',
      consent: escEmailConsent_(r[15])
    });
  });
  return members;
}

/**
 * Kayıt sayfalarının gerçek düzeni: Etkinlikler!A5, ilk 500 katılım satırı,
 * Etkinlikler!A6 sonraki 500 satır, ...; ör. ETK-017 -> 8004. satır.
 * Satır 8000 sınırı yoktur. Yalnızca istenen etkinlik bloklarını okur.
 * Sayfa düzeni değişirse yanlış kişilere mesaj göndermek yerine hata verir.
 */
function escEmailReadRosters_(ss, eventSpecs) {
  const rosters = new Map();
  const seenSpecs = new Set();
  eventSpecs.forEach(function (spec) {
    if (seenSpecs.has(spec.id)) throw new Error('Tekrarlanan etkinlik numarası: ' + spec.id);
    seenSpecs.add(spec.id);
    const kind = escEmailSimplify_(spec.type);
    const sheetName = kind === 'online' ? 'Katılım Online' :
      kind === 'face to face' ? 'Katılım Yüz Yüze' : '';
    if (!sheetName) {
      throw new Error('Bilinmeyen etkinlik türü: ' + spec.id);
    }
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error('Katılım sayfası bulunamadı: ' + sheetName);
    const blockStart = 4 + spec.index * ESC_EMAIL.rosterBlockSize;
    if (blockStart + ESC_EMAIL.rosterBlockSize - 1 > sheet.getMaxRows()) {
      throw new Error('Katılım sayfasında etkinlik bloğu bulunamadı: ' + spec.id);
    }
    const rows = sheet.getRange(blockStart, 1, ESC_EMAIL.rosterBlockSize, 7).getValues();
    const firstId = String(rows[0][0] || '').trim();
    if (firstId && firstId !== spec.id) {
      throw new Error('Katılım bloğu etkinlik numarasıyla uyuşmuyor: ' + spec.id);
    }
    const entries = [];
    rows.forEach(function (row) {
      const eventId = String(row[0] || '').trim();
      const memberId = String(row[1] || '').trim();
      if (eventId && eventId !== spec.id) {
        throw new Error('Katılım satırında farklı etkinlik numarası: ' + spec.id);
      }
      if (eventId !== spec.id || !memberId) return;
      entries.push({
        memberId: memberId,
        listed: escEmailYes_(row[4]),
        attended: escEmailYes_(row[5]),
        // Katılım tablosunda G sütunu: Yeni / Tekrar. Boşsa gönderme.
        isNew: escEmailSimplify_(row[6]) === 'yeni'
      });
    });
    rosters.set(spec.id, entries);
  });
  return rosters;
}

function escEmailParseEventTime_(dateValue, rangeValue) {
  const dateString = dateValue instanceof Date &&
    !isNaN(dateValue.getTime())
    ? Utilities.formatDate(dateValue, ESC_EMAIL.timeZone, 'dd.MM.yyyy')
    : String(dateValue || '').trim();
  const date = dateString.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/);
  const hours = String(rangeValue || '').trim()
    .match(/^(\d{1,2})[.:](\d{2})\s*[-–]\s*(\d{1,2})[.:](\d{2})$/);
  if (!date || !hours) return null;
  const d = +date[1], m = +date[2], y = +date[3];
  const h1 = +hours[1], min1 = +hours[2];
  const h2 = +hours[3], min2 = +hours[4];
  if (m < 1 || m > 12 || d < 1 || d > 31 ||
      h1 > 23 || h2 > 23 || min1 > 59 || min2 > 59) return null;
  // Türkiye yıl boyunca UTC+3 kullanır.
  const start = Date.UTC(y, m - 1, d, h1 - 3, min1);
  let end = Date.UTC(y, m - 1, d, h2 - 3, min2);
  if (end <= start) end += 24 * 3600000; // Gece yarısını geçen etkinlikler.
  const sanity = Utilities.formatDate(new Date(start), ESC_EMAIL.timeZone,
    'dd.MM.yyyy');
  if (sanity !== String(d).padStart(2, '0') + '.' +
      String(m).padStart(2, '0') + '.' + y) return null;
  return { start: start, end: end };
}

function escEmailContext_(ss) {
  const log = ss.getSheetByName(ESC_EMAIL.log);
  if (!log) throw new Error('E-posta Günlüğü sekmesi bulunamadı.');
  // B:G = Anahtar, Tür, E-posta, Üye, Etkinlik, Durum.
  const records = log.getLastRow() > 1
    ? log.getRange(2, 2, log.getLastRow() - 1, 6).getValues() : [];
  const eventEmails = new Set();
  records.forEach(function (r) {
    if ((r[1] === 'reminder' || r[1] === 'thanks') && r[4] && r[2]) {
      // PROCESSING veya belirsiz sonuç da ikinci kez gönderilmez.
      eventEmails.add(r[1] + '|' + String(r[4]).trim() + '|' +
        escEmailNormalizeAddress_(r[2]));
    }
  });
  return {
    ss: ss,
    log: log,
    keys: new Set(records.map(function (r) { return String(r[0] || ''); })),
    eventEmails: eventEmails,
    blocked: escEmailBlocked_(ss)
  };
}

function escEmailBlocked_(ss) {
  const sheet = ss.getSheetByName(ESC_EMAIL.blocked);
  if (!sheet || sheet.getLastRow() < 2) return new Set();
  return new Set(sheet.getRange(2, 1, sheet.getLastRow() - 1, 1)
    .getValues().map(function (r) {
      return escEmailNormalizeAddress_(r[0]);
    }).filter(Boolean));
}

function escEmailSend_(ctx, key, kind, email, memberId, eventId,
                       subject, body) {
  if (ctx.keys.has(key) || ctx.blocked.has(email)) return false;
  if (MailApp.getRemainingDailyQuota() < 1) {
    throw new Error('Gmail günlük gönderim kotası doldu. ' +
      'Etkinlik başlamadan sonraki kontrol deneyecek.');
  }

  const log = ctx.log;
  const logRow = log.getLastRow() + 1;
  log.getRange(logRow, 1, 1, 8).setValues([[
    new Date(), key, kind, email, memberId, eventId, 'PROCESSING', ''
  ]]);
  SpreadsheetApp.flush();
  ctx.keys.add(key);
  if (eventId) ctx.eventEmails.add(kind + '|' + eventId + '|' + email);
  const footer = '\n\n---\nBu mesaj ESC kayıt veya etkinlik bilgilendirmesidir. ' +
    'Bu e-postaları almak istemiyorsan mesajı yanıtlayarak bize bildirebilirsin.\n' +
    'eryamanspeakingclub.com';
  const plain = body + footer;
  try {
    MailApp.sendEmail({
      to: email,
      subject: subject,
      body: plain,
      htmlBody: escEmailHtml_(plain),
      name: 'Eryaman Speaking Club',
      replyTo: escEmailSender_(ctx.ss)
    });
    log.getRange(logRow, 7, 1, 2).setValues([['SENT', '']]);
    return true;
  } catch (error) {
    // Ambiguous send outcomes do NOT get retried automatically.
    log.getRange(logRow, 7, 1, 2).setValues([[
      'ERROR - MANUAL REVIEW', String(error).slice(0, 300)
    ]]);
    escEmailAlert_('E-posta gönderim hatası', error);
    return false;
  }
}

/**
 * Düzenli sağlık bilgisi. Sadece E-posta Otomasyonu!A8:C10 yazılır;
 * açık/kapalı ayarına ve katılımcı kayıtlarına dokunulmaz.
 */
function escEmailHealth_(status, error) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(ESC_EMAIL.settings);
    if (!sheet) return;
    sheet.getRange('A8:C9').setValues([
      ['SON_OTOMATIK_KONTROL', new Date(),
        'Mevcut zamanlayıcı her 15 dakikada bir kontrol eder.'],
      ['OTOMASYON_DURUMU', status,
        'Hata durumunda yöneticiye uyarı gönderilmeye çalışılır.']
    ]);
    if (error) sheet.getRange('A10:C10').setValues([[
      'SON_HATA', String(error).slice(0, 250),
      'Ayrıntılar için Apps Script > Yürütmeler ve E-posta Günlüğü.'
    ]]);
  } catch (healthError) {
    Logger.log('Sağlık göstergesi yazılamadı: ' + healthError);
  }
}

/** Hatalarda yalnızca yöneticiyi, en fazla günde bir kez bilgilendir. */
function escEmailAlert_(source, error) {
  try {
    const today = Utilities.formatDate(new Date(), ESC_EMAIL.timeZone, 'yyyyMMdd');
    const props = PropertiesService.getScriptProperties();
    const key = 'ESC_EMAIL_LAST_ALERT_DAY';
    if (props.getProperty(key) === today) return;
    if (MailApp.getRemainingDailyQuota() < 1) return;
    MailApp.sendEmail({
      to: ESC_EMAIL.account,
      subject: '[ESC] E-posta otomasyonu kontrol gerekli',
      body: 'Otomasyon hatası: ' + source + '\n\n' +
        String(error).slice(0, 1200) + '\n\n' +
        'Apps Script > Yürütmeler ve E-posta Günlüğü bölümlerini kontrol edin.',
      name: 'Eryaman Speaking Club'
    });
    props.setProperty(key, today);
  } catch (notificationError) {
    Logger.log('Yönetici hata bildirimi başarısız: ' + notificationError);
  }
}

function escEmailHtml_(plain) {
  const safe = String(plain).replace(/&/g, '&amp;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return '<div style="background:#f3f7fb;padding:24px;font-family:Arial,sans-serif">' +
    '<div style="max-width:570px;margin:auto;background:white;border-radius:14px;' +
    'padding:25px;color:#17324f;line-height:1.7">' +
    '<div style="font-weight:bold;color:#175ca8;font-size:20px">' +
    'Eryaman Speaking Club</div>' +
    '<div style="height:3px;background:#f2a329;margin:14px 0 23px"></div>' +
    '<div style="white-space:pre-wrap;font-size:14px">' + safe + '</div>' +
    '</div></div>';
}

function escEmailEnsureSheet_(ss, name, initialRows) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() !== 0) return sheet;
  sheet.getRange(1, 1, initialRows.length, initialRows[0].length)
    .setValues(initialRows);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, initialRows[0].length)
    .setBackground('#175ca8').setFontColor('#ffffff').setFontWeight('bold');
  sheet.autoResizeColumns(1, initialRows[0].length);
  return sheet;
}

function escEmailActive_(ss) {
  const sheet = ss.getSheetByName(ESC_EMAIL.settings);
  return !!sheet && ['ACIK', 'EVET', 'TRUE', '1'].indexOf(
    escEmailSimplify_(sheet.getRange('B2').getValue()).toUpperCase()
  ) !== -1;
}

function escEmailSender_(ss) {
  const sheet = ss.getSheetByName(ESC_EMAIL.settings);
  return escEmailNormalizeAddress_(sheet && sheet.getRange('B3').getValue()) ||
    ESC_EMAIL.account;
}

function escEmailAssertSender_(ss) {
  const required = escEmailSender_(ss);
  const actual = String(Session.getEffectiveUser().getEmail() || '')
    .trim().toLowerCase();
  if (actual !== required) {
    throw new Error('Güvenlik: Apps Script ' + required +
      ' hesabıyla çalıştırılmalı. Mevcut hesap: ' +
      (actual || '[doğrulanamadı]'));
  }
}

function escEmailNormalizeAddress_(value) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function escEmailConsent_(value) {
  const text = escEmailSimplify_(value);
  return text.indexOf('i agree') !== -1 ||
    text.indexOf('kabul ediyorum') !== -1 ||
    text === 'evet' || text === 'true' || text === '1';
}

function escEmailSimplify_(value) {
  return String(value || '').trim().toLocaleLowerCase('tr-TR')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i');
}

function escEmailYes_(value) {
  return value === true || ['TRUE', 'EVET', '1', 'YES'].indexOf(
    String(value || '').trim().toUpperCase()) !== -1;
}
