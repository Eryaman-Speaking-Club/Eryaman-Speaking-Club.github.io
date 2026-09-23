(() => {
  'use strict';
  const A=window.ESCAdmin;const {$,$$,esc,toast,openModal,closeModal}=A;


  async function eventsView(){
    const {data,error}=await A.state.db.from('esc_cms_settings').select('*').eq('key','event_config').maybeSingle();if(error)throw error;
    const cfg=A.clone(data?.draft_data||data?.published_data||{});
    const e=cfg.inPerson||{},p=cfg.pricing||{},o=cfg.online||{};
    $('#panel').innerHTML='<div class="card"><div class="card-head"><div><h2>Etkinlik & fiyatlar</h2><p class="muted">Buradaki değerler ana sayfadaki tekrar eden tarih, saat, mekân, kayıt linki ve fiyat alanlarını merkezi olarak günceller.</p></div><span class="pill '+(data?.has_unpublished_changes?'draft':'published')+'">'+(data?.has_unpublished_changes?'TASLAK':'YAYINDA · v'+(data?.version||0))+'</span></div>'+
      '<form id="eventConfigForm" class="stack">'+
      '<div class="grid-2"><label>Etkinlik başlangıcı (ISO)<input name="start" value="'+esc(e.start||'')+'"></label><label>Etkinlik bitişi (ISO)<input name="end" value="'+esc(e.end||'')+'"></label></div>'+
      '<div class="grid-3"><label>Gün<input name="day" value="'+esc(e.day||'')+'"></label><label>Ay TR<input name="monthTr" value="'+esc(e.monthTr||'')+'"></label><label>Ay EN<input name="monthEn" value="'+esc(e.monthEn||'')+'"></label></div>'+
      '<div class="grid-3"><label>Gün TR<input name="weekdayTr" value="'+esc(e.weekdayTr||'')+'"></label><label>Gün EN<input name="weekdayEn" value="'+esc(e.weekdayEn||'')+'"></label><label>Saat<input name="time" value="'+esc(e.time||'')+'"></label></div>'+
      '<label>Mekân<input name="venue" value="'+esc(e.venue||'')+'"></label>'+
      '<div class="grid-2"><label>Kayıt formu URL<input name="registrationUrl" value="'+esc(cfg.registrationUrl||'')+'"></label><label>Harita URL<input name="mapUrl" value="'+esc(cfg.mapUrl||'')+'"></label></div>'+
      '<div class="grid-2"><label>Kontenjan<select name="capacity"><option value="limited" '+(e.capacity==='limited'?'selected':'')+'>Sınırlı</option><option value="open" '+(e.capacity!=='limited'?'selected':'')+'>Açık</option></select></label><label>Online ilk buluşma ücretsiz <select name="onlineFree"><option value="true" '+(o.firstMeetupFree!==false?'selected':'')+'>Evet</option><option value="false" '+(o.firstMeetupFree===false?'selected':'')+'>Hayır</option></select></label></div>'+
      '<div class="grid-2"><label>Tek etkinlik fiyatı<input name="single" type="number" min="0" value="'+esc(p.single??400)+'"></label><label>1 aylık üyelik<input name="oneMonth" type="number" min="0" value="'+esc(p.oneMonth??1400)+'"></label></div>'+
      '<div class="grid-2"><label>3 aylık üyelik<input name="threeMonth" type="number" min="0" value="'+esc(p.threeMonth??3900)+'"></label><label>Online buluşma<input name="onlinePrice" type="number" min="0" value="'+esc(o.price??300)+'"></label></div>'+
      '<div class="row-actions"><button type="button" id="saveEventDraft" class="btn secondary" '+(!A.canEdit()?'disabled':'')+'>Taslak kaydet</button><button class="btn primary" '+(!A.canEdit()?'disabled':'')+'>Kaydet & yayınla</button><a class="btn secondary" href="../#next-event" target="_blank">Canlı bölümü aç ↗</a></div></form></div>';
    const collect=()=>{
      const f=new FormData($('#eventConfigForm'));
      return {
        registrationUrl:String(f.get('registrationUrl')||'').trim(),mapUrl:String(f.get('mapUrl')||'').trim(),
        inPerson:{start:f.get('start'),end:f.get('end'),day:f.get('day'),monthTr:String(f.get('monthTr')||'').toUpperCase(),monthEn:String(f.get('monthEn')||'').toUpperCase(),weekdayTr:String(f.get('weekdayTr')||'').toUpperCase(),weekdayEn:String(f.get('weekdayEn')||'').toUpperCase(),time:f.get('time'),venue:f.get('venue'),capacity:f.get('capacity')},
        pricing:{single:Number(f.get('single')||0),oneMonth:Number(f.get('oneMonth')||0),threeMonth:Number(f.get('threeMonth')||0),currency:'TL'},
        online:{firstMeetupFree:f.get('onlineFree')==='true',price:Number(f.get('onlinePrice')||0),currency:'TL',unitTr:'buluşma',unitEn:'meetup'}
      };
    };
    const save=async publish=>{
      const payload=collect();
      let r=await A.state.db.from('esc_cms_settings').update({draft_data:payload,has_unpublished_changes:true,updated_by:A.state.session.user.id,updated_at:new Date().toISOString()}).eq('key','event_config');
      if(r.error)throw r.error;
      if(publish){r=await A.state.db.rpc('esc_cms_publish_setting',{p_key:'event_config'});if(r.error)throw r.error}
      toast(publish?'Etkinlik ve fiyatlar canlı siteye yayınlandı':'Etkinlik taslağı kaydedildi');
    };
    $('#saveEventDraft').onclick=async()=>{try{await save(false);eventsView()}catch(err){alert(err.message)}};
    $('#eventConfigForm').onsubmit=async e=>{e.preventDefault();try{await save(true);eventsView()}catch(err){alert(err.message)}};
  }

  async function gamesView(){
    const [{data:games,error},{data:settings},{data:content}]=await Promise.all([
      A.state.db.from('games').select('*').order('name'),
      A.state.db.from('game_settings').select('*'),
      A.state.db.from('game_content').select('id,game_slug')
    ]);if(error)throw error;
    const sMap=Object.fromEntries((settings||[]).map(x=>[x.game_slug,x.config||{}]));
    const counts={};(content||[]).forEach(x=>counts[x.game_slug]=(counts[x.game_slug]||0)+1);
    $('#panel').innerHTML='<div class="card"><div class="card-head"><div><h2>Oyun yönetimi</h2><p class="muted">Oyunların yayın durumu, ayarları ve merkezi içerikleri.</p></div><a class="btn secondary" href="../games/" target="_blank">Game Hub ↗</a></div><div class="game-admin-grid">'+
      (games||[]).map(g=>'<article class="mini-card"><span class="pill '+(g.enabled?'published':'draft')+'">'+(g.enabled?'YAYINDA':'KAPALI')+'</span><h3>'+esc(g.name)+'</h3><p>'+esc(counts[g.slug]||0)+' merkezi içerik · '+esc(g.slug)+'</p><div class="row-actions" style="margin-top:13px"><button class="icon-btn" data-game="'+g.slug+'">Yönet</button><a class="icon-btn" href="../'+esc(g.slug)+'/" target="_blank">Aç ↗</a></div></article>').join('')+
      '</div></div>';
    $('#panel').querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>openGame(games.find(x=>x.slug===b.dataset.game),sMap[b.dataset.game]||{}));
  }
  async function openGame(game,config){
    const {data:items,error}=await A.state.db.from('game_content').select('*').eq('game_slug',game.slug).order('sort_order');if(error)throw error;
    openModal('<div class="card-head"><div><h2>'+esc(game.name)+'</h2><p class="muted">Oyun ayarları ve merkezi içerik.</p></div><span class="pill '+(game.enabled?'published':'draft')+'">'+(game.enabled?'YAYINDA':'KAPALI')+'</span></div>'+
      '<form id="gameAdminForm" class="stack"><label><input name="enabled" type="checkbox" '+(game.enabled?'checked':'')+'> Oyun public Game Hub’da aktif</label>'+
      '<label>Public config (gelişmiş)<textarea name="public_config" rows="5">'+esc(JSON.stringify(game.public_config||{},null,2))+'</textarea></label>'+
      '<label>Game settings (gelişmiş)<textarea name="config" rows="5">'+esc(JSON.stringify(config||{},null,2))+'</textarea></label>'+
      '<button class="btn primary" '+(!A.canEdit()?'disabled':'')+'>Ayarları kaydet</button></form>'+
      '<div class="card"><div class="card-head"><div><h2>Merkezi içerikler</h2><p class="muted">'+(items||[]).length+' kayıt</p></div><button id="newGameContent" class="btn secondary" '+(!A.canEdit()?'disabled':'')+'>+ İçerik</button></div>'+
      ((items||[]).length?'<div class="table-wrap"><table><thead><tr><th>Key</th><th>Kategori</th><th>Tip</th><th>Aktif</th><th></th></tr></thead><tbody>'+items.map(x=>'<tr><td>'+esc(x.content_key||x.id)+'</td><td>'+esc(x.category||'—')+'</td><td>'+esc(x.kind)+'</td><td>'+esc(x.is_active?'evet':'hayır')+'</td><td><button class="icon-btn" data-content="'+x.id+'">Düzenle</button></td></tr>').join('')+'</tbody></table></div>':'<div class="empty">Bu oyun için henüz merkezi içerik kaydı yok.</div>')+'</div>');
    $('#gameAdminForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);try{const pc=JSON.parse(f.get('public_config')||'{}'),cf=JSON.parse(f.get('config')||'{}');let r=await A.state.db.from('games').update({enabled:f.get('enabled')==='on',public_config:pc,updated_at:new Date().toISOString()}).eq('slug',game.slug);if(r.error)throw r.error;r=await A.state.db.from('game_settings').upsert({game_slug:game.slug,config:cf,updated_at:new Date().toISOString()});if(r.error)throw r.error;closeModal();toast('Oyun ayarları kaydedildi');gamesView()}catch(err){alert(err.message||err)}};
    const editItem=item=>{
      openModal('<h2>'+(item?'İçeriği düzenle':'Yeni oyun içeriği')+'</h2><form id="gameContentForm" class="stack"><label>Content key<input name="key" value="'+esc(item?.content_key||'')+'"></label><div class="grid-2"><label>Kategori<input name="category" value="'+esc(item?.category||'')+'"></label><label>Tip<input name="kind" value="'+esc(item?.kind||'prompt')+'"></label></div><label>Payload JSON<textarea name="payload" rows="10">'+esc(JSON.stringify(item?.payload||{text:''},null,2))+'</textarea></label><label><input name="active" type="checkbox" '+(item?.is_active!==false?'checked':'')+'> Aktif</label><button class="btn primary">Kaydet</button></form>');
      $('#gameContentForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);try{const payload=JSON.parse(f.get('payload')||'{}');const row={game_slug:game.slug,content_key:f.get('key')||null,category:f.get('category')||null,kind:f.get('kind')||'prompt',payload,is_active:f.get('active')==='on',updated_at:new Date().toISOString()};const q=item?A.state.db.from('game_content').update(row).eq('id',item.id):A.state.db.from('game_content').insert(row);const {error}=await q;if(error)throw error;closeModal();toast('Oyun içeriği kaydedildi');gamesView()}catch(err){alert(err.message||err)}};
    };
    $('#newGameContent').onclick=()=>editItem(null);
    document.querySelectorAll('[data-content]').forEach(b=>b.onclick=()=>editItem(items.find(x=>String(x.id)===b.dataset.content)));
  }

  async function educatorsView(){
    const [{data:profiles,error},{data:classes},{data:students},{data:lessons}]=await Promise.all([
      A.state.db.from('educator_profiles').select('*').order('created_at',{ascending:false}),
      A.state.db.from('edu_classes').select('*').order('created_at',{ascending:false}),
      A.state.db.from('edu_students').select('id,class_id,is_active'),
      A.state.db.from('edu_lessons').select('id,status')
    ]);if(error)throw error;
    $('#panel').innerHTML='<div class="stats"><div class="stat"><span>EĞİTİMCİ</span><strong>'+esc((profiles||[]).length)+'</strong><small>Teacher / school admin</small></div><div class="stat"><span>SINIF</span><strong>'+esc((classes||[]).length)+'</strong><small>'+(classes||[]).filter(x=>x.is_active).length+' aktif</small></div><div class="stat"><span>ÖĞRENCİ</span><strong>'+esc((students||[]).filter(x=>x.is_active).length)+'</strong><small>Aktif sınıf katılımı</small></div><div class="stat"><span>DERS</span><strong>'+esc((lessons||[]).length)+'</strong><small>'+((lessons||[]).filter(x=>x.status==='completed').length)+' tamamlandı</small></div></div>'+
      '<div class="card"><div class="card-head"><div><h2>Eğitimci hesapları</h2><p class="muted">Rol ve abonelik planını buradan yönet.</p></div><a class="btn secondary" href="../educators/" target="_blank">Educators ↗</a></div>'+
      ((profiles||[]).length?'<div class="table-wrap"><table><thead><tr><th>İsim</th><th>Rol</th><th>Plan</th><th>Kayıt</th><th></th></tr></thead><tbody>'+profiles.map(p=>'<tr><td><strong>'+esc(p.display_name)+'</strong><br><small>'+esc(p.user_id)+'</small></td><td>'+esc(p.role)+'</td><td><span class="pill">'+esc(p.plan)+'</span></td><td>'+esc(A.fmt(p.created_at))+'</td><td><button class="icon-btn" data-edu="'+p.user_id+'" '+(!A.canEdit()?'disabled':'')+'>Düzenle</button></td></tr>').join('')+'</tbody></table></div>':'<div class="empty">Eğitimci yok.</div>')+'</div>'+
      '<div class="card"><div class="card-head"><div><h2>Sınıflar</h2><p class="muted">Yaş, seviye, kod ve aktiflik.</p></div></div><div class="table-wrap"><table><thead><tr><th>Sınıf</th><th>Profil</th><th>Kod</th><th>Maks.</th><th>Durum</th></tr></thead><tbody>'+ (classes||[]).map(c=>'<tr><td><strong>'+esc(c.name)+'</strong></td><td>'+esc(c.age_group)+' · '+esc(c.level)+' · '+esc(c.focus)+'</td><td><strong>'+esc(c.join_code)+'</strong></td><td>'+esc(c.max_students)+'</td><td><span class="pill '+(c.is_active?'published':'draft')+'">'+(c.is_active?'aktif':'pasif')+'</span></td></tr>').join('')+'</tbody></table></div></div>';
    $('#panel').querySelectorAll('[data-edu]').forEach(b=>b.onclick=()=>{const p=profiles.find(x=>x.user_id===b.dataset.edu);openModal('<h2>Eğitimci hesabı</h2><form id="eduProfileForm" class="stack"><label>Görünen ad<input name="name" value="'+esc(p.display_name)+'"></label><div class="grid-2"><label>Rol<select name="role"><option '+(p.role==='teacher'?'selected':'')+'>teacher</option><option '+(p.role==='school_admin'?'selected':'')+'>school_admin</option><option '+(p.role==='admin'?'selected':'')+'>admin</option></select></label><label>Plan<select name="plan"><option '+(p.plan==='free'?'selected':'')+'>free</option><option '+(p.plan==='pro'?'selected':'')+'>pro</option><option '+(p.plan==='school'?'selected':'')+'>school</option></select></label></div><button class="btn primary">Kaydet</button></form>');$('#eduProfileForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const {error}=await A.state.db.from('educator_profiles').update({display_name:f.get('name'),role:f.get('role'),plan:f.get('plan'),updated_at:new Date().toISOString()}).eq('user_id',p.user_id);if(error)alert(error.message);else{closeModal();toast('Eğitimci güncellendi');educatorsView()}}});
  }

  async function mediaView(){
    const {data,error}=await A.state.db.from('esc_cms_media').select('*').order('created_at',{ascending:false});if(error)throw error;
    $('#panel').innerHTML='<div class="card"><div class="card-head"><div><h2>Medya kütüphanesi</h2><p class="muted">Site görsellerini Supabase Storage üzerinde merkezi tut.</p></div></div><form id="mediaUpload" class="upload-box stack"><label>Görsel<input name="file" type="file" accept="image/*" required></label><label>Alt metin<input name="alt" placeholder="Görsel açıklaması"></label><button class="btn primary" '+(!A.canEdit()?'disabled':'')+'>Yükle</button></form></div>'+
      '<div class="card"><div class="media-grid">'+(data||[]).map(m=>'<article class="media-item"><img src="'+esc(m.public_url)+'" alt="'+esc(m.alt_text||'')+'"><div class="media-info"><strong>'+esc(m.file_name)+'</strong><small>'+esc(m.alt_text||'Alt metin yok')+'</small><div class="row-actions" style="margin-top:9px"><button class="icon-btn" data-copy="'+esc(m.public_url)+'">URL kopyala</button><button class="icon-btn danger-text" data-media-delete="'+m.id+'" data-path="'+esc(m.storage_path)+'" '+(!A.canEdit()?'disabled':'')+'>Sil</button></div></div></article>').join('')+'</div></div>';
    $('#mediaUpload').onsubmit=async e=>{e.preventDefault();const file=e.currentTarget.elements.file.files[0];if(!file)return;const btn=e.currentTarget.querySelector('button');btn.disabled=true;btn.textContent='Yükleniyor…';try{const asset=await A.uploadAsset(file,'library');await A.saveMediaRecord(asset,file,e.currentTarget.elements.alt.value);toast('Görsel yüklendi');mediaView()}catch(err){alert(err.message)}};
    $('#panel').querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(b.dataset.copy);toast('URL kopyalandı')});
    $('#panel').querySelectorAll('[data-media-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('Bu görseli medya kütüphanesinden sil?'))return;let r=await A.state.db.storage.from('esc-site-media').remove([b.dataset.path]);if(r.error){alert(r.error.message);return}r=await A.state.db.from('esc_cms_media').delete().eq('id',b.dataset.mediaDelete);if(r.error)alert(r.error.message);else mediaView()});
  }

  async function analyticsView(){
    const since=new Date(Date.now()-30*86400000).toISOString();
    const {data,error}=await A.state.db.from('site_analytics').select('created_at,event_name,page_path,target,mode').gte('created_at',since).order('created_at',{ascending:false}).limit(5000);if(error)throw error;
    const rows=data||[];const views=rows.filter(x=>x.event_name==='page_view'),clicks=rows.filter(x=>x.event_name==='cta_click');
    const pathCounts={};views.forEach(x=>pathCounts[x.page_path]=(pathCounts[x.page_path]||0)+1);const top=Object.entries(pathCounts).sort((a,b)=>b[1]-a[1]).slice(0,12);const max=Math.max(1,...top.map(x=>x[1]));
    $('#panel').innerHTML='<div class="stats"><div class="stat"><span>30 GÜN PAGE VIEW</span><strong>'+views.length+'</strong><small>Son 5000 event içinde</small></div><div class="stat"><span>CTA CLICK</span><strong>'+clicks.length+'</strong><small>Form / Instagram / diğer</small></div><div class="stat"><span>SCROLL 50%</span><strong>'+rows.filter(x=>x.event_name==='scroll_50').length+'</strong><small>İçerik tüketimi</small></div><div class="stat"><span>SCROLL 90%</span><strong>'+rows.filter(x=>x.event_name==='scroll_90').length+'</strong><small>Derin okuma</small></div></div>'+
      '<div class="card"><div class="card-head"><div><h2>En çok görüntülenen sayfalar</h2><p class="muted">Son 30 gün.</p></div></div><div class="analytics-chart">'+top.map(([p,n])=>'<div class="bar-row"><b>'+esc(p)+'</b><i><span style="--w:'+Math.round(n/max*100)+'%"></span></i><em>'+n+'</em></div>').join('')+'</div></div>';
  }

  async function teamView(){
    if(!A.isSuper()){ $('#panel').innerHTML='<div class="card"><div class="notice warning">Yönetici Ekibi yalnızca Super Admin tarafından değiştirilebilir.</div></div>';return }
    const {data,error}=await A.state.db.from('esc_admin_profiles').select('*').order('created_at');if(error)throw error;
    $('#panel').innerHTML='<div class="card"><div class="card-head"><div><h2>Yönetici ekibi</h2><p class="muted">Önceden Supabase Auth hesabı olan kişiye site yönetim yetkisi ver.</p></div><button id="addAdmin" class="btn primary">+ Yönetici ekle</button></div><div class="table-wrap"><table><thead><tr><th>E-posta</th><th>Rol</th><th>Durum</th><th></th></tr></thead><tbody>'+data.map(p=>'<tr><td>'+esc(p.email||p.user_id)+'</td><td>'+esc(p.role)+'</td><td><span class="pill '+(p.active?'published':'draft')+'">'+(p.active?'aktif':'pasif')+'</span></td><td><div class="row-actions"><button class="icon-btn" data-admin-edit="'+p.user_id+'">Düzenle</button>'+(p.user_id!==A.state.session.user.id?'<button class="icon-btn danger-text" data-admin-remove="'+p.user_id+'">Kaldır</button>':'')+'</div></td></tr>').join('')+'</tbody></table></div></div>';
    $('#addAdmin').onclick=()=>{openModal('<h2>Yönetici yetkisi ver</h2><form id="addAdminForm" class="stack"><label>Supabase Auth e-postası<input name="email" type="email" required></label><label>Rol<select name="role"><option>editor</option><option>viewer</option><option>super_admin</option></select></label><button class="btn primary">Yetki ver</button></form>');$('#addAdminForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const {error}=await A.state.db.rpc('esc_cms_add_admin_by_email',{p_email:f.get('email'),p_role:f.get('role')});if(error)alert(error.message);else{closeModal();toast('Yönetici eklendi');teamView()}}};
    $('#panel').querySelectorAll('[data-admin-edit]').forEach(b=>b.onclick=()=>{const p=data.find(x=>x.user_id===b.dataset.adminEdit);openModal('<h2>Yönetici rolü</h2><form id="editAdminForm" class="stack"><label>Rol<select name="role"><option '+(p.role==='editor'?'selected':'')+'>editor</option><option '+(p.role==='viewer'?'selected':'')+'>viewer</option><option '+(p.role==='super_admin'?'selected':'')+'>super_admin</option></select></label><label><input name="active" type="checkbox" '+(p.active?'checked':'')+'> Aktif</label><button class="btn primary">Kaydet</button></form>');$('#editAdminForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const {error}=await A.state.db.from('esc_admin_profiles').update({role:f.get('role'),active:f.get('active')==='on',updated_at:new Date().toISOString()}).eq('user_id',p.user_id);if(error)alert(error.message);else{closeModal();teamView()}}});
    $('#panel').querySelectorAll('[data-admin-remove]').forEach(b=>b.onclick=async()=>{if(!confirm('Bu kişinin site yönetim yetkisini kaldır?'))return;const {error}=await A.state.db.rpc('esc_cms_remove_admin',{p_user_id:b.dataset.adminRemove});if(error)alert(error.message);else teamView()});
  }

  async function settingsView(){
    const {data,error}=await A.state.db.from('esc_cms_settings').select('*').order('key');if(error)throw error;
    const identity=data.find(x=>x.key==='site_identity')||{key:'site_identity',draft_data:{}};const social=data.find(x=>x.key==='social_links')||{key:'social_links',draft_data:{}};
    const id=identity.draft_data||{},so=social.draft_data||{};
    $('#panel').innerHTML='<div class="card"><div class="card-head"><div><h2>Genel site ayarları</h2><p class="muted">Marka, iletişim ve sosyal bağlantılar.</p></div></div><form id="settingsForm" class="stack"><div class="grid-2"><label>Site adı<input name="site_name" value="'+esc(id.site_name||'Eryaman Speaking Club')+'"></label><label>İletişim e-postası<input name="contact_email" type="email" value="'+esc(id.contact_email||'')+'"></label></div><div class="grid-2"><label>Instagram<input name="instagram" value="'+esc(so.instagram||'')+'"></label><label>TikTok<input name="tiktok" value="'+esc(so.tiktok||'')+'"></label></div><button class="btn primary" '+(!A.canEdit()?'disabled':'')+'>Kaydet & yayınla</button></form></div>'+
      '<div class="card"><div class="card-head"><div><h2>Güvenlik</h2><p class="muted">Yönetim paneli hesabının şifresini değiştir.</p></div></div><form id="passwordChangeForm" class="stack"><label>Yeni şifre<input name="password" type="password" minlength="8" autocomplete="new-password" required></label><label>Yeni şifre tekrar<input name="password2" type="password" minlength="8" autocomplete="new-password" required></label><button class="btn primary">Şifreyi değiştir</button></form></div>';
    $('#passwordChangeForm').onsubmit=async e=>{
      e.preventDefault();
      const f=new FormData(e.currentTarget),p=String(f.get('password')||''),p2=String(f.get('password2')||'');
      if(p!==p2){alert('Şifreler aynı değil.');return}
      try{
        await window.ESCSupabase.updatePassword(p);
        e.currentTarget.reset();
        toast('Şifre değiştirildi');
      }catch(err){alert(err.message||err)}
    };
    $('#settingsForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);try{let r=await A.state.db.from('esc_cms_settings').update({draft_data:{site_name:f.get('site_name'),contact_email:f.get('contact_email')},has_unpublished_changes:true,updated_by:A.state.session.user.id,updated_at:new Date().toISOString()}).eq('key','site_identity');if(r.error)throw r.error;r=await A.state.db.rpc('esc_cms_publish_setting',{p_key:'site_identity'});if(r.error)throw r.error;r=await A.state.db.from('esc_cms_settings').update({draft_data:{instagram:f.get('instagram'),tiktok:f.get('tiktok')},has_unpublished_changes:true,updated_by:A.state.session.user.id,updated_at:new Date().toISOString()}).eq('key','social_links');if(r.error)throw r.error;r=await A.state.db.rpc('esc_cms_publish_setting',{p_key:'social_links'});if(r.error)throw r.error;toast('Genel ayarlar yayınlandı')}catch(err){alert(err.message)}};
  }

  A.register('events',eventsView);A.register('games',gamesView);A.register('educators',educatorsView);A.register('media',mediaView);A.register('analytics',analyticsView);A.register('team',teamView);A.register('settings',settingsView);
})();