/* ESC dynamic event manager | direct Supabase, no duplicate spreadsheet calendar. */
(() => {
  'use strict';
  const A=window.ESCAdmin;
  const {esc,openModal,closeModal,toast}=A;
  const $=s=>document.querySelector(s);
  const ZONE='Europe/Istanbul';
  const local=(dt)=>{
    if(!dt)return '';
    const p=new Intl.DateTimeFormat('sv-SE',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date(dt));
    const x=k=>p.find(q=>q.type===k)?.value||'';
    return x('year')+'-'+x('month')+'-'+x('day')+'T'+x('hour')+':'+x('minute');
  };
  const fmt=v=>v?new Intl.DateTimeFormat('tr-TR',{timeZone:ZONE,dateStyle:'medium',timeStyle:'short'}).format(new Date(v)):'—';
  const parse=(localTime)=>{
    if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(localTime||''))throw new Error('Tarih ve saati seçin.');
    const date=new Date(localTime+':00+03:00');
    if(!Number.isFinite(date.getTime())||local(date.toISOString())!==localTime)throw new Error('Geçersiz etkinlik tarihi veya saati.');
    return date.toISOString();
  };
  const labels={planned:'Planlandı',draft:'Taslak',cancelled:'İptal',completed:'Tamamlandı'};
  const kinds={in_person:'Yüz yüze',online:'Online'};
  const field=(title,key,type,value,attrs='')=>'<label class="esc-event-field">'+esc(title)+'<input name="'+esc(key)+'" type="'+type+'" '+attrs+' value="'+esc(value??'')+'"></label>';
  const select=(title,key,value,values)=>'<label class="esc-event-field">'+esc(title)+'<select name="'+esc(key)+'">'+values.map(([k,v])=>'<option value="'+esc(k)+'" '+(String(value)===k?'selected':'')+'>'+esc(v)+'</option>').join('')+'</select></label>';
  const status=(r)=>{
    const label=r.status==='planned'?(r.published?'YAYINDA':'YAYIN DIŞI'):(labels[r.status]||r.status);
    return '<span class="pill '+(r.status==='planned'&&r.published?'published':'draft')+'">'+esc(label)+'</span>'+
      (r.status==='planned'&&r.published
        ? '<br><small>'+(r.registration_enabled?'Kayıt açık':'Kayıt kapalı')+'</small>' : '');
  };
  const isPublished=e=>e.status==='planned' && e.published===true;

  async function read(){
    const now=new Date(Date.now()-60*86400000).toISOString();
    const [events,rules]=await Promise.all([
      A.state.db.from('esc_events').select('id,event_code,title,kind,start_at,end_at,venue,location_url,meeting_url,capacity,status,published,registration_enabled,theme,note,revision,manual_override,recurrence_id').gte('start_at',now).order('start_at',{ascending:true}).limit(180),
      A.state.db.from('esc_event_rules').select('*').order('weekday',{ascending:true})
    ]);
    if(events.error)throw events.error;
    if(rules.error)throw rules.error;
    return {events:events.data||[],rules:rules.data||[]};
  }

  async function view(){
    const {events,rules}=await read();
    const upcoming=events.filter(e=>e.status==='planned'&&new Date(e.end_at)>new Date());
    const cancelled=events.filter(e=>e.status==='cancelled').length;
    const members=events.length
      ? await A.state.db.from('esc_event_registrations')
          .select('event_id,status').in('event_id',events.map(e=>e.id).slice(0,180))
      : {data:[],error:null};
    if(members.error && events.length)throw members.error;
    const counts={};
    (members.data||[]).forEach(r=>{if(r.status==='registered')counts[r.event_id]=(counts[r.event_id]||0)+1});
    $('#panel').innerHTML=
      '<div class="notice"><strong>TEK KAYNAK: Supabase → Canlı Etkinlik Yönetimi.</strong> Burada düzenlediğin ve yayınladığın etkinlikler web sitesinde ve /events/ kayıt sayfasında güncellenir. Google Sheets yalnızca eski operasyon kayıtlarıdır ve bu takvimi değiştirmez. E-posta gönderimi ayrı ve şu anda KAPALI.</div>'+
      '<div class="stats esc-event-stats">'+
        '<div class="stat"><span>YAKLAŞAN</span><strong>'+upcoming.length+'</strong><small>Aktif ve gelecekteki etkinlik</small></div>'+
        '<div class="stat"><span>BU ARALIKTA İPTAL</span><strong>'+cancelled+'</strong><small>Geri dönüşümlü</small></div>'+
        '<div class="stat"><span>TEKRARLAYAN PROGRAM</span><strong>'+rules.filter(x=>x.active).length+'</strong><small>Arka planda günlük üretilir</small></div>'+
        '<div class="stat"><span>BİLDİRİMLER</span><strong>Kapalı</strong><small>Eski üyelere izinsiz gönderim yok</small></div>'+
      '</div>'+
      '<div class="card"><div class="card-head"><div><h2>Etkinlikleri Düzenle ve Yayınla</h2><p class="muted">Düzenle = etkinliğin bilgilerini değiştir. Yayınla = etkinliği sitede görünür yap ve kayıtları aç. Yayından kaldır = etkinliği siteden gizle; kayıtları kapat. Değişen tarih ve mekân mevcut ETK numarası ile katılımcıları korur.</p></div><div class="row-actions"><button id="escEventNew" class="btn primary" '+(!A.canEdit()?'disabled':'')+'>+ Yeni Etkinlik</button><button id="escEventReload" class="btn secondary">Yenile</button><a href="../events/" target="_blank" rel="noopener" class="btn secondary">Kayıt Sayfası ↗</a></div></div>'+
      '<div class="table-wrap"><table><thead><tr><th>Etkinlik</th><th>Tarih & saat</th><th>Tür / yer</th><th>Durum</th><th>Katılımcı</th><th>İşlemler</th></tr></thead><tbody>'+
      (events.length?events.map(e=>
        '<tr><td><strong>'+esc(e.event_code)+'</strong><br>'+esc(e.title)+'</td>'+
        '<td>'+esc(fmt(e.start_at))+'<br><small>'+esc(fmt(e.end_at))+'</small></td>'+
        '<td>'+esc(kinds[e.kind]||e.kind)+'<br><small>'+esc(e.venue)+'</small></td>'+
        '<td>'+status(e)+'<br><small>Sürüm '+e.revision+(e.manual_override?' · Elle düzenlendi':'')+'</small></td>'+
        '<td><strong>'+Number(counts[e.id]||0)+'</strong> / '+e.capacity+'</td>'+
        '<td><div class="row-actions"><button type="button" class="icon-btn" data-edit="'+esc(e.id)+'" '+(!A.canEdit()?'disabled':'')+'>Düzenle</button>'+
        '<button type="button" class="icon-btn '+(isPublished(e)?'danger-text':'')+'" data-publish="'+esc(e.id)+'" '+
        (!A.canEdit()||e.status==='cancelled'||e.status==='completed'||(!isPublished(e)&&Date.parse(e.end_at)<=Date.now())?'disabled':'')+'>'+
        (isPublished(e)?'Yayından kaldır':'Yayınla')+'</button>'+
        '<button type="button" class="icon-btn" data-attendees="'+esc(e.id)+'">Katılımcılar</button></div></td></tr>').join('')
        :'<tr><td colspan="6">Etkinlik bulunamadı.</td></tr>')+
      '</tbody></table></div></div>'+
      '<div class="card"><div class="card-head"><div><h2>Tekrarlayan Etkinlikler</h2><p class="muted">Bunlar başlangıç şablonlarıdır. Önceden açılmış etkinlikleri veya elle değiştirilmiş tarihleri geri almaz.</p></div></div>'+
      '<div class="grid-3">'+rules.map(r=>'<div class="mini-card"><span class="pill '+(r.active?'published':'draft')+'">'+(r.active?'Aktif':'Kapalı')+'</span><h3>'+esc(r.title)+'</h3><p>'+['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'][r.weekday]+' · '+esc(String(r.start_time).slice(0,5))+' · '+esc(r.venue)+'</p><div class="row-actions" style="margin-top:12px"><button class="btn secondary" data-rule="'+esc(r.id)+'" '+(!A.canEdit()?'disabled':'')+'>Düzenle</button></div></div>').join('')+'</div></div>'+
      '<div class="notice warning">İletişim notu: Tarih değişikliği için kişiye özel bilgilendirme, Google Sheets\'teki mevcut hatırlatma kodundan ayrı bir modül olarak güvenle kurulacaktır. Bu ekranda yapılan değişiklik henüz otomatik e-posta göndermiyor.</div>';
    $('#escEventNew').onclick=()=>editor(null);
    $('#escEventReload').onclick=()=>view();
    $('#panel').querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editor(events.find(x=>x.id===b.dataset.edit)));
    $('#panel').querySelectorAll('[data-publish]').forEach(b=>b.onclick=()=>togglePublish(events.find(x=>x.id===b.dataset.publish),b));
    $('#panel').querySelectorAll('[data-attendees]').forEach(b=>b.onclick=()=>attendees(events.find(x=>x.id===b.dataset.attendees)));
    $('#panel').querySelectorAll('[data-rule]').forEach(b=>b.onclick=()=>ruleEditor(rules.find(x=>x.id===b.dataset.rule)));
  }

  async function togglePublish(event,button){
    if(!event||!A.canEdit())return;
    const currentlyLive=isPublished(event);
    if(event.status==='cancelled'||event.status==='completed'){
      alert('İptal edilmiş veya tamamlanmış etkinliği bu düğmeyle yayınlayamazsın. Önce Düzenle bölümünü kullan.');
      return;
    }
    if(!currentlyLive&&Date.parse(event.end_at)<=Date.now()){
      alert('Geçmiş etkinlik yayınlanamaz. Önce etkinliğin yeni tarihini Düzenle bölümünden belirle.');
      return;
    }
    const question=currentlyLive
      ? event.event_code+' web sitesinden kaldırılacak ve yeni kayıtlar kapanacak. Mevcut katılımcılar silinmeyecek. Onaylıyor musun?'
      : event.event_code+' web sitesinde yayınlanacak ve etkinlik kayıtları açılacak. Onaylıyor musun?';
    if(!confirm(question))return;
    button.disabled=true;
    const before=button.textContent;
    button.textContent='Kaydediliyor…';
    try{
      const patch=currentlyLive
        ? {published:false,registration_enabled:false}
        : {status:'planned',published:true,registration_enabled:true};
      const out=await A.state.db.from('esc_events').update(patch)
        .eq('id',event.id).eq('revision',event.revision)
        .select('id,event_code,status,published,registration_enabled,revision').maybeSingle();
      if(out.error)throw out.error;
      if(!out.data)throw new Error('Etkinlik başka bir yerde değiştirilmiş olabilir. Yenileyip tekrar dene.');
      if(out.data.published!==!currentlyLive)
        throw new Error('Beklenen yayın durumu kaydedilmedi. Sayfayı yeniden kontrol et.');
      toast(currentlyLive
        ? event.event_code+' yayından kaldırıldı; kayıtları kapandı.'
        : event.event_code+' yayınlandı; kayıtlar açıldı.');
      await view();
    }catch(error){
      alert('Etkinliğin yayın durumu değiştirilemedi: '+(error.message||String(error)));
    }finally{
      button.disabled=false;
      button.textContent=before;
    }
  }

  function editor(event){
    const fresh=!event;
    const e=event||{title:'English Speaking Meetup',kind:'in_person',start_at:'',end_at:'',
      venue:'Eryaman 1-2 Coffee LAB',status:'draft',capacity:15,published:false,registration_enabled:false};
    const start=local(e.start_at),end=local(e.end_at);
    openModal('<h2>'+(fresh?'Yeni Etkinlik':esc(e.event_code)+' · Etkinliği Düzenle')+'</h2>'+
      '<p class="muted">Değişiklikler yalnızca seçilen etkinliğe uygulanır. Yinelenen etkinlik kuralları bu kaydı geri değiştirmez.</p>'+
      '<form id="escEventForm" class="stack"><div class="grid-2">'+
        field('Etkinlik adı','title','text',e.title,'required maxlength="160"')+
        select('Tür','kind',e.kind,[['in_person','Yüz yüze'],['online','Online']])+
        field('Başlangıç','start','datetime-local',start,'required')+
        field('Bitiş','end','datetime-local',end,'required')+
        field('Mekân / Platform','venue','text',e.venue,'required maxlength="160"')+
        field('Kontenjan','capacity','number',e.capacity,'required min="1" max="500"')+
        select('Durum','status',e.status,[['draft','Taslak'],['planned','Planlandı'],['cancelled','İptal'],['completed','Tamamlandı']])+
        field('Tema','theme','text',e.theme||'','maxlength="120"')+
        field('Konum bağlantısı','location_url','url',e.location_url||'')+
        field('Toplantı bağlantısı (isteğe bağlı)','meeting_url','url',e.meeting_url||'')+
      '</div><label>Not<textarea name="note" rows="2" maxlength="1000">'+esc(e.note||'')+'</textarea></label>'+
      '<div class="grid-2">'+select('Web sitesinde görünür','published',String(e.published===true),[['true','Evet'],['false','Hayır']])+
      select('Yeni kayıt al','registration_enabled',String(e.registration_enabled===true),[['true','Açık'],['false','Kapalı']])+
      '</div><div class="notice warning" id="escEditWarning"><strong>Durum ve yayınlama farklıdır.</strong> Planlandı + Sitede yayınla=Evet olursa etkinlik web sitesinde görünür. Kaydet ve Yayınla her ikisini de açar. İptal/Tamamlandı/Taslak durumlarında etkinlik yayın dışıdır. Katılımcılara değişiklik e-postası henüz GÖNDERİLMİYOR.</div>'+
      '<div class="row-actions"><button type="submit" data-submit-action="save" class="btn secondary">'+(fresh?'Taslak kaydet':'Değişiklikleri kaydet')+'</button>'+
      '<button type="submit" data-submit-action="publish" class="btn primary">Kaydet ve Yayınla</button>'+
      '<button type="button" class="btn secondary" id="escEventCancel">Vazgeç</button></div>'+
      '<p id="escEventFeedback" role="status" aria-live="polite" class="muted"></p></form>');
    $('#escEventCancel').onclick=closeModal;
    $('#escEventForm').onsubmit=async(ev)=>{
      ev.preventDefault();
      if(!A.canEdit())return;
      const form=ev.currentTarget;
      const action=ev.submitter?.dataset.submitAction||'save';
      const btn=ev.submitter||form.querySelector('[type="submit"]');
      const feedback=$('#escEventFeedback');
      const f=new FormData(form);
      let patch;
      try{
        const startAt=parse(String(f.get('start')||'')),endAt=parse(String(f.get('end')||''));
        if(Date.parse(endAt)<=Date.parse(startAt))
          throw new Error('Bitiş saati başlangıçtan sonra olmalı.');
        let eventStatus=String(f.get('status')||'draft');
        let published=f.get('published')==='true';
        let registrations=f.get('registration_enabled')==='true';
        if(action==='publish'){
          if(Date.parse(endAt)<=Date.now())
            throw new Error('Geçmiş etkinliği yayınlayamazsın. Lütfen gelecekteki bir tarih seç.');
          if(eventStatus==='cancelled'||eventStatus==='completed'){
            if(!confirm('Etkinliği yeniden PLANLANDI yapıp siteye yayınlamak istiyor musun?'))return;
          }
          eventStatus='planned';published=true;registrations=true;
        }
        if(eventStatus!=='planned'){published=false;registrations=false;}
        if(eventStatus==='planned'&&Date.parse(endAt)<=Date.now())
          throw new Error('Geçmiş etkinlik Planlandı olarak tutulamaz. Tamamlandı veya İptal durumuna geçir.');
        if(!published)registrations=false;
        patch={
          title:String(f.get('title')||'').trim(),kind:String(f.get('kind')||''),
          start_at:startAt,end_at:endAt,venue:String(f.get('venue')||'').trim(),
          capacity:Number(f.get('capacity')||0),status:eventStatus,
          location_url:String(f.get('location_url')||'').trim()||null,
          meeting_url:String(f.get('meeting_url')||'').trim()||null,
          theme:String(f.get('theme')||'').trim(),note:String(f.get('note')||'').trim(),
          published,registration_enabled:registrations
        };
        if(!patch.title||patch.title.length>160||!patch.venue||patch.venue.length>160||
           !Number.isInteger(patch.capacity)||patch.capacity<1||patch.capacity>500)
          throw new Error('Etkinlik adı, mekân ve 1–500 arası kapasite gerekli.');
        for(const url of [patch.location_url,patch.meeting_url]){
          if(url&&!/^https:\/\/\S+$/i.test(url))throw new Error('Linkler https:// ile başlamalı.');
        }
        if(!event&&Date.parse(startAt)<=Date.now())
          throw new Error('Geçmiş tarihe yeni etkinlik açamazsın.');
        const changed=event&&(
          new Date(event.start_at).getTime()!==Date.parse(startAt)||
          new Date(event.end_at).getTime()!==Date.parse(endAt)||
          event.venue!==patch.venue||event.status!==patch.status||
          event.published!==patch.published);
        if(changed&&event.status==='planned'&&
           !confirm('Bu değişiklik mevcut kayıtları koruyacak. Eski Gmail otomasyonu kapalı olduğu için katılımcılara otomatik değişiklik e-postası gitmeyecek. Devam edilsin mi?'))return;
      }catch(error){
        feedback.textContent='Kontrol: '+(error.message||String(error));
        return;
      }
      btn.disabled=true;btn.textContent='Kaydediliyor…';feedback.textContent='Supabase kaydı güncelleniyor…';
      try{
        const q=A.state.db.from('esc_events');
        const result=event
          ? await q.update(patch).eq('id',event.id).eq('revision',event.revision)
              .select('id,event_code,status,published,registration_enabled,revision').maybeSingle()
          : await q.insert(patch)
              .select('id,event_code,status,published,registration_enabled,revision').single();
        if(result.error)throw result.error;
        if(!result.data)throw new Error('Etkinlik güncellenemedi. Başka bir yönetici aynı kaydı değiştirmiş olabilir; yenileyip tekrar dene.');
        const saved=result.data;
        if(saved.published!==patch.published||saved.status!==patch.status)
          throw new Error('Veritabanında beklenen yayın durumu oluşmadı. Yeniden kontrol et.');
        closeModal();
        toast(saved.event_code+(saved.published?' yayınlandı ve kaydedildi.':' kaydedildi (yayın dışı).'));
        await view();
      }catch(error){
        const msg=error.message||String(error);
        feedback.textContent='Kaydetme hatası: '+msg;
        alert('Etkinlik kaydedilemedi: '+msg);
      }finally{
        btn.disabled=false;btn.textContent=action==='publish'?'Kaydet ve Yayınla':(event?'Değişiklikleri kaydet':'Taslak kaydet');
      }
    };
  }

  async function attendees(event){
    const r=await A.state.db.from('esc_event_registrations')
      .select('id,full_name,email,status,consent,first_visit,created_at').eq('event_id',event.id).order('created_at');
    if(r.error)return alert(r.error.message);
    const rows=r.data||[];
    openModal('<h2>'+esc(event.event_code)+' · Katılımcılar</h2>'+
      '<p class="muted">Yalnızca bu etkinliğe kayıtlı kişilerin listesi. İletişim izni olmayanlara otomatik mesaj gönderilmez.</p>'+
      '<div class="table-wrap"><table><thead><tr><th>Ad Soyad</th><th>E-posta</th><th>Durum</th><th>İletişim</th><th>İşlem</th></tr></thead><tbody>'+
      (rows.length?rows.map(x=>'<tr><td>'+esc(x.full_name)+'</td><td>'+esc(x.email)+'</td><td>'+esc(x.status)+'</td><td>'+(x.consent?'İzin var':'İzin yok')+'</td><td><select class="esc-attend-select" data-reg="'+esc(x.id)+'" '+(!A.canEdit()?'disabled':'')+'>'+[['registered','Kayıtlı'],['attended','Katıldı'],['no_show','Gelmedi'],['cancelled','İptal']].map(([k,v])=>'<option value="'+k+'" '+(x.status===k?'selected':'')+'>'+v+'</option>').join('')+'</select></td></tr>').join(''):'<tr><td colspan="5">Henüz kayıt bulunmuyor. Mevcut Google Sheets üyeleri bu veritabanına otomatik aktarılmadı.</td></tr>')+
      '</tbody></table></div><p class="muted">İlk katılım teşekkür e-postaları şu anda kapalı; bu ekrandaki durum değişikliği kendiliğinden e-posta göndermez.</p>');
    $('#modalBody').querySelectorAll('[data-reg]').forEach(s=>s.onchange=async()=>{
      const out=await A.state.db.from('esc_event_registrations').update({status:s.value,updated_at:new Date().toISOString()}).eq('id',s.dataset.reg);
      if(out.error)alert(out.error.message);else toast('Katılım durumu güncellendi');
    });
  }

  function ruleEditor(rule){
    const w=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
    openModal('<h2>Tekrarlayan Program · '+esc(rule.title)+'</h2>'+
      '<form id="escRuleForm" class="stack"><div class="grid-2">'+
      field('Program adı','title','text',rule.title,'required maxlength="160"')+
      select('Etkinlik günü','weekday',String(rule.weekday),w.map((x,i)=>[String(i),x]))+
      field('Başlangıç saati','start_time','time',String(rule.start_time).slice(0,5),'required')+
      field('Süre (dakika)','duration_minutes','number',rule.duration_minutes,'required min="30" max="480"')+
      field('Mekân / Platform','venue','text',rule.venue,'required maxlength="160"')+
      field('Meet bağlantısı (online)','meeting_url','url',rule.meeting_url||'')+
      field('Harita bağlantısı (yüz yüze)','map_url','url',rule.map_url||'')+
      field('Kontenjan','capacity','number',rule.capacity,'required min="1" max="500"')+
      select('Otomatik oluştur','active',String(rule.active),[['true','AÇIK'],['false','KAPALI']])+
      select('Sitede yayınla','published',String(rule.published),[['true','Evet'],['false','Hayır']])+
      field('Kaç gün önceden','horizon_days','number',rule.horizon_days,'required min="7" max="90"')+
      '</div><div class="notice warning">Haftalık gün, saat ve mekân değişiklikleri yeni oluşacak etkinliklere uygulanır. Meet/harita bağlantısı değişirse, boş bağlantılı yaklaşan etkinliklere de aktarılır. Elle değiştirilen etkinlik tarihleri korunur.</div>'+
      '<div class="row-actions"><button class="btn primary" type="submit">Programı Kaydet</button><button type="button" class="btn secondary" id="escRuleClose">Vazgeç</button></div></form>');
    $('#escRuleClose').onclick=closeModal;
    $('#escRuleForm').onsubmit=async ev=>{
      ev.preventDefault();
      const f=new FormData(ev.currentTarget);
      const patch={title:String(f.get('title')).trim(),weekday:Number(f.get('weekday')),
        start_time:String(f.get('start_time')),duration_minutes:Number(f.get('duration_minutes')),
        venue:String(f.get('venue')).trim(),capacity:Number(f.get('capacity')),
        meeting_url:String(f.get('meeting_url')||'').trim()||null,
        map_url:String(f.get('map_url')||'').trim()||null,
        published:f.get('published')==='true',
        active:f.get('active')==='true',horizon_days:Number(f.get('horizon_days'))};
      const b=ev.currentTarget.querySelector('[type=submit]');b.disabled=true;
      try{
        const out=await A.state.db.from('esc_event_rules').update(patch).eq('id',rule.id).select('id').single();
        if(out.error)throw out.error;
        closeModal();toast('Haftalık program güncellendi');await view();
      }catch(err){alert(err.message||String(err))}finally{b.disabled=false}
    };
  }
  A.register('dynamicEvents',view);
})();
