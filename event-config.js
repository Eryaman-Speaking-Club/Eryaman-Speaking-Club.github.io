(() => {
  'use strict';

  const FORM_URL = 'https://forms.gle/qjYk7dYtV8Vhpud29';
  const MAP_URL = 'https://maps.app.goo.gl/7y8SdsCRGYzuSXnr6';

  const CONFIG = {
    registrationUrl: FORM_URL,
    mapUrl: MAP_URL,
    inPerson: {
      start: '2026-09-27T19:00:00+03:00',
      end: '2026-09-27T21:00:00+03:00',
      day: '27',
      monthTr: 'EYLÜL',
      monthEn: 'SEP',
      weekdayTr: 'PAZAR',
      weekdayEn: 'SUNDAY',
      time: '19:00',
      venue: 'Eryaman 1-2 Coffee Lab',
      capacity: 'limited'
    },
    online: {
      firstMeetupFree: true,
      price: 300,
      currency: 'TL',
      unitTr: 'buluşma',
      unitEn: 'meetup'
    }
  };

  window.ESC_EVENT_CONFIG = CONFIG;

  const isEnglish = document.documentElement.lang === 'en';
  const t = (tr, en) => isEnglish ? en : tr;
  const q = (selector) => document.querySelector(selector);
  const qa = (selector) => [...document.querySelectorAll(selector)];

  function labelDate() {
    return isEnglish ? 'Sep 27 · Sunday · 19:00' : '27 Eylül · Pazar · 19:00';
  }

  function applyJoinMode(link, mode) {
    if (!link) return;
    link.href = CONFIG.registrationUrl;
    link.dataset.joinMode = mode;
    link.dataset.analyticsTarget = mode === 'online' ? 'online_registration' : 'in_person_registration';
  }

  function apply() {
    const heroStrip = q('.hero-join-strip');
    if (heroStrip) {
      heroStrip.innerHTML = isEnglish
        ? '<span class="hero-join-free">SEP 27 · REGISTRATION OPEN</span><span class="hero-join-info"><strong>Sunday · 19:00</strong><i></i>Eryaman 1-2 Coffee Lab</span>'
        : '<span class="hero-join-free">27 EYLÜL · KAYITLAR AÇIK</span><span class="hero-join-info"><strong>Pazar · 19:00</strong><i></i>Eryaman 1-2 Coffee Lab</span>';
    }

    const heroJoin = q('.hero-actions .join-primary');
    if (heroJoin) {
      heroJoin.innerHTML = isEnglish ? 'Join the Sep 27 meetup <span>→</span>' : '27 Eylül buluşmasına katıl <span>→</span>';
      applyJoinMode(heroJoin, 'in_person');
    }

    const heroProof = q('.hero-proof p');
    if (heroProof) {
      heroProof.innerHTML = isEnglish
        ? '<strong>First meetup is free · Open to A2–B2+ levels</strong><br>Sep 27 registration is open · limited capacity · come on your own'
        : '<strong>İlk buluşma ücretsiz · A2–B2+ seviyelerine açık</strong><br>27 Eylül kayıtları açık · kontenjan sınırlı · tek başına gelebilirsin';
    }

    const dateCard = q('.next-event-date');
    if (dateCard) {
      dateCard.innerHTML = '<strong>27</strong><span>' + (isEnglish ? 'SEP' : 'EYLÜL') + '</span><small>' + (isEnglish ? 'SUNDAY' : 'PAZAR') + '</small>';
      dateCard.setAttribute('aria-label', isEnglish ? 'Sunday, September 27' : '27 Eylül Pazar');
    }

    const next = q('.next-event-card');
    if (next) {
      next.setAttribute('aria-label', isEnglish ? 'Eryaman Speaking Club meetup on September 27' : '27 Eylül Eryaman Speaking Club buluşması');
      const title = next.querySelector('h2');
      if (title) title.textContent = isEnglish ? 'Save your seat for this Sunday.' : 'Bu Pazar masadaki yerini ayırt.';
      const details = next.querySelector('.next-event-details');
      if (details) details.innerHTML = isEnglish
        ? '<span>🕖 <strong>19:00</strong></span><span>📍 <strong>Eryaman 1-2 Coffee Lab</strong></span><span>💬 <strong>Speaking · games · new people</strong></span>'
        : '<span>🕖 <strong>19:00</strong></span><span>📍 <strong>Eryaman 1-2 Coffee Lab</strong></span><span>💬 <strong>Speaking · oyunlar · yeni insanlar</strong></span>';
      const urgency = next.querySelector('.next-event-urgency');
      if (urgency) urgency.textContent = isEnglish ? 'Save your seat for Sep 27' : '27 Eylül için yerini ayırt';
      applyJoinMode(next.querySelector('.next-event-join'), 'in_person');
      const map = next.querySelector('.next-event-location');
      if (map) map.href = CONFIG.mapUrl;
    }

    qa('.online-meetup-cta, .online-plan .meetup-price-cta').forEach(link => applyJoinMode(link, 'online'));
    qa('.meetup-price-card:not(.online-plan) .meetup-price-cta').forEach(link => {
      if (link.href.includes('forms.gle')) applyJoinMode(link, 'in_person');
    });

    const onlinePrice = q('.online-plan .meetup-price-main');
    if (onlinePrice) onlinePrice.innerHTML = '<strong>' + CONFIG.online.price + ' TL</strong><span>/ ' + t('buluşma','meetup') + '</span>';

    const galleryDate = q('.gallery-join-cta small');
    if (galleryDate) galleryDate.textContent = isEnglish ? 'NEXT MEETUP · SUNDAY, SEP 27 · 19:00' : 'SIRADAKİ BULUŞMA · 27 EYLÜL PAZAR · 19:00';
    applyJoinMode(q('.gallery-join-cta a'), 'in_person');

    const feedbackDate = q('.feedback-intro-cta span');
    if (feedbackDate) feedbackDate.textContent = labelDate();
    applyJoinMode(q('.feedback-intro-cta a'), 'in_person');

    qa('.final-actions a').forEach(link => {
      const mode = /online/i.test(link.textContent) ? 'online' : 'in_person';
      applyJoinMode(link, mode);
    });

    const dockLinks = qa('.mobile-join-options a');
    if (dockLinks[0]) applyJoinMode(dockLinks[0], 'in_person');
    if (dockLinks[1]) applyJoinMode(dockLinks[1], 'online');

    qa('a[href*="forms.gle"]').forEach(link => {
      if (link.dataset.joinMode) return;
      const text = (link.textContent || '').toLowerCase();
      const inOnlineBlock = Boolean(link.closest('#online-meetups, .online-plan'));
      applyJoinMode(link, inOnlineBlock || text.includes('online') ? 'online' : 'in_person');
    });

    const oldSchema = document.querySelector('script[data-site-refresh-seo]');
    if (oldSchema) {
      try {
        const data = JSON.parse(oldSchema.textContent);
        if (data && Array.isArray(data['@graph'])) data['@graph'] = data['@graph'].filter(item => item['@type'] !== 'Event');
        oldSchema.textContent = JSON.stringify(data);
      } catch (_) {}
    }
    let eventSchema = document.getElementById('esc-event-schema');
    if (!eventSchema) {
      eventSchema = document.createElement('script');
      eventSchema.type = 'application/ld+json';
      eventSchema.id = 'esc-event-schema';
      document.head.appendChild(eventSchema);
    }
    eventSchema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: isEnglish ? 'Eryaman Speaking Club — September 27 Meetup' : 'Eryaman Speaking Club — 27 Eylül Buluşması',
      startDate: CONFIG.inPerson.start,
      endDate: CONFIG.inPerson.end,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: CONFIG.inPerson.venue,
        address: {'@type':'PostalAddress', addressLocality:'Ankara', addressCountry:'TR'}
      },
      organizer: {'@type':'Organization', name:'Eryaman Speaking Club', url:'https://eryamanspeakingclub.com/'},
      url: 'https://eryamanspeakingclub.com/#next-event'
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, {once:true});
  else apply();
})();