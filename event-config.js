(() => {
  'use strict';

  const DEFAULT = {
    registrationUrl: 'https://forms.gle/qjYk7dYtV8Vhpud29',
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
    link.href = CONFIG.registrationUrl;
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
      if (online) {
        if (title.includes('12 buluşma') || title.includes('12-meetup') || title.includes('12 meetup')) {
          setPrice(card,CONFIG.online.twelvePack,t('12 buluşma','12 meetups'));
        } else if (title.includes('4 buluşma') || title.includes('4-meetup') || title.includes('4 meetup')) {
          setPrice(card,CONFIG.online.fourPack,t('4 buluşma','4 meetups'));
        } else {
          setPrice(card,CONFIG.online.price,t('buluşma','meetup'));
        }
      } else if (title.includes('tek etkinlik') || title.includes('single')) {
        setPrice(card,CONFIG.pricing.single,t('etkinlik','event'));
      } else if (title.includes('12 buluşma') || title.includes('12-meetup') || title.includes('12 meetup') || title.includes('3 aylık') || title.includes('3 month')) {
        setPrice(card,CONFIG.pricing.threeMonth,t('12 buluşma','12 meetups'));
      } else if (title.includes('4 buluşma') || title.includes('4-meetup') || title.includes('4 meetup') || title.includes('1 aylık') || title.includes('1 month')) {
        setPrice(card,CONFIG.pricing.oneMonth,t('4 buluşma','4 meetups'));
      }
    });
  }

  function apply(source='local') {
    const e = CONFIG.inPerson;

    const heroStrip = markManaged(q('.hero-join-strip'));
    if (heroStrip) {
      heroStrip.innerHTML = isEnglish
        ? '<span class="hero-join-free">'+e.monthEn+' '+e.day+' · REGISTRATION OPEN</span><span class="hero-join-info"><strong>'+e.weekdayEn.charAt(0)+e.weekdayEn.slice(1).toLowerCase()+' · '+e.time+'</strong><i></i>'+e.venue+'</span>'
        : '<span class="hero-join-free">'+e.day+' '+e.monthTr+' · KAYITLAR AÇIK</span><span class="hero-join-info"><strong>'+e.weekdayTr.charAt(0)+e.weekdayTr.slice(1).toLocaleLowerCase('tr-TR')+' · '+e.time+'</strong><i></i>'+e.venue+'</span>';
    }

    const heroJoin = markManaged(q('.hero-actions .join-primary'));
    if (heroJoin) {
      heroJoin.innerHTML = isEnglish ? 'Join the '+e.monthEn+' '+e.day+' meetup <span>→</span>' : e.day+' '+e.monthTr.charAt(0)+e.monthTr.slice(1).toLocaleLowerCase('tr-TR')+' buluşmasına katıl <span>→</span>';
      applyJoinMode(heroJoin,'in_person');
    }

    const heroProof = markManaged(q('.hero-proof p'));
    if (heroProof) {
      heroProof.innerHTML = isEnglish
        ? '<strong>First meetup is free · Open to A2–B2+ levels</strong><br>'+e.monthEn+' '+e.day+' registration is open · '+(e.capacity==='limited'?'limited capacity':'registration open')+' · come on your own'
        : '<strong>İlk buluşma ücretsiz · A2–B2+ seviyelerine açık</strong><br>'+e.day+' '+e.monthTr.charAt(0)+e.monthTr.slice(1).toLocaleLowerCase('tr-TR')+' kayıtları açık · '+(e.capacity==='limited'?'kontenjan sınırlı':'kayıt açık')+' · tek başına gelebilirsin';
    }

    const scrollCue = markManaged(q('.scroll-cue span'));
    if (scrollCue) {
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
      if(heading) heading.textContent=isEnglish
        ? 'Save your seat for this '+titleCaseEn(e.weekdayEn)+'.'
        : 'Bu '+titleCaseTr(e.weekdayTr)+' masadaki yerini ayırt.';
      const kicker=markManaged(next.querySelector('.next-event-kicker'));
      if(kicker) kicker.textContent=isEnglish
        ? (e.capacity==='limited'?'REGISTRATION OPEN · LIMITED CAPACITY':'REGISTRATION OPEN')
        : (e.capacity==='limited'?'KAYITLAR AÇIK · KONTENJAN SINIRLI':'KAYITLAR AÇIK');
      const details=markManaged(next.querySelector('.next-event-details'));
      if(details) details.innerHTML=(isEnglish
        ? '<span>🕖 <strong>'+e.time+'</strong></span><span>📍 <strong>'+e.venue+'</strong></span><span>💬 <strong>Speaking · games · new people</strong></span>'
        : '<span>🕖 <strong>'+e.time+'</strong></span><span>📍 <strong>'+e.venue+'</strong></span><span>💬 <strong>Speaking · oyunlar · yeni insanlar</strong></span>');
      const urgency=markManaged(next.querySelector('.next-event-urgency'));
      if(urgency) urgency.textContent=isEnglish?'Save your seat for '+e.monthEn+' '+e.day:e.day+' '+e.monthTr.charAt(0)+e.monthTr.slice(1).toLocaleLowerCase('tr-TR')+' için yerini ayırt';
      applyJoinMode(next.querySelector('.next-event-join'),'in_person');
      const map=markManagedHref(next.querySelector('.next-event-location'));if(map)map.href=CONFIG.mapUrl;
    }

    const galleryDate=markManaged(q('.gallery-join-cta small'));
    if(galleryDate)galleryDate.textContent=isEnglish?'NEXT MEETUP · '+e.weekdayEn+', '+e.monthEn+' '+e.day+' · '+e.time:'SIRADAKİ BULUŞMA · '+e.day+' '+e.monthTr+' '+e.weekdayTr+' · '+e.time;
    applyJoinMode(q('.gallery-join-cta a'),'in_person');

    const feedbackDate=markManaged(q('.feedback-intro-cta span'));if(feedbackDate)feedbackDate.textContent=dateLabel(true);
    applyJoinMode(q('.feedback-intro-cta a'),'in_person');

    qa('.online-meetup-cta, .online-plan .meetup-price-cta').forEach(link=>applyJoinMode(link,'online'));
    qa('.meetup-price-card:not(.online-plan) .meetup-price-cta').forEach(link=>{if(link.href.includes('forms.gle'))applyJoinMode(link,'in_person')});
    qa('.final-actions a').forEach(link=>applyJoinMode(link,/online/i.test(link.textContent)?'online':'in_person'));
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
        startDate:e.start,endDate:e.end,eventStatus:'https://schema.org/EventScheduled',eventAttendanceMode:'https://schema.org/OfflineEventAttendanceMode',
        location:{'@type':'Place',name:e.venue,address:{'@type':'PostalAddress',addressLocality:'Ankara',addressCountry:'TR'}},
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
      if(!error&&data?.published_data){CONFIG=mergeDeep(JSON.parse(JSON.stringify(DEFAULT)),data.published_data);window.ESC_EVENT_CONFIG=CONFIG;apply('remote')}
    }catch(_){}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{apply('default');loadRemote()},{once:true});
  else{apply('default');loadRemote()}
})();