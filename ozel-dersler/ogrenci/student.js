import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/+esm';

const config=window.ESC_SUPABASE_CONFIG || {};
const studentApi=(config.url||'')+'/functions/v1/esc-lesson-student';
const publicApi=(config.url||'')+'/functions/v1/esc-private-lessons';
const siteUrl=location.origin+'/ozel-dersler/ogrenci/';
const $=id=>document.getElementById(id);
const weekdays=['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
const pad=n=>String(n).padStart(2,'0');
const levelOptions=['A1','A2','B1','B2','C1+','unsure'];
const dateFormat=new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',day:'numeric',month:'long',year:'numeric'});
const timeFormat=new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
const dayFormat=new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',weekday:'long'});
let client,session=null,profile=null,bookings=[],timeRequests=[],currentTab='overview';
let authMode='login',recoveryMode=false,weekOffset=0,loadingWeek=false,sending=false,onboardingRequired=true;
let selected=new Map(),availabilityCache=new Map(),lastBookingReceipt=null;
const slotKey=(date,minute)=>date+'@'+minute;
const isoStamp=date=>new Date(date+'T12:00:00Z');
const toIso=d=>d.toISOString().slice(0,10);
const hourText=m=>pad(Math.floor(m/60))+':'+pad(m%60);
const prettyDate=date=>dateFormat.format(isoStamp(date));
const prettyTime=iso=>timeFormat.format(new Date(iso));
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function dateTodayIstanbul(){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const o=Object.fromEntries(parts.map(p=>[p.type,p.value]));
 return o.year+'-'+o.month+'-'+o.day;
}
function weekMonday(offset){
 const d=isoStamp(dateTodayIstanbul());
 const dow=d.getUTCDay()||7;
 d.setUTCDate(d.getUTCDate()-(dow-1)+offset*7);
 return toIso(d);
}
function isoPlus(date,days){const d=isoStamp(date);d.setUTCDate(d.getUTCDate()+days);return toIso(d);}
function message(id,value,error=false){const e=$(id);if(!e)return;e.textContent=value||'';e.classList.toggle('is-error',error);}
function friendly(error){
 const text=String(error?.message||error||'');
 if(/invalid login credentials|invalid_credentials/i.test(text))return 'E-posta veya şifre hatalı. Şifremi unuttum bağlantısını kullanabilirsin.';
 if(/email not confirmed/i.test(text))return 'Önce e-posta adresine gelen doğrulama bağlantısını aç.';
 if(/rate limit|too many requests/i.test(text))return 'Çok fazla işlem denendi. Biraz sonra tekrar dene.';
 if(/failed to fetch|network/i.test(text))return 'Sunucuya bağlanılamadı. Bağlantını kontrol et.';
 return text || 'İşlem tamamlanamadı.';
}
function setSending(value){
 sending=value;
 for(const id of ['submitBookings','newBookingButton','refreshLessons','logout','resendVerificationButton','sendLoginLink','resetPasswordButton']){
  const e=$(id);if(!e)continue;
  if(id==='submitBookings')e.disabled=value||!selected.size||!profile||onboardingRequired;
  else e.disabled=value;
 }
}

const validLessonFor=['self','child','family','other'];
const validAgeGroups=['6-12','13-17','18+'];
const validGoals=['Konuşma pratiği','Genel İngilizce','İş / Profesyonel İngilizce',
 'Akademik İngilizce','Sınav / okul desteği','Eğitim koçluğu'];

// Native radio inputs provide keyboard access. Hidden values keep the
// existing authenticated enrollment payload and backend validation unchanged.
function refreshChoiceCards(controlId){
 const field=document.querySelector('[data-choice-control="'+controlId+'"]');
 const source=$(controlId);
 if(!field||!source)return;
 const chosen=source.value;
 const relation=controlId.endsWith('Age')?$(controlId.slice(0,-3)+'For')?.value:'';
 for(const radio of field.querySelectorAll('input[type="radio"]')){
   // A minor cannot register as their own account holder. Use a parent/guardian
   // relation instead. Do not silently change a person's real age.
   const invalidForSelf=controlId.endsWith('Age') && relation==='self' && radio.value!=='18+';
   radio.disabled=invalidForSelf;
   radio.checked=radio.value===chosen&&!invalidForSelf;
   const card=radio.closest('.sp-choice-card');
   if(card){
     card.classList.toggle('is-selected',radio.checked);
     card.classList.toggle('is-disabled',invalidForSelf);
   }
 }
}
function focusChoice(prefix,key,explanation){
 const field=document.querySelector('[data-choice-control="'+prefix+key+'"]');
 if(field){
  field.classList.add('is-invalid');
  const first=field.querySelector('input[type="radio"]:not(:disabled)');
  first?.focus();
 }
 throw Error(explanation);
}
function toggleLearnerFields(prefix){
 const relation=$(prefix+'For').value;
 let age=$(prefix+'Age').value;
 if(relation==='self' && age && age!=='18+'){
   $(prefix+'Age').value='';
   age='';
 }
 const otherName=relation!=='' && relation!=='self';
 const ageMinor=age==='6-12'||age==='13-17';
 $(prefix+'LearnerWrap').hidden=!otherName;
 $(prefix+'Learner').required=otherName;
 if(!otherName)$(prefix+'Learner').value='';
 $(prefix+'GuardianWrap').hidden=!ageMinor;
 $(prefix+'Guardian').required=ageMinor;
 if(!ageMinor)$(prefix+'Guardian').checked=false;
 const ageHint=$(prefix+'AgeHelp');
 if(ageHint){
   if(relation==='self'){
     ageHint.dataset.state='notice';
     ageHint.textContent='Kendim için seçtin: 18 yaş ve üzeri grubunu kullanmalısın. 18 yaş altı öğrenci için veli/vasi Çocuğum için veya uygun başka kişi seçeneğiyle kayıt oluşturmalıdır.';
   }else if(ageMinor){
     ageHint.dataset.state='notice';
     ageHint.textContent='18 yaş altındaki öğrenci için veli veya yasal vasi onayı aşağıda istenecek. Hesap sahibi yetişkin olmalıdır.';
   }else{
     ageHint.dataset.state='neutral';
     ageHint.textContent='Yaş grubunu seç. 18 yaş altındaki öğrenciler için veli veya yasal vasi kaydı gerekir.';
   }
 }
 for(const key of ['For','Age','Level','Goal'])refreshChoiceCards(prefix+key);
}
function collectStudentDetails(prefix){
 const full_name=$(prefix+'Name').value.trim().replace(/\s+/g,' ');
 const lesson_for=$(prefix+'For').value;
 const learner_age_group=$(prefix+'Age').value;
 const learner_name=lesson_for==='self'?full_name:$(prefix+'Learner').value.trim().replace(/\s+/g,' ');
 const level=$(prefix+'Level').value;
 const goal=$(prefix+'Goal').value;
 const goal_detail=$(prefix+'GoalDetail').value.trim();
 const guardian_confirmed=$(prefix+'Guardian').checked;
 if(full_name.length<2||full_name.length>100)throw Error('Geçerli bir ad ve soyad gir.');
 if(!validLessonFor.includes(lesson_for))focusChoice(prefix,'For','Önce özel dersin kimin için olduğunu seç.');
 if(lesson_for==='self'&&learner_age_group!=='18+')
   focusChoice(prefix,'Age','Kendim için seçeneğinde yaş grubun 18 yaş ve üzeri olmalıdır. 18 yaş altı bir öğrenci için velisi veya yasal vasisi kayıt oluşturmalı.');
 if(!validAgeGroups.includes(learner_age_group))
   focusChoice(prefix,'Age','Öğrencinin yaş grubunu seç.');
 if(learner_name.length<2||learner_name.length>100)
   throw Error('Ders alacak kişinin adını ve soyadını gir.');
 if(!levelOptions.includes(level))
   focusChoice(prefix,'Level','Öğrencinin İngilizce seviyesini seç. Emin değilsen Seviyesini bilmiyorum seçeneğini kullan.');
 if(!validGoals.includes(goal))
   focusChoice(prefix,'Goal','Öğrencinin ders alma amacını seç.');
 if(goal_detail.length>500)throw Error('Hedef açıklaması en fazla 500 karakter olmalıdır.');
 if(learner_age_group!=='18+'&&!guardian_confirmed){
   $(prefix+'Guardian').focus();
   throw Error('18 yaşından küçük öğrenciler için veli veya yasal vasi onayı gereklidir.');
 }
 return {full_name,lesson_for,learner_name,learner_age_group,level,goal,goal_detail,guardian_confirmed};
}
function populateProfile(){
 const meta=session?.user?.user_metadata||{};
 const source=profile||meta;
 $('profileEmail').value=session?.user?.email||'';
 $('profileName').value=source.full_name||'';
 $('profileFor').value=validLessonFor.includes(source.lesson_for)?source.lesson_for:'';
 $('profileLearner').value=source.learner_name||'';
 $('profileAge').value=validAgeGroups.includes(source.learner_age_group)?source.learner_age_group:'';
 $('profileLevel').value=levelOptions.includes(source.level)?source.level:'';
 $('profileGoal').value=validGoals.includes(source.goal)?source.goal:'';
 $('profileGoalDetail').value=source.goal_detail||'';
 $('profileGuardian').checked=source.guardian_confirmed===true;
 toggleLearnerFields('profile');
 $('profileOnboardingIntro').hidden=!onboardingRequired;
 $('profileSaveButton').textContent=onboardingRequired?'Öğrenci kaydını tamamla':'Bilgilerimi güncelle';
}

function updateAuthMode(mode){
 authMode=mode;
 recoveryMode=mode==='recovery';
 $('loginForm').hidden=mode!=='login';
 $('registerForm').hidden=mode!=='register';
 $('recoveryForm').hidden=mode!=='recovery';
 const tabs=document.querySelector('.sp-auth-tabs');tabs.hidden=mode==='recovery';
 $('loginTabButton').classList.toggle('active',mode==='login');
 $('registerTabButton').classList.toggle('active',mode==='register');
 $('loginTabButton').setAttribute('aria-selected',String(mode==='login'));
 $('registerTabButton').setAttribute('aria-selected',String(mode==='register'));
 message('authMessage','');
}
function showAuth(){
 $('authLoading').hidden=true;
 $('dashboard').hidden=true;
 $('headerBooking').hidden=true;
 $('logout').hidden=true;
 $('authSection').hidden=false;
 updateAuthMode(recoveryMode?'recovery':authMode);
}
function showDashboard(){
 $('authLoading').hidden=true;
 $('authSection').hidden=true;
 $('dashboard').hidden=false;
 $('headerBooking').hidden=false;
 $('logout').hidden=false;
 $('verifiedEmailLabel').hidden=!Boolean(session?.user?.email_confirmed_at);
}
async function api(action,body){
 // Supabase Auth persists a refresh token across reloads. Re-read the
 // current session instead of relying on a stale access token in memory.
 const latest=await client.auth.getSession();
 if(latest.data?.session)session=latest.data.session;
 if(!session?.access_token)throw Error('Oturumunu yeniden açman gerekiyor.');
 for(let attempt=0;attempt<2;attempt++){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),18000);
  try{
   const res=await fetch(studentApi+'?action='+encodeURIComponent(action),{
    method:body===undefined?'GET':'POST',
    headers:{'Authorization':'Bearer '+session.access_token,'apikey':config.anonKey,
      ...(body===undefined?{}:{'Content-Type':'application/json'})},
    ...(body===undefined?{}:{body:JSON.stringify(body)}),
    signal:controller.signal
   });
   if(res.status===401&&attempt===0){
    const refreshed=await client.auth.refreshSession();
    if(!refreshed.data?.session)throw Error('Oturum süresi doldu. Güvenli şekilde yeniden giriş yap.');
    session=refreshed.data.session;
    continue;
   }
   let data;
   try{data=await res.json();}catch{throw Error('Sunucudan geçersiz yanıt alındı.');}
   if(!res.ok)throw Error(data.error||'İşlem başarısız oldu.');
   return data;
  }catch(error){
   if(error.name==='AbortError')throw Error('Bağlantı zaman aşımına uğradı. Tekrar deneyebilirsin, oturumun korunuyor.');
   throw error;
  }finally{clearTimeout(timeout);}
 }
 throw Error('İşlem tamamlanamadı.');
}
async function loadState(){
 const result=await api('state');
 profile=result.profile||null;
 bookings=Array.isArray(result.bookings)?result.bookings:[];
 timeRequests=Array.isArray(result.time_requests)?result.time_requests:[];
 $('sessionNotice').hidden=true;
 onboardingRequired=Boolean(result.onboarding_required)||!profile?.onboarding_completed;
 showDashboard();
 renderOverview();
 renderProfile();
 renderSelected();
 if(onboardingRequired){
   setTab('profile');
   message('profileMessage','Rezervasyondan önce öğrenci kaydını tamamla: ders kimin için, yaş grubu, İngilizce seviyesi ve ders alma amacı.',false);
 }else setTab(currentTab);
}
function setTab(tab){
 if(!session)return;
 if(onboardingRequired && tab!=='profile'){
   tab='profile';
   message('profileMessage','Ders takvimine geçmeden önce öğrenci kaydını tamamla.',false);
 }
 $('tabOverview').disabled=onboardingRequired;
 $('tabBooking').disabled=onboardingRequired;
 $('newBookingButton').disabled=onboardingRequired;
 $('headerBooking').disabled=onboardingRequired;
 currentTab=tab;
 try{sessionStorage.setItem('esc_student_tab',tab);}catch{}
 for(const key of ['overview','booking','profile']){
  const title=key[0].toUpperCase()+key.slice(1);
  $('view'+title).hidden=key!==tab;
  $('tab'+title).classList.toggle('active',key===tab);
  $('tab'+title).setAttribute('aria-selected',String(key===tab));
 }
 if(tab==='booking') void loadWeek();
 if(tab==='profile')renderProfile();
}
function statusLabel(status){
 return ({requested:'Onay bekleniyor',confirmed:'Onaylandı',cancelled:'İptal edildi',completed:'Tamamlandı'})[status]||status;
}
function meetUrl(url){return /^https:\/\/meet\.google\.com\/[a-z0-9-]+\/?$/.test(url||'')?url:null;}
function currentBookings(){
 return bookings.filter(b=>new Date(b.start_at).getTime()>Date.now()&&
     ['requested','confirmed'].includes(b.status)).sort((a,b)=>new Date(a.start_at)-new Date(b.start_at));
}
function renderBookingReceipt(){
 const box=$('bookingReceipt');
 if(!box)return;
 box.replaceChildren();
 box.hidden=!lastBookingReceipt;
 if(!lastBookingReceipt)return;
 const strong=document.createElement('strong');
 strong.textContent=lastBookingReceipt.count+' ders talebin sisteme kaydedildi.';
 const p=document.createElement('p');
 p.textContent='Rezervasyonların henüz öğretmen tarafından onaylanmadı. Durumu Derslerim alanından takip edebilirsin. Otomatik e-posta teslimatı henüz etkin değil.';
 box.append(strong,p);
 const list=document.createElement('ul');
 for(const slot of lastBookingReceipt.slots){
  const li=document.createElement('li');
  li.textContent=prettyDate(slot.date)+' · '+hourText(slot.minute);
  list.append(li);
 }
 box.append(list);
}

function renderTimeRequests(){
 const list=$('customTimeRequests');
 if(!list)return;
 list.replaceChildren();
 const requests=[...timeRequests].sort((a,b)=>b.preferred_date.localeCompare(a.preferred_date)||b.preferred_minute-a.preferred_minute);
 if(!requests.length){
  const empty=document.createElement('div');empty.className='sp-empty';
  empty.textContent='Henüz alternatif saat talebin bulunmuyor.';
  list.append(empty);return;
 }
 for(const r of requests){
  const card=document.createElement('article');card.className='sp-time-request-row';
  const info=document.createElement('div');
  const heading=document.createElement('strong');
  heading.textContent=prettyDate(r.preferred_date)+' · '+hourText(r.preferred_minute)+' · 50 dk';
  const badge=document.createElement('span');
  badge.className='sp-status '+(r.status==='pending'?'requested':r.status==='declined'?'cancelled':'completed');
  badge.textContent=({pending:'Öğretmen değerlendirmesinde',contacted:'İletişime geçildi',declined:'Uygun değil',cancelled:'İptal edildi'})[r.status]||r.status;
  const description=document.createElement('small');
  description.textContent=(r.learner_name||'Öğrenci')+' · Bu saat henüz kesinleşmiş bir ders değildir.';
  info.append(heading,description);card.append(info,badge);
  if(r.status==='pending'){
   const cancel=document.createElement('button');
   cancel.type='button';cancel.className='sp-cancel-button';cancel.textContent='Talebi geri çek';
   cancel.onclick=()=>cancelCustomTimeRequest(r.id);
   card.append(cancel);
  }
  list.append(card);
 }
}
async function cancelCustomTimeRequest(id){
 if(sending||!confirm('Bu alternatif ders saati talebini geri çekmek istiyor musun?'))return;
 try{
  setSending(true);
  await api('cancel_time_request',{id});
  await loadState();
 }catch(error){$('sessionNotice').hidden=false;$('sessionNoticeText').textContent=friendly(error);}
 finally{setSending(false);}
}
async function submitCustomTimeRequest(event){
 event.preventDefault();
 if(sending||onboardingRequired||!session)return;
 const date=$('timeRequestDate').value,minute=Number($('timeRequestHour').value);
 if(!$('timeRequestConsent').checked){
  message('timeRequestMessage','İletişim iznini onaylamalısın.',true);return;
 }
 try{
  setSending(true);
  $('timeRequestSubmit').disabled=true;
  message('timeRequestMessage','Alternatif saat talebin kaydediliyor...');
  const result=await api('time_request',{date,minute,notes:$('timeRequestNotes').value,consent:true});
  if(!result.ok)throw Error('Talebin kaydedilemedi.');
  $('timeRequestNotes').value='';$('timeRequestConsent').checked=false;
  message('timeRequestMessage','Talebin kaydedildi ve öğretmen paneline düştü. Ders henüz onaylanmadı; otomatik e-posta gönderimi aktif değil.');
  try{await loadState();}catch(err){
   // A successful create must not be reported as failed due to the subsequent refresh.
   $('sessionNotice').hidden=false;$('sessionNoticeText').textContent='Saat talebin kaydedildi ancak liste yenilenemedi. Oturumun açık.';
  }
 }catch(error){message('timeRequestMessage',friendly(error),true);}
 finally{setSending(false);$('timeRequestSubmit').disabled=false;}
}

function renderOverview(){
 renderBookingReceipt();
 renderTimeRequests();
 const upcoming=currentBookings();
 const confirmed=upcoming.filter(b=>b.status==='confirmed');
 const pending=upcoming.filter(b=>b.status==='requested');
 const completed=bookings.filter(b=>b.status==='completed');
 const display=profile?.full_name||session?.user?.user_metadata?.full_name||'';
 $('welcomeName').textContent=display?'Hoş geldin, '+display.split(/\s+/)[0]+'.':'Hoş geldin.';
 $('welcomeSubtitle').textContent=profile?'Derslerini planla, takip et ve katılım bağlantılarını buradan aç.':'Ders takvimin için önce profilini tamamla.';
 $('statUpcoming').textContent=String(confirmed.length);
 $('statRequested').textContent=String(pending.length);
 $('statCompleted').textContent=String(completed.length);
 const next=$('nextLesson');next.replaceChildren();
 if(upcoming.length){
  const lesson=upcoming[0],link=meetUrl(lesson.meeting_url),day=dateFormat.format(new Date(lesson.start_at));
  next.innerHTML='<div class="sp-featured"><div><span class="sp-kicker">GÜLSÜM YAĞMUR AKDENİZ · 60 DAKİKA</span>'+
   '<h4>'+esc(day)+' · '+esc(prettyTime(lesson.start_at))+' · 50 dakika</h4>'+
   '<p>'+(lesson.full_name?'Öğrenci: '+esc(lesson.full_name)+' · ':'')+(lesson.status==='confirmed'?'Ders onaylandı. Katılım bağlantısına buradan ulaşabilirsin.':'Talep alındı. Yağmur’un onayı bekleniyor.')+
   '</p></div><div>'+ (lesson.status==='confirmed'&&link?
     '<a class="sp-primary-button" target="_blank" rel="noopener noreferrer" href="'+esc(link)+'">Google Meet’e katıl ↗</a>':
     '<span class="sp-status '+esc(lesson.status)+'">'+esc(statusLabel(lesson.status))+'</span>')+'</div></div>';
 }else{
  next.innerHTML='<div class="sp-empty">Yaklaşan dersin bulunmuyor. Yeni ders seçerek kendi haftalık programını oluşturabilirsin.<div><button type="button" class="sp-primary-button" id="emptyBooking">+ Ders seç</button></div></div>';
  $('emptyBooking')?.addEventListener('click',()=>setTab(profile?'booking':'profile'));
 }
 const upList=$('upcomingLessons');upList.replaceChildren();
 if(!upcoming.length){upList.innerHTML='<div class="sp-empty">Henüz kayıtlı ileri tarihli dersin yok.</div>';}
 for(const lesson of upcoming)upList.append(renderLessonCard(lesson));
 const history=bookings.filter(b=>!upcoming.includes(b)).sort((a,b)=>new Date(b.start_at)-new Date(a.start_at)).slice(0,20);
 const historyList=$('historyLessons');historyList.replaceChildren();
 if(!history.length)historyList.innerHTML='<div class="sp-empty">Geçmiş ders kaydı henüz yok.</div>';
 for(const lesson of history)historyList.append(renderLessonCard(lesson));
}
function renderLessonCard(b){
 const date=new Date(b.start_at);
 const wrap=document.createElement('article');wrap.className='sp-lesson-card';
 const dayIcon=document.createElement('div');dayIcon.className='sp-date-icon';
 const strong=document.createElement('strong');strong.textContent=new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',day:'numeric'}).format(date);
 const month=document.createElement('small');month.textContent=new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',month:'short'}).format(date);
 dayIcon.append(strong,month);wrap.append(dayIcon);
 const info=document.createElement('div');info.className='sp-lesson-info';
 const title=document.createElement('strong');title.textContent=dayFormat.format(date)+' · '+prettyTime(b.start_at)+' · 50 dakika';
 const meta=document.createElement('small');meta.textContent='Öğrenci: '+(b.full_name||profile?.learner_name||'Kayıtlı öğrenci')+' · Gülsüm Yağmur Akdeniz · 50 dakika online birebir ders';
 const badge=document.createElement('span');badge.className='sp-status '+b.status;badge.textContent=statusLabel(b.status);
 info.append(title,meta,badge);wrap.append(info);
 const actions=document.createElement('div');actions.className='sp-lesson-actions';
 const link=meetUrl(b.meeting_url);
 if(b.status==='confirmed'&&link){
  const a=document.createElement('a');a.className='sp-meet-link';a.href=link;
  a.target='_blank';a.rel='noopener noreferrer';a.textContent='Derse katıl ↗';actions.append(a);
 }
 if(b.status==='requested'&&date.getTime()>Date.now()){
  const btn=document.createElement('button');btn.type='button';btn.className='sp-cancel-button';btn.textContent='Talebi iptal et';
  btn.onclick=()=>cancelLesson(b.id);actions.append(btn);
 }
 if(actions.childNodes.length)wrap.append(actions);
 return wrap;
}
function renderProfile(){
 if(!session)return;
 populateProfile();
}
async function cancelLesson(id){
 if(sending||!confirm('Bu ders talebini iptal etmek istiyor musun?'))return;
 try{setSending(true);await api('cancel',{id});await loadState();message('bookingMessage','Ders talebin iptal edildi.');}
 catch(error){message('bookingMessage',friendly(error),true);alert(friendly(error));}
 finally{setSending(false);}
}
async function loadWeek(force=false){
 if(loadingWeek)return;
 loadingWeek=true;
 const from=weekMonday(weekOffset),to=isoPlus(from,6);
 $('weekLabel').textContent=prettyDate(from)+' – '+prettyDate(to);
 $('prevWeek').disabled=weekOffset===0;
 $('nextWeek').disabled=weekOffset>=3;
 const grid=$('weekGrid');
 if(!availabilityCache.has(from)||force)grid.textContent='Takvim yükleniyor...';
 message('calendarNotice','');
 try{
  let days=availabilityCache.get(from);
  if(!days||force){
   const reply=await fetch(publicApi+'?action=availability&from='+from,
      {headers:{apikey:config.anonKey}});
   const payload=await reply.json();
   if(!reply.ok||!Array.isArray(payload.days))throw Error(payload.error||'Takvim şu anda yüklenemedi.');
   days=payload.days;availabilityCache.set(from,days);
  }
  renderCalendar(days);
  const freeSlots=days.reduce((n,d)=>n+(d.slots||[]).filter(slot=>slot.free).length,0);
  if(!freeSlots)message('calendarNotice','Bu hafta müsait saat bulunmuyor. Aşağıdaki Alternatif saat iste bölümünden tercih ettiğin tarih ve saati önerebilirsin.');
 }catch(error){grid.innerHTML='<p class="sp-empty">Takvim yüklenemedi. Yeniden deneyin.</p>';message('calendarNotice',friendly(error),true);}
 finally{loadingWeek=false;}
}
function renderCalendar(days){
 const grid=$('weekGrid');grid.replaceChildren();
 for(const day of days){
  const d=isoStamp(day.date);
  const col=document.createElement('div');col.className='sp-week-column';
  const header=document.createElement('header');
  const dow=document.createElement('strong');dow.textContent=weekdays[(d.getUTCDay()+6)%7];
  const date=document.createElement('small');date.textContent=pad(d.getUTCDate())+'.'+pad(d.getUTCMonth()+1);
  header.append(dow,date);col.append(header);
  const slots=Array.isArray(day.slots)?day.slots:[];
  if(!slots.length){const small=document.createElement('small');small.textContent='Müsaitlik açılmadı';col.append(small);}
  for(const slot of slots){
   const key=slotKey(day.date,slot.minute);
   const button=document.createElement('button');button.type='button';button.className='sp-slot';
   button.textContent=hourText(slot.minute);
   const isSelected=selected.has(key);
   button.classList.toggle('is-selected',isSelected);
   button.classList.toggle('is-full',!slot.free && !isSelected);
   button.disabled=!slot.free && !isSelected;
   button.setAttribute('aria-pressed',String(isSelected));
   button.setAttribute('aria-label',prettyDate(day.date)+' '+button.textContent+(isSelected?' seçildi':slot.free?' müsait':' dolu'));
   button.onclick=()=>{
    if(selected.has(key)){selected.delete(key);}
    else{
     const allowed=Math.max(0,12-currentBookings().length);
     if(selected.size>=Math.min(12,allowed)){message('calendarNotice','Aktif derslerinle birlikte en fazla 12 dersin olabilir. Yeni ders kapasiten: '+allowed+'.',true);return;}
     selected.set(key,{date:day.date,minute:slot.minute});
     message('calendarNotice','');
    }
    button.classList.toggle('is-selected',selected.has(key));
    button.setAttribute('aria-pressed',String(selected.has(key)));
    renderSelected();
   };
   col.append(button);
  }
  grid.append(col);
 }
}
function renderSelected(){
 const items=[...selected.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.minute-b.minute);
 $('selectedCount').textContent=String(items.length);
 const allowance=Math.max(0,12-currentBookings().length);
 $('bookingAllowance').textContent=allowance+' yeni ders talebi daha oluşturabilirsin (toplam en fazla 12 ileri tarihli aktif ders).';
 const holder=$('selectedSlots');holder.replaceChildren();
 if(!items.length){const p=document.createElement('p');p.className='sp-smallprint';p.textContent='Henüz saat seçmedin. Takvimden müsait saatlere dokun.';holder.append(p);}
 for(const item of items){
  const row=document.createElement('div');row.className='sp-selected-slot';
  const text=document.createElement('span');text.textContent=prettyDate(item.date)+' · '+hourText(item.minute);
  const remove=document.createElement('button');remove.type='button';remove.setAttribute('aria-label','Bu saati kaldır');remove.textContent='×';
  remove.onclick=()=>{selected.delete(slotKey(item.date,item.minute));renderSelected();const days=availabilityCache.get(weekMonday(weekOffset));if(days)renderCalendar(days);};
  row.append(text,remove);holder.append(row);
 }
 $('submitBookings').disabled=sending||!items.length||!profile||items.length>allowance;
 $('repeatWeekly').disabled=sending||repeatingWeeks||!items.length;
 $('submitBookings').textContent=items.length?'Seçtiğim '+items.length+' ders için talep gönder':'Önce ders saati seç';
}
let repeatingWeeks=false;
async function repeatWeeklySelections(){
 if(repeatingWeeks||sending)return;
 const original=[...selected.values()];
 if(!original.length){
  message('calendarNotice','Önce tekrarlamak istediğin en az bir saat seç.',true);
  return;
 }
 repeatingWeeks=true;
 $('repeatWeekly').disabled=true;
 message('calendarNotice','Sonraki haftaların müsaitliği kontrol ediliyor...');
 try{
  const lastDate=isoPlus(weekMonday(3),6);
  const candidates=[];
  const mondayFor=date=>{
   const d=isoStamp(date);
   d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));
   return toIso(d);
  };
  for(const item of original){
   for(let offset=7;offset<=21;offset+=7){
    const date=isoPlus(item.date,offset),key=slotKey(date,item.minute);
    if(date<=lastDate && !selected.has(key))
      candidates.push({date,minute:item.minute,from:mondayFor(date),key});
   }
  }
  const weeks=[...new Set(candidates.map(x=>x.from))];
  await Promise.all(weeks.map(async from=>{
   if(availabilityCache.has(from))return;
   const reply=await fetch(publicApi+'?action=availability&from='+from,
      {headers:{apikey:config.anonKey}});
   const payload=await reply.json();
   if(!reply.ok||!Array.isArray(payload.days))throw Error('Haftalık müsaitlik sorgulanamadı.');
   availabilityCache.set(from,payload.days);
  }));
  let added=0;
  const allowance=Math.max(0,12-currentBookings().length);
  for(const item of candidates){
   if(selected.size>=Math.min(12,allowance))break;
   const day=availabilityCache.get(item.from)?.find(d=>d.date===item.date);
   const isFree=day?.slots?.some(slot=>slot.minute===item.minute&&slot.free===true);
   if(isFree && !selected.has(item.key)){
    selected.set(item.key,{date:item.date,minute:item.minute});
    added++;
   }
  }
  renderSelected();
  const displayed=availabilityCache.get(weekMonday(weekOffset));
  if(displayed)renderCalendar(displayed);
  message('calendarNotice',added?
    added+' yeni müsait saat eklendi. Onaylamak için sağdaki ders sepetini kullan.':
    'Sonraki haftalarda aynı saatte ek müsait ders bulunamadı.');
 }catch(error){message('calendarNotice',friendly(error),true);}
 finally{repeatingWeeks=false;$('repeatWeekly').disabled=!selected.size;}
}
async function submitBatch(){
 if(sending)return;
 if(!profile||onboardingRequired){
  setTab('profile');
  message('profileMessage','Ders talebinden önce öğrenci kaydını tamamla.',true);
  return;
 }
 if(!selected.size){
  message('bookingMessage','En az bir saat seçmelisin.',true);return;
 }
 if(selected.size>Math.max(0,12-currentBookings().length)){
  message('bookingMessage','Aktif derslerinle birlikte en fazla 12 ileri tarihli ders talebi bulunabilir.',true);
  return;
 }
 if(!$('bookingConsent').checked){
  message('bookingMessage','İletişim iznini işaretlemelisin.',true);return;
 }
 const items=[...selected.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.minute-b.minute);
 try{
  setSending(true);
  message('bookingMessage',items.length+' ders talebin kaydediliyor...');
  // Request success is authoritative. A subsequent failed refresh must never
  // falsely report that the already-inserted bookings were not saved.
  const result=await api('reserve',{slots:items,notes:$('bookingNotes').value,consent:true});
  if(!result.ok)throw Error('Ders talepleri kaydedilemedi.');
  lastBookingReceipt={count:result.count,slots:items};
  selected.clear();availabilityCache.clear();
  $('bookingNotes').value='';$('bookingConsent').checked=false;
  try{
   currentTab='overview';
   await loadState();
  }catch(error){
   setTab('overview');
   message('bookingMessage','Ders talebin kaydedildi ancak liste yenilenemedi. Derslerim sekmesinden yenilemeyi dene.',true);
  }
  renderBookingReceipt();
 }catch(error){
  availabilityCache.clear();
  message('bookingMessage',friendly(error),true);
  try{await loadWeek(true);}catch{ /* keep the original error visible */}
 }finally{
  setSending(false);renderSelected();
 }
}
async function signIn(event){
 event.preventDefault();
 if(sending)return;
 try{
  setSending(true);message('authMessage','Giriş yapılıyor...');
  const {data,error}=await client.auth.signInWithPassword({
   email:$('loginEmail').value.trim(),password:$('loginPassword').value
  });
  if(error)throw error;
  if(!data.session)throw Error('Giriş oturumu oluşturulamadı.');
  session=data.session;$('loginPassword').value='';
  await loadState();
 }catch(error){
  if(session?.access_token){
   showDashboard();renderOverview();renderProfile();renderSelected();
   setTab('profile');
   $('sessionNotice').hidden=false;
   $('sessionNoticeText').textContent='Giriş başarılı, fakat öğrenci bilgileri şu anda yüklenemiyor. Yeniden bağlan ile devam et: '+friendly(error);
  }else message('authMessage',friendly(error),true);
 }
 finally{setSending(false);}
}
async function signUp(event){
 event.preventDefault();
 if(sending)return;
 const password=$('registerPassword').value;
 if(password!==$('registerConfirm').value){
  message('authMessage','Şifreler eşleşmiyor.',true);return;
 }
 if(!$('registerConsent').checked){
  message('authMessage','Kayıt ve iletişim onayını işaretlemelisin.',true);return;
 }
 let details;
 try{details=collectStudentDetails('register');}
 catch(error){message('authMessage',friendly(error),true);return;}
 try{
  setSending(true);
  message('authMessage','Öğrenci hesabın oluşturuluyor...');
  const {data,error}=await client.auth.signUp({
   email:$('registerEmail').value.trim().toLowerCase(),password,
   options:{emailRedirectTo:siteUrl,data:details}
  });
  if(error)throw error;
  $('registerPassword').value='';
  $('registerConfirm').value='';
  if(data.session){
   session=data.session;
   await api('profile',details);
   currentTab='overview';
   await loadState();
   message('profileMessage','Öğrenci hesabın ve kayıt bilgilerin oluşturuldu.');
  }else{
   // Supabase may deliberately return an empty / obfuscated identity when
   // the email is already registered. Never claim delivery unconditionally.
   message('authMessage','Kayıt isteği işlendi. Yeni bir hesap açıldıysa doğrulama e-postası gönderilmesi istenmiştir. Bu adresle mevcut hesabın varsa yeniden onay gelmez: Giriş yap bölümünü kullan. E-posta gelmediyse Doğrulama e-postasını yeniden gönder seçeneğini deneyebilirsin.');
  }
 }catch(error){
  if(session?.access_token){
   showDashboard();renderProfile();renderSelected();
   setTab('profile');
   $('sessionNotice').hidden=false;
   $('sessionNoticeText').textContent='Hesabın açıldı, ancak kayıt bilgileri henüz tamamlanamadı. Yeniden dene: '+friendly(error);
  }else message('authMessage',friendly(error),true);
 }finally{setSending(false);}
}
async function resendVerificationEmail(){
 if(sending)return;
 const email=$('registerEmail').value.trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
  message('authMessage','Doğrulama için önce geçerli e-posta adresini yaz.',true);return;
 }
 try{
  setSending(true);
  message('authMessage','Doğrulama e-postası tekrar isteniyor...');
  const {error}=await client.auth.resend({
    type:'signup', email,
    options:{emailRedirectTo:siteUrl}
  });
  if(error)throw error;
  message('authMessage','Doğrulama e-postasını yeniden gönderme isteği Supabase tarafından kabul edildi. Gelen Kutusu, Spam ve Tanıtımlar klasörlerini kontrol et. Bu adres zaten doğrulanmışsa yeniden onay mesajı gerekmiyor; giriş yap.');
 }catch(error){
  const raw=String(error?.message||'');
  if(/already confirmed|email.*confirm|already registered|signup is disabled/i.test(raw)){
    message('authMessage','Bu e-posta adresindeki hesap zaten doğrulanmış olabilir. Kayıt yerine Giriş yap bölümünü seç.',false);
  }else{
    message('authMessage',friendly(error),true);
  }
 }finally{setSending(false);}
}
async function sendEmailLoginLink(){
 if(sending)return;
 const email=$('loginEmail').value.trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
  message('authMessage','Önce hesabına ait e-posta adresini yaz.',true);return;
 }
 try{
  setSending(true);
  message('authMessage','Tek kullanımlık giriş bağlantısı isteniyor...');
  const {error}=await client.auth.signInWithOtp({
   email,
   options:{shouldCreateUser:false,emailRedirectTo:siteUrl}
  });
  if(error)throw error;
  message('authMessage','Giriş bağlantısı gönderme isteği kabul edildi. Bu, yeni hesap onayı değildir; e-posta ile giriş yapmanı sağlar. Gelen Kutusu, Spam ve Tanıtımlar klasörlerini kontrol et.');
 }catch(error){
  message('authMessage',friendly(error),true);
 }finally{setSending(false);}
}

async function resetPassword(){
 if(sending)return;
 const email=$('loginEmail').value.trim();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
  message('authMessage','Önce geçerli e-posta adresini gir.',true);return;
 }
 try{
  setSending(true);message('authMessage','Şifre yenileme bağlantısı hazırlanıyor...');
  const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:siteUrl});
  if(error)throw error;
  message('authMessage','Şifre yenileme isteği alındı. E-posta kutunu ve spam klasörünü kontrol et.');
 }catch(error){message('authMessage',friendly(error),true);}
 finally{setSending(false);}
}
async function savePassword(event){
 event.preventDefault();if(sending)return;
 const password=$('newPassword').value;
 if(password!==$('newPasswordAgain').value){
  message('authMessage','Şifreler eşleşmiyor.',true);return;
 }
 try{
  setSending(true);
  const {error}=await client.auth.updateUser({password});
  if(error)throw error;
  await client.auth.signOut();
  session=null;recoveryMode=false;authMode='login';
  history.replaceState({},'',location.pathname);
  showAuth();
  message('authMessage','Şifren kaydedildi. Şimdi yeni şifrenle giriş yapabilirsin.');
 }catch(error){message('authMessage',friendly(error),true);}
 finally{setSending(false);}
}
async function saveProfile(event){
 event.preventDefault();if(sending)return;
 let details;
 try{details=collectStudentDetails('profile');}
 catch(error){message('profileMessage',friendly(error),true);return;}
 try{
  setSending(true);message('profileMessage','Öğrenci bilgilerin kaydediliyor...');
  await api('profile',details);
  profile={...details,onboarding_completed:true};
  onboardingRequired=false;
  try{await loadState();}catch(error){
   $('sessionNotice').hidden=false;
   $('sessionNoticeText').textContent='Öğrenci kaydın kaydedildi. Liste yenilenemedi: '+friendly(error);
  }
  setTab('booking');
  message('bookingMessage','Öğrenci kaydın tamamlandı. Artık müsait saatlerden ders seçebilirsin.');
 }catch(error){message('profileMessage',friendly(error),true);}
 finally{setSending(false);}
}
async function logout(){
 if(sending)return;
 await client.auth.signOut();session=null;profile=null;bookings=[];timeRequests=[];
 selected.clear();availabilityCache.clear();lastBookingReceipt=null;currentTab='overview';recoveryMode=false;onboardingRequired=true;
 showAuth();message('authMessage','Çıkış yaptın.');
}
function bindEvents(){
 $('loginTabButton').onclick=()=>updateAuthMode('login');
 $('registerTabButton').onclick=()=>updateAuthMode('register');
 $('loginForm').addEventListener('submit',signIn);
 $('registerForm').addEventListener('submit',signUp);
 $('resetPasswordButton').onclick=resetPassword;
 $('resendVerificationButton').onclick=resendVerificationEmail;
 $('sendLoginLink').onclick=sendEmailLoginLink;
 $('recoveryForm').addEventListener('submit',savePassword);
 $('profileForm').addEventListener('submit',saveProfile);
 for(const field of document.querySelectorAll('[data-choice-control]')){
   field.addEventListener('change',event=>{
     const radio=event.target;
     if(!radio?.matches?.('input[type="radio"]'))return;
     const controlId=field.dataset.choiceControl;
     const source=$(controlId);
     if(!source||radio.disabled)return;
     source.value=radio.value;
     field.classList.remove('is-invalid');
     refreshChoiceCards(controlId);
     source.dispatchEvent(new Event('change',{bubbles:true}));
   });
 }
 for(const prefix of ['register','profile']){
   $(prefix+'For').addEventListener('change',()=>toggleLearnerFields(prefix));
   $(prefix+'Age').addEventListener('change',()=>toggleLearnerFields(prefix));
 }
 toggleLearnerFields('register');
 toggleLearnerFields('profile');
 $('logout').onclick=logout;
 $('headerBooking').onclick=()=>setTab(profile?'booking':'profile');
 $('newBookingButton').onclick=()=>setTab(profile?'booking':'profile');
 $('tabOverview').onclick=()=>setTab('overview');
 $('tabBooking').onclick=()=>setTab('booking');
 $('tabProfile').onclick=()=>setTab('profile');
 $('refreshLessons').onclick=async()=>{
  try{await loadState();}catch(error){message('bookingMessage',friendly(error),true);}
 };
 $('prevWeek').onclick=()=>{if(weekOffset>0&&!loadingWeek){weekOffset--;void loadWeek();}};
 $('nextWeek').onclick=()=>{if(weekOffset<3&&!loadingWeek){weekOffset++;void loadWeek();}};
 $('clearSelected').onclick=()=>{
  selected.clear();renderSelected();
  const days=availabilityCache.get(weekMonday(weekOffset));
  if(days)renderCalendar(days);
 };
 $('submitBookings').onclick=submitBatch;
 $('timeRequestForm').addEventListener('submit',submitCustomTimeRequest);
 $('retrySession').addEventListener('click',async()=>{
  $('retrySession').disabled=true;
  try{await loadState();}catch(e){$('sessionNotice').hidden=false;$('sessionNoticeText').textContent='Bağlantı hâlâ kurulamıyor: '+friendly(e);}
  finally{$('retrySession').disabled=false;}
 });
 $('repeatWeekly').onclick=repeatWeeklySelections;
 const dateField=$('timeRequestDate');
 const today=dateTodayIstanbul();
 dateField.min=today;
 dateField.max=isoPlus(today,56);
 dateField.value=isoPlus(today,1);
 for(let hour=8;hour<=21;hour++){
  const option=document.createElement('option');option.value=String(hour*60);
  option.textContent=pad(hour)+':00';$('timeRequestHour').append(option);
 }
 $('timeRequestHour').value=String(18*60);
 $('weekGrid').addEventListener('keydown',event=>{
  if(event.key==='Escape'){selected.clear();renderSelected();const days=availabilityCache.get(weekMonday(weekOffset));if(days)renderCalendar(days);}
 });
}
async function boot(){
 bindEvents();
 renderSelected();
 if(!config.url||!config.anonKey){
  showAuth();message('authMessage','Giriş hizmeti yapılandırılamadı.',true);return;
 }
 client=createClient(config.url,config.anonKey,{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
 });
 try{
  const tab=sessionStorage.getItem('esc_student_tab');
  if(['overview','booking','profile'].includes(tab))currentTab=tab;
 }catch{}
 const params=new URLSearchParams(location.hash.slice(1));
 recoveryMode=params.get('type')==='recovery'||new URLSearchParams(location.search).get('type')==='recovery';
 if(recoveryMode){authMode='recovery';showAuth();}
 client.auth.onAuthStateChange((event,newSession)=>{
  if(event==='PASSWORD_RECOVERY'){
   recoveryMode=true;authMode='recovery';session=newSession;showAuth();
   message('authMessage','Bağlantı doğrulandı. Yeni şifreni belirle.');
  }else if(event==='TOKEN_REFRESHED'){
   session=newSession;
  }else if(event==='SIGNED_OUT'){
   session=null;
   if(!recoveryMode)showAuth();
  }
 });
 let auth;
 try{auth=await client.auth.getSession();}
 catch(error){showAuth();message('authMessage','Oturum doğrulama isteği başarısız oldu: '+friendly(error),true);return;}
 session=auth.data?.session||null;
 if(recoveryMode){showAuth();return;}
 if(!session){showAuth();return;}
 // Never send an authenticated visitor back to the login page for
 // transient Edge Function/network errors. Keep the valid session intact.
 try{await loadState();}
 catch(error){
  showDashboard();
  renderOverview();
  renderProfile();
  renderSelected();
  setTab('profile');
  $('sessionNotice').hidden=false;
  $('sessionNoticeText').textContent='Oturumun açık, ancak bilgiler yüklenemedi. Yeniden bağlan ile tekrar dene: '+friendly(error);
 }
}
boot().catch(error=>message('authMessage',friendly(error),true));