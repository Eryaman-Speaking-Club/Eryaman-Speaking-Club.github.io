(() => {
  'use strict';

  const nav = document.querySelector('.site-nav');
  const menu = document.querySelector('.menu-btn');
  const links = document.querySelector('.nav-links');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const gallery = document.querySelector('.event-gallery');
  if (gallery) {
    gallery.innerHTML = `
      <div class="gallery-head reveal">
        <div>
          <div class="section-label">04 · Kulüpten anlar</div>
          <h2>Tek bir kare değil.<br>Bütün atmosfer.</h2>
        </div>
        <p>Burada etkinlikleri numaralandırmak yerine kulübün gerçek havasını gösteriyoruz: aynı masada tanışan insanlar, kahve araları, oyunlar, kahkahalar ve İngilizceye karışan doğal sohbetler.</p>
      </div>

      <div class="media-collages" aria-label="Eryaman Speaking Club fotoğraf kolajları">
        <article class="media-collage reveal">
          <div class="collage-grid collage-grid-three">
            <img class="collage-main" src="https://drive.google.com/thumbnail?id=1wzEkgDHWnVKasYCC1m6PFXlwJaes0k-h&sz=w1800" alt="Eryaman Speaking Club grup buluşması" loading="lazy">
            <img src="https://drive.google.com/thumbnail?id=1l9MuCJZ-iAxtfZrM1jMsmK1VcIBpWYDz&sz=w1200" alt="Speaking Club sohbet anı" loading="lazy">
            <img src="https://drive.google.com/thumbnail?id=1cX6C0JdIvgCiGsgchPovlDp1UpyiKAbA&sz=w1200" alt="Speaking Club masa sohbeti" loading="lazy">
          </div>
          <div class="collage-copy"><span>MASA ETRAFINDA</span><h3>Bir kahveyle başlayıp sohbete dönüşen akşamlar.</h3><p>Yeni yüzler, farklı hikâyeler ve konuşmayı kolaylaştıran rahat bir ortam.</p></div>
        </article>

        <article class="media-collage reveal" data-delay="70">
          <div class="collage-grid collage-grid-three reverse">
            <img class="collage-main" src="https://drive.google.com/thumbnail?id=1-7mdgbKTqsTMB-14VIG_0VyKFOeFEpNm&sz=w1800" alt="Eryaman Speaking Club grup enerjisi" loading="lazy">
            <img src="https://drive.google.com/thumbnail?id=1aDlqfs-x-Xc03nbt1rSXN3WUe6z3h7-4&sz=w1200" alt="Speaking Club etkinlik anı" loading="lazy">
            <img src="https://drive.google.com/thumbnail?id=1qurSz7SvxcAtk4gRN6eEt8--Ax0tl_Zi&sz=w1200" alt="Speaking Club oyun ve sohbet anı" loading="lazy">
          </div>
          <div class="collage-copy"><span>OYUN + SOHBET</span><h3>Konuşacak konu aramak yerine oyunun içine giriyoruz.</h3><p>Soru kartları, mini oyunlar ve küçük grup değişimleri sayesinde sohbet kendi kendine akıyor.</p></div>
        </article>

        <article class="media-collage reveal" data-delay="140">
          <div class="collage-grid collage-grid-two">
            <img src="https://drive.google.com/thumbnail?id=1MkefhGA_TFQ5wO1tNK_CPOO6p-gJ-9jS&sz=w1600" alt="Eryaman Speaking Club birlikte konuşma anı" loading="lazy">
            <img src="https://drive.google.com/thumbnail?id=1r1DM8SIcLLkNrEUYkXQZur2YDYVmejR8&sz=w1600" alt="Eryaman Speaking Club speaking night" loading="lazy">
          </div>
          <div class="collage-copy"><span>GERÇEK TOPLULUK</span><h3>Aynı ortam, farklı insanlar, her seferinde başka bir sohbet.</h3><p>Amacımız tek bir güzel fotoğraf değil; insanların gerçekten dahil olduğu bir topluluk hissi.</p></div>
        </article>
      </div>

      <div class="video-heading reveal">
        <div><span class="video-kicker">HAREKETLİ ANLAR</span><h3>Biraz da ortamın sesini aç.</h3></div>
        <a class="archive-link" href="https://drive.google.com/drive/folders/1b1eps-NOZy5kayocZXjcIIMHHhRM_kCU" target="_blank" rel="noreferrer">Fotoğraf & video arşivi ↗</a>
      </div>
      <div class="event-videos event-videos-three">
        <article class="event-video reveal">
          <iframe src="https://drive.google.com/file/d/1gtPOxNJvVnie-IHy1d81VKG_sFhxPdAk/preview" title="Speaking Club sohbet videosu" allow="autoplay" loading="lazy"></iframe>
          <div><b>Sohbetin içinden</b><span>Kameraya poz değil, masanın gerçek hali.</span></div>
        </article>
        <article class="event-video reveal" data-delay="70">
          <iframe src="https://drive.google.com/file/d/1NyS-p_8zBkzLicaZAKE0sud65ywsHX-I/preview" title="Speaking Club etkinlik videosu" allow="autoplay" loading="lazy"></iframe>
          <div><b>Bir masada başlayan enerji</b><span>İngilizce, kahve ve kendiliğinden gelişen sohbet.</span></div>
        </article>
        <article class="event-video reveal" data-delay="140">
          <iframe src="https://drive.google.com/file/d/1CQR1MK4EdeGcxqCRBGrkQWZ0O3w9ngnH/preview" title="Eryaman Speaking Club kısa video" allow="autoplay" loading="lazy"></iframe>
          <div><b>Kulüpten kısa bir an</b><span>Oyun, konuşma ve grubun doğal temposu.</span></div>
        </article>
      </div>
    `;
  }

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
