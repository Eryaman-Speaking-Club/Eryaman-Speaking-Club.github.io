/* Central ESC event email administration. No client-side emails. */
(() => {
 'use strict';
 const A=window.ESCAdmin, {$,esc,toast,openModal,closeModal}=A;
 const names={
  reminder_in_person:'Yüz yüze hatırlatma',
  reminder_online:'Online hatırlatma',
  welcome:'Yeni kayıt onayı',
  change:'Etkinlik değişikliği',
  cancelled:'Etkinlik iptali',
  thanks:'İlk katılım teşekkürü'
 };
 const canConfigure=()=>A.canEdit() && A.isSuper();
 const mustCheck=(out)=>{if(out.error)throw out.error;return out.data};
 async function view(){
  const [health,templates]=await Promise.all([
   A.state.db.rpc('esc_email_bridge_status'),
   A.state.db.from('esc_event_email_templates').select('*').order('kind')
  ]);
  const h=mustCheck(health)||{},list=mustCheck(templates)||[];
  $('#panel').innerHTML=
   '<div class="notice warning"><strong>Katılımcılara e-posta gönderimi korunuyor.</strong> Bu sayfa Supabase takvimine ve etkinliğe gerçekten kayıt olmuş, iletişim izni olan kişilere bağlıdır. Eski Google Sheets!B2 hâlâ KAPALI olmalı; aynı anda iki ayrı sistemden gönderim açmayın.</div>'+
   '<div class="stats">'+
   '<div class="stat"><span>GÖNDERİM</span><strong>'+(h.enabled?'AÇIK':'KAPALI')+'</strong><small>Sunucu anahtarı</small></div>'+
   '<div class="stat"><span>HAZIR KUYRUK</span><strong>'+Number(h.waiting||0)+'</strong><small>Henüz e-posta değil</small></div>'+
   '<div class="stat"><span>GÖNDERİME KABUL EDİLDİ</span><strong>'+Number(h.sent||0)+'</strong><small>MailApp tarafından kabul edildi</small></div>'+
   '<div class="stat"><span>MANUEL İNCELEME</span><strong>'+Number(h.manual_review||0)+'</strong><small>Tekrar gönderim otomatik değil</small></div>'+
   '</div>'+
   '<div class="card"><div class="card-head"><div><h2>E-posta Sunucu Bağlantısı</h2><p class="muted">Bir kez kurulur, sonra arka planda her 15 dakikada bir çalışır. Mevcut kurulum durumu: '+(h.configured?'Anahtar mevcut':'Henüz anahtar oluşturulmadı')+'.</p></div></div>'+
   '<div class="row-actions">'+
   '<button class="btn secondary" id="escEmailMakeToken" '+(!canConfigure()?'disabled':'')+'>'+(h.configured?'Anahtarı yenile':'Bağlantı anahtarı oluştur')+'</button>'+
   '<button class="btn '+(h.enabled?'danger':'primary')+'" id="escEmailToggle" '+(!h.configured||!canConfigure()?'disabled':'')+'>'+(h.enabled?'Gönderimleri DURDUR':'Gönderimi AÇ')+'</button>'+
   '<button class="btn secondary" id="escEmailReload">Durumu yenile</button>'+
   '</div><p class="muted">Gönderim için iki ayrı onay gerekir: bu panelin anahtarı ve Gmail Apps Script ESC_LIVE_enable. Sadece bu panelden açmak mesaj göndermez.</p>'+
   '<div class="notice"><strong>Tek seferlik kurulum:</strong> Anahtarı oluştur → Apps Script > Proje Ayarları > Komut Dosyası Özellikleri > <code>ESC_LIVE_BRIDGE_TOKEN</code> alanına ekle → yeni <code>ESC_Live_Gmail.gs</code> kodunu kur → <code>ESC_LIVE_setup</code> ve <code>ESC_LIVE_preview</code> çalıştır. Bunlar gönderim yapmaz. Testler geçince iki ayrı gönderim anahtarını etkinleştir.</div></div>'+
   '<div class="card"><div class="card-head"><div><h2>Mesaj Şablonları</h2><p class="muted">Kodu değiştirmeden konu ve metni düzenle. {{ad}}, {{tarih}}, {{saat}}, {{mekan}}, {{etkinlik}}, {{link}} gibi alanlar gerçek etkinlikle doldurulur.</p></div></div>'+
   '<div class="grid-3">'+list.map(t=>
    '<div class="mini-card"><span class="pill '+(t.enabled?'published':'draft')+'">'+(t.enabled?'Aktif':'Kapalı')+'</span>'+
    '<h3>'+esc(names[t.kind]||t.kind)+'</h3>'+
    '<p>'+esc(t.subject)+'</p>'+
    '<div class="row-actions" style="margin-top:12px"><button class="btn secondary" data-template="'+esc(t.kind)+'">Düzenle / Önizle</button></div></div>').join('')+
   '</div></div>';
  $('#escEmailReload').onclick=()=>view();
  $('#escEmailMakeToken').onclick=async()=>{
   if(!canConfigure())return;
   if(!confirm('Yeni anahtar oluşturulacak. Önceki anahtar geçersiz hale gelecek ve otomatik gönderim güvenli biçimde kapatılacak. Devam edilsin mi?'))return;
   const bytes=crypto.getRandomValues(new Uint8Array(48));
   const token=btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
   try{
    mustCheck(await A.state.db.rpc('esc_configure_email_bridge',{p_token:token,p_enable:false}));
    openModal('<h2>Tek seferlik güvenli bağlantı anahtarı</h2>'+
     '<div class="notice warning">Bu anahtar yalnızca şimdi gösteriliyor. Chat mesajına veya Google Sheets içine yapıştırma. Apps Script’in <strong>Komut Dosyası Özellikleri</strong> bölümüne kaydet.</div>'+
     '<textarea id="escNewBridgeKey" readonly rows="3" style="width:100%;margin:12px 0;word-break:break-all">'+esc(token)+'</textarea>'+
     '<div class="row-actions"><button class="btn primary" id="escCopyBridgeKey">Anahtarı kopyala</button><button class="btn secondary" id="escCloseBridgeKey">Kapat</button></div>');
    $('#escCopyBridgeKey').onclick=async()=>{try{await navigator.clipboard.writeText(token);toast('Anahtar kopyalandı')}catch(e){$('#escNewBridgeKey').select();document.execCommand('copy');toast('Anahtar kopyalandı')}};
    $('#escCloseBridgeKey').onclick=()=>{closeModal();view()};
   }catch(e){alert(e.message||String(e))}
  };
  $('#escEmailToggle').onclick=async()=>{
   if(!canConfigure())return;
   const enabling=!h.enabled;
   const prompt=enabling?
     'Gmail Apps Script ESC_LIVE_setup ve ESC_LIVE_preview testlerini çalıştırdınız mı? Eski Sheets gönderim sistemi KAPALI mı? Sadece onaylı etkinlik kayıtlarına iletişim izniyle mesaj gönderilecek. Sunucu anahtarını AÇMAK istediğinize emin misiniz?':
     'Sunucudan yeni e-posta taleplerini DURDURMAK istiyor musunuz?';
   if(!confirm(prompt))return;
   try{
    mustCheck(await A.state.db.rpc('esc_toggle_email_bridge',{p_enabled:enabling}));
    toast(enabling?'Sunucu açık. Gmail tarafındaki ayrı anahtarı da açmalısın.':'Yeni gönderimler durduruldu.');
    await view();
   }catch(e){alert(e.message||String(e))}
  };
  $('#panel').querySelectorAll('[data-template]').forEach(b=>
    b.onclick=()=>editTemplate(list.find(t=>t.kind===b.dataset.template)));
 }
 function editTemplate(t){
  if(!t)return;
  openModal('<h2>'+esc(names[t.kind]||t.kind)+'</h2>'+
   '<p class="muted">Metin değişiklikleri yalnızca yeni oluşturulacak gönderimlere uygulanır. E-posta önizlemesi mesaj göndermez.</p>'+
   '<form class="stack" id="escEmailTemplateForm"><label>Konu<input name="subject" maxlength="220" required value="'+esc(t.subject)+'"></label>'+
   '<label>Mesaj<textarea name="body" rows="15" maxlength="12000" required>'+esc(t.body)+'</textarea></label>'+
   '<label class="consent"><input name="enabled" type="checkbox" '+(t.enabled?'checked':'')+'>Bu şablon aktif olsun</label>'+
   '<div class="row-actions"><button class="btn primary" type="submit" '+(!A.canEdit()?'disabled':'')+'>Kaydet</button><button class="btn secondary" type="button" id="escEmailPreviewBtn">Örnek göster</button><button class="btn secondary" type="button" id="escEmailCloseBtn">Vazgeç</button></div>'+
   '<div id="escEmailPreview" style="margin-top:12px;white-space:pre-wrap;background:#f4f8fb;padding:14px;border-radius:13px;max-height:280px;overflow:auto"></div></form>');
  $('#escEmailCloseBtn').onclick=closeModal;
  $('#escEmailPreviewBtn').onclick=()=>{
   const f=new FormData($('#escEmailTemplateForm')),tokens={
    ad:'Ayşe',tarih:'18.10.2026',saat:'18.00–20.00',
    mekan:'Eryaman 1-2 Coffee LAB',tur:'Yüz yüze',etkinlik:'ETK-013',
    link:'Bağlantı buluşma öncesinde paylaşılacak',
    eski_tarih:'17.10.2026',eski_saat:'19.00',eski_mekan:'Önceki mekân'
   };
   let preview=String(f.get('body')||'');
   for(const [key,value] of Object.entries(tokens))
     preview=preview.replaceAll('{{'+key+'}}',value);
   $('#escEmailPreview').textContent=String(f.get('subject')||'')+'\n\n'+preview;
  };
  $('#escEmailTemplateForm').onsubmit=async event=>{
   event.preventDefault();if(!A.canEdit())return;
   const f=new FormData(event.currentTarget),subject=String(f.get('subject')||'').trim(),body=String(f.get('body')||'').trim();
   if(subject.length<3||body.length<10)return alert('Konu veya mesaj çok kısa.');
   const save=event.currentTarget.querySelector('[type=submit]');save.disabled=true;
   try{
    const out=await A.state.db.from('esc_event_email_templates')
      .update({subject,body,enabled:f.get('enabled')==='on',updated_at:new Date().toISOString()})
      .eq('kind',t.kind).select('kind').single();
    mustCheck(out);closeModal();toast('E-posta şablonu kaydedildi');await view();
   }catch(e){alert(e.message||String(e))}finally{save.disabled=false}
  };
 }
 A.register('emailAutomation',view);
})();
