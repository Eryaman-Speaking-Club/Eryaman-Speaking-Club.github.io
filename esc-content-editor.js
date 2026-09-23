(function(){
  const PATH_KEY=location.pathname.replace(/\/+$/,'')||'/';
  const STORAGE_KEY='esc-custom-content-v1:'+PATH_KEY;
  const UNLOCK_KEY='esc-admin-unlocked-v2';
  const ADMIN_HASH='c28440d7f9de5738eddf560c79371754e9ffa41fba2afd1efaa3da1458438a52';
  const STUDIO_MODE=new URLSearchParams(location.search).get('studio')==='1';
  const GAME_SLUG=PATH_KEY.replace(/^\/+|\/+$/g,'');

  function loadScript(src,id){
    if(id&&document.getElementById(id))return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      if(id)s.id=id;
      s.src=src;
      s.onload=resolve;
      s.onerror=reject;
      document.head.appendChild(s);
    });
  }

  async function ensureSupabase(){
    if(!window.ESC_SUPABASE_CONFIG)await loadScript('../esc-supabase-config.js?v=20260920-1','escSupabaseConfig');
    if(!window.ESCSupabase)await loadScript('../esc-supabase.js?v=20260920-2','escSupabaseAdapter');
    return window.ESCSupabase||null;
  }

  function detectSource(){
    try{if(typeof items!=='undefined'&&Array.isArray(items))return{name:'items',data:items}}catch(e){}
    try{if(typeof cards!=='undefined'&&Array.isArray(cards))return{name:'cards',data:cards}}catch(e){}
    try{if(typeof prompts!=='undefined'&&Array.isArray(prompts))return{name:'prompts',data:prompts}}catch(e){}
    try{if(typeof situations!=='undefined'&&Array.isArray(situations))return{name:'situations',data:situations}}catch(e){}
    try{if(typeof statements!=='undefined'&&Array.isArray(statements))return{name:'statements',data:statements}}catch(e){}
    try{if(typeof topics!=='undefined'&&Array.isArray(topics))return{name:'topics',data:topics}}catch(e){}
    try{if(typeof motions!=='undefined'&&Array.isArray(motions))return{name:'motions',data:motions}}catch(e){}
    try{if(typeof questions!=='undefined'&&Array.isArray(questions))return{name:'questions',data:questions}}catch(e){}
    try{if(typeof challenges!=='undefined'&&Array.isArray(challenges))return{name:'challenges',data:challenges}}catch(e){}
    return null;
  }

  const clone=v=>JSON.parse(JSON.stringify(v));
  const safeParse=raw=>{try{return JSON.parse(raw)}catch(e){return null}};
  async function verifyAdmin(value){
    if(!window.crypto||!crypto.subtle||!window.TextEncoder)return false;
    const bytes=new TextEncoder().encode(value);
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    const hex=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
    return hex===ADMIN_HASH;
  }
  function categoriesOf(data){
    const out=[];
    data.forEach(item=>{let c='';if(Array.isArray(item))c=typeof item[0]==='string'?item[0]:'';else if(item&&typeof item==='object')c=item.c||item.category||item.cat||'';if(c&&!out.includes(c))out.push(c)});
    return out;
  }
  function schemaFrom(item){
    if(Array.isArray(item)){
      if(item.length>=3&&Array.isArray(item[2]))return{kind:'taboo'};
      if(item.length>=3&&typeof item[2]==='string')return{kind:'choice'};
      return{kind:'array2'};
    }
    if(item&&typeof item==='object'){
      const categoryKey='c'in item?'c':('category'in item?'category':('cat'in item?'cat':null));
      const textKey='q'in item?'q':('question'in item?'question':('prompt'in item?'prompt':('text'in item?'text':Object.keys(item).find(k=>k!==categoryKey))));
      return{kind:'object',categoryKey,textKey};
    }
    return{kind:'array2'};
  }
  function categoryOf(item,schema){return schema.kind==='object'?(item[schema.categoryKey]||''):(Array.isArray(item)?(item[0]||''):'')}
  function summaryOf(item,schema){
    if(schema.kind==='choice')return`${item[1]}  OR  ${item[2]}`;
    if(schema.kind==='taboo')return`${item[1]} — avoid: ${(item[2]||[]).join(', ')}`;
    if(schema.kind==='array2')return item[1]||'';
    if(schema.kind==='object')return item[schema.textKey]||'';
    return String(item||'');
  }
  function makeItem(schema,category,primary,secondary){
    category=(category||'General').trim()||'General';primary=(primary||'').trim();secondary=(secondary||'').trim();
    if(schema.kind==='choice')return[category,primary,secondary];
    if(schema.kind==='taboo')return[category,primary.toUpperCase(),secondary.split(',').map(x=>x.trim().toUpperCase()).filter(Boolean)];
    if(schema.kind==='object'){const obj={};if(schema.categoryKey)obj[schema.categoryKey]=category;obj[schema.textKey||'q']=primary;return obj}
    return[category,primary];
  }
  function refreshGame(){
    try{if(typeof buildDeck==='function')buildDeck();else if(typeof build==='function')build()}catch(e){}
    try{if(typeof next==='function')next();else if(typeof nextPrompt==='function')nextPrompt();else if(typeof show==='function'&&show.length===0)show()}catch(e){}
  }

  const source=detectSource();
  if(!source||!source.data.length)return;
  const defaults=clone(source.data);
  const saved=safeParse(localStorage.getItem(STORAGE_KEY));
  if(Array.isArray(saved)&&saved.length){source.data.splice(0,source.data.length,...clone(saved));refreshGame()}
  const schema=schemaFrom(source.data[0]||defaults[0]);
  const categories=categoriesOf(defaults);

  async function syncRemote(){
    try{
      const api=await ensureSupabase();
      if(!api||!api.isConfigured())return false;
      const settings=await api.getGameSettings(GAME_SLUG);
      if(settings&&Array.isArray(settings.content)&&settings.content.length){
        source.data.splice(0,source.data.length,...clone(settings.content));
        localStorage.setItem(STORAGE_KEY,JSON.stringify(source.data));
        refreshGame();
        return true;
      }
    }catch(e){
      console.warn('ESC cloud content unavailable; using local/built-in fallback.',e);
    }
    return false;
  }

  function mount(){
    const actionHost=document.querySelector('.game-actions')||document.querySelector('.header-actions')||document.querySelector('.topbar');
    if(!actionHost||document.getElementById('escEditContentBtn'))return;

    const btn=document.createElement('button');
    btn.id='escEditContentBtn';btn.type='button';btn.className='esc-edit-content-btn';btn.innerHTML='<span>Edit questions</span> ⚙';btn.setAttribute('aria-label','Edit questions');btn.hidden=true;actionHost.appendChild(btn);

    const overlay=document.createElement('div');
    overlay.className='esc-editor-overlay';overlay.id='escEditorOverlay';
    overlay.innerHTML=`<section class="esc-editor-panel" role="dialog" aria-modal="true" aria-label="Question editor"><div class="esc-editor-head"><div><div class="esc-editor-tag">QUESTION LIBRARY EDITOR</div><h2>Question Library</h2><p>Add, edit or remove questions. Changes are saved to the shared Supabase backend.</p></div><button class="esc-editor-close" type="button" aria-label="Close">×</button></div><div class="esc-editor-form"><label>Category<input id="escEditorCategory" list="escEditorCategories"></label><datalist id="escEditorCategories"></datalist><label class="esc-editor-primary-label">Question / Prompt<textarea id="escEditorPrimary" rows="3"></textarea></label><label class="esc-editor-secondary-wrap" hidden><span class="esc-editor-secondary-label">Second field</span><textarea id="escEditorSecondary" rows="3"></textarea></label><div class="esc-editor-form-actions"><button type="button" class="esc-editor-save">Add question</button><button type="button" class="esc-editor-cancel" hidden>Cancel edit</button></div></div><div class="esc-editor-toolbar"><input id="escEditorSearch" type="search" placeholder="Search questions..."><button type="button" class="esc-editor-reset">Reset built-ins</button></div><div class="esc-editor-list"></div></section>`;
    document.body.appendChild(overlay);

    const panel=overlay.querySelector('.esc-editor-panel'),close=overlay.querySelector('.esc-editor-close'),category=overlay.querySelector('#escEditorCategory'),categoryList=overlay.querySelector('#escEditorCategories'),primary=overlay.querySelector('#escEditorPrimary'),secondaryWrap=overlay.querySelector('.esc-editor-secondary-wrap'),secondaryLabel=overlay.querySelector('.esc-editor-secondary-label'),secondary=overlay.querySelector('#escEditorSecondary'),saveBtn=overlay.querySelector('.esc-editor-save'),cancelBtn=overlay.querySelector('.esc-editor-cancel'),search=overlay.querySelector('#escEditorSearch'),resetBtn=overlay.querySelector('.esc-editor-reset'),list=overlay.querySelector('.esc-editor-list');
    let editing=-1;
    categoryList.innerHTML=categories.map(c=>`<option value="${String(c).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}"></option>`).join('');if(categories[0])category.value=categories[0];
    if(schema.kind==='choice'){overlay.querySelector('.esc-editor-primary-label').firstChild.textContent='Option A';secondaryWrap.hidden=false;secondaryLabel.textContent='Option B'}
    else if(schema.kind==='taboo'){overlay.querySelector('.esc-editor-primary-label').firstChild.textContent='Main word';secondaryWrap.hidden=false;secondaryLabel.textContent='Forbidden words (comma separated)'}

    const persist=async()=>{
      localStorage.setItem(STORAGE_KEY,JSON.stringify(source.data));
      try{
        const api=await ensureSupabase();
        if(!api||!api.isConfigured())return;
        if(!(await api.isAdmin()))throw new Error('Admin session required');
        await api.saveGameSettings(GAME_SLUG,{content:clone(source.data),source:'esc-studio',version:2});
      }catch(e){
        console.warn('ESC cloud save failed; local backup kept.',e);
        if(STUDIO_MODE)alert('Bulut kaydı başarısız oldu. Yerel yedek korundu; yönetim paneli oturumunu kontrol et.');
      }
    };
    function clearForm(){editing=-1;primary.value='';secondary.value='';if(categories[0])category.value=categories[0];saveBtn.textContent='Add question';cancelBtn.hidden=true}
    function render(){
      const q=search.value.trim().toLowerCase();list.innerHTML='';
      source.data.forEach((item,index)=>{
        const text=summaryOf(item,schema),cat=categoryOf(item,schema);if(q&&!(text+' '+cat).toLowerCase().includes(q))return;
        const row=document.createElement('div');row.className='esc-editor-row';const copy=document.createElement('div');copy.className='esc-editor-copy';const badge=document.createElement('span');badge.className='esc-editor-cat';badge.textContent=cat||'General';const p=document.createElement('p');p.textContent=text;copy.append(badge,p);
        const actions=document.createElement('div');actions.className='esc-editor-row-actions';const edit=document.createElement('button');edit.type='button';edit.textContent='Edit';edit.className='esc-editor-mini';const del=document.createElement('button');del.type='button';del.textContent='Remove';del.className='esc-editor-mini danger';
        edit.onclick=()=>{editing=index;category.value=cat;if(schema.kind==='choice'){primary.value=item[1]||'';secondary.value=item[2]||''}else if(schema.kind==='taboo'){primary.value=item[1]||'';secondary.value=(item[2]||[]).join(', ')}else if(schema.kind==='object'){primary.value=item[schema.textKey]||''}else primary.value=item[1]||'';saveBtn.textContent='Save changes';cancelBtn.hidden=false;panel.scrollTo({top:0,behavior:'smooth'})};
        del.onclick=()=>{if(source.data.length<=1){alert('Keep at least one question.');return}source.data.splice(index,1);void persist();render();refreshGame()};actions.append(edit,del);row.append(copy,actions);list.appendChild(row);
      });
    }
    saveBtn.onclick=()=>{if(!primary.value.trim())return;if((schema.kind==='choice'||schema.kind==='taboo')&&!secondary.value.trim())return;const item=makeItem(schema,category.value,primary.value,secondary.value);if(editing>=0)source.data.splice(editing,1,item);else source.data.push(item);void persist();clearForm();render();refreshGame()};
    cancelBtn.onclick=clearForm;resetBtn.onclick=()=>{if(!confirm('Reset this game to the built-in question library?'))return;source.data.splice(0,source.data.length,...clone(defaults));localStorage.setItem(STORAGE_KEY,JSON.stringify(source.data));void persist();clearForm();render();refreshGame()};search.oninput=render;
    async function open(){
      try{
        const api=await ensureSupabase();
        const session=api&&await api.getSession();
        const admin=session&&await api.isAdmin();
        if(!admin){
          const next=location.pathname.replace(/^\/+|\/+$/g,'');
          location.replace('/admin/?next='+encodeURIComponent(next)+'#games');
          return;
        }
      }catch(e){
        const next=location.pathname.replace(/^\/+|\/+$/g,'');
        location.replace('/admin/?next='+encodeURIComponent(next)+'#games');
        return;
      }
      overlay.classList.add('open');render();
    }
    function hide(){overlay.classList.remove('open');clearForm()}
    const back=document.createElement('a');back.href='/admin/#games';back.textContent='← Yönetim Paneli';back.setAttribute('aria-label','Back to Eryaman Speaking Club Admin');back.style.cssText='display:inline-flex;align-items:center;gap:6px;margin:0 0 14px;padding:9px 12px;border-radius:12px;background:#eef4fa;color:#0b2f5b;text-decoration:none;font:800 12px/1 system-ui,sans-serif';panel.prepend(back);
    btn.onclick=open;close.onclick=hide;overlay.addEventListener('click',e=>{if(e.target===overlay)hide()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open'))hide()});render();setTimeout(()=>void open(),0);
  }
  async function bootstrap(){
    await syncRemote();
    if(!STUDIO_MODE)return;
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
    else mount();
  }
  void bootstrap();
})();