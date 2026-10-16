/* ESC unified event operations: calendar in Supabase, attendance verified against Sheets. */
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
  let lastRuleResult=null;
  const sheetUrl='https://docs.google.com/spreadsheets/d/1nD5GjKPQD88UCkJJZkygEZpB2Hj2rvCqWlsFlgrhgK4/edit';

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
    const roster=events.length
      ? await A.state.db.from('esc_sheet_roster')
          .select('event_id,listed,attended').in('event_id',events.map(e=>e.id).slice(0,180))
      : {data:[],error:null};
    if(roster.error && events.length)throw roster.error;
    const counts={};
    (roster.data||[]).forEach(r=>{
      if(!counts[r.event_id])counts[r.event_id]={listed:0,attended:0};
      if(r.listed){counts[r.event_id].listed++;if(r.attended)counts[r.event_id].attended++;}
    });
    $('#panel').innerHTML=
      '<div class="notice"><strong>ETKİNLİK VE KATILIM MERKEZİ.</strong> Etkinlik tarih, saat, mekân ve iptal işlemlerini burada yönet. Katılımın esas kaynağı <strong>Google Sheets</strong>; “Katılımcılar” ekranında Listede, Katıldı ve Gelmedi işlemleri güvenli senkronizasyon kuyruğuna alınır. İki yerde farklı değişiklik olursa otomatik üzerine yazılmaz. E-posta gönderimi ayrıca onaylanana kadar KAPALI.</div>'+
      '<div class="stats esc-event-stats">'+
        '<div class="stat"><span>YAKLAŞAN</span><strong>'+upcoming.length+'</strong><small>Aktif ve gelecekteki etkinlik</small></div>'+
        '<div class="stat"><span>BU ARALIKTA İPTAL</span><strong>'+cancelled+'</strong><small>Geri dönüşümlü</small></div>'+
        '<div class="stat"><span>TEKRARLAYAN PROGRAM</span><strong>'+rules.filter(x=>x.active).length+'</strong><small>Arka planda günlük üretilir</small></div>'+
        '<div class="stat"><span>BİLDİRİMLER</span><strong>Kapalı</strong><small>Eski üyelere izinsiz gönderim yok</small></div>'+
      '</div>'+
      '<div class="card"><div class="card-head"><div><h2>Etkinlikleri Düzenle ve Yayınla</h2><p class="muted">Düzenle = etkinliğin bilgilerini değiştir. Yayınla = etkinliği sitede görünür yap ve kayıtları aç. Yayından kaldır = etkinliği siteden gizle; kayıtları kapat. Değişen tarih ve mekân mevcut ETK numarası ile katılımcıları korur.</p></div><div class="row-actions"><button id="escEventNew" class="btn primary" '+(!A.canEdit()?'disabled':'')+'>+ Yeni Etkinlik</button><button id="escEventReload" class="btn secondary">Yenile</button><button type="button" id="escEventExports" class="btn secondary">Excel’e Aktar</button><a href="../events/" target="_blank" rel="noopener" class="btn secondary">Kayıt Sayfası ↗</a></div></div>'+
      '<div class="table-wrap"><table><thead><tr><th>Etkinlik</th><th>Tarih & saat</th><th>Tür / yer</th><th>Durum</th><th>Katılımcı</th><th>İşlemler</th></tr></thead><tbody>'+
      (events.length?events.map(e=>
        '<tr><td><strong>'+esc(e.event_code)+'</strong><br>'+esc(e.title)+'</td>'+
        '<td>'+esc(fmt(e.start_at))+'<br><small>'+esc(fmt(e.end_at))+'</small></td>'+
        '<td>'+esc(kinds[e.kind]||e.kind)+'<br><small>'+esc(e.venue)+'</small></td>'+
        '<td>'+status(e)+'<br><small>Sürüm '+e.revision+(e.manual_override?' · Elle düzenlendi':'')+'</small></td>'+
        '<td><strong>'+Number(counts[e.id]?.listed||0)+'</strong> / '+e.capacity+'<br><small>Katıldı: '+Number(counts[e.id]?.attended||0)+'</small></td>'+
        '<td><div class="row-actions"><button type="button" class="icon-btn" data-edit="'+esc(e.id)+'" '+(!A.canEdit()?'disabled':'')+'>Düzenle</button>'+
        '<button type="button" class="icon-btn '+(isPublished(e)?'danger-text':'')+'" data-publish="'+esc(e.id)+'" '+
        (!A.canEdit()||e.status==='cancelled'||e.status==='completed'||(!isPublished(e)&&Date.parse(e.end_at)<=Date.now())?'disabled':'')+'>'+
        (isPublished(e)?'Yayından kaldır':'Yayınla')+'</button>'+
        '<button type="button" class="icon-btn" data-attendees="'+esc(e.id)+'">Katılımı Yönet</button>'+
        '<button type="button" class="icon-btn danger-text" data-cancel-event="'+esc(e.id)+'" '+
        (e.status!=='planned'||!A.canEdit()?'disabled':'')+'>Etkinliği İptal Et</button></div></td></tr>').join('')
        :'<tr><td colspan="6">Etkinlik bulunamadı.</td></tr>')+
      '</tbody></table></div></div>'+
      '<div class="card"><div class="card-head"><div><h2>Tekrarlayan Etkinlikler</h2><p class="muted">Bunlar başlangıç şablonlarıdır. Önceden açılmış etkinlikleri veya elle değiştirilmiş tarihleri geri almaz.</p></div></div>'+
      '<div class="grid-3">'+rules.map(r=>'<div class="mini-card"><span class="pill '+(r.active?'published':'draft')+'">'+(r.active?'Aktif':'Kapalı')+'</span><h3>'+esc(r.title)+'</h3><p>'+['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'][r.weekday]+' · '+esc(String(r.start_time).slice(0,5))+' · '+esc(r.venue)+'</p><div class="row-actions" style="margin-top:12px"><button class="btn secondary" data-rule="'+esc(r.id)+'" '+(!A.canEdit()?'disabled':'')+'>Düzenle</button></div></div>').join('')+'</div></div>'+
      (lastRuleResult?'<div class="notice"><strong>Haftalık program sonucu:</strong> '+esc(lastRuleResult)+'</div>':'')+
      '<div class="notice warning">Katılımcısı olan veya özel olarak düzenlenmiş mevcut etkinlikler haftalık değişiklikle sessizce taşınmaz. Bunları yukarıdaki listeden ayrıca düzenle. Otomatik e-posta gönderimi henüz KAPALI.</div>';
    $('#escEventNew').onclick=()=>editor(null);
    $('#escEventReload').onclick=()=>view();
    $('#escEventExports').onclick=()=>A.go('exports');
    $('#panel').querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editor(events.find(x=>x.id===b.dataset.edit)));
    $('#panel').querySelectorAll('[data-publish]').forEach(b=>b.onclick=()=>togglePublish(events.find(x=>x.id===b.dataset.publish),b));
    $('#panel').querySelectorAll('[data-attendees]').forEach(b=>b.onclick=()=>attendees(events.find(x=>x.id===b.dataset.attendees)));
    $('#panel').querySelectorAll('[data-cancel-event]').forEach(b=>b.onclick=()=>cancelEvent(events.find(x=>x.id===b.dataset.cancelEvent),b));
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

  async function cancelEvent(event,button){
    if(!event||!A.canEdit()||event.status!=='planned')return;
    if(!confirm(event.event_code+' etkinliğini İPTAL etmek istiyor musun?\n\nSiteden kaldırılacak, yeni kayıtlar kapanacak ve 5 dakikalık kontrol sonrasında Google Sheets Etkinlikler tablosuna yansıyacak. Katılım geçmişi SİLİNMEYECEK. E-posta ayrıca onaylanmadıkça GÖNDERİLMEYECEK.'))return;
    button.disabled=true;button.textContent='İptal ediliyor…';
    try{
      const out=await A.state.db.from('esc_events')
        .update({status:'cancelled',published:false,registration_enabled:false})
        .eq('id',event.id).eq('revision',event.revision)
        .select('id,event_code,status,revision').maybeSingle();
      if(out.error)throw out.error;
      if(!out.data||out.data.status!=='cancelled')
        throw new Error('Etkinlik eşzamanlı değişmiş olabilir. Yenileyip tekrar dene.');
      toast(event.event_code+' iptal edildi; katılımcı kayıtları korundu.');
      await view();
    }catch(err){
      alert('Etkinlik iptal edilemedi: '+(err.message||String(err)));
    }finally{button.disabled=false;button.textContent='Etkinliği İptal Et';}
  }

  async function attendees(event){
    if(!event)return;
    const [roster,members,requests,health,web]=await Promise.all([
      A.state.db.from('esc_sheet_roster')
        .select('member_code,full_name,email,consent,listed,attended,first_visit,sheet_row,synced_at')
        .eq('event_id',event.id).order('member_code',{ascending:true}),
      A.state.db.from('esc_sheet_members')
        .select('member_code,full_name,eligible,consent')
        .order('member_code',{ascending:true}).limit(500),
      A.state.db.from('esc_sheet_attendance_actions')
        .select('id,member_code,operation,status,error,created_at')
        .eq('event_id',event.id).order('created_at',{ascending:false}).limit(100),
      A.state.db.rpc('esc_admin_attendance_bridge_status'),
      A.state.db.from('esc_event_registrations')
        .select('id,status,source,email').eq('event_id',event.id)
    ]);
    for(const r of [roster,members,requests,health,web])
      if(r.error){alert('Katılım listesi açılamadı: '+r.error.message);return;}
    const ready=health.data?.ready===true && A.canEdit()
      && event.status!=='cancelled' && Date.parse(event.end_at)>Date.now()-30*86400000;
    const isPast=Date.parse(event.end_at)<=Date.now()&&event.status!=='cancelled';
    const all=(roster.data||[]),visible=all.filter(r=>r.listed);
    const memberList=(members.data||[]).filter(m=>m.eligible);
    const recent=requests.data||[],pending=new Map();
    for(const r of recent)if(r.status==='pending'&&!pending.has(r.member_code))
      pending.set(r.member_code,r);
    const activeCodes=new Set(visible.map(r=>r.member_code));
    const pendingAdds=recent.filter(r=>r.status==='pending'&&r.operation==='add').map(r=>r.member_code);
    const outside=(web.data||[]).filter(r=>
      r.source==='website'&&r.status==='registered'&&!all.some(m=>
        m.listed&&m.email&&String(m.email).toLowerCase()===String(r.email).toLowerCase())
    ).length;
    const attended=visible.filter(r=>r.attended).length;
    const absent=isPast?visible.filter(r=>!r.attended).length:0;
    const rowHTML=(r)=>{
      const p=pending.get(r.member_code);
      const statusText=p?'Beklemede':r.attended?'Katıldı':isPast?'Gelmedi':'Listede';
      const canTouch=ready&&!p;
      return '<tr><td><strong>'+esc(r.full_name)+'</strong><br><small>'+esc(r.member_code)+'</small></td>'+
        '<td>'+esc(statusText)+(r.first_visit?' · İlk kez':'')+'</td>'+
        '<td>'+(r.consent?'İzin var':'İzin yok')+'</td>'+
        '<td><div class="row-actions">'+
          (!r.attended?'<button type="button" class="icon-btn" data-att-operation="attended" data-att-member="'+esc(r.member_code)+'" '+(!canTouch?'disabled':'')+'>Katıldı</button>':
            '<button type="button" class="icon-btn" data-att-operation="absent" data-att-member="'+esc(r.member_code)+'" '+(!canTouch?'disabled':'')+'>'+(isPast?'Gelmedi':'Katılımı Geri Al')+'</button>')+
          '<button type="button" class="icon-btn danger-text" data-att-operation="remove" data-att-member="'+esc(r.member_code)+'" '+(!canTouch?'disabled':'')+'>Listeden Çıkar</button>'+
        '</div></td></tr>';
    };
    openModal('<h2>'+esc(event.event_code)+' · Etkinlik ve Katılım Merkezi</h2>'+
      '<p class="muted">'+esc(kinds[event.kind]||event.kind)+' · '+esc(fmt(event.start_at))+' · '+esc(event.venue)+'</p>'+
      '<div class="notice"><strong>Katılım Google Sheets\'e bağlıdır.</strong> Listede, Katıldı ve Gelmedi işlemleri önce güvenli kuyruğa alınır, Sheets\'e uygulandıktan sonra Supabase kaydı güncellenir. E-posta bu işlemle gönderilmez.</div>'+
      (!ready?'<div class="notice warning"><strong>Panelden katılım değiştirme henüz hazır değil.</strong> Güncel Apps Script v2 kurularak 5 dakikalık senkronizasyon doğrulanmalıdır. O zamana kadar <a href="'+sheetUrl+'" target="_blank" rel="noopener">Google Sheets üzerinden düzenleyebilirsin ↗</a>.</div>':'')+
      '<div class="stats">'+
        '<div class="stat"><span>LİSTEDE</span><strong>'+visible.length+'</strong></div>'+
        '<div class="stat"><span>KATILDI</span><strong>'+attended+'</strong></div>'+
        '<div class="stat"><span>GELMEDİ</span><strong>'+absent+'</strong><small>'+(!isPast?'Etkinlik henüz bitmedi':'Etkinlik tamamlandı')+'</small></div>'+
        '<div class="stat"><span>BEKLEYEN</span><strong>'+pending.size+'</strong></div>'+
      '</div>'+
      '<div class="table-wrap"><table><thead><tr><th>Üye</th><th>Durum</th><th>İletişim izni</th><th>İşlemler</th></tr></thead><tbody>'+
      (visible.length?visible.map(rowHTML).join(''):'<tr><td colspan="4">Bu etkinlik için Listede işaretli üye yok.</td></tr>')+
      '</tbody></table></div>'+
      (memberList.length?'<div class="card"><h3>Listeden yeni kişi seç</h3>'+
        '<p class="muted">Google Sheets ana üye listesinde bulunan kişileri seçebilirsin.</p>'+
        '<div class="row-actions"><select id="escAttendanceNewMember" aria-label="Üye seç" '+(!ready?'disabled':'')+'>'+
        '<option value="">Üye seç…</option>'+
        memberList.filter(m=>!activeCodes.has(m.member_code)&&!pending.has(m.member_code)).map(m=>
          '<option value="'+esc(m.member_code)+'">'+esc(m.full_name)+' · '+esc(m.member_code)+'</option>').join('')+
        '</select><button type="button" id="escAttendanceAdd" class="btn primary" '+(!ready?'disabled':'')+'>Listeye Ekle</button></div></div>':
        '<div class="notice">Üye seçme listesi henüz senkronize edilmedi. Apps Script v2 ilk çalıştırmada üye rehberini aktaracak.</div>')+
      (outside?'<div class="notice warning">Web sitesi üzerinden '+outside+' kayıtlı kişi Sheets\'te “Listede” değil. Mesaj göndermek için önce üye rehberinden seçilmeli veya Sheets listesinde işaretlenmeli.</div>':'')+
      (recent.some(x=>x.status==='conflict')?'<div class="notice warning"><strong>Çakışma:</strong> '+recent.filter(x=>x.status==='conflict').slice(0,3).map(x=>
        esc(x.member_code+': '+(x.error||'İki tarafta farklı değişiklik'))).join(' | ')+'</div>':'')+
      (pendingAdds.length?'<p class="muted">Listeye eklenmeyi bekleyen: '+pendingAdds.map(x=>esc(x)).join(', ')+'</p>':'')+
      '<p class="muted">Gelmedi = etkinlik bittikten sonra Listede seçili ama Katıldı işaretli olmayan kişi. Gelecek etkinliklerde henüz “Gelmedi” sayılmaz. İptal edilen etkinlikte yoklama düzenlenmez.</p>'+
      '<div class="row-actions"><button type="button" id="escAttendanceRefresh" class="btn secondary">Durumu Yenile</button>'+
      '<a href="'+sheetUrl+'" target="_blank" rel="noopener" class="btn secondary">Google Sheets\'i Aç ↗</a>'+
      '<button type="button" id="escAttendanceMail" class="btn secondary">Mesaj Ayarları</button></div>'+
      '<p id="escAttendanceFeedback" role="status" aria-live="polite" class="muted"></p>');
    $('#escAttendanceRefresh').onclick=()=>attendees(event);
    $('#escAttendanceMail').onclick=()=>{closeModal();A.go('sheetsSync')};
    async function queue(memberCode,operation){
      if(!ready)return;
      const fb=$('#escAttendanceFeedback');
      fb.textContent='Google Sheets işlem kuyruğuna ekleniyor…';
      try{
        const out=await A.state.db.rpc('esc_admin_request_attendance',{
          p_event:event.id,p_member_code:memberCode,p_operation:operation
        });
        if(out.error)throw out.error;
        if(!out.data?.queued && !out.data?.already_current)
          throw new Error('İşlem isteği doğrulanamadı.');
        if(out.data.queued)toast('Katılım değişikliği güvenli senkronizasyon sırasına alındı.');
        await attendees(event);
      }catch(e){fb.textContent='İşlem yapılamadı: '+(e.message||String(e));}
    }
    $('#modalBody').querySelectorAll('[data-att-operation]').forEach(btn=>{
      btn.onclick=async()=>{
        const op=btn.dataset.attOperation;
        if(op==='remove'&&!confirm('Bu kişiyi '+event.event_code+' Listede durumundan çıkarıyor musun? Katılım geçmişi silinmez.'))return;
        await queue(btn.dataset.attMember,op);
      };
    });
    const add=$('#escAttendanceAdd');
    if(add)add.onclick=()=>{
      const code=$('#escAttendanceNewMember')?.value;
      if(!code)return alert('Önce bir üye seç.');
      queue(code,'add');
    };
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
      '</div><label class="esc-rule-sync-option" style="display:flex;align-items:flex-start;gap:10px;font-weight:700"><input name="apply_future" type="checkbox" checked style="width:18px;min-width:18px;margin-top:3px">Katılımcısı ve özel düzenlemesi olmayan mevcut gelecek etkinlikleri de bu programa göre güncelle.</label>'+ 
      '<div class="notice warning">Haftalık değişikliklerin mevcut buluşmalara uygulanması güvenlik kontrollüdür. Katılımcısı veya elle yapılmış değişikliği olan etkinlikler korunur; aynı haftaya ikinci etkinlik açılmaz.</div>'+
      '<div class="row-actions"><button class="btn primary" type="submit">Programı Kaydet</button><button type="button" class="btn secondary" id="escRuleClose">Vazgeç</button></div>'+
      '<p id="escRuleFeedback" class="muted" role="status" aria-live="polite"></p></form>');
    $('#escRuleClose').onclick=closeModal;
    $('#escRuleForm').onsubmit=async ev=>{
      ev.preventDefault();
      if(!A.canEdit())return;
      const form=ev.currentTarget;
      const f=new FormData(form);
      const patch={
        title:String(f.get('title')||'').trim(),weekday:Number(f.get('weekday')),
        start_time:String(f.get('start_time')||''),
        duration_minutes:Number(f.get('duration_minutes')),
        venue:String(f.get('venue')||'').trim(),capacity:Number(f.get('capacity')),
        meeting_url:String(f.get('meeting_url')||'').trim()||null,
        map_url:String(f.get('map_url')||'').trim()||null,
        published:f.get('published')==='true',
        active:f.get('active')==='true',
        horizon_days:Number(f.get('horizon_days'))
      };
      const applyFuture=f.get('apply_future')==='on';
      const feedback=$('#escRuleFeedback');
      if(!patch.title||patch.title.length>160||!patch.venue||
         !Number.isInteger(patch.weekday)||patch.weekday<0||patch.weekday>6||
         !Number.isInteger(patch.duration_minutes)||patch.duration_minutes<30||patch.duration_minutes>480||
         !Number.isInteger(patch.capacity)||patch.capacity<1||patch.capacity>500||
         !Number.isInteger(patch.horizon_days)||patch.horizon_days<7||patch.horizon_days>90){
        feedback.textContent='Program adı, gün, mekân, süre, kontenjan ve önceden oluşturma sayısını kontrol et.';
        return;
      }
      for(const link of [patch.meeting_url,patch.map_url]){
        if(link&&!/^https:\/\/\S+$/i.test(link)){
          feedback.textContent='Meet ve harita bağlantıları https:// ile başlamalı.';
          return;
        }
      }
      const btn=form.querySelector('[type="submit"]');
      btn.disabled=true;btn.textContent='Kaydediliyor…';
      feedback.textContent='Haftalık program ve uygun gelecek etkinlikler kaydediliyor…';
      try{
        // Atomic backend operation: saved rule, protected future occurrences
        // and generation either succeed together or not at all.
        const out=await A.state.db.rpc('esc_admin_save_weekly_rule',{
          p_rule_id:rule.id,p_patch:patch,p_apply_future:applyFuture
        });
        if(out.error)throw out.error;
        if(!out.data?.saved)throw new Error('Program kaydı doğrulanamadı.');
        const r=out.data;
        const protectedCount=Number(r.protected_manual||0)+Number(r.protected_registered||0);
        lastRuleResult='Güncellenen mevcut: '+Number(r.updated||0)+
          ' · Yeni: '+Number(r.created||0)+
          ' · Korunan: '+protectedCount+
          ' · Geçmiş/çakışma yüzünden değişmeyen: '+
          (Number(r.skipped_past||0)+Number(r.skipped_collision||0))+
          '. Korunanları etkinlik listesinden gerekirse tek tek düzenle.';
        closeModal();
        await view();
        toast('Haftalık program ve uygun gelecek etkinlikler kaydedildi.');
      }catch(error){
        const msg=error.message||String(error);
        feedback.textContent='Program: '+msg;
        alert(msg);
      }finally{
        btn.disabled=false;btn.textContent='Programı Kaydet';
      }
    };
  }
  A.register('dynamicEvents',view);
})();
