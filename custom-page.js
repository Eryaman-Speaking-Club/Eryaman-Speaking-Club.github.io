(() => {
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const params=new URLSearchParams(location.search);
  const slug=(params.get('slug')||'').toLowerCase().replace(/[^a-z0-9-]/g,'');
  const lang=params.get('lang')==='en'?'en':'tr';
  document.documentElement.lang=lang;
  document.getElementById('langTr').href='?slug='+encodeURIComponent(slug)+'&lang=tr';
  document.getElementById('langEn').href='?slug='+encodeURIComponent(slug)+'&lang=en';
  document.getElementById(lang==='en'?'langEn':'langTr').classList.add('active');

  const val=obj=>obj?.[lang]||obj?.tr||obj?.en||'';
  function renderBlock(b,i){
    const eyebrow=val(b.eyebrow),title=val(b.title),body=val(b.body),label=val(b.button_label);
    if(b.type==='hero'){
      const style=b.image_url?' style="background-image:url(\''+String(b.image_url).replace(/'/g,'%27')+'\')"':'';
      return '<section class="custom-section custom-hero '+(b.image_url?'has-image':'')+'"'+style+'>'+
        (eyebrow?'<span class="eyebrow">'+esc(eyebrow)+'</span>':'')+
        (title?'<h1>'+esc(title)+'</h1>':'')+(body?'<p>'+esc(body)+'</p>':'')+
        (label?'<a class="custom-button" href="'+esc(b.button_href||'#')+'">'+esc(label)+' →</a>':'')+'</section>';
    }
    if(b.type==='image_text'){
      return '<section class="custom-section"><div class="custom-image-text">'+
        (b.image_url?'<img src="'+esc(b.image_url)+'" alt="'+esc(val(b.image_alt)||title)+'">':'')+
        '<div>'+(eyebrow?'<span class="eyebrow">'+esc(eyebrow)+'</span>':'')+(title?'<h2>'+esc(title)+'</h2>':'')+(body?'<p>'+esc(body)+'</p>':'')+(label?'<a class="custom-button" href="'+esc(b.button_href||'#')+'">'+esc(label)+' →</a>':'')+'</div></div></section>';
    }
    if(b.type==='cta'){
      return '<section class="custom-cta">'+(eyebrow?'<span class="eyebrow">'+esc(eyebrow)+'</span>':'')+(title?'<h2>'+esc(title)+'</h2>':'')+(body?'<p>'+esc(body)+'</p>':'')+(label?'<a class="custom-button" href="'+esc(b.button_href||'#')+'">'+esc(label)+' →</a>':'')+'</section>';
    }
    return '<section class="custom-section custom-text '+(i%2?'alt':'')+'">'+(eyebrow?'<span class="eyebrow">'+esc(eyebrow)+'</span>':'')+(title?'<h2>'+esc(title)+'</h2>':'')+(body?'<p>'+esc(body)+'</p>':'')+(label?'<a class="custom-button" href="'+esc(b.button_href||'#')+'">'+esc(label)+' →</a>':'')+'</section>';
  }
  async function init(){
    const main=document.getElementById('customPageMain');
    if(!slug){main.innerHTML='<section class="custom-empty"><h1>Sayfa bulunamadı.</h1><p>Geçerli bir sayfa adresi kullanılmadı.</p></section>';return}
    for(let i=0;i<80&&!window.ESCSupabase?.getClient;i++)await new Promise(r=>setTimeout(r,50));
    const db=await window.ESCSupabase?.getClient?.();
    if(!db){main.innerHTML='<section class="custom-empty"><h1>Sayfa yüklenemedi.</h1></section>';return}
    const {data,error}=await db.from('esc_cms_public_pages').select('*').eq('slug',slug).eq('page_kind','custom').maybeSingle();
    if(error||!data){main.innerHTML='<section class="custom-empty"><h1>Sayfa bulunamadı.</h1><p>Bu sayfa henüz yayınlanmamış veya kaldırılmış olabilir.</p></section>';return}
    const seo=data.published_seo||{};if(seo.title)document.title=seo.title;
    const desc=document.querySelector('meta[name="description"]')||document.head.appendChild(Object.assign(document.createElement('meta'),{name:'description'}));if(seo.description)desc.content=seo.description;
    const blocks=(data.published_data?.custom_blocks||[]).filter(b=>b.visible!==false);
    main.innerHTML=blocks.length?blocks.map(renderBlock).join(''):'<section class="custom-empty"><h1>'+esc(data.name)+'</h1><p>İçerik yakında burada olacak.</p></section>';
  }
  init();
})();