(() => {
  'use strict';

  const nav = document.querySelector('.site-nav');
  const menu = document.querySelector('.menu-btn');
  const links = document.querySelector('.nav-links');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const syncNav = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  syncNav();
  window.addEventListener('scroll', syncNav, { passive: true });

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

  document.querySelectorAll('.reveal').forEach((element) => {
    element.style.setProperty('--delay', `${Number(element.dataset.delay || 0)}ms`);
  });

  if (reduceMotion) {
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
  const words = ['Naturally.', 'Confidently.', 'Together.', 'For real.'];
  let wordIndex = 0;
  if (!reduceMotion) {
    window.setInterval(() => {
      rotating.classList.add('out');
      window.setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length;
        rotating.textContent = words[wordIndex];
        rotating.classList.remove('out');
      }, 250);
    }, 2500);
  }

  const countObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.count);
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

  document.querySelectorAll('.faq-list details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      document.querySelectorAll('.faq-list details').forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });
})();
