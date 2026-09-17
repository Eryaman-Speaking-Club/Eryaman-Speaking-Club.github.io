(() => {
  'use strict';

  const nav = document.querySelector('.site-nav');
  const menu = document.querySelector('.menu-btn');
  const links = document.querySelector('.nav-links');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Keep the base landing-page files stable and load the final polish as a small layer. */
  if (!document.querySelector('link[data-home-polish]')) {
    const polish = document.createElement('link');
    polish.rel = 'stylesheet';
    polish.href = './home-polish.css?v=20260917-0951';
    polish.dataset.homePolish = 'true';
    document.head.appendChild(polish);
  }

  if (!document.querySelector('link[data-next-event]')) {
    const nextEventStyle = document.createElement('link');
    nextEventStyle.rel = 'stylesheet';
    nextEventStyle.href = './next-event.css?v=20260917-2';
    nextEventStyle.dataset.nextEvent = 'true';
    document.head.appendChild(nextEventStyle);
  }

  const upgradePrinciples = () => {
    const cards = [...document.querySelectorAll('.principle')];
    const setups = [
      {
        key: 'talk',
        tag: 'Konuşma pratiği',
        art: '<div class="principle-art" aria-hidden="true"><span class="talk-bubble one">How was your week?</span><span class="talk-bubble two">Much better now 😄</span><span class="talk-mic">🎙️</span></div>'
      },
      {
        key: 'community',
        tag: 'Topluluk',
        art: '<div class="principle-art" aria-hidden="true"><div class="people-row"><span>A</span><span>Y</span><span>İ</span><span>+</span></div><span class="community-chip">Yeni masa · yeni insanlar</span></div>'
      },
      {
        key: 'growth',
        tag: 'Kişisel gelişim',
        art: '<div class="principle-art" aria-hidden="true"><div class="growth-bars"><span></span><span></span><span></span><span></span></div><span class="growth-arrow">↗</span></div>'
      }
    ];

    cards.forEach((card, index) => {
      const setup = setups[index];
      if (!setup || card.dataset.upgraded === 'true') return;
      card.dataset.upgraded = 'true';
      card.classList.add(`principle-${setup.key}`);
      const icon = card.querySelector('.principle-icon');
      if (icon) icon.insertAdjacentHTML('afterend', setup.art);
      const tag = document.createElement('span');
      tag.className = 'principle-tag';
      tag.textContent = setup.tag;
      card.appendChild(tag);
    });
  };

  /* Homepage must always contain only the three featured games.
     Remove any extra cards immediately, including cards inserted later by stale/legacy scripts. */
  const trimHomepageGames = () => {
    const showcase = document.querySelector('.game-showcase');
    if (!showcase) return;
    [...showcase.querySelectorAll('.feature-game')].slice(3).forEach((card) => card.remove());
  };

  /* Keep participation pricing near the bottom of the page and remove the old duplicate payment summary. */
  const moveParticipationToBottom = () => {
    const main = document.querySelector('main');
    const pricing = document.getElementById('katilim');
    const payment = document.getElementById('odeme');
    if (payment) payment.remove();
    if (main && pricing) {
      const label = pricing.querySelector('.section-label');
      if (label) label.textContent = '08 · Katılım seçenekleri';
      main.appendChild(pricing);
    }
  };

  /* The homepage always opens the dedicated private-lessons application page.
     No teacher phone or WhatsApp contact is exposed from the homepage. */
  const restorePrivateLessonsPageLinks = () => {
    const privateLessonsHref = './ozel-dersler/';
    const shouldRouteToLessons = (link) => {
      const text = (link.textContent || '').toLocaleLowerCase('tr-TR');
      return text.includes('özel dersler') ||
        text.includes('özel dersleri incele') ||
        (link.closest('.tutor-cta') && text.includes('ingilizce'));
    };

    document.querySelectorAll('a').forEach((link) => {
      if (!shouldRouteToLessons(link)) return;
      link.href = privateLessonsHref;
      link.removeAttribute('target');
      link.removeAttribute('rel');
    });

    const tutorCard = document.querySelector('.tutor-cta a');
    const tutorTitle = tutorCard?.querySelector('strong');
    if (tutorTitle) tutorTitle.textContent = 'Birebir İngilizce özel dersleri inceleyin.';

    document.querySelectorAll('.final-actions a').forEach((link) => {
      if (link.textContent.includes('Online özel ders')) link.textContent = 'Online özel dersleri incele →';
    });

    document.querySelectorAll('.faq-list a').forEach((link) => {
      if (link.href.includes('/ozel-dersler/')) link.textContent = 'özel dersler sayfasından detayları inceleyebilirsin';
    });

    /* Capture clicks as a second safety layer so private-lesson CTAs always open the application page. */
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link || !shouldRouteToLessons(link)) return;
      event.preventDefault();
      window.location.assign(privateLessonsHref);
    }, true);
  };

  const mountNextEvent = () => {
    const events = document.getElementById('events');
    if (!events || document.querySelector('.next-event-card')) return;

    const card = document.createElement('section');
    card.className = 'next-event-card reveal';
    card.setAttribute('aria-label', 'Bir sonraki Eryaman Speaking Club buluşması');
    card.innerHTML = `
      <div class="next-event-copy">
        <span class="next-event-kicker">Bir sonraki buluşma</span>
        <h2>Bu Pazar Eryaman’da buluşuyoruz.</h2>
        <div class="next-event-details">
          <span>📅 <strong>20 Eylül Pazar</strong></span>
          <span>🕖 <strong>19:00</strong></span>
          <span>📍 <strong>Eryaman 1-2 Coffee Lab</strong></span>
        </div>
        <p>Kahve, sohbet ve İngilizce pratiği. Orada görüşmek üzere.</p>
      </div>
      <a class="next-event-map" href="https://maps.app.goo.gl/7y8SdsCRGYzuSXnr6" target="_blank" rel="noreferrer">Konumu aç <span>↗</span></a>
    `;
    events.insertAdjacentElement('beforebegin', card);
  };

  const initConversationGame = () => {
    const stage = document.querySelector('.conversation-stage');
    const cards = [...document.querySelectorAll('.conversation-stage .speech-card')];
    const center = document.querySelector('.conversation-stage .center-badge');
    if (!stage || cards.length < 2) return;

    const prompts = [
      ['What would you do if you could live anywhere?', 'Pick a place and tell us why. 🌍'],
      ['Coffee or tea for the rest of your life?', 'Choose your side. No fence-sitting. ☕'],
      ['What is your most useless talent?', 'This is a safe space. Probably. 😄'],
      ['Would you rather travel alone or with friends?', 'Defend your choice. ✈️'],
      ['What song do you never skip?', 'Bonus point: sing one line. 🎵'],
      ['What is a tiny thing that makes your day better?', 'Small answers count. ✨'],
      ['If you had one extra hour every day...', 'How would you spend it? ⏰'],
      ['What food could you eat every week?', 'Be specific. We may judge. 🍕'],
      ['What is something you want to learn?', 'Why have you not started yet? 👀'],
      ['Mountains or beach?', 'You have 10 seconds to convince us. 🏔️'],
      ['What app do you use too much?', 'Screen-time confession time. 📱'],
      ['What makes someone easy to talk to?', 'Give us one real example. 💬'],
      ['What is your ideal lazy Sunday?', 'Paint the whole picture. 🛋️'],
      ['If you could restart one day...', 'Which day would you choose? ↩️'],
      ['What is one unpopular opinion you have?', 'Keep it friendly. Keep it interesting. 🌶️'],
      ['What was the last thing that made you laugh?', 'Tell the story, not just the answer. 😂'],
      ['Would you rather be early or exactly on time?', 'Late is not an option. ⌚'],
      ['What is one thing tourists should do in Ankara?', 'Sell us the plan. 📍'],
      ['What is harder: starting or staying consistent?', 'Pick one and explain. 🎯'],
      ['If your week had a title...', 'What would this week be called? 🎬']
    ];

    if (!document.querySelector('style[data-conversation-game]')) {
      const style = document.createElement('style');
      style.dataset.conversationGame = 'true';
      style.textContent = `
        .conversation-stage .speech-card{cursor:pointer;user-select:none;outline:none;transition:transform .2s ease,box-shadow .2s ease,opacity .16s ease;}
        .conversation-stage .speech-card:hover{transform:translateY(-4px) rotate(0deg)!important;box-shadow:0 22px 45px rgba(8,31,59,.18);}
        .conversation-stage .speech-card:focus-visible{box-shadow:0 0 0 4px rgba(24,178,173,.28),0 22px 45px rgba(8,31,59,.18);}
        .conversation-stage .speech-card.conversation-pop{animation:conversationPop .28s ease;}
        .conversation-stage .center-badge{cursor:pointer;transition:transform .2s ease,box-shadow .2s ease;}
        .conversation-stage .center-badge:hover{transform:scale(1.025);box-shadow:0 24px 55px rgba(8,31,59,.18);}
        .conversation-game-hint{position:absolute;left:50%;bottom:4%;z-index:8;transform:translateX(-50%);padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.94);border:1px solid rgba(8,31,59,.1);box-shadow:0 10px 25px rgba(8,31,59,.1);color:#52687d;font-size:10px;font-weight:950;letter-spacing:.04em;white-space:nowrap;pointer-events:none;}
        @keyframes conversationPop{0%{opacity:.45;transform:scale(.96)}70%{transform:scale(1.025)}100%{opacity:1}}
        @media(max-width:700px){.conversation-game-hint{bottom:1.5%;font-size:9px;padding:7px 10px}}
        @media(prefers-reduced-motion:reduce){.conversation-stage .speech-card,.conversation-stage .center-badge{transition:none}.conversation-stage .speech-card.conversation-pop{animation:none}}
      `;
      document.head.appendChild(style);
    }

    const hint = document.createElement('div');
    hint.className = 'conversation-game-hint';
    hint.textContent = '💬 Kartlara tıkla · yeni sohbet gelsin';
    stage.appendChild(hint);

    let lastIndexes = [-1, -1];
    const nextIndex = (slot) => {
      let index = Math.floor(Math.random() * prompts.length);
      let guard = 0;
      while ((index === lastIndexes[slot] || index === lastIndexes[1 - slot]) && guard < 20) {
        index = Math.floor(Math.random() * prompts.length);
        guard += 1;
      }
      lastIndexes[slot] = index;
      return index;
    };

    const renderCard = (card, slot) => {
      const prompt = prompts[nextIndex(slot)];
      const small = card.querySelector('span');
      const strong = card.querySelector('b');
      if (!small || !strong) return;
      small.textContent = prompt[0];
      strong.textContent = prompt[1];
      card.classList.remove('conversation-pop');
      void card.offsetWidth;
      card.classList.add('conversation-pop');
    };

    cards.forEach((card, slot) => {
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', 'Yeni sohbet kartı getir');
      card.title = 'Yeni sohbet kartı için tıkla';
      card.addEventListener('click', () => renderCard(card, slot));
      card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        renderCard(card, slot);
      });
    });

    if (center) {
      center.setAttribute('role', 'button');
      center.setAttribute('tabindex', '0');
      center.setAttribute('aria-label', 'İki sohbet kartını da yenile');
      center.title = 'İki kartı da yenile';
      const shuffleAll = () => cards.forEach((card, slot) => renderCard(card, slot));
      center.addEventListener('click', shuffleAll);
      center.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        shuffleAll();
      });
    }
  };

  upgradePrinciples();
  trimHomepageGames();
  moveParticipationToBottom();
  restorePrivateLessonsPageLinks();
  mountNextEvent();
  initConversationGame();

  const gameShowcase = document.querySelector('.game-showcase');
  if (gameShowcase && 'MutationObserver' in window) {
    const gamesObserver = new MutationObserver(trimHomepageGames);
    gamesObserver.observe(gameShowcase, { childList: true });
  }

  const syncNav = () => nav && nav.classList.toggle('scrolled', window.scrollY > 24);
  syncNav();
  window.addEventListener('scroll', syncNav, { passive: true });

  if (menu && links) {
    menu.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.textContent = open ? '×' : '☰';
    });
    links.addEventListener('click', (event) => {
      if (!event.target.closest('a')) return;
      links.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
      menu.textContent = '☰';
    });
  }

  const filmstrip = document.querySelector('.filmstrip');
  if (filmstrip) {
    const controls = document.createElement('div');
    controls.className = 'gallery-controls';
    controls.setAttribute('aria-label', 'Galeri kontrolleri');
    controls.innerHTML = '<button class="gallery-control" type="button" data-gallery-prev aria-label="Önceki fotoğraf">←</button><button class="gallery-control" type="button" data-gallery-next aria-label="Sonraki fotoğraf">→</button>';
    filmstrip.insertAdjacentElement('afterend', controls);
  }
  const galleryPrev = document.querySelector('[data-gallery-prev]');
  const galleryNext = document.querySelector('[data-gallery-next]');
  const scrollGallery = (direction) => {
    if (!filmstrip) return;
    const card = filmstrip.querySelector('.film-shot');
    const gap = Number.parseFloat(getComputedStyle(filmstrip).gap) || 16;
    const step = card ? card.getBoundingClientRect().width + gap : Math.min(window.innerWidth * 0.86, 500);
    filmstrip.scrollBy({ left: direction * step, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  galleryPrev?.addEventListener('click', () => scrollGallery(-1));
  galleryNext?.addEventListener('click', () => scrollGallery(1));

  document.querySelectorAll('.reveal').forEach((element) => {
    element.style.setProperty('--delay', `${Number(element.dataset.delay || 0)}ms`);
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px' });
    document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
  }

  const rotating = document.querySelector('.rotating-word');
  const words = ['Rahatça.', 'Özgüvenle.', 'Birlikte.', 'Gerçekten.'];
  let wordIndex = 0;
  if (rotating && !reduceMotion) {
    window.setInterval(() => {
      rotating.classList.add('out');
      window.setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length;
        rotating.textContent = words[wordIndex];
        rotating.classList.remove('out');
      }, 250);
    }, 2500);
  }

  if ('IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const target = Number(element.dataset.count);
        if (reduceMotion) {
          element.textContent = String(target);
          observer.unobserve(element);
          return;
        }
        const duration = 900;
        const started = performance.now();
        const update = (now) => {
          const progress = Math.min(1, (now - started) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          element.textContent = Math.round(target * eased);
          if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
        observer.unobserve(element);
      });
    }, { threshold: 0.7 });
    document.querySelectorAll('[data-count]').forEach((element) => countObserver.observe(element));
  } else {
    document.querySelectorAll('[data-count]').forEach((element) => { element.textContent = element.dataset.count; });
  }

  document.querySelectorAll('.faq-list details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      document.querySelectorAll('.faq-list details').forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });
})();