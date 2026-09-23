(() => {
  'use strict';
  const A=window.ESCAdmin;
  const {$,$$,esc,clone,toast,openModal,closeModal}=A;

  async function loadSetting(key){
    const {data,error}=await A.state.db.from('esc_cms_settings').select('*').eq('key',key).single();
    if(error)throw error;
    return data;
  }
  async function saveSetting(key,data,publish=false){
    if(!A.canEdit())throw new Error('Bu hesap salt-okunur.');
    let r=await A.state.db.from('esc_cms_settings').update({
      draft_data:data,has_unpublished_changes:true,updated_by:A.state.session.user.id,updated_at:new Date().toISOString()
    }).eq('key',key);
    if(r.error)throw r.error;
    if(publish){
      r=await A.state.db.rpc('esc_cms_publish_setting',{p_key:key});
      if(r.error)throw r.error;
    }
  }

  async function navigationView(){
    const [navRow,footerRow]=await Promise.all([loadSetting('navigation'),loadSetting('footer')]);
    let nav=clone(navRow.draft_data||{items:[]}),footer=clone(footerRow.draft_data||{links:[]});
    if(!Array.isArray(nav.items))nav.items=[];
    if(!Array.isArray(footer.links))footer.links=[];

    const render=()=>{
      $('#panel').innerHTML=
        '<div class="card"><div class="card-head"><div><h2>Ana navigasyon</h2><p class="muted">TR/EN menü etiketleri, sıralama, görünürlük ve bağlantılar.</p></div><div class="row-actions"><button id="addNavItem" class="btn secondary" '+(!A.canEdit()?'disabled':'')+'>+ Menü öğesi</button><button id="saveNav" class="btn secondary" '+(!A.canEdit()?'disabled':'')+'>Taslak kaydet</button><button id="publishNav" class="btn primary" '+(!A.canEdit()?'disabled':'')+'>Yayınla</button></div></div>'+
        '<div class="section-list" id="navItems">'+nav.items.map((x,i)=>'<div class="section-row '+(x.visible===false?'hidden-section':'')+'"><span class="drag">☰</span><div><strong>'+esc(x.label?.tr||x.label?.en||'Menü')+'</strong><small>'+esc(x.label?.en||'')+' · '+esc(x.href||'#')+'</small></div><div class="row-actions"><button class="icon-btn" data-nav-up="'+i+'" '+(i===0?'disabled':'')+'>↑</button><button class="icon-btn" data-nav-down="'+i+'" '+(i===nav.items.length-1?'disabled':'')+'>↓</button><button class="icon-btn" data-nav-edit="'+i+'">Düzenle</button><button class="icon-btn" data-nav-toggle="'+i+'">'+(x.visible===false?'Göster':'Gizle')+'</button><button class="icon-btn danger-text" data-nav-delete="'+i+'">Sil</button></div></div>').join('')+'</div>'+
        '<div class="card" style="margin-top:16px"><div class="card-head"><div><h2>Üst menü CTA</h2><p class="muted">Sağdaki ana aksiyon butonu.</p></div></div><div class="grid-2"><label class="field">TR metin<input id="ctaTr" value="'+esc(nav.cta?.label?.tr||'')+'"></label><label class="field">EN metin<input id="ctaEn" value="'+esc(nav.cta?.label?.en||'')+'"></label><label class="field">Link<input id="ctaHref" value="'+esc(nav.cta?.href||'')+'"></label><label class="field">Görünür<select id="ctaVisible"><option value="true" '+(nav.cta?.visible!==false?'selected':'')+'>Evet</option><option value="false" '+(nav.cta?.visible===false?'selected':'')+'>Hayır</option></select></label></div></div>'+
        '</div>'+
        '<div class="card"><div class="card-head"><div><h2>Footer</h2><p class="muted">Alt bölüm metni ve bağlantıları.</p></div><div class="row-actions"><button id="addFooterItem" class="btn secondary" '+(!A.canEdit()?'disabled':'')+'>+ Footer linki</button><button id="saveFooter" class="btn secondary" '+(!A.canEdit()?'disabled':'')+'>Taslak kaydet</button><button id="publishFooter" class="btn primary" '+(!A.canEdit()?'disabled':'')+'>Yayınla</button></div></div>'+
        '<div class="grid-2"><label class="field">Slogan TR<input id="footerTagTr" value="'+esc(footer.tagline?.tr||'')+'"></label><label class="field">Slogan EN<input id="footerTagEn" value="'+esc(footer.tagline?.en||'')+'"></label><label class="field">Konum TR<input id="footerLocTr" value="'+esc(footer.location?.tr||'')+'"></label><label class="field">Konum EN<input id="footerLocEn" value="'+esc(footer.location?.en||'')+'"></label></div>'+
        '<div class="section-list" style="margin-top:15px">'+footer.links.map((x,i)=>'<div class="section-row '+(x.visible===false?'hidden-section':'')+'"><span class="drag">↳</span><div><strong>'+esc(x.label?.tr||x.label?.en||'Link')+'</strong><small>'+esc(x.label?.en||'')+' · '+esc(x.href||'#')+'</small></div><div class="row-actions"><button class="icon-btn" data-footer-up="'+i+'" '+(i===0?'disabled':'')+'>↑</button><button class="icon-btn" data-footer-down="'+i+'" '+(i===footer.links.length-1?'disabled':'')+'>↓</button><button class="icon-btn" data-footer-edit="'+i+'">Düzenle</button><button class="icon-btn" data-footer-toggle="'+i+'">'+(x.visible===false?'Göster':'Gizle')+'</button><button class="icon-btn danger-text" data-footer-delete="'+i+'">Sil</button></div></div>').join('')+'</div></div>';

      const syncNavFields=()=>{nav.cta={label:{tr:$('#ctaTr').value,en:$('#ctaEn').value},href:$('#ctaHref').value,visible:$('#ctaVisible').value==='true'}};
      const syncFooterFields=()=>{footer.tagline={tr:$('#footerTagTr').value,en:$('#footerTagEn').value};footer.location={tr:$('#footerLocTr').value,en:$('#footerLocEn').value}};

      const openItem=(kind,index)=>{
        const arr=kind==='nav'?nav.items:footer.links;
        const item=index===null?{label:{tr:'',en:''},href:'',visible:true}:clone(arr[index]);
        openModal('<h2>'+(index===null?'Yeni bağlantı':'Bağlantıyı düzenle')+'</h2><form id="linkEditForm" class="stack"><div class="grid-2"><label>Metin TR<input name="tr" required value="'+esc(item.label?.tr||'')+'"></label><label>Metin EN<input name="en" value="'+esc(item.label?.en||'')+'"></label></div><label>Link<input name="href" required value="'+esc(item.href||'')+'" placeholder="/games/ veya https://..."></label><label><input name="visible" type="checkbox" '+(item.visible!==false?'checked':'')+'> Görünür</label><button class="btn primary">Kaydet</button></form>');
        $('#linkEditForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);item.label={tr:f.get('tr'),en:f.get('en')};item.href=f.get('href');item.visible=f.get('visible')==='on';if(index===null)arr.push(item);else arr[index]=item;closeModal();render()};
      };
      $('#addNavItem').onclick=()=>openItem('nav',null);
      $('#addFooterItem').onclick=()=>openItem('footer',null);
      $$('[data-nav-edit]').forEach(b=>b.onclick=()=>openItem('nav',+b.dataset.navEdit));
      $$('[data-footer-edit]').forEach(b=>b.onclick=()=>openItem('footer',+b.dataset.footerEdit));
      $$('[data-nav-up]').forEach(b=>b.onclick=()=>{syncNavFields();const i=+b.dataset.navUp;[nav.items[i-1],nav.items[i]]=[nav.items[i],nav.items[i-1]];render()});
      $$('[data-nav-down]').forEach(b=>b.onclick=()=>{syncNavFields();const i=+b.dataset.navDown;[nav.items[i+1],nav.items[i]]=[nav.items[i],nav.items[i+1]];render()});
      $$('[data-footer-up]').forEach(b=>b.onclick=()=>{syncFooterFields();const i=+b.dataset.footerUp;[footer.links[i-1],footer.links[i]]=[footer.links[i],footer.links[i-1]];render()});
      $$('[data-footer-down]').forEach(b=>b.onclick=()=>{syncFooterFields();const i=+b.dataset.footerDown;[footer.links[i+1],footer.links[i]]=[footer.links[i],footer.links[i+1]];render()});
      $$('[data-nav-toggle]').forEach(b=>b.onclick=()=>{syncNavFields();const x=nav.items[+b.dataset.navToggle];x.visible=x.visible===false;render()});
      $$('[data-footer-toggle]').forEach(b=>b.onclick=()=>{syncFooterFields();const x=footer.links[+b.dataset.footerToggle];x.visible=x.visible===false;render()});
      $$('[data-nav-delete]').forEach(b=>b.onclick=()=>{syncNavFields();nav.items.splice(+b.dataset.navDelete,1);render()});
      $$('[data-footer-delete]').forEach(b=>b.onclick=()=>{syncFooterFields();footer.links.splice(+b.dataset.footerDelete,1);render()});
      $('#saveNav').onclick=async()=>{syncNavFields();try{await saveSetting('navigation',nav,false);toast('Navigasyon taslağı kaydedildi')}catch(e){alert(e.message)}};
      $('#publishNav').onclick=async()=>{syncNavFields();try{await saveSetting('navigation',nav,true);toast('Navigasyon canlı siteye yayınlandı');navigationView()}catch(e){alert(e.message)}};
      $('#saveFooter').onclick=async()=>{syncFooterFields();try{await saveSetting('footer',footer,false);toast('Footer taslağı kaydedildi')}catch(e){alert(e.message)}};
      $('#publishFooter').onclick=async()=>{syncFooterFields();try{await saveSetting('footer',footer,true);toast('Footer canlı siteye yayınlandı');navigationView()}catch(e){alert(e.message)}};
    };
    render();
  }

  const slugify=s=>String(s||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  function emptyBlock(type){
    return {id:'b'+Date.now()+Math.random().toString(36).slice(2,5),type,visible:true,eyebrow:{tr:'',en:''},title:{tr:'',en:''},body:{tr:'',en:''},button_label:{tr:'',en:''},button_href:'',image_url:'',image_alt:{tr:'',en:''}};
  }
  function blockName(b){
    const map={hero:'Hero',text:'Metin',image_text:'Görsel + Metin',cta:'CTA'};
    return map[b.type]||b.type;
  }
  async function pageBuilder(){
    const {data,error}=await A.state.db.from('esc_cms_pages').select('*').eq('page_kind','custom').order('created_at',{ascending:false});
    if(error)throw error;
    $('#panel').innerHTML='<div class="card"><div class="card-head"><div><h2>Page Builder</h2><p class="muted">Kod yazmadan TR/EN özel sayfa oluştur, taslak tut ve yayınla.</p></div><button id="newCustomPage" class="btn primary" '+(!A.canEdit()?'disabled':'')+'>+ Yeni sayfa</button></div>'+
      ((data||[]).length?'<div class="table-wrap"><table><thead><tr><th>Sayfa</th><th>Durum</th><th>Sürüm</th><th>URL</th><th></th></tr></thead><tbody>'+data.map(p=>'<tr><td><strong>'+esc(p.name)+'</strong><br><small>'+esc(p.slug||'')+'</small></td><td><span class="pill '+(p.has_unpublished_changes||p.status==='draft'?'draft':'published')+'">'+(p.status==='draft'?'taslak':p.has_unpublished_changes?'yayın bekliyor':'yayında')+'</span></td><td>v'+esc(p.version)+'</td><td>/page.html?slug='+esc(p.slug||'')+'</td><td><div class="row-actions"><button class="icon-btn" data-page-edit="'+p.id+'">Düzenle</button>'+(p.status==='published'?'<a class="icon-btn" href="../page.html?slug='+encodeURIComponent(p.slug)+'" target="_blank">Aç ↗</a>':'')+'<button class="icon-btn danger-text" data-page-delete="'+p.id+'" '+(!A.canEdit()?'disabled':'')+'>Sil</button></div></td></tr>').join('')+'</tbody></table></div>':'<div class="empty">Henüz özel sayfa yok. İlk sayfayı oluşturabilirsin.</div>')+'</div>';
    $('#newCustomPage').onclick=()=>{openModal('<h2>Yeni sayfa</h2><form id="newPageForm" class="stack"><label>Sayfa adı<input name="name" required placeholder="Örn. Okullar İçin"></label><label>URL slug<input name="slug" required placeholder="okullar-icin"></label><button class="btn primary">Taslak sayfa oluştur</button></form>');const form=$('#newPageForm');const n=form.elements.name,s=form.elements.slug;n.oninput=()=>{if(!s.dataset.touched)s.value=slugify(n.value)};s.oninput=()=>{s.dataset.touched='1';s.value=slugify(s.value)};form.onsubmit=async e=>{e.preventDefault();const f=new FormData(form),slug=slugify(f.get('slug'));if(!slug)return;const seo={title:f.get('name')+' · Eryaman Speaking Club',description:''};const {data:created,error}=await A.state.db.from('esc_cms_pages').insert({path:'/page/'+slug+'/',slug,name:f.get('name'),category:'custom',page_kind:'custom',draft_data:{custom_blocks:[]},published_data:{custom_blocks:[]},draft_seo:seo,published_seo:{},status:'draft',has_unpublished_changes:true,updated_by:A.state.session.user.id}).select('*').single();if(error){alert(error.message);return}closeModal();openBuilder(created)}};
    $$('[data-page-edit]').forEach(b=>b.onclick=()=>openBuilder(data.find(x=>x.id===b.dataset.pageEdit)));
    $$('[data-page-delete]').forEach(b=>b.onclick=async()=>{const p=data.find(x=>x.id===b.dataset.pageDelete);if(!confirm('"'+p.name+'" sayfasını silmek istiyor musun?'))return;const {error}=await A.state.db.rpc('esc_cms_delete_custom_page',{p_page_id:p.id});if(error)alert(error.message);else{toast('Sayfa ve canlı kopyası silindi');pageBuilder()}});
  }

  function previewBlocks(blocks,lang='tr'){
    const val=x=>x?.[lang]||x?.tr||x?.en||'';
    return '<div style="border:1px solid #dce5ed;border-radius:18px;overflow:hidden">'+blocks.filter(b=>b.visible!==false).map(b=>{
      const image=b.image_url?'<img src="'+esc(b.image_url)+'" style="width:100%;max-height:260px;object-fit:cover;border-radius:14px" alt="">':'';
      const text='<small style="color:#16a6a2;font-weight:900">'+esc(val(b.eyebrow))+'</small><h2 style="color:#081f3b">'+esc(val(b.title))+'</h2><p style="color:#6f8193;line-height:1.6;white-space:pre-line">'+esc(val(b.body))+'</p>';
      if(b.type==='hero')return '<section style="padding:55px;background:#f5f9fc">'+image+text+'</section>';
      if(b.type==='image_text')return '<section style="padding:38px;display:grid;grid-template-columns:1fr 1fr;gap:25px">'+image+'<div>'+text+'</div></section>';
      if(b.type==='cta')return '<section style="padding:45px;background:#081f3b;color:#fff">'+text+'</section>';
      return '<section style="padding:38px">'+text+'</section>';
    }).join('')+'</div>';
  }

  function openBuilder(page){
    let data=clone(page.draft_data||{custom_blocks:[]}),seo=clone(page.draft_seo||{});
    if(!Array.isArray(data.custom_blocks))data.custom_blocks=[];
    const save=async()=>{
      const {data:updated,error}=await A.state.db.from('esc_cms_pages').update({draft_data:data,draft_seo:seo,has_unpublished_changes:true,updated_by:A.state.session.user.id,updated_at:new Date().toISOString()}).eq('id',page.id).select('*').single();
      if(error)throw error;page=updated;toast('Sayfa taslağı kaydedildi');
    };
    const draw=()=>{
      $('#panel').innerHTML='<div class="card"><div class="card-head"><div><button id="backBuilder" class="icon-btn">← Page Builder</button><h2 style="margin-top:10px">'+esc(page.name)+'</h2><p class="muted">/page.html?slug='+esc(page.slug)+'</p></div><div class="row-actions"><button id="previewCustom" class="btn secondary">Önizle</button><button id="seoCustom" class="btn secondary">SEO</button><button id="saveCustom" class="btn secondary" '+(!A.canEdit()?'disabled':'')+'>Taslak kaydet</button><button id="publishCustom" class="btn primary" '+(!A.canEdit()?'disabled':'')+'>Yayınla</button></div></div>'+
        '<div class="toolbar"><button class="btn secondary" data-add-block="hero">+ Hero</button><button class="btn secondary" data-add-block="text">+ Metin</button><button class="btn secondary" data-add-block="image_text">+ Görsel + Metin</button><button class="btn secondary" data-add-block="cta">+ CTA</button></div>'+
        '<div class="section-list" style="margin-top:16px">'+data.custom_blocks.map((b,i)=>'<div class="section-row '+(b.visible===false?'hidden-section':'')+'"><span class="drag">☰</span><div><strong>'+esc(blockName(b))+' · '+esc(b.title?.tr||b.title?.en||'Başlıksız')+'</strong><small>'+esc(b.type)+'</small></div><div class="row-actions"><button class="icon-btn" data-block-up="'+i+'" '+(i===0?'disabled':'')+'>↑</button><button class="icon-btn" data-block-down="'+i+'" '+(i===data.custom_blocks.length-1?'disabled':'')+'>↓</button><button class="icon-btn" data-block-edit="'+i+'">Düzenle</button><button class="icon-btn" data-block-toggle="'+i+'">'+(b.visible===false?'Göster':'Gizle')+'</button><button class="icon-btn danger-text" data-block-delete="'+i+'">Sil</button></div></div>').join('')+'</div>'+
        (!data.custom_blocks.length?'<div class="empty">Henüz blok yok. Yukarıdan Hero veya Metin bloğu ekle.</div>':'')+'</div>';
      $('#backBuilder').onclick=pageBuilder;
      $$('[data-add-block]').forEach(b=>b.onclick=()=>editBlock(emptyBlock(b.dataset.addBlock),null));
      $$('[data-block-edit]').forEach(b=>b.onclick=()=>editBlock(data.custom_blocks[+b.dataset.blockEdit],+b.dataset.blockEdit));
      $$('[data-block-up]').forEach(b=>b.onclick=()=>{const i=+b.dataset.blockUp;[data.custom_blocks[i-1],data.custom_blocks[i]]=[data.custom_blocks[i],data.custom_blocks[i-1]];draw()});
      $$('[data-block-down]').forEach(b=>b.onclick=()=>{const i=+b.dataset.blockDown;[data.custom_blocks[i+1],data.custom_blocks[i]]=[data.custom_blocks[i],data.custom_blocks[i+1]];draw()});
      $$('[data-block-toggle]').forEach(b=>b.onclick=()=>{const x=data.custom_blocks[+b.dataset.blockToggle];x.visible=x.visible===false;draw()});
      $$('[data-block-delete]').forEach(b=>b.onclick=()=>{data.custom_blocks.splice(+b.dataset.blockDelete,1);draw()});
      $('#saveCustom').onclick=async()=>{try{await save()}catch(e){alert(e.message)}};
      $('#publishCustom').onclick=async e=>{e.currentTarget.disabled=true;try{await save();const r=await A.state.db.rpc('esc_cms_publish_page',{p_page_id:page.id,p_note:'Page Builder üzerinden yayınlandı'});if(r.error)throw r.error;page=r.data;toast('Sayfa canlıya yayınlandı');draw()}catch(x){alert(x.message)}finally{e.currentTarget.disabled=false}};
      $('#previewCustom').onclick=()=>openModal('<div class="card-head"><div><h2>Taslak önizleme</h2><p class="muted">TR içerik görünümü.</p></div></div>'+previewBlocks(data.custom_blocks,'tr')+'<hr style="border:0;border-top:1px solid #dce5ed;margin:25px 0"><div class="card-head"><div><h2>English preview</h2></div></div>'+previewBlocks(data.custom_blocks,'en'));
      $('#seoCustom').onclick=()=>{openModal('<h2>SEO</h2><form id="customSeoForm" class="stack"><label>Sayfa başlığı<input name="title" value="'+esc(seo.title||'')+'"></label><label>Meta açıklama<textarea name="description" rows="4">'+esc(seo.description||'')+'</textarea></label><label>OG görsel URL<input name="og_image" value="'+esc(seo.og_image||'')+'"></label><button class="btn primary">Taslağa uygula</button></form>');$('#customSeoForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);seo={title:f.get('title'),description:f.get('description'),og_image:f.get('og_image')};closeModal();toast('SEO taslağa uygulandı')}};
    };
    const editBlock=(block,index)=>{
      const isImage=block.type==='hero'||block.type==='image_text';
      openModal('<h2>'+esc(blockName(block))+'</h2><form id="blockForm" class="stack"><div class="grid-2"><label>Eyebrow TR<input name="eyetr" value="'+esc(block.eyebrow?.tr||'')+'"></label><label>Eyebrow EN<input name="eyeen" value="'+esc(block.eyebrow?.en||'')+'"></label><label>Başlık TR<input name="titletr" value="'+esc(block.title?.tr||'')+'"></label><label>Başlık EN<input name="titleen" value="'+esc(block.title?.en||'')+'"></label></div><div class="grid-2"><label>Metin TR<textarea name="bodytr" rows="6">'+esc(block.body?.tr||'')+'</textarea></label><label>Metin EN<textarea name="bodyen" rows="6">'+esc(block.body?.en||'')+'</textarea></label></div>'+
        (isImage?'<label>Görsel URL<input name="image" value="'+esc(block.image_url||'')+'"></label><label>veya yeni görsel yükle<input name="file" type="file" accept="image/*"></label>':'')+
        '<div class="grid-2"><label>Buton TR<input name="btntr" value="'+esc(block.button_label?.tr||'')+'"></label><label>Buton EN<input name="btnen" value="'+esc(block.button_label?.en||'')+'"></label></div><label>Buton linki<input name="href" value="'+esc(block.button_href||'')+'"></label><button class="btn primary">Bloğu kaydet</button></form>');
      $('#blockForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);block.eyebrow={tr:f.get('eyetr'),en:f.get('eyeen')};block.title={tr:f.get('titletr'),en:f.get('titleen')};block.body={tr:f.get('bodytr'),en:f.get('bodyen')};block.button_label={tr:f.get('btntr'),en:f.get('btnen')};block.button_href=f.get('href')||'';if(isImage){block.image_url=f.get('image')||'';const file=e.currentTarget.elements.file.files[0];if(file){const asset=await A.uploadAsset(file,'pages');await A.saveMediaRecord(asset,file,block.title.tr||block.title.en);block.image_url=asset.url}}if(index===null)data.custom_blocks.push(block);else data.custom_blocks[index]=block;closeModal();draw()};
    };
    draw();
  }

  A.register('navigation',navigationView);
  A.register('pageBuilder',pageBuilder);
})();