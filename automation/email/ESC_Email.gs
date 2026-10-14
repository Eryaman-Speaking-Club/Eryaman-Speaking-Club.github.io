/**
 * Eryaman Speaking Club - kayıt ve etkinlik e-posta otomasyonu
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
  maxPerRun: 35
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

  escEmailEnsureSheet_(ss, ESC_EMAIL.log, [
    ['İşlem Zamanı', 'Tekil Anahtar', 'Tür', 'E-posta', 'Üye No',
      'Etkinlik No', 'Durum', 'Hata / Not']
  ]);
  escEmailEnsureSheet_(ss, ESC_EMAIL.blocked, [
    ['E-posta', 'Açıklama', 'Tarih']
  ]);

  const handlers = ScriptApp.getProjectTriggers().map(function (trigger) {
    return trigger.getHandlerFunction();
  });
  if (handlers.indexOf('ESC_EMAIL_onFormSubmit') === -1) {
    ScriptApp.newTrigger('ESC_EMAIL_onFormSubmit')
      .forSpreadsheet(ss).onFormSubmit().create();
  }
  if (handlers.indexOf('ESC_EMAIL_runScheduled') === -1) {
    ScriptApp.newTrigger('ESC_EMAIL_runScheduled')
      .timeBased().everyHours(1).create();
  }
  Logger.log('Kurulum hazır. Gönderim KAPALI. Şimdi ESC_EMAIL_test çalıştırın.');
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
    const message = [
      'Merhaba ' + firstName + ',',
      'Eryaman Speaking Club katılım formunu aldık. İlgin için teşekkür ederiz!',
      'Bu mesaj bir etkinlikte yerinin kesinleştiği anlamına gelmez. ' +
        'Etkinlik ve katılım detaylarını ayrıca paylaşacağız.',
      'Soruların için bu e-postayı yanıtlayabilirsin.'
    ].join('\n\n');
    escEmailSend_(ctx, 'welcome:' + email, 'Kayıt alındı', email,
      '', '', 'Eryaman Speaking Club | Başvurunu aldık', message);
  } finally {
    lock.releaseLock();
  }
}

function ESC_EMAIL_runScheduled() {
  escEmailProcessScheduled_(false);
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
    const byEvent = {};
    const members = escEmailReadMembers_(ss);
    const rosters = escEmailReadRosters_(ss);
    const eventsSheet = ss.getSheetByName(ESC_EMAIL.events);
    const n = Math.min(Math.max(0, eventsSheet.getLastRow() - 4), 200);
    const rows = n ? eventsSheet.getRange(5, 1, n, 15).getValues() : [];
    const now = Date.now();
    const hour = 3600000;
    let dueCount = 0;
    let attempted = 0;
    let delivered = 0;
    const seen = new Set(ctx.keys);

    rows.forEach(function (row) {
      const eventId = String(row[0] || '').trim();
      if (!eventId || !rosters.has(eventId)) return;
      const times = escEmailParseEventTime_(row[1], row[2]);
      if (!times || times.start < firstEventTime) return;
      const state = escEmailSimplify_(row[12]);
      if (state === 'iptal' || state === 'iptal edildi') return;

      const reminderDue = state === 'planlandi' &&
        times.start > now + 2 * hour && times.start <= now + 24 * hour;
      const thanksDue = state === 'tamamlandi' && times.end &&
        times.end + hour <= now && times.end + 7 * 24 * hour >= now;
      if (!reminderDue && !thanksDue) return;

      const kind = reminderDue ? 'reminder' : 'thanks';
      const dateText = Utilities.formatDate(new Date(times.start),
        ESC_EMAIL.timeZone, 'dd.MM.yyyy');
      const hoursText = String(row[2] || '').trim();
      const title = String(row[4] || '').trim();
      const venue = String(row[5] || '').trim();
      const format = String(row[3] || '').trim();
      if (!venue || !format) return; // Eksik etkinlik bilgisiyle e-posta gönderme.

      rosters.get(eventId).forEach(function (entry) {
        if (attempted >= ESC_EMAIL.maxPerRun) return;
        if (kind === 'reminder' && !entry.listed) return;
        if (kind === 'thanks' && !entry.attended) return;
        const member = members.get(entry.memberId);
        if (!member || !member.email || !member.consent) return;
        if (ctx.blocked.has(member.email)) return;
        const key = kind + ':' + eventId + ':' + entry.memberId;
        if (seen.has(key)) return;
        seen.add(key);
        dueCount += 1;
        const eventKey = kind + ':' + eventId;
        byEvent[eventKey] = (byEvent[eventKey] || 0) + 1;
        if (preview) return;
        const info = 'Tarih: ' + dateText + '\nSaat: ' + hoursText +
          '\nTür: ' + format + '\nYer / platform: ' + venue +
          (title ? '\nTema: ' + title : '');
        let subject, text;
        if (kind === 'reminder') {
          subject = 'Eryaman Speaking Club | Buluşma hatırlatması';
          text = [
            'Merhaba ' + member.firstName + ',',
            'Kaydının bulunduğu buluşmamız yaklaşıyor:',
            info,
            'Katılım durumunda değişiklik varsa lütfen bu e-postayı yanıtla.'
          ].join('\n\n');
        } else {
          subject = 'Eryaman Speaking Club | Katılımın için teşekkürler';
          text = [
            'Merhaba ' + member.firstName + ',',
            'Buluşmamıza katıldığın için teşekkür ederiz!',
            info,
            'Yeni buluşmalarda tekrar görüşmek üzere.'
          ].join('\n\n');
        }
        attempted += 1;
        if (escEmailSend_(ctx, key, kind, member.email,
            entry.memberId, eventId, subject, text)) delivered += 1;
      });
    });
    Logger.log((preview ? 'Önizleme' : 'Gönderim') +
      ': uygun=' + dueCount + ', denenen=' + attempted +
      ', başarılı=' + delivered);
    Logger.log('Etkinlik bazında adaylar (kişisel veri içermez): ' +
      JSON.stringify(byEvent));
  } finally {
    lock.releaseLock();
  }
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

function escEmailReadRosters_(ss) {
  const rosters = new Map();
  ESC_EMAIL.rosters.forEach(function (name) {
    const sheet = ss.getSheetByName(name);
    const n = Math.min(Math.max(0, sheet.getLastRow() - 3), 8000);
    const rows = n ? sheet.getRange(4, 1, n, 6).getValues() : [];
    rows.forEach(function (r) {
      const eventId = String(r[0] || '').trim();
      const memberId = String(r[1] || '').trim();
      if (!eventId || !memberId) return;
      if (!rosters.has(eventId)) rosters.set(eventId, []);
      rosters.get(eventId).push({
        memberId: memberId,
        listed: escEmailYes_(r[4]),
        attended: escEmailYes_(r[5])
      });
    });
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
  const records = log && log.getLastRow() > 1
    ? log.getRange(2, 2, log.getLastRow() - 1, 1).getValues() : [];
  return {
    ss: ss,
    log: log,
    keys: new Set(records.map(function (r) { return String(r[0] || ''); })),
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
    Logger.log('Günlük Gmail gönderim kotası doldu; yeni e-posta gönderilmedi.');
    return false;
  }

  const log = ctx.log;
  const logRow = log.getLastRow() + 1;
  log.getRange(logRow, 1, 1, 8).setValues([[
    new Date(), key, kind, email, memberId, eventId, 'PROCESSING', ''
  ]]);
  SpreadsheetApp.flush();
  ctx.keys.add(key);
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
    return false;
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
