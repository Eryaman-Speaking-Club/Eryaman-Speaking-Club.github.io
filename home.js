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

  const expandGameShowcase = () => {
    const showcase = document.querySelector('.game-showcase');
    if (!showcase || showcase.dataset.expanded === 'true') return;
    showcase.dataset.expanded = 'true';

    const games = [
      {
        cls: 'game-me', href: './one-for-me-one-for-you/', kicker: 'KARŞILIKLI SOHBET', title: 'One for Me · One for You',
        text: 'Soruyu önce sen cevapla, sonra aynı soruyu karşındakine bırak. Sohbet tek taraflı kalmasın.',
        preview: '<div class="mini-game-preview chat-preview" aria-hidden="true"><div class="chat-card me"><small>ONE FOR ME</small>What is something you changed your mind about?</div><div class="chat-dots"><i></i><i></i><i></i></div><div class="chat-card you"><small>ONE FOR YOU</small>Now ask the same question back.</div></div>'
      },
      {
        cls: 'game-last', href: './last-thing-you-did/', kicker: 'HİKÂYE BAŞLATICI', title: 'Last Thing You Did',
        text: 'En son yaptığın küçük bir şeyden yola çık; kısa cevapları gerçek hikâyelere çevir.',
        preview: '<div class="mini-game-preview memory-preview" aria-hidden="true"><div class="memory-line"></div><div class="memory-row">Last thing you laughed at<small>30 seconds ago</small></div><div class="memory-row">Last message you sent<small>Today</small></div><div class="memory-row">Last thing you regretted<small>Your turn</small></div></div>'
      },
      {
        cls: 'game-whatif', href: './what-would-you-do-if/', kicker: 'SENARYO MODU', title: 'What Would You Do If...?',
        text: 'Beklenmedik bir senaryo gelir. Kararını ver, sonra neden öyle düşündüğünü anlat.',
        preview: '<div class="mini-game-preview scenario-preview" aria-hidden="true"><div class="scenario-card"><small>WHAT WOULD YOU DO IF...</small><strong>You woke up in another country with no phone?</strong><div class="scenario-actions"><span>DECIDE</span><span>EXPLAIN</span></div></div></div>'
      },
      {
        cls: 'game-likely', href: './most-likely-to/', kicker: 'GRUP OYLAMASI', title: 'Most Likely To',
        text: 'Herkes aynı anda birini seçsin. En çok oy alan kişi savunmasını yapsın.',
        preview: '<div class="mini-game-preview likely-preview" aria-hidden="true"><div class="vote-topic">Who is most likely to miss a flight?</div><div class="avatar-vote-row"><span class="vote-avatar">A<b>1</b></span><span class="vote-avatar">Y<b>4</b></span><span class="vote-avatar">İ<b>2</b></span><span class="vote-avatar">M<b>1</b></span></div></div>'
      },
      {
        cls: 'game-hot', href: './hot-seat/', kicker: '60 SANİYE', title: 'Hot Seat',
        text: 'Bir kişi merkezde. Süre akarken hızlı sorulara mümkün olduğunca seri cevap ver.',
        preview: '<div class="mini-game-preview hot-preview" aria-hidden="true"><div class="hot-timer">00:37</div><div class="hot-question">What is your most useless talent?</div><div class="hot-question">Coffee or tea?</div><div class="hot-question">What would you change tomorrow?</div></div>'
      },
      {
        cls: 'game-five', href: './five-second-challenge/', kicker: 'HIZLI & KAOTİK', title: '5 Second Challenge',
        text: 'Üç örnek söylemek için yalnızca beş saniyen var. Düşünmeye değil, konuşmaya odaklan.',
        preview: '<div class="mini-game-preview five-preview" aria-hidden="true"><div class="five-ring">5</div><div class="five-prompt">NAME 3 THINGS YOU DO BEFORE WORK</div></div>'
      },
      {
        cls: 'game-flag', href: './red-flag-green-flag/', kicker: 'FİKRİNİ SAVUN', title: 'Red Flag / Green Flag',
        text: 'Durumu kırmızı veya yeşil bayrak olarak değerlendir; grubun geri kalanını ikna etmeye çalış.',
        preview: '<div class="mini-game-preview flag-preview" aria-hidden="true"><div class="flag-side red"><span>🚩</span>RED</div><div class="flag-side green"><span>✅</span>GREEN</div><div class="flag-topic">Replies two days later — every time?</div></div>'
      },
      {
        cls: 'game-debate', href: './debate-roulette/', kicker: 'RASTGELE TARAF', title: 'Debate Roulette',
        text: 'Konu ve tarafın hazır. Kısa hazırlık süresinden sonra seçmediğin fikri bile savun.',
        preview: '<div class="mini-game-preview debate-preview" aria-hidden="true"><div class="debate-topic">Social media makes friendships stronger.</div><div class="debate-sides"><span class="active">FOR</span><span>AGAINST</span></div><div class="debate-clock">00:45</div></div>'
      },
      {
        cls: 'game-never', href: './never-have-i-ever/', kicker: 'HİKÂYE MODU', title: 'Never Have I Ever',
        text: 'I HAVE veya NEVER seç. İstersen tek kelimelik cevabı grubun duyacağı bir hikâyeye dönüştür.',
        preview: '<div class="mini-game-preview never-preview" aria-hidden="true"><div class="never-statement">Never have I ever sent a message and instantly regretted it.</div><div class="never-choice"><span>I HAVE</span><span>NEVER</span></div><div class="never-bars"><i></i><i></i></div></div>'
      }
    ];

    const delaySteps = [0, 60, 120, 0, 60, 120, 0, 60, 120];
    const html = games.map((game, index) => `
      <a class="feature-game ${game.cls} reveal" data-delay="${delaySteps[index]}" href="${game.href}">
        <div class="game-card-head"><span class="game-kicker">${game.kicker}</span><span class="game-status">● LIVE</span></div>
        ${game.preview}
        <h3>${game.title}</h3>
        <p>${game.text}</p>
        <b>Hemen oyna <span>→</span></b>
      </a>`).join('');

    showcase.insertAdjacentHTML('beforeend', html);

    const banner = document.querySelector('.all-games-banner strong');
    if (banner) banner.textContent = '12 oyun · tek Game Hub · sınırsız sohbet';
  };

  upgradePrinciples();
  expandGameShowcase();

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
