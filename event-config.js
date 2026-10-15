(() => {
  'use strict';

  const DEFAULT = {
    registrationUrl: '/events/',
    mapUrl: 'https://maps.app.goo.gl/7y8SdsCRGYzuSXnr6',
    inPerson: {
      start: '2026-10-11T18:00:00+03:00',
      end: '2026-10-11T20:00:00+03:00',
      day: '11',
      monthTr: 'EKİM',
      monthEn: 'OCT',
      weekdayTr: 'PAZAR',
      weekdayEn: 'SUNDAY',
      time: '18:00',
      venue: 'Eryaman 1-2 Coffee Lab',
      capacity: 'limited'
    },
    pricing: { single: 400, oneMonth: 1400, threeMonth: 3900, currency: 'TL' },
    online: { firstMeetupFree: true, price: 300, fourPack: 1100, twelvePack: 3000, currency: 'TL', unitTr: 'buluşma', unitEn: 'meetup' }
  };

  let CONFIG = JSON.parse(JSON.stringify(DEFAULT));
  window.ESC_EVENT_CONFIG = CONFIG;

  const isEnglish = document.documentElement.lang === 'en';
  const t = (tr,en) => isEnglish ? en : tr;
  const q = selector => document.querySelector(selector);
  const safeText = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeHttpsUrl = value => { try { const u=new URL(value,location.origin);return u.protocol==='https:' ? u.href : null; } catch(_) { return null; } };
  const qa = selector => [...document.querySelectorAll(selector)];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const markManaged = (el, type='event') => {
    if (el) el.dataset.escManaged = type;
    return el;
  };
  const markManagedHref = el => {
    if (el) el.dataset.escManagedHref = 'event';
    return el;
  };
  const titleCaseTr = value => {
    const x=String(value||'').toLocaleLowerCase('tr-TR');
    return x ? x.charAt(0).toLocaleUpperCase('tr-TR')+x.slice(1) : '';
  };
  const titleCaseEn = value => {
    const x=String(value||'').toLowerCase();
    return x ? x.charAt(0).toUpperCase()+x.slice(1) : '';
  };

  function mergeDeep(base, extra) {
    if (!extra || typeof extra !== 'object') return base;
    Object.keys(extra).forEach(key => {
      const value = extra[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        base[key] = mergeDeep(base[key] && typeof base[key] === 'object' ? base[key] : {}, value);
      } else {
        base[key] = value;
      }
    });
    return base;
  }

  function dateLabel(short=false) {
    const e = CONFIG.inPerson;
    if (isEnglish) return short ? (e.monthEn+' '+e.day+' · '+e.weekdayEn+' · '+e.time) : (e.weekdayEn+', '+e.monthEn+' '+e.day+' · '+e.time);
    return e.day+' '+e.monthTr.charAt(0)+e.monthTr.slice(1).toLocaleLowerCase('tr-TR')+' · '+e.weekdayTr.charAt(0)+e.weekdayTr.slice(1).toLocaleLowerCase('tr-TR')+' · '+e.time;
  }

  function applyJoinMode(link, mode) {
    if (!link) return;
    markManagedHref(link);
    const eventPortal = /^\/events\/?(?:\?|$)/.test(CONFIG.registrationUrl||'');
    link.href = eventPortal ? '/events/?type='+encodeURIComponent(mode) : CONFIG.registrationUrl;
    link.dataset.joinMode = mode;
    link.dataset.analyticsTarget = mode === 'online' ? 'online_registration' : 'in_person_registration';
  }

  function setPrice(card, amount, unit) {
    if (!card || amount === undefined || amount === null) return;
    const target = card.querySelector('.meetup-price-main');
    markManaged(target,'pricing');
    const formatted = new Intl.NumberFormat(isEnglish ? 'en-US' : 'tr-TR').format(Number(amount));
    if (target) target.innerHTML = '<strong>'+formatted+' '+(CONFIG.pricing?.currency || CONFIG.online?.currency || 'TL')+'</strong><span>/ '+unit+'</span>';
  }

  function applyPricing() {
    const cards = qa('.meetup-price-card');
    cards.forEach(card => {
      const title=(card.querySelector('h3')?.textContent||'').toLocaleLowerCase('tr-TR');
      const online=card.classList.contains('online-plan');
      const has12=/(^|\D)12(\D|$)/.test(title);
      const has4=/(^|\D)4(\D|$)/.test(title);
      if (online) {
        if (has12) {
          setPrice(card,CONFIG.online.twelvePack,t('12 buluşma','12 meetups'));
        } else if (has4) {
          setPrice(card,CONFIG.online.fourPack,t('4 buluşma','4 meetups'));
        } else {
          setPrice(card,CONFIG.online.price,t('buluşma','meetup'));
        }
      } else if (title.includes('tek etkinlik') || title.includes('single')) {
        setPrice(card,CONFIG.pricing.single,t('etkinlik','event'));
      } else if (has12 || title.includes('3 aylık') || title.includes('3 month')) {
        setPrice(card,CONFIG.pricing.threeMonth,t('12 buluşma','12 meetups'));
      } else if (has4 || title.includes('1 aylık') || title.includes('1 month')) {
        setPrice(card,CONFIG.pricing.oneMonth,t('4 buluşma','4 meetups'));
      }
    });
  }

  function apply(source='local') {
    const e = CONFIG.inPerson;
    const onlineEvent = e.eventKind === 'online';
    const upcoming = Number.isFinite(Date.parse(e.end||'')) && Date.parse(e.end)>Date.now();
    const registrationOpen = upcoming && e.registrationEnabled !== false;
    const featured = q('.next-event-card');
    if(featured) featured.style.display = upcoming ? '' : 'none';
    const strip = q('.hero-join-strip');
    if(strip) strip.style.display = upcoming ? '' : 'none';

    const heroStrip = markManaged(q('.hero-join-strip'));
    if (heroStrip && upcoming) {
      heroStrip.innerHTML = isEnglish
        ? '<span class="hero-join-free">'+e.monthEn+' '+e.day+' · '+(onlineEvent?'ONLINE · ':'')+(registrationOpen?'REGISTRATION OPEN':'REGISTRATION CLOSED')+'</span><span class="hero-join-info"><strong>'+e.weekdayEn.charAt(0)+e.weekdayEn.slice(1).toLowerCase()+' · '+e.time+'</strong><i></i>'+safeText(e.venue)+'</span>'
        : '<span class="hero-join-free">'+e.day+' '+e.monthTr+' · '+(onlineEvent?'ONLINE · ':'')+(registrationOpen?'KAYITLAR AÇIK':'KAYITLAR KAPALI')+'</span><span class="hero-join-info"><strong>'+e.weekdayTr.charAt(0)+e.weekdayTr.slice(1).toLocaleLowerCase('tr-TR')+' · '+e.time+'</strong><i></i>'+safeText(e.venue)+'</span>';
    }

    const heroJoin = markManaged(q('.hero-actions .join-primary'));
    if (heroJoin) {
      heroJoin.innerHTML = !registrationOpen ? (isEnglish?'See upcoming meetups <span>→</span>':'Yaklaşan buluşmaları gör <span>→</span>') : (isEnglish ? 'Join the '+e.monthEn+' '+e.day+' meetup <span>→</span>' : e.day+' '+e.monthTr.charAt(0)+e.monthTr.slice(1).toLocaleLowerCase('tr-TR')+' buluşmasına katıl <span>→</span>');
      applyJoinMode(heroJoin,onlineEvent?'online':'in_person');
    }

    const heroProof = markManaged(q('.hero-proof p'));
    if (heroProof && !upcoming) heroProof.innerHTML = isEnglish ? '<strong>First meetup is free · A2–B2+</strong> · Discover future meetups' : '<strong>İlk buluşma ücretsiz · A2–B2+</strong> · Yaklaşan buluşmaları keşfet';
    if (heroProof && upcoming) {
      heroProof.innerHTML = isEnglish
        ? '<strong>First meetup is free · Open to A2–B2+ levels</strong><br>'+e.monthEn+' '+e.day+(registrationOpen?' registration is open · ':' registration is closed · ')+(registrationOpen?(e.capacity==='limited'?'limited capacity':'registration open'):'registration closed')+' · come on your own'
        : '<strong>İlk buluşma ücretsiz · A2–B2+ seviyelerine açık</strong><br>'+e.day+' '+e.monthTr.charAt(0)+e.monthTr.slice(1).toLocaleLowerCase('tr-TR')+(registrationOpen?' kayıtları açık · ':' kayıtları kapalı · ')+(registrationOpen?(e.capacity==='limited'?'kontenjan sınırlı':'kayıt açık'):'kayıt kapalı')+' · tek başına gelebilirsin';
    }

    const scrollCue = markManaged(q('.scroll-cue span'));
    if (scrollCue && !upcoming) scrollCue.textContent = isEnglish ? 'Discover upcoming meetups' : 'Yaklaşan buluşmaları keşfet';
    if (scrollCue && upcoming) {
      scrollCue.textContent = isEnglish
        ? 'See the '+titleCaseEn(e.monthEn)+' '+e.day+' meetup'
        : e.day+' '+titleCaseTr(e.monthTr)+' etkinliğini gör';
    }

    const dateCard = markManaged(q('.next-event-date'));
    if (dateCard) {
      dateCard.innerHTML='<strong>'+e.day+'</strong><span>'+(isEnglish?e.monthEn:e.monthTr)+'</span><small>'+(isEnglish?e.weekdayEn:e.weekdayTr)+'</small>';
      dateCard.setAttribute('aria-label',dateLabel());
    }

    const next=q('.next-event-card');
    if(next){
      next.setAttribute('aria-label',dateLabel());
      const heading=markManaged(next.querySelector('.next-event-copy h2'));
      if(heading) heading.textContent=onlineEvent
        ? (isEnglish?'Join our next online conversation.':'Sıradaki online buluşmamıza katıl.')
        : (isEnglish?'Save your seat for this '+titleCaseEn(e.weekdayEn)+'.':'Bu '+titleCaseTr(e.weekdayTr)+' masadaki yerini ayırt.');
      const kicker=markManaged(next.querySelector('.next-event-kicker'));
      if(kicker) kicker.textContent=!registrationOpen ? (isEnglish?'REGISTRATION CLOSED':'KAYITLAR KAPALI') : isEnglish
        ? (e.capacity==='limited'?'REGISTRATION OPEN · LIMITED CAPACITY':'REGISTRATION OPEN')
        : (e.capacity==='limited'?'KAYITLAR AÇIK · KONTENJAN SINIRLI':'KAYITLAR AÇIK');
      const details=markManaged(next.querySelector('.next-event-details'));
      if(details) details.innerHTML=(isEnglish
        ? '<span>🕖 <strong>'+e.time+'</strong></span><span>'+(onlineEvent?'💻':'📍')+' <strong>'+safeText(e.venue)+'</strong></span><span>💬 <strong>Speaking · games · new people</strong></span>'
        : '<span>🕖 <strong>'+e.time+'</strong></span><span>'+(onlineEvent?'💻':'📍')+' <strong>'+safeText(e.venue)+'</strong></span><span>💬 <strong>Speaking · oyunlar · yeni insanlar</strong></span>');
      const urgency=markManaged(next.querySelector('.next-event-urgency'));
      if(urgency) urgency.textContent=!registrationOpen?(isEnglish?'Registrations are closed':'Kayıtlar kapalı'):isEnglish?'Save your seat for '+e.monthEn+' '+e.day:e.day+' '+e.monthTr.charAt(0)+e.monthTr.slice(1).toLocaleLowerCase('tr-TR')+' için yerini ayırt';
      applyJoinMode(next.querySelector('.next-event-join'),onlineEvent?'online':'in_person');
      const map=markManagedHref(next.querySelector('.next-event-location'));if(map){map.style.display=onlineEvent?'none':'';const safe=safeHttpsUrl(CONFIG.mapUrl);if(!onlineEvent&&safe)map.href=safe;else map.removeAttribute('href');}
    }

    const galleryDate=markManaged(q('.gallery-join-cta small'));
    if(galleryDate)galleryDate.textContent=!upcoming ? (isEnglish?'UPCOMING MEETUPS':'YAKLAŞAN BULUŞMALAR') : isEnglish?'NEXT MEETUP · '+e.weekdayEn+', '+e.monthEn+' '+e.day+' · '+e.time:'SIRADAKİ BULUŞMA · '+e.day+' '+e.monthTr+' '+e.weekdayTr+' · '+e.time;
    applyJoinMode(q('.gallery-join-cta a'),onlineEvent?'online':'in_person');

    const feedbackDate=markManaged(q('.feedback-intro-cta span'));if(feedbackDate)feedbackDate.textContent=upcoming?dateLabel(true):(isEnglish?'Upcoming events':'Yaklaşan etkinlikler');
    applyJoinMode(q('.feedback-intro-cta a'),onlineEvent?'online':'in_person');

    qa('.online-meetup-cta, .online-plan .meetup-price-cta').forEach(link=>applyJoinMode(link,'online'));
    qa('.meetup-price-card:not(.online-plan) .meetup-price-cta').forEach(link=>{if(link.href.includes('forms.gle'))applyJoinMode(link,'in_person')});
    qa('.final-actions a').forEach(link=>{
      const text=(link.textContent||'').toLowerCase();
      const href=link.getAttribute('href')||'';
      const isJoinLink=href.includes('forms.gle')||/katıl|buluşma|join|meetup|online|eryaman/.test(text);
      if(isJoinLink)applyJoinMode(link,/online/i.test(text)?'online':'in_person');
    });
    const dock=qa('.mobile-join-options a');if(dock[0])applyJoinMode(dock[0],'in_person');if(dock[1])applyJoinMode(dock[1],'online');
    qa('a[href*="forms.gle"]').forEach(link=>{if(link.dataset.joinMode)return;const text=(link.textContent||'').toLowerCase();applyJoinMode(link,link.closest('#online-meetups,.online-plan')||text.includes('online')?'online':'in_person')});
    applyPricing();

    const oldSchema=document.querySelector('script[data-site-refresh-seo]');
    if(oldSchema){try{const data=JSON.parse(oldSchema.textContent);if(data&&Array.isArray(data['@graph']))data['@graph']=data['@graph'].filter(item=>item['@type']!=='Event');oldSchema.textContent=JSON.stringify(data)}catch(_){}}
    let eventSchema=document.getElementById('esc-event-schema');
    const eventEnd=Date.parse(e.end||'');
    const eventExpired=Number.isFinite(eventEnd)&&eventEnd<Date.now();
    if(eventExpired){
      if(eventSchema)eventSchema.remove();
    }else{
      if(!eventSchema){eventSchema=document.createElement('script');eventSchema.type='application/ld+json';eventSchema.id='esc-event-schema';document.head.appendChild(eventSchema)}
      eventSchema.textContent=JSON.stringify({
        '@context':'https://schema.org','@type':'Event',
        name:isEnglish?'Eryaman Speaking Club — '+e.monthEn+' '+e.day+' Meetup':'Eryaman Speaking Club — '+e.day+' '+e.monthTr.charAt(0)+e.monthTr.slice(1).toLocaleLowerCase('tr-TR')+' Buluşması',
        startDate:e.start,endDate:e.end,eventStatus:'https://schema.org/EventScheduled',eventAttendanceMode:onlineEvent?'https://schema.org/OnlineEventAttendanceMode':'https://schema.org/OfflineEventAttendanceMode',
        location:onlineEvent?{'@type':'VirtualLocation',url:'https://eryamanspeakingclub.com/events/'}:{'@type':'Place',name:e.venue,address:{'@type':'PostalAddress',addressLocality:'Ankara',addressCountry:'TR'}},
        organizer:{'@type':'Organization',name:'Eryaman Speaking Club',url:'https://eryamanspeakingclub.com/'},url:'https://eryamanspeakingclub.com/#next-event'
      });
    }
    window.ESC_EVENT_CONFIG=CONFIG;
    window.dispatchEvent(new CustomEvent('esc:event-config:applied',{detail:{source}}));
  }

  async function loadRemote() {
    for(let i=0;i<80;i++){if(window.ESCSupabase?.getClient)break;await sleep(50)}
    if(!window.ESCSupabase?.getClient)return;
    try{
      const db=await window.ESCSupabase.getClient();if(!db)return;
      const {data,error}=await db.from('esc_cms_public_settings').select('published_data').eq('key','event_config').maybeSingle();
      if(!error&&data?.published_data){
        CONFIG=mergeDeep(JSON.parse(JSON.stringify(DEFAULT)),data.published_data);
      }
      // Registration is tied to a specific live event.
      CONFIG.registrationUrl='/events/';
      // One canonical event table: never rely on old manual CMS date again.
      const {data:events,error:eventError}=await db.from('esc_public_upcoming_events')
        .select('event_code,start_at,end_at,venue,location_url,kind,status,registration_enabled,available_seats')
        .eq('status','planned')
        .gt('start_at',new Date().toISOString())
        .order('start_at',{ascending:true}).limit(1);
      if(!eventError&&events?.length){
        const event=events[0];
        const start=new Date(event.start_at),end=new Date(event.end_at);
        const parts=new Intl.DateTimeFormat('en-CA',{
          timeZone:'Europe/Istanbul',year:'numeric',month:'numeric',day:'numeric',
          weekday:'long',hour:'2-digit',minute:'2-digit',hour12:false
        }).formatToParts(start);
        const part=t=>parts.find(x=>x.type===t)?.value||'';
        const weekdays=['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
        const weekdayNum=new Date(Date.UTC(Number(part('year')),Number(part('month'))-1,Number(part('day')))).getUTCDay();
        const trMonths=['OCAK','ŞUBAT','MART','NİSAN','MAYIS','HAZİRAN','TEMMUZ','AĞUSTOS','EYLÜL','EKİM','KASIM','ARALIK'];
        const enMonths=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        const trDays=['PAZAR','PAZARTESİ','SALI','ÇARŞAMBA','PERŞEMBE','CUMA','CUMARTESİ'];
        CONFIG.inPerson={
          ...CONFIG.inPerson,
          start:event.start_at,end:event.end_at,
          day:String(Number(part('day'))),
          monthTr:trMonths[Number(part('month'))-1],
          monthEn:enMonths[Number(part('month'))-1],
          weekdayTr:trDays[weekdayNum],
          weekdayEn:weekdays[weekdayNum],
          time:part('hour')+':'+part('minute'),
          venue:event.venue,
          eventCode:event.event_code,
          eventKind:event.kind,
          registrationEnabled:event.registration_enabled===true && Number(event.available_seats)>0
        };
        if(event.location_url && safeHttpsUrl(event.location_url))CONFIG.mapUrl=event.location_url;
      }else if(!eventError){
        CONFIG.inPerson={...CONFIG.inPerson,start:'',end:'2000-01-01T00:00:00+03:00'};
      }else if(eventError){
        console.warn('ESC upcoming event lookup failed',eventError.code||eventError.message||'unknown');
        CONFIG.inPerson={...CONFIG.inPerson,start:'',end:'2000-01-01T00:00:00+03:00'};
      }
      window.ESC_EVENT_CONFIG=CONFIG;
      apply('remote');
    }catch(error){
      console.warn('ESC event config temporarily unavailable',error);
      CONFIG.registrationUrl='/events/';
      CONFIG.inPerson={...CONFIG.inPerson,start:'',end:'2000-01-01T00:00:00+03:00'};
      apply('unavailable');
    }
  }

  window.ESCApplyEventConfig = () => apply('manual');
  window.addEventListener('esc:event-config:refresh',()=>apply('refresh'));

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{apply('default');loadRemote()},{once:true});
  else{apply('default');loadRemote()}
})();