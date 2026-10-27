
import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/+esm';

const cfg = window.ESC_SUPABASE_CONFIG || {};
const API = (cfg.url || '') + '/functions/v1/esc-private-lessons?action=admin';
const DEFAULT_EMAIL = 'eryamanspeakingclub@gmail.com';
const el = id => document.getElementById(id);
const dayNames = ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];
const two = n => String(n).padStart(2,'0');
const hourText = min => two(Math.floor(min / 60))+':'+two(min%60);
let client = null;
let session = null;
let snapshot = null;
let recoveryMode = false;
let busy = false;

// Optimistic slot editor: keep user selections locally and send one batched request.
const slotButtons = new Map();
const slotDesired = new Map();
const slotQueue = new Map();
let slotSaving = false;
let slotSaveTimer = null;
let slotSaveError = false;
let activeSlotBatch = [];

const slotKey = (weekday,minute) => weekday+':'+minute;
const savedSlotEnabled = (weekday,minute) =>
  !!snapshot?.rules?.some(r => r.weekday===weekday && r.start_minute===minute && r.enabled);
const currentSlotEnabled = (weekday,minute) => {
  const key = slotKey(weekday,minute);
  return slotDesired.has(key) ? slotDesired.get(key) : savedSlotEnabled(weekday,minute);
};
const slotUnsaved = () => slotQueue.size>0 || slotSaving || slotDesired.size>0;

function showSlotSaveState() {
  const status = el('slotSaveStatus');
  const retry = el('retrySlots');
  if (!status || !retry) return;
  const count = slotDesired.size;
  if (slotSaveError) {
    status.textContent = count+' saat değişikliği kaydedilemedi. Seçimleriniz korunuyor; tekrar deneyin.';
    status.dataset.state = 'error';
    retry.hidden = false;
  } else if (count || slotSaving || slotQueue.size) {
    status.textContent = 'Değişiklikler arka planda kaydediliyor ('+Math.max(count,slotQueue.size+activeSlotBatch.length)+' saat)…';
    status.dataset.state = 'saving';
    retry.hidden = true;
  } else {
    status.textContent = 'Tüm müsaitlik değişiklikleri kaydedildi.';
    status.dataset.state = 'saved';
    retry.hidden = true;
  }
}
function updateSlotButton(weekday,minute) {
  const key = slotKey(weekday,minute);
  const button = slotButtons.get(key);
  if (!button) return;
  const enabled = currentSlotEnabled(weekday,minute);
  button.classList.toggle('active',enabled);
  button.classList.toggle('pending',slotDesired.has(key));
  button.setAttribute('aria-pressed',String(enabled));
  button.title = (enabled ? 'Bu saati kapat' : 'Bu saati aç')+(slotDesired.has(key) ? ' (kaydediliyor)' : '');
}
function scheduleSlotSave() {
  showSlotSaveState();
  if (slotSaveError || slotSaving) return;
  if (slotSaveTimer) clearTimeout(slotSaveTimer);
  slotSaveTimer=setTimeout(()=>{
    slotSaveTimer=null;
    void flushSlotChanges();
  },450);
}
function toggleSlot(weekday,minute) {
  if (busy || !snapshot) return;
  const key=slotKey(weekday,minute);
  const enabled = !currentSlotEnabled(weekday,minute);
  slotDesired.set(key,enabled);
  slotQueue.set(key,{weekday,minute,enabled});
  updateSlotButton(weekday,minute);  // immediate feedback, no calendar refresh
  // Any new edit is a fresh reason to attempt saving again.
  if (slotSaveError) slotSaveError=false;
  scheduleSlotSave();
}
async function flushSlotChanges() {
  if (slotSaving || !slotQueue.size || slotSaveError) return;
  if (slotSaveTimer){clearTimeout(slotSaveTimer);slotSaveTimer=null;}
  activeSlotBatch=[...slotQueue.values()];
  slotQueue.clear();
  slotSaving=true;
  showSlotSaveState();
  try {
    const result = await api({op:'slots_bulk',changes:activeSlotBatch});
    if (result.ok!==true || result.saved!==activeSlotBatch.length)
      throw new Error('Sunucunun kayıt onayı alınamadı.');
    // Only the slots in this batch change in the authoritative snapshot.
    for (const item of activeSlotBatch) {
      const existing = snapshot.rules.find(r=>r.weekday===item.weekday && r.start_minute===item.minute);
      if (existing) existing.enabled=item.enabled;
      else snapshot.rules.push({weekday:item.weekday,start_minute:item.minute,enabled:item.enabled});
    }
    // If newer clicks were made during the request, preserve their values.
    for (const [key,change] of slotQueue) {
      if (change.enabled===savedSlotEnabled(change.weekday,change.minute))slotQueue.delete(key);
    }
    for (const [key] of slotDesired) {
      const parts=key.split(':').map(Number);
      if (!slotQueue.has(key) && slotDesired.get(key)===savedSlotEnabled(parts[0],parts[1]))slotDesired.delete(key);
    }
    for (const item of activeSlotBatch) updateSlotButton(item.weekday,item.minute);
    slotSaveError=false;
  } catch(error) {
    // Do not erase the user's edits on network/DB failure.
    for (const item of activeSlotBatch) {
      const key=slotKey(item.weekday,item.minute);
      if (!slotQueue.has(key)) {
        slotQueue.set(key,{...item,enabled:slotDesired.get(key)??item.enabled});
      }
    }
    slotSaveError=true;
    notice('Müsaitlik saatleri sunucuya kaydedilemedi. Tekrar dene butonunu kullan.',true);
  } finally {
    slotSaving=false;
    activeSlotBatch=[];
    showSlotSaveState();
    if (!slotSaveError && slotQueue.size) scheduleSlotSave();
  }
}
async function retrySlotChanges() {
  if (slotSaving || !slotQueue.size) return;
  slotSaveError=false;
  showSlotSaveState();
  await flushSlotChanges();
}


function notice(message, error = false) {
  const box = el('msg');
  box.textContent = message;
  box.style.color = error ? '#b43143' : '#16687b';
}
function setBusy(value) {
  busy = value;
  for (const id of ['signIn','forgot','signOut','reload','saveRecipient','block','unblock','savePassword']) {
    if (el(id)) el(id).disabled = value;
  }
}
function recoverUrl() {
  const parsed = new URL(location.href);
  return parsed.searchParams.get('type') === 'recovery'
    || parsed.hash.includes('type=recovery');
}
function setLoginVisibility() {
  const loggedIn = !!session && !recoveryMode;
  el('panel').hidden = !loggedIn || !snapshot;
  el('loginForm').hidden = loggedIn || recoveryMode;
  el('signOut').hidden = !loggedIn;
  el('recovery').hidden = !recoveryMode;
  el('loginCaption').textContent = loggedIn
    ? 'Yönetici hesabıyla giriş yapıldı.'
    : 'Yönetici hesabınız için mevcut şifrenizi girin veya şifre sıfırlama bağlantısı isteyin.';
}
function friendlyError(error) {
  const msg = String(error?.message || error || '');
  if (/invalid login credentials|invalid_credentials/i.test(msg))
    return 'E-posta veya şifre eşleşmedi. Şifremi unuttum bağlantısıyla yeni şifre belirleyebilirsiniz.';
  if (/email not confirmed/i.test(msg))
    return 'E-posta adresiniz henüz doğrulanmamış.';
  if (/rate limit|too many requests/i.test(msg))
    return 'Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.';
  if (/failed to fetch|network/i.test(msg))
    return 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edip yeniden deneyin.';
  return msg || 'İşlem tamamlanamadı.';
}
async function api(body) {
  if (!session?.access_token) throw Error('Oturum bulunamadı. Yeniden giriş yapın.');
  const reply = await fetch(API, {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':'Bearer '+session.access_token,
      'apikey':cfg.anonKey
    },
    body:JSON.stringify(body)
  });
  let result;
  try { result = await reply.json(); }
  catch { throw Error('Sunucudan geçersiz cevap alındı.'); }
  if (!reply.ok) {
    if (reply.status === 401) throw Error('Oturumun süresi doldu. Lütfen tekrar giriş yap.');
    if (reply.status === 403) throw Error('Bu hesabın takvimi yönetme yetkisi bulunamadı.');
    throw Error(result?.error || 'Sunucu hatası ('+reply.status+')');
  }
  return result;
}
async function reload() {
  // A full refresh must not discard edits waiting for the background save.
  if (slotUnsaved()) {
    notice('Önce saat değişikliklerinin kaydedilmesini bekleyin. Gerekirse Tekrar dene butonunu kullanın.',true);
    return;
  }
  if (!snapshot) el('panel').hidden=true;
  notice('Takvim bilgileri okunuyor...');
  const loaded = await api({op:'list'});
  if (!loaded || !Array.isArray(loaded.rules) || !Array.isArray(loaded.bookings))
    throw Error('Sunucu takvim verilerini eksik gönderdi.');
  snapshot=loaded;
  render();
  setLoginVisibility();
  notice('Takvim ve başvurular güncellendi.');
}
async function mutation(input) {
  if (busy || slotUnsaved()) {
    notice('Saat değişiklikleri kaydedilirken diğer işlemleri başlatmayın.',true);
    return;
  }
  try {
    setBusy(true);
    notice('Kaydediliyor...');
    await api(input);
    await reload();
  } catch(error) {
    notice(friendlyError(error),true);
  } finally { setBusy(false); }
}
function render() {
  const slots = el('slots');
  slots.replaceChildren();
  slotButtons.clear();
  for (let weekday=1; weekday<=7; weekday++) {
    const col = document.createElement('div');
    col.className = 'day';
    const name = document.createElement('strong');
    name.textContent = dayNames[weekday-1];
    col.append(name);
    for (let hour=8; hour<=21; hour++) {
      const minute = hour*60;
      const button = document.createElement('button');
      button.className='slot';
      button.type='button';
      button.textContent=hourText(minute);
      slotButtons.set(slotKey(weekday,minute),button);
      updateSlotButton(weekday,minute);
      button.onclick=()=>toggleSlot(weekday,minute);
      col.append(button);
    }
    slots.append(col);
  }
  el('recipient').value = snapshot.settings?.notification_email || DEFAULT_EMAIL;
  el('blocks').textContent = (snapshot.blocks || []).map(r=>r.lesson_date+' '+hourText(r.start_minute)).join(' • ') || 'Özel olarak kapatılan saat bulunmuyor.';
  const list = el('bookings');
  list.replaceChildren();
  for (const r of snapshot.bookings) {
    const wrapper = document.createElement('article');
    wrapper.className = 'booking';
    const title = document.createElement('strong');
    title.textContent = new Date(r.start_at).toLocaleString('tr-TR',{timeZone:'Europe/Istanbul',dateStyle:'medium',timeStyle:'short'})+' — '+r.full_name;
    wrapper.append(title);
    const desc = document.createElement('small');
    desc.textContent = r.email+' | '+r.level+' | '+r.goal+' | Durum: '+r.status+(r.notes ? ' | '+r.notes : '');
    wrapper.append(desc);
    if (['requested','confirmed'].includes(r.status)) {
      const actions = document.createElement('div');
      actions.className = 'row';
      const meeting = document.createElement('input');
      meeting.type = 'url';
      meeting.value = r.meeting_url || '';
      meeting.placeholder = 'https://meet.google.com/abc-defg-hij';
      meeting.style.cssText = 'flex:1;min-width:220px';
      meeting.setAttribute('aria-label','Dersin Google Meet bağlantısı');
      if (r.status === 'requested') {
        const approve = document.createElement('button');
        approve.textContent = 'Dersi onayla';
        approve.type = 'button';
        approve.onclick = () => mutation({op:'booking',id:r.id,status:'confirmed',meeting_url:meeting.value.trim()});
        actions.append(meeting,approve);
      }
      if (r.status === 'confirmed') {
        const complete = document.createElement('button');
        complete.className = 'subtle';
        complete.textContent = 'Tamamlandı';
        complete.onclick = () => mutation({op:'booking',id:r.id,status:'completed',meeting_url:r.meeting_url});
        actions.append(complete);
      }
      const cancel = document.createElement('button');
      cancel.className = 'danger';
      cancel.textContent = 'İptal et';
      cancel.onclick = () => {
        if (window.confirm('Bu ders randevusu iptal edilsin mi?'))
          mutation({op:'booking',id:r.id,status:'cancelled',meeting_url:r.meeting_url});
      };
      actions.append(cancel);
      wrapper.append(actions);
    }
    list.append(wrapper);
  }
  if (!snapshot.bookings.length) {
    const empty = document.createElement('p');
    empty.textContent = 'Henüz özel ders başvurusu yapılmadı.';
    list.append(empty);
  }
  showSlotSaveState();
}
async function login(event) {
  event?.preventDefault();
  if (busy) return;
  try {
    setBusy(true);
    notice('Giriş yapılıyor...');
    const email = el('email').value.trim().toLowerCase();
    const password = el('password').value;
    const {data,error} = await client.auth.signInWithPassword({email,password});
    if (error) throw error;
    if (!data.session) throw Error('Giriş oturumu oluşturulamadı.');
    session = data.session;
    el('password').value = '';
    await reload();
  } catch(error) {
    if (session) {
      await client.auth.signOut().catch(()=>{});
      session = null;
    }
    snapshot = null;
    setLoginVisibility();
    notice(friendlyError(error), true);
  } finally { setBusy(false); }
}
async function requestReset() {
  if (busy) return;
  try {
    setBusy(true);
    const email = el('email').value.trim().toLowerCase() || DEFAULT_EMAIL;
    const redirectTo = new URL('/ozel-dersler/yonetim/',location.origin).href;
    const {error} = await client.auth.resetPasswordForEmail(email,{redirectTo});
    if (error) throw error;
    notice('Şifre yenileme bağlantısı e-posta adresine gönderilmek üzere istendi. Gelen kutunu ve spam klasörünü kontrol et.');
  } catch(error) { notice(friendlyError(error),true); }
  finally { setBusy(false); }
}
async function savePassword(event) {
  event?.preventDefault();
  if (busy) return;
  const password = el('newPassword').value;
  const confirmPassword = el('confirmNewPassword').value;
  if (password.length<8) return notice('Yeni şifre en az 8 karakter olmalı.',true);
  if (password!==confirmPassword) return notice('İki şifre eşleşmiyor.',true);
  try {
    setBusy(true);
    const {error}=await client.auth.updateUser({password});
    if (error) throw error;
    el('newPassword').value='';
    el('confirmNewPassword').value='';
    await client.auth.signOut();
    session=null;
    snapshot=null;
    recoveryMode=false;
    history.replaceState({},'',location.pathname);
    setLoginVisibility();
    notice('Yeni şifre kaydedildi. Şimdi yeni şifrenle giriş yapabilirsin.');
  } catch(error){ notice(friendlyError(error),true); }
  finally { setBusy(false); }
}
async function start() {
  el('email').value = DEFAULT_EMAIL;
  if (!cfg.url || !cfg.anonKey) throw Error('Site kimlik doğrulama ayarları yüklenemedi.');
  client = createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  recoveryMode = recoverUrl();
  client.auth.onAuthStateChange((event,newSession)=>{
    if (event === 'PASSWORD_RECOVERY') {
      recoveryMode=true;
      session=newSession;
      setLoginVisibility();
      notice('Bağlantı doğrulandı. Yeni şifreni aşağıda belirle.');
    }
    if (event === 'SIGNED_OUT' && !recoveryMode) {
      session=null;
      snapshot=null;
      setLoginVisibility();
    }
  });
  el('loginForm').addEventListener('submit',login);
  el('forgot').addEventListener('click',requestReset);
  el('recoveryForm').addEventListener('submit',savePassword);
  el('signOut').addEventListener('click',async()=>{await client.auth.signOut();session=null;snapshot=null;setLoginVisibility();notice('Çıkış yapıldı.');});
  el('reload').onclick=async()=>{try{await reload()}catch(e){notice(friendlyError(e),true)}};
  el('retrySlots').onclick=retrySlotChanges;
  el('saveRecipient').onclick=()=>mutation({op:'settings',email:el('recipient').value.trim()});
  el('block').onclick=()=>mutation({op:'block',date:el('blockDate').value,minute:Number(el('blockHour').value),blocked:true});
  el('unblock').onclick=()=>mutation({op:'block',date:el('blockDate').value,minute:Number(el('blockHour').value),blocked:false});
  for (let hour=8;hour<=21;hour++){
    const o=document.createElement('option');o.value=String(hour*60);o.textContent=two(hour)+':00';el('blockHour').append(o);
  }
  el('blockDate').value = new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Istanbul'});
  const {data,error}=await client.auth.getSession();
  if (error) throw error;
  session=data.session;
  if (recoverUrl()) recoveryMode=true;
  setLoginVisibility();
  if (session && !recoveryMode) {
    try { await reload(); }
    catch(e){notice('Giriş doğrulandı ancak takvim yüklenemedi: '+friendlyError(e),true);}
  } else if (!recoveryMode) {
    notice('E-posta adresi hazır. Şifrenle giriş yapabilirsin.');
  } else notice('Yeni şifre belirlemek için e-postadaki bağlantıyı kullan.');
}
start().catch(error => notice(friendlyError(error),true));
