/**
 * Eryaman Speaking Club — private-lesson Gmail delivery worker.
 *
 * Safe to paste into the existing ESC Google Apps Script project, or a new
 * project owned by eryamanspeakingclub@gmail.com.
 *
 * Script Properties (never put the token in repository code):
 *   ESC_EMAIL_BRIDGE_URL = https://bshzakigvtyjilolsfjp.supabase.co/functions/v1/esc-email-bridge
 *   ESC_EMAIL_BRIDGE_TOKEN = the bridge token installed server-side
 *
 * Set up by running escLessonMailHealth() and escInstallLessonMailTrigger()
 * once, and accepting Google's authorization prompt.
 *
 * 5-minute clock trigger calls escLessonMailWorker. The Google account
 * that authorizes it is the sender. MailApp acceptance is NOT proof that
 * the recipient's inbox has delivered it.
 */
const ESC_LESSON_NOTIFY_TO = 'eryamanspeakingclub@gmail.com';

function escLessonMailWorker() {
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(5000))return; // never run two sends in parallel
  try{
    const props=PropertiesService.getScriptProperties();
    const endpoint=props.getProperty('ESC_EMAIL_BRIDGE_URL');
    const token=props.getProperty('ESC_EMAIL_BRIDGE_TOKEN');
    escRequireLessonMailSetup_(endpoint,token);
    const left=MailApp.getRemainingDailyQuota();
    if(left<=0){
      console.log('ESC lesson notifications: daily Gmail send quota reached.');
      return; // Do not claim items when they cannot be sent.
    }
    const claimed=escLessonBridgeCall_(endpoint,token,{
      action:'lesson_claim',limit:Math.min(15,left)
    });
    const items=(claimed.data&&claimed.data.items)||[];
    for(const item of items){
      const recipient=String(item.recipient||'').trim();
      const id=Number(item.id);
      const queue=String(item.queue||'');
      const validQueue=(queue==='lesson'||queue==='alternative');
      if(!validQueue||!Number.isSafeInteger(id)||id<=0||
         !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)){
        // Don't send malformed/unknown queue records, record a failure.
        if(validQueue&&Number.isSafeInteger(id)&&id>0){
          escLessonBridgeCall_(endpoint,token,{
            action:'lesson_ack',queue,id,delivered:false,
            error:'Invalid recipient or queue item'
          });
        }
        continue;
      }
      try {
        MailApp.sendEmail({
          to:recipient,
          subject:String(item.subject||'Eryaman Speaking Club - Özel ders bildirimi').slice(0,160),
          body:String(item.body||'').replace(/\\n/g,'\n'),
          name:'Eryaman Speaking Club',
          replyTo:ESC_LESSON_NOTIFY_TO
        });
        // Gmail accepted the send request. This is not recipient inbox proof.
        escLessonBridgeCall_(endpoint,token,{
          action:'lesson_ack',queue,id,delivered:true
        });
        console.log('ESC lesson email accepted by Gmail: '+queue+' #'+id);
      }catch(error){
        const explanation=String(error&&error.message||error).slice(0,250);
        console.error('ESC Gmail send/ack error for '+queue+' #'+id+': '+explanation);
        // If Gmail sent successfully but the acknowledgment failed, the
        // item stays "sending", then becomes "uncertain" for human review.
        try{escLessonBridgeCall_(endpoint,token,{
          action:'lesson_ack',queue,id,delivered:false,error:explanation
        });}catch(ackError){
          console.error('ESC ack failed: '+String(ackError).slice(0,180));
        }
      }
    }
    console.log('ESC lesson worker processed '+items.length+' item(s).');
  }finally{
    lock.releaseLock();
  }
}
function escLessonBridgeCall_(url,token,body){
  const response=UrlFetchApp.fetch(url,{
    method:'post',
    contentType:'application/json',
    headers:{Authorization:'Bearer '+token},
    payload:JSON.stringify(body),
    muteHttpExceptions:true,
    followRedirects:false
  });
  const status=response.getResponseCode();
  let data;
  try{data=JSON.parse(response.getContentText());}
  catch{throw Error('Invalid bridge response (HTTP '+status+')');}
  if(status!==200||!data.ok){
    throw Error('ESC bridge HTTP '+status+': '+String(data.error||'unknown'));
  }
  return data;
}
function escRequireLessonMailSetup_(url,token){
  if(!/^https:\/\/bshzakigvtyjilolsfjp\.supabase\.co\/functions\/v1\/esc-email-bridge$/.test(url||'')){
    throw Error('ESC_EMAIL_BRIDGE_URL Script Property is missing/incorrect.');
  }
  if(!/^[A-Za-z0-9_-]{48,128}$/.test(token||'')){
    throw Error('ESC_EMAIL_BRIDGE_TOKEN Script Property is missing/invalid.');
  }
}
function escLessonMailHealth(){
  const p=PropertiesService.getScriptProperties();
  const endpoint=p.getProperty('ESC_EMAIL_BRIDGE_URL');
  const token=p.getProperty('ESC_EMAIL_BRIDGE_TOKEN');
  escRequireLessonMailSetup_(endpoint,token);
  const report=escLessonBridgeCall_(endpoint,token,{action:'health'});
  console.log(JSON.stringify(report.data)); // no token in logs
  return report.data;
}
function escInstallLessonMailTrigger(){
  const handler='escLessonMailWorker';
  const triggers=ScriptApp.getProjectTriggers();
  if(triggers.some(trigger=>trigger.getHandlerFunction()===handler)){
    console.log('ESC lesson mail trigger is already installed.');
    return;
  }
  ScriptApp.newTrigger(handler).timeBased().everyMinutes(5).create();
  console.log('ESC lesson mail 5-minute trigger installed.');
}
function escLessonSendTest(){
  // Send one real test email after authenticating Apps Script.
  // Check both sender's Sent folder and recipient Inbox/Spam.
  MailApp.sendEmail({
    to:ESC_LESSON_NOTIFY_TO,
    subject:'ESC özel ders e-posta sistemi TEST',
    body:'Bu test mesajı Gmail Apps Script üzerinden gönderildi.\n'+
      'Test tarihi: '+new Date().toISOString()+'\n'+
      'Öğrenci rezervasyonlarını kontrol etmek için:\n'+
      'https://eryamanspeakingclub.com/ozel-dersler/yonetim/',
    name:'Eryaman Speaking Club'
  });
  console.log('Test send accepted by Gmail. Verify inbox separately.');
}
