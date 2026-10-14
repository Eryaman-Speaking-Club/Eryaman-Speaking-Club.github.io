/**
 * ESC Live Gmail Worker.
 * All event data + recipients come from Supabase, not legacy Sheets.
 * Requires ONE-TIME authorization and script property setup:
 *   ESC_LIVE_BRIDGE_TOKEN = <token generated inside authenticated ESC admin panel>
 *
 * DO NOT paste the token in source code or spreadsheets.
 * After setting token, run ESC_LIVE_setup() once, ESC_LIVE_preview(),
 * and only after checking eligibility activate from both:
 *    Admin dashboard email switch + ESC_LIVE_enable()
 * This file is independent of Kod.gs / ESC_Email.gs.
 * NEVER sends reminders for a past or cancelled event: bridge checks state.
 */
const ESC_LIVE = Object.freeze({
  url: 'https://bshzakigvtyjilolsfjp.supabase.co/functions/v1/esc-email-bridge',
  sender: 'eryamanspeakingclub@gmail.com',
  name: 'Eryaman Speaking Club',
  tokenKey: 'ESC_LIVE_BRIDGE_TOKEN',
  enabledKey: 'ESC_LIVE_ENABLED',
  maxPerRun: 20
});

function ESC_LIVE_setup() {
  escLiveAssertAccount_();
  const settings=PropertiesService.getScriptProperties();
  if (!settings.getProperty(ESC_LIVE.tokenKey)) {
    throw new Error('Önce Apps Script > Proje Ayarları > Komut Dosyası Özellikleri ' +
      'içinde ESC_LIVE_BRIDGE_TOKEN değerini ekleyin. Gönderim yapılmadı.');
  }
  const health=escLiveRequest_('health', {});
  if (!health || !health.configured) {
    throw new Error('Sunucu bağlantısı doğrulanamadı. Gönderim yapılmadı.');
  }
  settings.setProperty(ESC_LIVE.enabledKey,'KAPALI');
  const installed=ScriptApp.getProjectTriggers()
    .filter(function(t){return t.getHandlerFunction()==='ESC_LIVE_run';});
  if (!installed.length) {
    ScriptApp.newTrigger('ESC_LIVE_run').timeBased()
      .everyMinutes(15).create();
  }
  Logger.log('Kurulum tamamlandı. 15 dakikalık kontrol kuruldu.');
  Logger.log('Gönderim KAPALI. ESC_LIVE_preview güvenle çalıştırılabilir.');
}

function ESC_LIVE_preview() {
  escLiveAssertAccount_();
  const health=escLiveRequest_('health',{});
  Logger.log('GÖNDERİMSİZ ÖNİZLEME: '+JSON.stringify({
    localEnabled:escLiveActive_(),
    serverEnabled:health.enabled,
    waiting:health.waiting,
    sent:health.sent,
    manualReview:health.manual_review
  }));
  Logger.log('Hiçbir alıcıya ve yöneticiye e-posta gönderilmedi.');
}

function ESC_LIVE_enable() {
  escLiveAssertAccount_();
  const health=escLiveRequest_('health',{});
  if (!health.enabled) throw new Error('Önce ESC yönetim panelinden sunucu gönderimini AÇIK yapmalısınız.');
  PropertiesService.getScriptProperties().setProperty(ESC_LIVE.enabledKey,'AÇIK');
  Logger.log('Gmail gönderimi açıldı. İlk tetikleyicide uygun mesajlar gönderilir.');
}

function ESC_LIVE_disable() {
  PropertiesService.getScriptProperties().setProperty(ESC_LIVE.enabledKey,'KAPALI');
  Logger.log('Gmail gönderimi kapatıldı.');
}

function ESC_LIVE_run() {
  if(!escLiveActive_())return;
  const lock=LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    Logger.log('Gönderim kilitli. Sonraki çalışmada yeniden kontrol edilir.');
    return;
  }
  try {
    escLiveAssertAccount_();
    const quota=MailApp.getRemainingDailyQuota();
    if(quota<=0){Logger.log('Günlük Gmail kotası bitti. Kuyruktan mesaj alınmadı.');return}
    const batch=escLiveRequest_('claim',{limit:Math.min(ESC_LIVE.maxPerRun,quota)});
    const items=Array.isArray(batch.items)?batch.items:[];
    let sent=0,review=0;
    for(const item of items){
      let delivered=false,errorNote='';
      try{
        if(!item || !Number.isSafeInteger(Number(item.id)) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(item.email||'')){
          throw new Error('Gönderim bilgisi geçersiz');
        }
        const subject=String(item.subject||'').trim();
        const body=String(item.body||'').trim();
        if(!subject || !body || /\{\{[a-z_]+\}\}/i.test(subject+' '+body)){
          throw new Error('Şablonda doldurulmamış alan veya boş içerik');
        }
        // The queue is authorized at claim time, but a long batch may cross
        // the event start. Never send any pre-event message after start.
        if (['welcome','reminder','change','cancelled'].includes(String(item.kind))) {
          const startsAt=Date.parse(String(item.event_start_at||''));
          if (!Number.isFinite(startsAt) || Date.now() >= startsAt) {
            throw new Error('Etkinlik başladı veya başlangıç tarihi geçersiz; mesaj gönderilmedi.');
          }
        }
        // MailApp returning without exception is acceptance, not inbox delivery proof.
        MailApp.sendEmail({to:item.email,subject:subject,body:body,
          name:ESC_LIVE.name,replyTo:ESC_LIVE.sender});
        delivered=true;sent++;
      }catch(err){
        errorNote=String(err).slice(0,350);review++;
      }
      try{
        const ack=escLiveRequest_('ack',{
          id:Number(item.id),delivered:delivered,error:errorNote
        });
        if(!ack.acknowledged){
          review++;Logger.log('Manuel kontrol: ACK eksik, id='+item.id);
        }
      }catch(ackError){
        // Do not resend uncertain emails: backend marks a timed-out claim for review.
        review++;Logger.log('ACK belirsiz, tekrar gönderilmeyecek: '+String(ackError));
      }
    }
    Logger.log('Gönderim tamamlandı. Kabul edilen='+sent+
      ', manuel inceleme gereken='+review+', kuyruktan alınan='+items.length);
  }catch(error){
    Logger.log('ESC canlı e-posta çalıştırma hatası: '+String(error));
    escLiveAlert_(error);
    throw error;
  }finally{
    lock.releaseLock();
  }
}

function escLiveRequest_(action,values){
  const token=PropertiesService.getScriptProperties().getProperty(ESC_LIVE.tokenKey);
  if(!token || !/^[A-Za-z0-9_-]{48,128}$/.test(token)){
    throw new Error('ESC_LIVE_BRIDGE_TOKEN eksik veya geçersiz.');
  }
  const req={action:action};
  Object.keys(values||{}).forEach(function(k){req[k]=values[k]});
  const result=UrlFetchApp.fetch(ESC_LIVE.url,{
    method:'post',
    contentType:'application/json',
    payload:JSON.stringify(req),
    headers:{Authorization:'Bearer '+token},
    muteHttpExceptions:true,
    followRedirects:false
  });
  const status=result.getResponseCode();
  let parsed;
  try{parsed=JSON.parse(result.getContentText())}catch(e){
    throw new Error('Köprüden JSON yanıtı alınamadı (HTTP '+status+').');
  }
  if(status!==200 || parsed.ok!==true){
    throw new Error('ESC sunucu bağlantısı başarısız (HTTP '+status+'): '+
      String(parsed.error||'unknown'));
  }
  return parsed.data||{};
}

function escLiveActive_(){
  return PropertiesService.getScriptProperties()
    .getProperty(ESC_LIVE.enabledKey)==='AÇIK';
}
function escLiveAssertAccount_(){
  const address=String(Session.getEffectiveUser().getEmail()||'')
    .trim().toLowerCase();
  if(address!==ESC_LIVE.sender){
    throw new Error('Yanlış Gmail hesabı ('+address+'). '+
      ESC_LIVE.sender+' hesabından çalıştırılmalı. Gönderim yapılmadı.');
  }
}
function escLiveAlert_(err){
  try{
    if(MailApp.getRemainingDailyQuota()<=0)return;
    const props=PropertiesService.getScriptProperties();
    const key='ESC_LIVE_ALERT_DATE';
    const today=Utilities.formatDate(new Date(),'Europe/Istanbul','yyyyMMdd');
    if(props.getProperty(key)===today)return;
    MailApp.sendEmail({
      to:ESC_LIVE.sender,
      subject:'[ESC] Canlı e-posta otomasyonu kontrol gerekli',
      body:'Hata: '+String(err).slice(0,800)+
        '\n\nApps Script > Yürütmeler ve ESC yönetim panelini kontrol edin.',
      name:ESC_LIVE.name
    });
    props.setProperty(key,today);
  }catch(e){Logger.log('Yönetici uyarısı gönderilemedi: '+String(e))}
}
