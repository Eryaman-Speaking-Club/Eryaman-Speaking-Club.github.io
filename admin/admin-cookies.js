/* ESC admin · editable public cookie notice */
(() => {
  'use strict';
  const A = window.ESCAdmin;
  if (!A) return;
  const {$,esc,toast} = A;
  const fields = [
    {key:'title',name:'Başlık',max:90},
    {key:'description',name:'Kısa açıklama',max:500,multiline:true},
    {key:'link_label',name:'Politika bağlantısı',max:70},
    {key:'accept_label',name:'Kabul düğmesi',max:50},
    {key:'reject_label',name:'Ret düğmesi',max:50},
    {key:'settings_label',name:'Tercihler düğmesi',max:50}
  ];
  async function cookiesView() {
    const {data,error} = await A.state.db.from('esc_cookie_banner')
      .select('*').eq('id',true).maybeSingle();
    if(error) throw error;
    if(!data) throw new Error('Çerez ayarları bulunamadı.');
    const editable = !!A.canEdit();
    const form = fields.map(item => {
      const value=esc(data[item.key] || '');
      const attr='name="'+item.key+'" maxlength="'+item.max+'" required '+(editable?'':'disabled');
      return '<label>'+esc(item.name)+(item.multiline
        ?'<textarea '+attr+' rows="4">'+value+'</textarea>'
        :'<input '+attr+' value="'+value+'">')+'</label>';
    }).join('');
    $('#panel').innerHTML =
      '<section class="card"><div class="card-head"><div><h2>Çerez uyarısı</h2>'+
      '<p class="muted">Sitede görünen kısa çerez bildirimini buradan düzenle. Teknik bilgileri veya site kodunu değiştirmen gerekmez.</p>'+
      '</div><span class="pill live">Canlı site metni</span></div>'+
      '<form class="stack" id="escCookieEditForm">'+form+
      '<button class="btn primary" type="submit" '+(editable?'':'disabled')+'>Kaydet ve yayınla</button>'+
      '</form><p class="muted" style="font-size:11px;margin-top:14px">Gizlilik ve çerez politikası bağlantısı sabittir; kısa uyarıdaki metinleri düzenlerken ayrıntılı bilgilendirme sayfası kaldırılmaz.</p></section>'+
      '<section class="card"><div class="card-head"><div><h2>Uyarı önizlemesi</h2><p class="muted">Ziyaretçinin göreceği başlık, açıklama ve bağlantı.</p></div></div>'+
      '<div class="esc-cookie-preview" style="padding:19px;border:1px solid #dce5ed;border-radius:14px;max-width:530px">'+
      '<h3 id="escCookiePreviewTitle" style="margin:0 0 8px;color:#17324b"></h3>'+
      '<p id="escCookiePreviewDescription" class="muted"></p>'+
      '<p><a href="/gizlilik-ve-cerezler/" target="_blank" rel="noopener" id="escCookiePreviewLink"></a></p>'+
      '<div class="row-actions" style="margin-top:14px">'+
      '<span class="btn primary" id="escCookiePreviewAccept"></span>'+
      '<span class="btn secondary" id="escCookiePreviewReject"></span>'+
      '<span class="btn secondary" id="escCookiePreviewSettings"></span>'+
      '</div></div></section>';
    const frm=$('#escCookieEditForm');
    const updatePreview=()=>{
      const f=new FormData(frm);
      for(const [key,id] of Object.entries({
        title:'escCookiePreviewTitle',description:'escCookiePreviewDescription',
        link_label:'escCookiePreviewLink',accept_label:'escCookiePreviewAccept',
        reject_label:'escCookiePreviewReject',settings_label:'escCookiePreviewSettings'
      })) {
        const el=$('#'+id);
        if(el)el.textContent=String(f.get(key)||data[key]||'');
      }
    };
    frm.querySelectorAll('input,textarea').forEach(el=>el.addEventListener('input',updatePreview));
    updatePreview();
    frm.onsubmit = async event=>{
      event.preventDefault();
      if(!editable)return;
      const values=new FormData(frm),payload={updated_at:new Date().toISOString()};
      for(const field of fields){
        const value=String(values.get(field.key)||'').trim();
        if(!value || value.length>field.max){
          alert(field.name+' alanını kontrol edin.');return;
        }
        payload[field.key]=value;
      }
      const btn=frm.querySelector('button[type="submit"]');
      btn.disabled=true;btn.textContent='Kaydediliyor…';
      try{
        const {data:written,error}=await A.state.db.from('esc_cookie_banner')
          .update(payload).eq('id',true).select('id').maybeSingle();
        if(error) throw error;
        if(!written) throw new Error('Kaydetme izni bulunamadı.');
        toast('Çerez uyarısı yayınlandı');
        btn.textContent='Kaydet ve yayınla';
      }catch(error){
        alert('Kaydetme başarısız: '+(error.message||error));
        btn.textContent='Kaydet ve yayınla';
      }finally{btn.disabled=false;}
    };
  }
  A.register('cookies',cookiesView);
})();
