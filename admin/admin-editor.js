(() => {
  'use strict';
  const A=window.ESCAdmin;
  const {$,$$,esc,clone,toast,openModal,closeModal}=A;
  let pages=[],current=null,workingData=null,workingSeo=null,frame=null;

  function normalizeData(data){
    const x=clone(data||{});
    if(!Array.isArray(x.patches))x.patches=[];
    if(!Array.isArray(x.sections))x.sections=[];
    return x;
  }
  function pageUrl(path,skip=true){
    const q=(path.includes('?')?'&':'?')+(skip?'cms_skip=1&':'')+'cms_admin_preview=1&v='+Date.now();
    return path+q;
  }
  function cssPath(el,doc){
    if(el.id) return '#'+CSS.escape(el.id);
    const parts=[]; let cur=el;
    while(cur&&cur!==doc.body){
      let part=cur.tagName.toLowerCase();
      const parent=cur.parentElement;
      if(parent){
        const same=[...parent.children].filter(x=>x.tagName===cur.tagName);
        if(same.length>1) part+=':nth-of-type('+(same.indexOf(cur)+1)+')';
      }
      parts.unshift(part); cur=parent;
    }
    return parts.join(' > ');
  }
  function findEditable(target,doc){
    if(target?.tagName==='IMG')return {el:target,type:'image'};
    const allowed=new Set(['H1','H2','H3','H4','H5','H6','P','A','BUTTON','SPAN','SMALL','STRONG','B','EM','LI','SUMMARY','FIGCAPTION','LABEL','DIV']);
    let cur=target;
    while(cur&&cur!==doc.body){
      if(allowed.has(cur.tagName)){
        const nodes=[...cur.childNodes].filter(n=>n.nodeType===3&&n.nodeValue.trim());
        if(nodes.length)return {el:cur,type:'textNode',node:nodes[0],nodeIndex:[...cur.childNodes].filter(n=>n.nodeType===3).indexOf(nodes[0])};
        if(cur.children.length===0&&cur.textContent.trim())return {el:cur,type:'text'};
      }
      cur=cur.parentElement;
    }
    return null;
  }
  function applyPatchDoc(doc,p){
    let els=[];try{els=[...doc.querySelectorAll(p.selector)]}catch(_){}
    els.forEach(el=>{
      if(p.kind==='text')el.textContent=p.value??'';
      else if(p.kind==='textNode'){
        const nodes=[...el.childNodes].filter(n=>n.nodeType===3);
        if(nodes[p.node_index??0])nodes[p.node_index??0].nodeValue=p.value??'';
      }else if(p.kind==='html')el.innerHTML=p.value??'';
      else if(p.kind==='image'){if(p.value)el.src=p.value;if('alt'in el&&p.alt!==undefined)el.alt=p.alt||''}
      else if(p.kind==='attr'&&p.attr){if(p.value)el.setAttribute(p.attr,p.value);else el.removeAttribute(p.attr)}
    });
  }
  function applySectionsDoc(doc){
    const sections=workingData.sections||[];
    const found=sections.map((x,i)=>{let el=null;try{el=doc.querySelector(x.selector)}catch(_){}return el?{x,el,i}:null}).filter(Boolean);
    found.forEach(({x,el})=>{el.style.display=x.visible===false?'none':''});
    const groups=new Map();
    found.forEach(o=>{const p=o.el.parentElement;if(!p)return;if(!groups.has(p))groups.set(p,[]);groups.get(p).push(o)});
    groups.forEach(g=>{g.sort((a,b)=>(a.x.order??a.i)-(b.x.order??b.i));g.forEach(o=>o.el.parentElement.appendChild(o.el))});
  }
  function applyWorking(){
    const doc=frame?.contentDocument;if(!doc)return;
    (workingData.patches||[]).forEach(p=>applyPatchDoc(doc,p));
    applySectionsDoc(doc);
    if(workingSeo?.title)doc.title=workingSeo.title;
  }
  function upsertPatch(patch){
    const list=workingData.patches||[];
    const i=list.findIndex(x=>x.selector===patch.selector&&x.kind===patch.kind&&(x.node_index??null)===(patch.node_index??null)&&(x.attr??null)===(patch.attr??null));
    if(i>=0)list[i]=Object.assign({},list[i],patch);else list.push(Object.assign({id:'p'+Date.now()},patch));
    workingData.patches=list;
  }
  async function uploadImage(file,alt){
    if(!file)return null;
    const asset=await A.uploadAsset(file,'cms');
    await A.saveMediaRecord(asset,file,alt);
    return asset.url;
  }
  function editClicked(found,doc){
    const selector=cssPath(found.el,doc);
    if(found.type==='image'){
      const currentSrc=found.el.getAttribute('src')||'';
      const currentAlt=found.el.getAttribute('alt')||'';
      openModal('<h2>Görseli düzenle</h2><form id="cmsImageForm" class="stack">'+
        '<img class="preview-image" src="'+esc(found.el.src||currentSrc)+'" alt="">'+
        '<label>Yeni görsel yükle<input name="file" type="file" accept="image/*"></label>'+
        '<label>veya görsel URL<input name="url" value="'+esc(currentSrc)+'"></label>'+
        '<label>Alt metin<input name="alt" value="'+esc(currentAlt)+'"></label>'+
        '<button class="btn primary">Taslağa uygula</button></form>');
      $('#cmsImageForm').onsubmit=async e=>{
        e.preventDefault();
        const f=new FormData(e.currentTarget);let url=String(f.get('url')||'').trim();
        const file=e.currentTarget.elements.file.files[0];
        if(file){e.currentTarget.querySelector('button').textContent='Yükleniyor…';url=await uploadImage(file,f.get('alt'))}
        upsertPatch({selector,kind:'image',value:url,alt:f.get('alt')||''});
        found.el.src=url;found.el.alt=f.get('alt')||'';closeModal();toast('Görsel taslağa uygulandı');
      };
      return;
    }
    const value=found.type==='textNode'?found.node.nodeValue:found.el.textContent;
    const anchor=found.el.closest('a');
    openModal('<h2>Metni düzenle</h2><form id="cmsTextForm" class="stack">'+
      '<label>Metin<textarea name="value" rows="5">'+esc(value)+'</textarea></label>'+
      (anchor?'<label>Bağlantı adresi<input name="href" value="'+esc(anchor.getAttribute('href')||'')+'"></label>':'')+
      '<button class="btn primary">Taslağa uygula</button></form>');
    $('#cmsTextForm').onsubmit=e=>{
      e.preventDefault();const f=new FormData(e.currentTarget);
      const nv=String(f.get('value')??'');
      upsertPatch({selector,kind:found.type,node_index:found.nodeIndex,value:nv});
      if(found.type==='textNode')found.node.nodeValue=nv;else found.el.textContent=nv;
      if(anchor){
        const aSelector=cssPath(anchor,doc);const href=String(f.get('href')||'');
        upsertPatch({selector:aSelector,kind:'attr',attr:'href',value:href});anchor.setAttribute('href',href);
      }
      closeModal();toast('Metin taslağa uygulandı');
    };
  }
  function injectEditor(){
    const doc=frame?.contentDocument;if(!doc)return;
    const style=doc.createElement('style');style.id='escAdminOverlayStyle';
    style.textContent='[data-esc-admin-hover]{outline:3px solid #f29d38!important;outline-offset:3px!important;cursor:pointer!important} img[data-esc-admin-hover]{outline-color:#175ca8!important}';
    doc.head.appendChild(style);
    let last=null;
    doc.addEventListener('mouseover',e=>{const f=findEditable(e.target,doc);if(last)last.removeAttribute('data-esc-admin-hover');if(f){f.el.setAttribute('data-esc-admin-hover','1');last=f.el}},true);
    doc.addEventListener('mouseout',e=>{if(last){last.removeAttribute('data-esc-admin-hover');last=null}},true);
    doc.addEventListener('click',e=>{
      const found=findEditable(e.target,doc);if(!found)return;
      e.preventDefault();e.stopPropagation();editClicked(found,doc);
    },true);
  }
  function discoverSections(){
    const doc=frame?.contentDocument;if(!doc)return [];
    const els=[...doc.querySelectorAll('main > section')];
    return els.map((el,i)=>{
      const selector=el.id?'#'+CSS.escape(el.id):'main > section:nth-of-type('+(i+1)+')';
      const h=el.querySelector('h1,h2,h3');
      const existing=(workingData.sections||[]).find(x=>x.selector===selector);
      return existing||{selector,label:(h?.textContent||el.id||el.className||('Bölüm '+(i+1))).trim().slice(0,80),visible:true,order:i};
    });
  }
  function sectionsModal(){
    workingData.sections=discoverSections();
    const draw=()=>{
      openModal('<div class="card-head"><div><h2>Sayfa bölümleri</h2><p class="muted">Bölümleri gizle/göster veya sıralamasını değiştir.</p></div></div><div id="cmsSectionList" class="section-list">'+
        workingData.sections.map((s,i)=>'<div class="section-row '+(s.visible===false?'hidden-section':'')+'"><span class="drag">☰</span><div><strong>'+esc(s.label||s.selector)+'</strong><small>'+esc(s.selector)+'</small></div><div class="row-actions"><button class="icon-btn" data-up="'+i+'" '+(i===0?'disabled':'')+'>↑</button><button class="icon-btn" data-down="'+i+'" '+(i===workingData.sections.length-1?'disabled':'')+'>↓</button><button class="icon-btn" data-toggle="'+i+'">'+(s.visible===false?'Göster':'Gizle')+'</button></div></div>').join('')+
        '</div><div class="row-actions" style="margin-top:14px"><button id="closeSections" class="btn primary">Tamam</button></div>');
      $('#cmsSectionList').querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{const i=+b.dataset.up;[workingData.sections[i-1],workingData.sections[i]]=[workingData.sections[i],workingData.sections[i-1]];workingData.sections.forEach((x,j)=>x.order=j);applyWorking();draw()});
      $('#cmsSectionList').querySelectorAll('[data-down]').forEach(b=>b.onclick=()=>{const i=+b.dataset.down;[workingData.sections[i+1],workingData.sections[i]]=[workingData.sections[i],workingData.sections[i+1]];workingData.sections.forEach((x,j)=>x.order=j);applyWorking();draw()});
      $('#cmsSectionList').querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>{const s=workingData.sections[+b.dataset.toggle];s.visible=s.visible===false?true:false;applyWorking();draw()});
      $('#closeSections').onclick=()=>closeModal();
    }; draw();
  }
  function seoModal(){
    openModal('<h2>SEO & paylaşım bilgileri</h2><form id="seoForm" class="stack">'+
      '<label>Sayfa başlığı<input name="title" value="'+esc(workingSeo.title||'')+'"></label>'+
      '<label>Meta açıklama<textarea name="description" rows="4">'+esc(workingSeo.description||'')+'</textarea></label>'+
      '<label>Open Graph başlığı<input name="og_title" value="'+esc(workingSeo.og_title||'')+'"></label>'+
      '<label>Open Graph açıklama<textarea name="og_description" rows="3">'+esc(workingSeo.og_description||'')+'</textarea></label>'+
      '<label>Paylaşım görseli URL<input name="og_image" value="'+esc(workingSeo.og_image||'')+'"></label>'+
      '<button class="btn primary">Taslağa uygula</button></form>');
    $('#seoForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);workingSeo={title:f.get('title'),description:f.get('description'),og_title:f.get('og_title'),og_description:f.get('og_description'),og_image:f.get('og_image')};closeModal();toast('SEO taslağa uygulandı')};
  }
  async function saveDraft(){
    if(!A.canEdit())throw new Error('Bu hesap salt-okunur.');
    const {data,error}=await A.state.db.from('esc_cms_pages').update({
      draft_data:workingData,draft_seo:workingSeo,has_unpublished_changes:true,
      updated_by:A.state.session.user.id,updated_at:new Date().toISOString()
    }).eq('id',current.id).select('*').single();
    if(error)throw error;current=data;toast('Taslak kaydedildi');return data;
  }
  async function publish(){
    await saveDraft();
    const {data,error}=await A.state.db.rpc('esc_cms_publish_page',{p_page_id:current.id,p_note:'Eryaman Speaking Club yönetim panelinden yayınlandı'});
    if(error)throw error;current=data;toast('Yayınlandı · canlı site güncellendi');
    $('#editorState').textContent='YAYINDA · v'+(data.version||0);
  }
  function loadFrame(){
    frame=$('#liveEditorFrame');if(!frame)return;
    $('#editorStatus').textContent='Yükleniyor…';
    frame.src=pageUrl(current.path,true);
    frame.onload=()=>{workingData=normalizeData(current.draft_data);workingSeo=clone(current.draft_seo||{});applyWorking();injectEditor();$('#editorStatus').textContent='Tıklayarak düzenleyebilirsin'};
  }
  async function renderEditor(preselect){
    const {data,error}=await A.state.db.from('esc_cms_pages').select('*').eq('active',true).eq('page_kind','static').order('category').order('name');
    if(error)throw error;pages=data||[];
    current=pages.find(p=>p.id===preselect)||pages.find(p=>p.path==='/')||pages[0];
    workingData=normalizeData(current?.draft_data);workingSeo=clone(current?.draft_seo||{});
    $('#panel').innerHTML='<div class="card"><div class="card-head"><div><h2>Canlı siteyi tıklayarak düzenle</h2><p class="muted">Turuncu çerçeve metin, mavi çerçeve görsel düzenleme alanıdır.</p></div><span id="editorState" class="pill '+(current.has_unpublished_changes?'draft':'published')+'">'+(current.has_unpublished_changes?'TASLAK DEĞİŞİKLİK':'YAYINDA · v'+current.version)+'</span></div>'+
      '<div class="editor-toolbar"><label>Sayfa<select id="editorPage">'+pages.map(p=>'<option value="'+p.id+'" '+(p.id===current.id?'selected':'')+'>'+esc(p.name)+' · '+esc(p.path)+'</option>').join('')+'</select></label>'+
      '<button class="btn secondary" id="reloadEditor">Önizlemeyi yenile</button><button class="btn secondary" id="sectionsBtn">Bölümler</button><button class="btn secondary" id="seoBtn">SEO</button>'+
      '<button class="btn secondary" id="saveDraftBtn" '+(!A.canEdit()?'disabled':'')+'>Taslak kaydet</button><button class="btn primary" id="publishBtn" '+(!A.canEdit()?'disabled':'')+'>Yayınla</button><span id="editorStatus" class="editor-status"></span></div>'+
      '<div class="live-editor-shell"><iframe id="liveEditorFrame" class="live-editor-frame" title="Canlı site editörü"></iframe></div>'+
      '<div class="editor-guide"><span class="text">Metne tıkla → düzenle</span><span class="image">Görsele tıkla → değiştir</span><span>Bölümler → sırala/gizle</span><span>Yayınla → gerçek siteye gönder</span></div></div>';
    $('#editorPage').onchange=()=>renderEditor($('#editorPage').value);
    $('#reloadEditor').onclick=loadFrame;$('#sectionsBtn').onclick=sectionsModal;$('#seoBtn').onclick=seoModal;
    $('#saveDraftBtn').onclick=async()=>{try{await saveDraft();$('#editorState').textContent='TASLAK DEĞİŞİKLİK'}catch(e){alert(e.message)}};
    $('#publishBtn').onclick=async e=>{e.currentTarget.disabled=true;try{await publish()}catch(x){alert(x.message)}finally{e.currentTarget.disabled=false}};
    loadFrame();
  }

  async function pagesView(){
    const {data,error}=await A.state.db.from('esc_cms_pages').select('*').eq('page_kind','static').order('category').order('name');if(error)throw error;
    $('#panel').innerHTML='<div class="card"><div class="card-head"><div><h2>Sayfalar & bölümler</h2><p class="muted">39 sayfanın yayın durumu, SEO’su ve canlı editöre girişi.</p></div><button id="openHomeEditor" class="btn primary">Ana sayfayı düzenle</button></div><div class="table-wrap"><table><thead><tr><th>Sayfa</th><th>Kategori</th><th>Durum</th><th>Sürüm</th><th>Son güncelleme</th><th></th></tr></thead><tbody>'+
      (data||[]).map(p=>'<tr><td><strong>'+esc(p.name)+'</strong><br><small>'+esc(p.path)+'</small></td><td>'+esc(p.category)+'</td><td><span class="pill '+(p.has_unpublished_changes?'draft':'published')+'">'+(p.has_unpublished_changes?'taslak değişiklik':'yayında')+'</span></td><td>v'+esc(p.version)+'</td><td>'+esc(A.fmt(p.updated_at))+'</td><td><div class="row-actions"><button class="icon-btn" data-edit="'+p.id+'">Düzenle</button><a class="icon-btn" href="'+esc(p.path)+'" target="_blank">Aç ↗</a></div></td></tr>').join('')+
      '</tbody></table></div></div>';
    $('#openHomeEditor').onclick=()=>{A.go('siteEditor')};
    $('#panel').querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{A.state.currentView='siteEditor';$('#viewTitle').textContent='Canlı Site Editörü';renderEditor(b.dataset.edit)});
  }

  async function historyView(){
    const {data,error}=await A.state.db.from('esc_cms_revisions').select('*').order('created_at',{ascending:false}).limit(150);if(error)throw error;
    $('#panel').innerHTML='<div class="card"><div class="card-head"><div><h2>Sürüm geçmişi</h2><p class="muted">Geri yükleme doğrudan canlıyı değiştirmez; seçilen sürümü taslağa getirir.</p></div></div>'+
      ((data||[]).length?'<div class="table-wrap"><table><thead><tr><th>Sayfa</th><th>Sürüm</th><th>Tarih</th><th>Not</th><th></th></tr></thead><tbody>'+
      data.map(r=>'<tr><td>'+esc(r.page_path)+'</td><td>v'+esc(r.version)+'</td><td>'+esc(A.fmt(r.created_at))+'</td><td>'+esc(r.note||'')+'</td><td><button class="icon-btn" data-restore="'+r.id+'" '+(!A.canEdit()?'disabled':'')+'>Taslağa geri yükle</button></td></tr>').join('')+'</tbody></table></div>':'<div class="empty">Henüz yayın sürümü yok.</div>')+'</div>';
    $('#panel').querySelectorAll('[data-restore]').forEach(b=>b.onclick=async()=>{if(!confirm('Bu sürümü yeni taslak olarak geri yüklemek istiyor musun?'))return;const {error}=await A.state.db.rpc('esc_cms_restore_revision',{p_revision_id:+b.dataset.restore});if(error)alert(error.message);else{toast('Sürüm taslağa geri yüklendi');historyView()}});
  }

  A.register('siteEditor',()=>renderEditor());
  A.register('pages',pagesView);
  A.register('history',historyView);
})();