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
        '<button class="btn primary">Kaydet ve canlıya yayınla</button></form>');
      $('#cmsImageForm').onsubmit=async e=>{
        e.preventDefault();
        const btn=e.currentTarget.querySelector('button');
        btn.disabled=true;btn.textContent='Kaydediliyor…';
        try{
          const f=new FormData(e.currentTarget);let url=String(f.get('url')||'').trim();
          const file=e.currentTarget.elements.file.files[0];
          if(file)url=await uploadImage(file,f.get('alt'));
          upsertPatch({selector,kind:'image',value:url,alt:f.get('alt')||''});
          found.el.src=url;found.el.alt=f.get('alt')||'';
          await publishWorkingNow('Görsel');
          closeModal();
        }catch(err){
          alert(err.message||err);btn.disabled=false;btn.textContent='Kaydet ve canlıya yayınla';
        }
      };
      return;
    }
    const value=found.type==='textNode'?found.node.nodeValue:found.el.textContent;
    const anchor=found.el.closest('a');
    openModal('<h2>Metni düzenle</h2><form id="cmsTextForm" class="stack">'+
      '<label>Metin<textarea name="value" rows="5">'+esc(value)+'</textarea></label>'+
      (anchor?'<label>Bağlantı adresi<input name="href" value="'+esc(anchor.getAttribute('href')||'')+'"></label>':'')+
      '<button class="btn primary">Kaydet ve canlıya yayınla</button></form>');
    $('#cmsTextForm').onsubmit=async e=>{
      e.preventDefault();
      const btn=e.currentTarget.querySelector('button');
      btn.disabled=true;btn.textContent='Kaydediliyor…';
      try{
        const f=new FormData(e.currentTarget);
        const nv=String(f.get('value')??'');
        upsertPatch({selector,kind:found.type,node_index:found.nodeIndex,value:nv});
        if(found.type==='textNode')found.node.nodeValue=nv;else found.el.textContent=nv;
        if(anchor){
          const aSelector=cssPath(anchor,doc);const href=String(f.get('href')||'');
          upsertPatch({selector:aSelector,kind:'attr',attr:'href',value:href});anchor.setAttribute('href',href);
        }
        await publishWorkingNow('Metin');
        closeModal();
      }catch(err){
        alert(err.message||err);btn.disabled=false;btn.textContent='Kaydet ve canlıya yayınla';
      }
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
        '</div><div class="row-actions" style="margin-top:14px"><button id="closeSections" class="btn primary">Kaydet ve canlıya yayınla</button></div>');
      $('#cmsSectionList').querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{const i=+b.dataset.up;[workingData.sections[i-1],workingData.sections[i]]=[workingData.sections[i],workingData.sections[i-1]];workingData.sections.forEach((x,j)=>x.order=j);applyWorking();draw()});
      $('#cmsSectionList').querySelectorAll('[data-down]').forEach(b=>b.onclick=()=>{const i=+b.dataset.down;[workingData.sections[i+1],workingData.sections[i]]=[workingData.sections[i],workingData.sections[i+1]];workingData.sections.forEach((x,j)=>x.order=j);applyWorking();draw()});
      $('#cmsSectionList').querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>{const s=workingData.sections[+b.dataset.toggle];s.visible=s.visible===false?true:false;applyWorking();draw()});
      $('#closeSections').onclick=async e=>{const btn=e.currentTarget;btn.disabled=true;btn.textContent='Kaydediliyor…';try{await publishWorkingNow('Bölüm düzeni');closeModal()}catch(err){alert(err.message||err);btn.disabled=false;btn.textContent='Kaydet ve canlıya yayınla'}};
    }; draw();
  }
  function readMeta(doc,selector){
    return doc?.querySelector(selector)?.getAttribute('content')||'';
  }
  function absolutePageUrl(path){
    const clean=String(path||'/').split('?')[0].split('#')[0]||'/';
    return 'https://eryamanspeakingclub.com'+(clean.startsWith('/')?clean:'/'+clean);
  }
  function effectiveSeo(){
    const doc=frame?.contentDocument;
    const robots=readMeta(doc,'meta[name="robots"]');
    const canonical=doc?.querySelector('link[rel="canonical"]')?.getAttribute('href')||absolutePageUrl(current?.path);
    const title=workingSeo.title ?? doc?.title ?? current?.name ?? '';
    const description=workingSeo.description ?? readMeta(doc,'meta[name="description"]');
    const ogTitle=workingSeo.og_title ?? readMeta(doc,'meta[property="og:title"]') ?? title;
    const ogDescription=workingSeo.og_description ?? readMeta(doc,'meta[property="og:description"]') ?? description;
    const ogImage=workingSeo.og_image ?? readMeta(doc,'meta[property="og:image"]') ?? 'https://eryamanspeakingclub.com/og-card.jpg';
    return {
      title,
      description,
      focus_keyword:workingSeo.focus_keyword||'',
      canonical:workingSeo.canonical||canonical,
      indexable:workingSeo.indexable!==undefined?workingSeo.indexable:!/\bnoindex\b/i.test(robots),
      og_title:ogTitle||title,
      og_description:ogDescription||description,
      og_image:ogImage,
      og_type:workingSeo.og_type||readMeta(doc,'meta[property="og:type"]')||'website'
    };
  }
  function seoScore(seo){
    const doc=frame?.contentDocument;
    let score=0, checks=[];
    const titleLen=String(seo.title||'').trim().length;
    const descLen=String(seo.description||'').trim().length;
    const canonicalOk=/^https:\/\//i.test(String(seo.canonical||''));
    const imageOk=/^https:\/\//i.test(String(seo.og_image||''));
    const h1=(doc?.querySelector('h1')?.textContent||'').trim();
    const focus=String(seo.focus_keyword||'').trim().toLocaleLowerCase('tr-TR');
    const text=(String(seo.title||'')+' '+String(seo.description||'')).toLocaleLowerCase('tr-TR');
    const items=[
      [titleLen>=25&&titleLen<=70,25,'Açıklayıcı sayfa başlığı'],
      [descLen>=70&&descLen<=180,20,'Yeterli meta açıklama'],
      [canonicalOk,15,'Canonical URL tanımlı'],
      [imageOk,15,'Sosyal paylaşım görseli tanımlı'],
      [!!h1,10,'Sayfada H1 başlığı var'],
      [seo.indexable!==false,10,'Arama motoru indekslemesi açık'],
      [!focus||text.includes(focus),5,focus?'Hedef ifade başlık/açıklamada geçiyor':'Hedef ifade isteğe bağlı']
    ];
    items.forEach(([ok,pts,label])=>{if(ok)score+=pts;checks.push({ok,label})});
    return {score,checks};
  }
  function seoModal(){
    const s=effectiveSeo();
    openModal('<div class="seo-modal-head"><div><span class="pill published">SEO</span><h2>Google & paylaşım görünümü</h2><p class="muted">Bu alan arama motorlarının sayfayı anlamasına ve Google / WhatsApp / sosyal medya önizlemelerinin daha kontrollü görünmesine yardımcı olur.</p></div><div class="seo-score"><strong id="seoScore">0</strong><span>/100 kontrol skoru</span></div></div>'+
      '<form id="seoForm" class="stack seo-form">'+
        '<div class="seo-grid">'+
          '<div class="seo-fields">'+
            '<label>Sayfa başlığı <small id="seoTitleCount"></small><input name="title" maxlength="120" value="'+esc(s.title||'')+'" placeholder="Örn. Eryaman Speaking Club | Ankara İngilizce Konuşma Kulübü"></label>'+
            '<label>Meta açıklama <small id="seoDescCount"></small><textarea name="description" rows="4" maxlength="320" placeholder="Sayfanın ne sunduğunu doğal ve net biçimde anlat.">'+esc(s.description||'')+'</textarea></label>'+
            '<label>Ana hedef arama ifadesi <small>Google meta etiketi değildir; içerik planlama yardımcısıdır.</small><input name="focus_keyword" value="'+esc(s.focus_keyword||'')+'" placeholder="Örn. Ankara İngilizce konuşma kulübü"></label>'+
            '<label>Canonical URL <small>Aynı içeriğin birden fazla URL’si varsa ana adresi belirtir.</small><input name="canonical" type="url" value="'+esc(s.canonical||'')+'"></label>'+
            '<label>Google indeksleme<select name="indexable"><option value="true" '+(s.indexable!==false?'selected':'')+'>Index · Google’da görünebilir</option><option value="false" '+(s.indexable===false?'selected':'')+'>Noindex · Google sonuçlarında gösterme</option></select></label>'+
          '</div>'+
          '<div class="seo-preview-column">'+
            '<div class="seo-preview-card"><small>GOOGLE ÖNİZLEMESİ</small><div class="seo-preview-url" id="seoPreviewUrl"></div><h3 id="seoPreviewTitle"></h3><p id="seoPreviewDescription"></p></div>'+
            '<div class="seo-check-card"><div class="card-head"><div><h3>SEO kontrolü</h3><p class="muted">Bu skor Google sıralama puanı değildir; temel alanların eksik olup olmadığını kontrol eder.</p></div></div><div id="seoChecks" class="seo-checks"></div></div>'+
          '</div>'+
        '</div>'+
        '<div class="card seo-social-card"><div class="card-head"><div><h3>Sosyal paylaşım</h3><p class="muted">WhatsApp, LinkedIn ve diğer platformlarda paylaşıldığında kullanılabilecek başlık, açıklama ve görsel.</p></div></div>'+
          '<div class="grid-2"><label>Open Graph başlığı<input name="og_title" value="'+esc(s.og_title||'')+'"></label><label>Open Graph türü<select name="og_type"><option value="website" '+(s.og_type==='website'?'selected':'')+'>website</option><option value="article" '+(s.og_type==='article'?'selected':'')+'>article</option></select></label></div>'+
          '<label>Open Graph açıklama<textarea name="og_description" rows="3">'+esc(s.og_description||'')+'</textarea></label>'+
          '<label>Paylaşım görseli URL <small>Öneri: 1200×630 px ve herkese açık HTTPS görsel.</small><input name="og_image" type="url" value="'+esc(s.og_image||'')+'"></label>'+
        '</div>'+
        '<div class="seo-note"><strong>Not:</strong> Başlık ve açıklama karakter aralıkları pratik rehberdir; Google sabit bir karakter sınırı garanti etmez ve sonucu sorguya göre değiştirebilir.</div>'+
        '<div class="row-actions"><button type="button" id="seoFillBtn" class="btn secondary">Mevcut sayfadan doldur</button><button class="btn primary">Kaydet ve canlıya yayınla</button></div>'+
      '</form>');
    const form=$('#seoForm');
    const collect=()=>{const fd=new FormData(form);return {
      title:String(fd.get('title')||'').trim(),
      description:String(fd.get('description')||'').trim(),
      focus_keyword:String(fd.get('focus_keyword')||'').trim(),
      canonical:String(fd.get('canonical')||'').trim(),
      indexable:String(fd.get('indexable'))!=='false',
      og_title:String(fd.get('og_title')||'').trim(),
      og_description:String(fd.get('og_description')||'').trim(),
      og_image:String(fd.get('og_image')||'').trim(),
      og_type:String(fd.get('og_type')||'website')
    }};
    const refresh=()=>{
      const seo=collect(), result=seoScore(seo);
      $('#seoTitleCount').textContent=(seo.title.length||0)+' karakter';
      $('#seoDescCount').textContent=(seo.description.length||0)+' karakter';
      $('#seoScore').textContent=result.score;
      $('#seoPreviewUrl').textContent=seo.canonical||absolutePageUrl(current?.path);
      $('#seoPreviewTitle').textContent=seo.title||current?.name||'Sayfa başlığı';
      $('#seoPreviewDescription').textContent=seo.description||'Meta açıklama girildiğinde Google önizlemesi burada görünür.';
      $('#seoChecks').innerHTML=result.checks.map(x=>'<div class="'+(x.ok?'ok':'warn')+'"><span>'+(x.ok?'✓':'!')+'</span><b>'+esc(x.label)+'</b></div>').join('');
    };
    form.querySelectorAll('input,textarea,select').forEach(el=>el.addEventListener('input',refresh));
    form.querySelectorAll('select').forEach(el=>el.addEventListener('change',refresh));
    $('#seoFillBtn').onclick=()=>{
      const doc=frame?.contentDocument;
      form.elements.title.value=doc?.title||current?.name||'';
      form.elements.description.value=readMeta(doc,'meta[name="description"]')||((doc?.querySelector('main p')?.textContent||'').trim().slice(0,180));
      form.elements.canonical.value=doc?.querySelector('link[rel="canonical"]')?.href||absolutePageUrl(current?.path);
      form.elements.og_title.value=readMeta(doc,'meta[property="og:title"]')||form.elements.title.value;
      form.elements.og_description.value=readMeta(doc,'meta[property="og:description"]')||form.elements.description.value;
      form.elements.og_image.value=readMeta(doc,'meta[property="og:image"]')||'https://eryamanspeakingclub.com/og-card.jpg';
      refresh();
    };
    refresh();
    form.onsubmit=async e=>{
      e.preventDefault();
      const btn=e.currentTarget.querySelector('button[type="submit"]');btn.disabled=true;btn.textContent='Kaydediliyor…';
      try{
        workingSeo=collect();
        await publishWorkingNow('SEO');
        closeModal();
      }catch(err){alert(err.message||err);btn.disabled=false;btn.textContent='Kaydet ve canlıya yayınla'}
    };
  }
  let saveBusy=false;
  let publishBusy=false;
  async function saveDraft({quiet=false}={}){
    if(!A.canEdit())throw new Error('Bu hesap salt-okunur.');
    if(saveBusy)throw new Error('Önceki kayıt işlemi hâlâ tamamlanıyor.');
    saveBusy=true;
    try{
      const {data,error}=await A.state.db.from('esc_cms_pages').update({
        draft_data:workingData,draft_seo:workingSeo,has_unpublished_changes:true,
        updated_by:A.state.session.user.id,updated_at:new Date().toISOString()
      }).eq('id',current.id).select('*').single();
      if(error)throw error;
      if(!data?.id)throw new Error('Taslak kaydedilemedi. Sayfayı yenileyip tekrar dene.');
      current=data;if(!quiet)toast('Taslak kaydedildi');return data;
    } finally { saveBusy=false; }
  }
  async function publish({quiet=false}={}){
    await saveDraft({quiet:true});
    const pageId=current.id;
    const {data,error}=await A.state.db.rpc('esc_cms_publish_page',{p_page_id:pageId,p_note:'Eryaman Speaking Club yönetim panelinden yayınlandı'});
    if(error)throw error;
    if(!data?.id)throw new Error('Yayınlama tamamlanamadı.');
    const {data:fresh,error:freshError}=await A.state.db.from('esc_cms_pages').select('*').eq('id',pageId).single();
    if(freshError)throw freshError;
    current=fresh;
    workingData=normalizeData(fresh.draft_data);
    workingSeo=clone(fresh.draft_seo||{});
    if(!quiet)toast('Yayınlandı · aynı sayfada yeni değişiklik yapıp tekrar yayınlayabilirsin');
    return pageId;
  }
  async function publishWorkingNow(label='Değişiklik'){
    if(publishBusy)throw new Error('Önceki yayınlama işlemi hâlâ tamamlanıyor.');
    publishBusy=true;
    try{
      await publish({quiet:true});
      const stateEl=$('#editorState');
      if(stateEl){stateEl.className='pill published';stateEl.textContent='YAYINDA · v'+(current?.version||0)}
      const status=$('#editorStatus');if(status)status.textContent='Kaydedildi ve canlıya yayınlandı';
      toast(label+' kaydedildi ve canlı siteye yayınlandı');
      return current;
    }finally{publishBusy=false}
  }
  function loadFrame(){
    frame=$('#liveEditorFrame');if(!frame)return;
    $('#editorStatus').textContent='Yükleniyor…';
    frame.src=pageUrl(current.path,true);
    frame.onload=()=>{
      workingData=normalizeData(current.draft_data);workingSeo=clone(current.draft_seo||{});
      applyWorking();injectEditor();
      const win=frame.contentWindow;
      if(win)win.addEventListener('esc:event-config:applied',()=>requestAnimationFrame(applyWorking));
      setTimeout(applyWorking,250);
      setTimeout(applyWorking,900);
      $('#editorStatus').textContent='Tıklayarak düzenleyebilirsin · değişiklikler kalıcıdır';
    };
  }
  async function renderEditor(preselect){
    const {data,error}=await A.state.db.from('esc_cms_pages').select('*').eq('active',true).eq('page_kind','static').order('category').order('name');
    if(error)throw error;pages=data||[];
    current=pages.find(p=>p.id===preselect)||pages.find(p=>p.path==='/')||pages[0];
    workingData=normalizeData(current?.draft_data);workingSeo=clone(current?.draft_seo||{});
    $('#panel').innerHTML='<div class="card"><div class="card-head"><div><h2>Canlı siteyi tıklayarak düzenle</h2><p class="muted">Turuncu çerçeve metin, mavi çerçeve görsel düzenleme alanıdır. Metin, görsel ve SEO değişiklikleri kaydedildiği anda canlı siteye yayınlanır.</p></div><span id="editorState" class="pill '+(current.has_unpublished_changes?'draft':'published')+'">'+(current.has_unpublished_changes?'TASLAK DEĞİŞİKLİK':'YAYINDA · v'+current.version)+'</span></div>'+
      '<div class="editor-toolbar"><label>Sayfa<select id="editorPage">'+pages.map(p=>'<option value="'+p.id+'" '+(p.id===current.id?'selected':'')+'>'+esc(p.name)+' · '+esc(p.path)+'</option>').join('')+'</select></label>'+
      '<button class="btn secondary" id="reloadEditor">Önizlemeyi yenile</button><button class="btn secondary" id="sectionsBtn">Bölümler</button><button class="btn secondary" id="seoBtn">SEO / GEO</button>'+
      '<button class="btn primary" id="publishBtn" '+(!A.canEdit()?'disabled':'')+'>Kaydet & yayınla</button><span id="editorStatus" class="editor-status"></span></div>'+
      '<div class="live-editor-shell"><iframe id="liveEditorFrame" class="live-editor-frame" title="Canlı site editörü"></iframe></div>'+
      '<div class="editor-guide"><span class="text">Metne tıkla → düzenle ve kaydet</span><span class="image">Görsele tıkla → değiştir ve kaydet</span><span>Bölümler → sırala/gizle → kaydet</span><span>Kaydedilen değişiklik → canlı sitede kalıcı</span></div></div>';
    $('#editorPage').onchange=()=>renderEditor($('#editorPage').value);
    $('#reloadEditor').onclick=loadFrame;$('#sectionsBtn').onclick=sectionsModal;$('#seoBtn').onclick=seoModal;
    $('#publishBtn').onclick=async e=>{
      const btn=e.currentTarget;
      btn.disabled=true;
      btn.textContent='Yayınlanıyor…';
      try{
        const pageId=await publish();
        await renderEditor(pageId);
      }catch(x){
        alert(x.message||x);
        btn.disabled=false;
        btn.textContent='Yayınla';
      }
    };
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

  function geoAuditFromDoc(doc,page,canonical,indexable,title,description){
    const h1=String(doc.querySelector('h1')?.textContent||'').replace(/\s+/g,' ').trim();
    const paragraphs=[...doc.querySelectorAll('.game-hero p, main p, section p, article p')]
      .map(x=>String(x.textContent||'').replace(/\s+/g,' ').trim())
      .filter(x=>x.length>=35);
    const answer=paragraphs[0]||'';
    const schemas=[...doc.querySelectorAll('script[type="application/ld+json"]')];
    let validSchemas=0;
    schemas.forEach(s=>{try{JSON.parse(s.textContent||'');validSchemas++}catch(_){}});
    const visibleText=String(doc.body?.innerText||'').replace(/\s+/g,' ').trim();
    const entityNamed=/Eryaman Speaking Club/i.test(visibleText);
    const checks=[
      [!!h1,20,'Net bir H1 başlığı'],
      [answer.length>=50&&answer.length<=420,25,'İlk bölümde doğrudan açıklayıcı cevap'],
      [validSchemas>0,20,'Yapılandırılmış veri / entity sinyali'],
      [/^https:\/\//i.test(canonical||''),10,'Canonical kaynak adresi'],
      [indexable!==false,10,'AI arama için erişilebilir/indexlenebilir'],
      [entityNamed,10,'Marka/entity adı görünür içerikte net'],
      [String(title||'').length>=20&&String(description||'').length>=50,5,'Başlık ve açıklama bağlam sağlıyor']
    ];
    let score=0;checks.forEach(([ok,pts])=>{if(ok)score+=pts});
    return {score,checks,h1,answer,validSchemas,entityNamed,pageUpdatedAt:page?.updated_at||null};
  }

  function seoAuditFromHtml(page,html){
    const doc=new DOMParser().parseFromString(html||'','text/html');
    const custom=page.published_seo||{};
    const meta=(sel)=>doc.querySelector(sel)?.getAttribute('content')||'';
    const title=String(custom.title||doc.title||'').trim();
    const description=String(custom.description!==undefined?custom.description:meta('meta[name="description"]')).trim();
    const canonical=String(custom.canonical||doc.querySelector('link[rel="canonical"]')?.getAttribute('href')||'').trim();
    const ogTitle=String(custom.og_title||meta('meta[property="og:title"]')||'').trim();
    const ogDescription=String(custom.og_description||meta('meta[property="og:description"]')||'').trim();
    const ogImage=String(custom.og_image||meta('meta[property="og:image"]')||'').trim();
    const robots=meta('meta[name="robots"]');
    const indexable=custom.indexable!==undefined?custom.indexable:!/\\bnoindex\\b/i.test(robots);
    const h1=String(doc.querySelector('h1')?.textContent||'').trim();
    let score=0;
    if(title.length>=20)score+=20;
    if(description.length>=50)score+=20;
    if(/^https:\/\//i.test(canonical))score+=20;
    if(ogTitle&&ogDescription&&/^https:\/\//i.test(ogImage))score+=20;
    if(h1)score+=10;
    if(robots)score+=10;
    const geo=geoAuditFromDoc(doc,page,canonical,indexable,title,description);
    return {page,title,description,canonical,ogTitle,ogDescription,ogImage,robots,indexable,h1,score,geoScore:geo.score,geo};
  }

  async function geoGlobalStatus(){
    const key='c9487a4d6e0b4fdca1e8f7d93b6a21c5';
    const safeText=async path=>{try{const r=await fetch(path+'?geo_audit='+Date.now(),{cache:'no-store'});return r.ok?await r.text():''}catch(_){return ''}};
    const [robots,llms,sitemap,keyFile]=await Promise.all([
      safeText('/robots.txt'),safeText('/llms.txt'),safeText('/sitemap.xml'),safeText('/'+key+'.txt')
    ]);
    const oai=/user-agent:\s*OAI-SearchBot[\s\S]*?allow:\s*\//i.test(robots);
    return {
      oai,
      sitemap:/<urlset|<sitemapindex/i.test(sitemap),
      llms:/#\s*Eryaman Speaking Club/i.test(llms),
      indexNow:keyFile.trim()===key
    };
  }

  async function seoCenter(){
    const {data,error}=await A.state.db.from('esc_cms_pages')
      .select('id,name,path,category,version,published_seo,has_unpublished_changes,updated_at')
      .eq('active',true).eq('page_kind','static').order('category').order('name');
    if(error)throw error;
    const list=data||[];
    $('#panel').innerHTML='<div class="card"><div class="card-head"><div><h2>SEO & GEO Merkezi</h2><p class="muted">Google SEO ile birlikte ChatGPT Search, Copilot ve diğer üretken arama sistemleri için taranabilirlik, entity netliği ve cevaplanabilir içerik yapısını kontrol eder.</p></div><button id="seoRefreshAudit" class="btn secondary">Taramayı yenile</button></div><div id="seoAuditBody"><div class="empty">SEO ve GEO kontrolleri çalışıyor…</div></div></div>';

    const [audited,globalGeo]=await Promise.all([
      Promise.all(list.map(async page=>{
        try{
          const res=await fetch(page.path+(page.path.includes('?')?'&':'?')+'seo_geo_audit='+Date.now(),{cache:'no-store'});
          const html=await res.text();
          return seoAuditFromHtml(page,html);
        }catch(_){
          return {page,score:0,geoScore:0,title:'',description:'',canonical:'',ogTitle:'',ogDescription:'',ogImage:'',robots:'',indexable:true,h1:'',geo:{checks:[],answer:'',validSchemas:0},error:true};
        }
      })),
      geoGlobalStatus()
    ]);

    const indexed=audited.filter(x=>x.indexable).length;
    const noindex=audited.length-indexed;
    const seoGood=audited.filter(x=>x.score>=80).length;
    const geoGood=audited.filter(x=>x.geoScore>=80).length;
    const avg=audited.length?Math.round(audited.reduce((n,x)=>n+x.score,0)/audited.length):0;
    const geoAvg=audited.length?Math.round(audited.reduce((n,x)=>n+x.geoScore,0)/audited.length):0;
    const body=$('#seoAuditBody');
    const status=(ok,title,desc)=>'<div class="geo-status '+(ok?'ok':'warn')+'"><span>'+(ok?'✓':'!')+'</span><div><strong>'+esc(title)+'</strong><small>'+esc(desc)+'</small></div></div>';

    body.innerHTML=
      '<div class="geo-explainer"><div><span class="pill live">GEO</span><h3>Generative Engine Optimization</h3><p>AI sistemlerinin sayfayı kolayca taraması, konuyu doğru anlaması ve cevabında kaynak olarak kullanabilmesi için yapılan içerik + teknik optimizasyon. Buradaki skor bir ChatGPT/Google sıralama garantisi değildir.</p></div><a class="icon-btn" href="/llms.txt" target="_blank">llms.txt ↗</a></div>'+
      '<div class="geo-global-grid">'+
        status(globalGeo.oai,'ChatGPT Search crawler','OAI-SearchBot robots.txt içinde açık')+
        status(globalGeo.sitemap,'Sitemap','Public URL listesi taranabilir')+
        status(globalGeo.indexNow,'IndexNow','Güncellemeleri Bing/Copilot ekosistemine bildirebilir')+
        status(globalGeo.llms,'llms.txt','Deneysel AI site özeti mevcut; Google için zorunlu değildir')+
      '</div>'+
      '<div class="stats seo-audit-stats">'+
        '<div class="stat"><span>ORTALAMA SEO</span><strong>'+avg+'/100</strong><small>'+seoGood+' sayfa 80+</small></div>'+
        '<div class="stat"><span>ORTALAMA GEO</span><strong>'+geoAvg+'/100</strong><small>'+geoGood+' sayfa answer-ready</small></div>'+
        '<div class="stat"><span>GELİŞTİRİLECEK</span><strong>'+audited.filter(x=>x.score<80||x.geoScore<80).length+'</strong><small>SEO veya GEO eksiği</small></div>'+
        '<div class="stat"><span>INDEX / NOINDEX</span><strong>'+indexed+' / '+noindex+'</strong><small>Arama görünürlüğü</small></div>'+
      '</div>'+
      '<div class="seo-audit-tools"><label>Filtrele <select id="seoAuditFilter"><option value="all">Tüm sayfalar</option><option value="needs">SEO/GEO geliştirilecek</option><option value="geo">GEO 80 altı</option><option value="index">Index</option><option value="noindex">Noindex</option><option value="game">Oyunlar</option></select></label><input id="seoAuditSearch" type="search" placeholder="Sayfa veya URL ara…"></div>'+
      '<div class="table-wrap"><table><thead><tr><th>Sayfa</th><th>SEO</th><th>GEO</th><th>Title</th><th>Cevap bölümü</th><th>Schema</th><th>Index</th><th></th></tr></thead><tbody id="seoAuditRows"></tbody></table></div>';

    const draw=()=>{
      const filter=$('#seoAuditFilter').value,q=($('#seoAuditSearch').value||'').toLocaleLowerCase('tr-TR');
      const rows=audited.filter(x=>{
        if(q&&!((x.page.name+' '+x.page.path).toLocaleLowerCase('tr-TR').includes(q)))return false;
        if(filter==='needs'&&x.score>=80&&x.geoScore>=80)return false;
        if(filter==='geo'&&x.geoScore>=80)return false;
        if(filter==='index'&&!x.indexable)return false;
        if(filter==='noindex'&&x.indexable)return false;
        if(filter==='game'&&!String(x.page.path||'').match(/^\/(?!en\/|tr\/|games\/|educators\/|ozel-dersler\/)[a-z0-9-]+\/?$/i))return false;
        return true;
      });
      $('#seoAuditRows').innerHTML=rows.map(x=>{
        const seoClass=x.score>=90?'live':(x.score>=70?'published':'draft');
        const geoClass=x.geoScore>=90?'live':(x.geoScore>=70?'published':'draft');
        const answerOk=(x.geo?.answer||'').length>=50;
        const schemaOk=(x.geo?.validSchemas||0)>0;
        return '<tr>'+
          '<td><strong>'+esc(x.page.name)+'</strong><br><small>'+esc(x.page.path)+'</small></td>'+
          '<td><span class="pill '+seoClass+'">'+x.score+'/100</span></td>'+
          '<td><span class="pill '+geoClass+'">'+x.geoScore+'/100</span></td>'+
          '<td><span class="seo-audit-dot '+(x.title?'ok':'bad')+'">'+(x.title?'✓':'!')+'</span> '+esc(x.title?x.title.slice(0,48):'Eksik')+'</td>'+
          '<td><span class="seo-audit-dot '+(answerOk?'ok':'bad')+'">'+(answerOk?'✓':'!')+'</span> '+(answerOk?esc((x.geo.answer||'').slice(0,72)):'Net açıklama eksik')+'</td>'+
          '<td><span class="seo-audit-dot '+(schemaOk?'ok':'bad')+'">'+(schemaOk?'✓':'!')+'</span> '+(schemaOk?esc(x.geo.validSchemas+' JSON-LD'):'Eksik')+'</td>'+
          '<td><span class="pill '+(x.indexable?'published':'')+'">'+(x.indexable?'INDEX':'NOINDEX')+'</span></td>'+
          '<td><div class="row-actions"><button class="icon-btn" data-seo-edit="'+x.page.id+'">SEO/GEO düzenle</button><a class="icon-btn" href="'+esc(x.page.path)+'" target="_blank">Aç ↗</a></div></td>'+
        '</tr>';
      }).join('')||'<tr><td colspan="8"><div class="empty">Bu filtrede sayfa yok.</div></td></tr>';
      $('#seoAuditRows').querySelectorAll('[data-seo-edit]').forEach(b=>b.onclick=()=>{A.state.currentView='siteEditor';$('#viewTitle').textContent='Canlı Site Editörü';renderEditor(b.dataset.seoEdit);setTimeout(()=>toast('Sayfa açıldı · üst menüden SEO / GEO butonuna tıkla'),700)});
    };
    $('#seoAuditFilter').onchange=draw;$('#seoAuditSearch').oninput=draw;draw();
    $('#seoRefreshAudit').onclick=seoCenter;
  }

  async function historyView(){
    const {data,error}=await A.state.db.from('esc_cms_revisions').select('*').order('created_at',{ascending:false}).limit(150);if(error)throw error;
    $('#panel').innerHTML='<div class="card"><div class="card-head"><div><h2>Sürüm geçmişi</h2><p class="muted">Geri yükleme doğrudan canlıyı değiştirmez; seçilen sürümü taslağa getirir.</p></div></div>'+
      ((data||[]).length?'<div class="table-wrap"><table><thead><tr><th>Sayfa</th><th>Sürüm</th><th>Tarih</th><th>Not</th><th></th></tr></thead><tbody>'+
      data.map(r=>'<tr><td>'+esc(r.page_path)+'</td><td>v'+esc(r.version)+'</td><td>'+esc(A.fmt(r.created_at))+'</td><td>'+esc(r.note||'')+'</td><td><button class="icon-btn" data-restore="'+r.id+'" '+(!A.canEdit()?'disabled':'')+'>Taslağa geri yükle</button></td></tr>').join('')+'</tbody></table></div>':'<div class="empty">Henüz yayın sürümü yok.</div>')+'</div>';
    $('#panel').querySelectorAll('[data-restore]').forEach(b=>b.onclick=async()=>{if(!confirm('Bu sürümü yeni taslak olarak geri yüklemek istiyor musun?'))return;const {error}=await A.state.db.rpc('esc_cms_restore_revision',{p_revision_id:+b.dataset.restore});if(error)alert(error.message);else{toast('Sürüm taslağa geri yüklendi');historyView()}});
  }

  A.register('siteEditor',()=>renderEditor());
  A.register('seo',seoCenter);
  A.register('pages',pagesView);
  A.register('history',historyView);
})();