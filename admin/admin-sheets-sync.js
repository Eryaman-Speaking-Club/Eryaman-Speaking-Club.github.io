/* ESC sync controls: Google Sheets attendance authority + Supabase event calendar.
   Never sends messages; token only stored hashed server-side and Apps Script property.
*/
(() => {
 'use strict';
 const A=window.ESCAdmin;
 const {$,esc,toast,openModal,closeModal}=A;
 const adminOnly=()=>A.canEdit()&&A.isSuper();
 const scriptUrl='https://script.google.com/u/0/home/projects/1DJbgDDwRPR8wtplG5hjSbfFQN76b79-oMDPuZaT_Ti0IVfSFz9nokQuI/edit';
 const sheetUrl='https://docs.google.com/spreadsheets/d/1nD5GjKPQD88UCkJJZkygEZpB2Hj2rvCqWlsFlgrhgK4/edit';
 const codeUrl='https://github.com/Eryaman-Speaking-Club/Eryaman-Speaking-Club.github.io/blob/main/automation/sheets/ESC_Sheets_Supabase_Sync.gs';
 const stamp=x=>x?new Intl.DateTimeFormat('tr-TR',{
    timeZone:'Europe/Istanbul',dateStyle:'medium',timeStyle:'short'
 }).format(new Date(x)):'Henüz çalışmadı';
 const count=x=>Number(x||0).toLocaleString('tr-TR');
 const mark=x=>x?'<span class="pill published">AÇIK</span>':'<span class="pill draft">KAPALI</span>';
 async function view(){
  const [out,bridge]=await Promise.all([
    A.state.db.rpc('esc_sheets_bridge_status'),
    A.state.db.rpc('esc_admin_attendance_bridge_status')
  ]);
  if(out.error)throw out.error;
  if(bridge.error)throw bridge.error;
  const h=out.data||{},v2=bridge.data||{},ready=v2.ready===true;
  $('#panel').innerHTML=
   '<div class="notice"><strong>Tek düzen: Katılım Google Sheets\'te, etkinlik takvimi Supabase ile eşitlenir.</strong><br>'+
    'Google Sheets\'te <strong>Katılım Yüz Yüze</strong> veya <strong>Katılım Online</strong> → <strong>Listede?</strong> işaretlediğin katılımcılar, kurulumdan sonra aynı ETK numarasıyla sisteme yansır. Panelden değiştirilen etkinlik tarih/saatleri de Sheets\'teki Etkinlikler tablosuna döner. Aynı kayıt iki yerde değişirse son değişikliği körü körüne ezmez; kontrol gerektirir.</div>'+
   (!ready?'<div class="notice warning"><strong>Panelden katılım düzenlemek için Apps Script güncellemesi gerekiyor.</strong> Mevcut ESC_Sheets_Supabase_Sync.gs dosyasının içeriğini yeni sürümle değiştir. Sonra ESC_SYNC_SETUP, ESC_SYNC_PREVIEW ve ESC_SYNC_run çalıştır. Kod.gs ve ESC_Email.gs dosyalarına dokunma.</div>':
    '<div class="notice"><strong>Panelden katılım kontrolü hazır.</strong> Güncel Apps Script v'+Number(v2.client_version||0)+' bağlı. Değişiklikler Google Sheets üzerinde doğrulanıyor.</div>')+
   '<div class="stats">'+
    '<div class="stat"><span>BAĞLANTI</span><strong>'+(h.configured?(h.enabled?'AÇIK':'DURDURULDU'):'KURULMADI')+'</strong><small>Güvenli sunucu köprüsü</small></div>'+
    '<div class="stat"><span>LISTEDE SEÇİLEN</span><strong>'+count(h.selected)+'</strong><small>Supabase\'e aktarılmış</small></div>'+
    '<div class="stat"><span>İLETİŞİME UYGUN</span><strong>'+count(h.eligible)+'</strong><small>İzinli + kayıtlı</small></div>'+
    '<div class="stat"><span>MESAJ İZNİ</span><strong>'+(h.mail_approved?'AÇIK':'KAPALI')+'</strong><small>Gmail ayrıca kapalı</small></div>'+
   '</div>'+
   '<div class="card"><div class="card-head"><div><h2>Google Sheets Bağlantısı</h2>'+
    '<p class="muted">Katılım listesini iki yerde tutma: Excel benzeri Google Sheets tablosundaki Listede? / Katıldı? seçimleri asıl kaynaktır. Bu bağlantı kurulduğunda 5 dakikada bir senkronizasyon kontrolü yapılır.</p></div></div>'+
    '<div class="row-actions">'+
     '<button type="button" id="escSheetsKey" class="btn primary" '+(!adminOnly()?'disabled':'')+'>'+(h.configured?'Yeni bağlantı anahtarı':'Bağlantı anahtarı oluştur')+'</button>'+
     '<button type="button" id="escSheetsToggle" class="btn secondary" '+(!h.configured||!adminOnly()?'disabled':'')+'>'+(h.enabled?'Bağlantıyı durdur':'Bağlantıyı yeniden aç')+'</button>'+
     '<button type="button" id="escSheetsReload" class="btn secondary">Durumu yenile</button>'+
    '</div>'+
    '<p class="muted">Son panelden veri alma: '+esc(stamp(h.last_pull_at))+' · Son Sheets verisi: '+esc(stamp(h.last_push_at))+'</p>'+
    (h.last_error?'<div class="notice warning"><strong>Son hata:</strong> '+esc(h.last_error)+'</div>':'')+
    '<div class="notice warning"><strong>Mesaj gönderimi ayrı.</strong> Bu bağlantıyı açmak katılımcılara e-posta göndermez. Eski <code>E-posta Otomasyonu!B2</code> hücresi KAPALI kalmalı. Yeni mesaj gönderimi ancak Gmail yetkilendirmesi ve kontrollü test sonrası açılacak.</div>'+
   '</div>'+
   '<div class="card"><div class="card-head"><div><h2>Bir defalık kurulum</h2><p class="muted">Mevcut formüllerin, finans kayıtlarının ve eski <code>Kod.gs</code> dosyasının üzerine yazılmaz.</p></div></div>'+
     '<div class="stack">'+
      '<p><strong>1.</strong> Yukarıdan bağlantı anahtarı oluştur. Anahtarı sohbet içinde paylaşma.</p>'+
      '<p><strong>2.</strong> <a href="'+codeUrl+'" target="_blank" rel="noopener">En güncel ESC_Sheets_Supabase_Sync.gs kodunu</a> aç. Bu dosya Apps Script\'te zaten varsa <strong>yalnızca onun içeriğini değiştir</strong>; yoksa ayrı dosya oluştur.</p>'+
      '<p><strong>3.</strong> <a href="'+scriptUrl+'" target="_blank" rel="noopener">Apps Script\'i aç</a> → Proje Ayarları → Komut Dosyası Özellikleri bölümünde <code>ESC_SHEETS_BRIDGE_TOKEN</code> zaten kayıtlıysa <strong>yenisini oluşturma</strong>.</p>'+
      '<p><strong>4.</strong> Apps Script\'te bir kez <code>ESC_SYNC_SETUP</code>, sonra güvenli <code>ESC_SYNC_PREVIEW</code> ve <code>ESC_SYNC_run</code> çalıştır.</p>'+
      '<p><strong>5.</strong> <a href="'+sheetUrl+'" target="_blank" rel="noopener">Google Sheets → ESC Senkronizasyon</a> sekmesinde <strong>BAĞLANDI</strong>, son kontrol ve hata durumunu incele.</p>'+
     '</div>'+
   '</div>'+
   '<div class="card"><div class="card-head"><div><h2>Mesajların fiyatları ve alıcıları</h2><p class="muted">Ayrı mesaj türleri ve fiyatlar. E-posta Şablonları sekmesinden metinleri yönetebilirsin.</p></div></div>'+
    '<div class="grid-2">'+
     '<div class="mini-card"><h3>Yüz yüze buluşma</h3><p>Tek: 400 TL<br>4 buluşma: 1.400 TL<br>12 buluşma: 3.900 TL</p><p class="muted">Katılım Yüz Yüze → Listede?</p></div>'+
     '<div class="mini-card"><h3>Online buluşma</h3><p>Tek: 300 TL<br>4 buluşma: 1.100 TL<br>12 buluşma: 3.000 TL</p><p class="muted">Katılım Online → Listede?</p></div>'+
    '</div><p class="muted">Bu fiyatlar açıklama içindir; gönderilen şablonlar Supabase CMS\'de yayınlanmış güncel fiyatlar ile doldurulur. İlk buluşma ve paket hakkı koşulları kişiye göre ayrıca kontrol edilmelidir.</p>'+
    '<div class="row-actions"><a href="'+sheetUrl+'" target="_blank" rel="noopener" class="btn secondary">Katılım Excel\'ini aç ↗</a>'+
      '<button type="button" id="escSheetsMail" class="btn secondary">E-posta ayarlarını aç</button></div>'+
   '</div>';
  $('#escSheetsReload').onclick=()=>view();
  $('#escSheetsMail').onclick=()=>A.go('emailAutomation');
  $('#escSheetsKey').onclick=async()=>{
   if(!adminOnly())return;
   if(!confirm('Yeni anahtar hazırlanacak. Eski bağlantı anahtarı geçersiz olacak, varsa Apps Script özelliğini yeniden güncellemen gerekecek. Mesaj izni güvenlik için KAPALI yapılır. Devam?'))return;
   const raw=crypto.getRandomValues(new Uint8Array(48));
   const token=btoa(String.fromCharCode(...raw)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
   try{
    const res=await A.state.db.rpc('esc_sheets_configure',{p_token:token});
    if(res.error)throw res.error;
    openModal('<h2>Google Sheets bağlantı anahtarı</h2>'+
      '<div class="notice warning">Gizli anahtar yalnızca burada gösterilir. <strong>Apps Script proje özelliği</strong> olarak sakla; Sheets hücrelerine, sohbet mesajlarına veya GitHub koduna yazma.</div>'+
      '<p class="muted"><code>ESC_SHEETS_BRIDGE_TOKEN</code></p>'+
      '<textarea id="escSyncToken" rows="3" readonly style="width:100%;word-break:break-all">'+esc(token)+'</textarea>'+
      '<div class="row-actions"><button type="button" class="btn primary" id="escSyncCopy">Anahtarı kopyala</button>'+
      '<button type="button" class="btn secondary" id="escSyncClose">Kapat</button></div>');
    $('#escSyncCopy').onclick=async()=>{
      try{await navigator.clipboard.writeText(token);toast('Anahtar kopyalandı.');}
      catch(_){const field=$('#escSyncToken');field.select();toast('Alan seçildi: Cmd+C ile kopyala.');}
    };
    $('#escSyncClose').onclick=()=>{closeModal();view()};
   }catch(e){alert('Bağlantı anahtarı oluşturulamadı: '+(e.message||String(e)))}
  };
  $('#escSheetsToggle').onclick=async()=>{
   if(!adminOnly())return;
   const enabled=!h.enabled;
   if(!confirm(enabled?'Bağlantıyı yeniden etkinleştirmek istiyor musun? Gmail kapalı kalır.':'Sheets ve Supabase senkronizasyonunu durdurmak istiyor musun? Katılım kayıtları silinmez.'))return;
   const res=await A.state.db.rpc('esc_sheets_toggle',{p_enabled:enabled});
   if(res.error){alert(res.error.message);return}
   toast(enabled?'Senkronizasyon sunucusu etkinleştirildi. Apps Script kurulumu da gerekli.':'Senkronizasyon sunucusu durduruldu.');
   await view();
  };
 }
 A.register('sheetsSync',view);
})();
