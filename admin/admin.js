(() => {
  'use strict';
  const modules = {};
  const state = { db:null, session:null, profile:null, currentView:'dashboard' };
  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => [...r.querySelectorAll(s)];
  const esc = (v='') => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = v => v ? new Date(v).toLocaleString('tr-TR') : '—';
  const clone = v => JSON.parse(JSON.stringify(v ?? {}));
  const canEdit = () => state.profile && state.profile.active && state.profile.role !== 'viewer';
  const isSuper = () => state.profile?.role === 'super_admin';

  function toast(message){
    const el=$('#toast'); if(!el)return;
    el.textContent=message; el.classList.add('show');
    clearTimeout(toast._t); toast._t=setTimeout(()=>el.classList.remove('show'),2200);
  }
  function openModal(html){
    $('#modalBody').innerHTML=html; $('#modal').hidden=false;
  }
  function closeModal(){ $('#modal').hidden=true; $('#modalBody').innerHTML=''; }
  async function uploadAsset(file,prefix='site'){
    if(!file) return null;
    const safe=(file.name||'file').replace(/[^a-zA-Z0-9._-]/g,'-');
    const path=prefix+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'-'+safe;
    const {error}=await state.db.storage.from('esc-site-media').upload(path,file,{upsert:false,contentType:file.type||undefined});
    if(error) throw error;
    const url=state.db.storage.from('esc-site-media').getPublicUrl(path).data.publicUrl;
    return {path,url};
  }
  async function saveMediaRecord(asset,file,alt=''){
    if(!asset)return;
    const {error}=await state.db.from('esc_cms_media').insert({
      storage_path:asset.path, public_url:asset.url, file_name:file.name,
      mime_type:file.type||null, alt_text:alt||null, uploaded_by:state.session.user.id
    });
    if(error) throw error;
  }
  function register(name,fn){ modules[name]=fn; }

  async function dashboard(){
    const panel=$('#panel');
    const since=new Date(Date.now()-7*86400000).toISOString();
    const [pages,games,teachers,views,revs]=await Promise.all([
      state.db.from('esc_cms_pages').select('id,has_unpublished_changes',{count:'exact'}),
      state.db.from('games').select('slug',{count:'exact'}),
      state.db.from('educator_profiles').select('user_id',{count:'exact'}),
      state.db.from('site_analytics').select('id',{count:'exact'}).eq('event_name','page_view').gte('created_at',since),
      state.db.from('esc_cms_revisions').select('id',{count:'exact'})
    ]);
    const drafts=(pages.data||[]).filter(x=>x.has_unpublished_changes).length;
    panel.innerHTML=
      '<div class="stats">'+
        '<div class="stat"><span>CMS SAYFALARI</span><strong>'+esc(pages.count||0)+'</strong><small>'+drafts+' yayın bekleyen taslak</small></div>'+
        '<div class="stat"><span>OYUNLAR</span><strong>'+esc(games.count||0)+'</strong><small>Merkezi oyun yönetimi</small></div>'+
        '<div class="stat"><span>EDUCATORS</span><strong>'+esc(teachers.count||0)+'</strong><small>Kayıtlı eğitimci profili</small></div>'+
        '<div class="stat"><span>7 GÜN GÖRÜNTÜLEME</span><strong>'+esc(views.count||0)+'</strong><small>'+esc(revs.count||0)+' yayın sürümü</small></div>'+
      '</div>'+
      '<div class="card"><div class="card-head"><div><h2>Site yönetim merkezi</h2><p class="muted">Panelde Publish dediğinde değişiklik Supabase üzerinden gerçek siteye uygulanır.</p></div></div>'+
      '<div class="grid-3">'+
        '<button class="mini-card quick-card" data-go="siteEditor"><span class="pill live">CANLI</span><h3>Canlı Site Editörü</h3><p>Sayfayı aç, metne veya görsele tıkla ve doğrudan düzenle.</p></button>'+
        '<button class="mini-card quick-card" data-go="games"><span class="pill">OYUNLAR</span><h3>Game Hub</h3><p>Oyunları aç/kapat, ayarları ve merkezi içerikleri yönet.</p></button>'+
        '<button class="mini-card quick-card" data-go="educators"><span class="pill">EDTECH</span><h3>Educators</h3><p>Öğretmen, sınıf, plan ve eğitimci kullanıcılarını kontrol et.</p></button>'+
      '</div></div>'+
      (drafts?'<div class="card"><div class="notice warning"><strong>'+drafts+' sayfada yayınlanmamış değişiklik var.</strong> Pages & Sections veya Live Site Editor bölümünden kontrol edip yayınlayabilirsin.</div></div>':'');
    panel.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
  }

  async function render(view){
    state.currentView=view;
    const titles={dashboard:'Genel Bakış',siteEditor:'Canlı Site Editörü',pages:'Sayfalar & Bölümler',events:'Etkinlik & Fiyatlar',games:'Oyunlar',educators:'Educators',media:'Medya Kütüphanesi',analytics:'Site İstatistikleri',history:'Sürüm Geçmişi',team:'Yönetici Ekibi',settings:'Ayarlar'};
    $('#viewTitle').textContent=titles[view]||view;
    $('#panel').innerHTML='<div class="card"><div class="empty">Yükleniyor…</div></div>';
    try{
      if(view==='dashboard') return dashboard();
      if(!modules[view]) throw new Error('Bu modül henüz yüklenmedi.');
      await modules[view]();
    }catch(err){
      console.error(err);
      $('#panel').innerHTML='<div class="card"><p class="danger-text">'+esc(err.message||err)+'</p></div>';
    }
  }
  function go(view){
    $$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
    render(view);
  }

  async function enterApp(){
    const ok=await window.ESCSupabase.isAdmin();
    if(!ok){ await window.ESCSupabase.signOut(); $('#authMessage').textContent='Bu hesap ESC yönetim yetkisine sahip değil.'; return; }
    const {data:profile}=await state.db.from('esc_admin_profiles').select('*').eq('user_id',state.session.user.id).maybeSingle();
    state.profile=profile||{user_id:state.session.user.id,email:state.session.user.email,role:'editor',active:true};
    if(!state.profile.active){ $('#authMessage').textContent='Bu yönetici hesabı pasif durumda.'; return; }
    $('#authView').hidden=true; $('#appView').hidden=false;
    $('#userEmail').textContent=state.profile.email||state.session.user.email||'';
    $('#roleBadge').textContent=(state.profile.role||'editor').replaceAll('_',' ');
    if(state.profile.role==='viewer') $('#appView').classList.add('viewer-mode');
    if(!isSuper()) $('#nav [data-view="team"]')?.setAttribute('disabled','');
    const requested=(location.hash||'').replace('#','');
    if(requested && (requested==='dashboard' || modules[requested])) state.currentView=requested;
    $('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===state.currentView));
    await render(state.currentView);
  }

  async function bootstrap(){
    state.db=await window.ESCSupabase.getClient();
    if(!state.db){ $('#authMessage').textContent='Supabase bağlantısı bulunamadı.'; return; }
    state.session=await window.ESCSupabase.getSession();
    if(state.session) await enterApp();
  }

  document.addEventListener('DOMContentLoaded',()=>{
    $('#loginForm')?.addEventListener('submit',async e=>{
      e.preventDefault(); $('#authMessage').textContent='Giriş yapılıyor…';
      const f=new FormData(e.currentTarget);
      try{
        const out=await window.ESCSupabase.signIn(f.get('email'),f.get('password'));
        state.session=out.session; $('#authMessage').textContent=''; await enterApp();
      }catch(err){ $('#authMessage').textContent=err.message||String(err); }
    });
    $('#logoutBtn')?.addEventListener('click',async()=>{await window.ESCSupabase.signOut(); location.reload();});
    $('#refreshBtn')?.addEventListener('click',()=>render(state.currentView));
    $$('#nav button').forEach(b=>b.addEventListener('click',()=>{if(!b.disabled)go(b.dataset.view)}));
    document.addEventListener('click',e=>{if(e.target.closest('[data-close-modal]'))closeModal()});
    bootstrap();
  });

  window.ESCAdmin={
    state,$,$$,esc,fmt,clone,toast,openModal,closeModal,uploadAsset,saveMediaRecord,
    register,render,go,canEdit,isSuper
  };
})();