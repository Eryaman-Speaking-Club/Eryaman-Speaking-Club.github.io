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

  /* Homepage intentionally shows only the three featured games already present in index.html.
     The complete 12-game library lives on /games/. */
  upgradePrinciples();

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
