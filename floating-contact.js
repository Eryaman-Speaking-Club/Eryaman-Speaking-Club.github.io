(() => {
  'use strict';

  if (document.querySelector('[data-esc-contact-fab]')) return;

  const CONTACT_EMAIL = 'eryamanspeakingclub@gmail.com';
  const JOIN_FORM = 'https://forms.gle/qjYk7dYtV8Vhpud29';
  const INSTAGRAM = 'https://www.instagram.com/eryamanspeakingclub/';
  const MAP = 'https://maps.app.goo.gl/7y8SdsCRGYzuSXnr6';

  const style = document.createElement('style');
  style.dataset.escFloatingContact = 'true';
  style.textContent = `
    .esc-scroll-progress{position:fixed;left:0;top:0;z-index:110;width:100%;height:3px;transform:scaleX(0);transform-origin:left center;background:linear-gradient(90deg,#175ca8,#16a6a2,#f2a329,#f05f69);box-shadow:0 0 18px rgba(23,92,168,.18);pointer-events:none}

    .hero-join-strip{display:flex;align-items:center;gap:12px;width:fit-content;max-width:100%;margin:14px 0 -2px;padding:10px 13px 10px 10px;border:1px solid rgba(11,47,91,.09);border-radius:18px;background:rgba(255,255,255,.9);box-shadow:0 12px 34px rgba(8,31,59,.09);backdrop-filter:blur(10px)}
    .hero-join-free{display:inline-flex;align-items:center;gap:7px;padding:8px 10px;border-radius:12px;background:#e9fbf5;color:#087563;font-size:9px;font-weight:1000;letter-spacing:.08em;white-space:nowrap}
    .hero-join-free::before{content:"";width:7px;height:7px;border-radius:50%;background:#16a6a2;box-shadow:0 0 0 5px rgba(22,166,162,.11)}
    .hero-join-info{display:flex;align-items:center;gap:10px;color:#52687d;font-size:10px;font-weight:900;line-height:1.2;white-space:nowrap}
    .hero-join-info strong{color:#081f3b}
    .hero-join-info i{width:4px;height:4px;border-radius:50%;background:#f2a329;flex:0 0 auto}
    .hero-games-link{display:inline-flex;margin:11px 0 0 3px;color:#72869a;font-size:10px;font-weight:900;text-decoration:none;letter-spacing:.02em}
    .hero-games-link:hover{color:#175ca8}
    .hero-actions .join-primary{background:linear-gradient(135deg,#f05f69,#d94e59);color:#fff;box-shadow:0 16px 35px rgba(240,95,105,.23)}
    .hero-actions .join-primary span{color:#fff}
    .hero-actions .join-instagram{background:#fff;color:#081f3b;border:1px solid #dce5ed}

    .next-event-card.esc-priority-event{margin:34px auto 20px}
    .next-event-card.esc-priority-event .next-event-kicker{color:#087563}
    .next-event-card.esc-priority-event .next-event-kicker::before{background:#16a6a2;box-shadow:0 0 0 6px rgba(22,166,162,.11)}
    .next-event-free{display:inline-flex;margin:0 0 9px;padding:6px 9px;border-radius:999px;background:#e9fbf5;color:#087563;font-size:9px;font-weight:1000;letter-spacing:.08em}
    .next-event-actions{display:grid;gap:8px;min-width:205px}
    .next-event-actions a{min-height:52px;padding:0 18px;display:flex;align-items:center;justify-content:center;gap:8px;border-radius:15px;text-decoration:none;font-size:11px;font-weight:1000;transition:transform .18s ease,box-shadow .18s ease}
    .next-event-actions a:hover{transform:translateY(-2px)}
    .next-event-join{background:linear-gradient(135deg,#f05f69,#d94e59);color:#fff;box-shadow:0 12px 28px rgba(240,95,105,.22)}
    .next-event-instagram{background:#fff;color:#081f3b;border:1px solid #dce5ed}
    .next-event-location{background:transparent!important;color:#6d8092!important;border:0!important;min-height:34px!important;box-shadow:none!important;font-size:10px!important}

    .feedback-card.esc-feedback-hidden{display:none!important}

    .esc-contact-fab{position:fixed;right:22px;bottom:22px;z-index:120;min-height:54px;padding:0 18px;border:0;border-radius:999px;background:linear-gradient(135deg,#081f3b,#175ca8);color:#fff;display:inline-flex;align-items:center;gap:10px;font:inherit;font-size:12px;font-weight:950;letter-spacing:.01em;box-shadow:0 18px 42px rgba(8,31,59,.26);cursor:pointer;transition:transform .2s ease,box-shadow .2s ease}
    .esc-contact-fab:hover{transform:translateY(-3px);box-shadow:0 24px 52px rgba(8,31,59,.32)}
    .esc-contact-fab-icon{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.13);font-size:15px}

    .esc-contact-overlay{position:fixed;inset:0;z-index:140;display:none;place-items:center;padding:20px;background:rgba(5,22,43,.48);backdrop-filter:blur(8px)}
    .esc-contact-overlay.open{display:grid}
    .esc-contact-panel{width:min(540px,96vw);max-height:min(88vh,780px);overflow:auto;border:1px solid rgba(8,31,59,.09);border-radius:28px;background:#fff;padding:23px;box-shadow:0 35px 100px rgba(5,22,43,.28)}
    .esc-contact-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:18px}
    .esc-contact-kicker{display:block;margin-bottom:6px;color:#175ca8;font-size:9px;font-weight:1000;letter-spacing:.12em;text-transform:uppercase}
    .esc-contact-head h2{margin:0;color:#081f3b;font-size:clamp(26px,5vw,36px);line-height:1;letter-spacing:-.045em}
    .esc-contact-head p{margin:8px 0 0;color:#718397;font-size:12px;line-height:1.55}
    .esc-contact-close{width:42px;height:42px;flex:0 0 42px;border:1px solid #dce5ed;border-radius:14px;background:#fff;color:#081f3b;font-size:24px;cursor:pointer}
    .esc-contact-form{display:grid;gap:12px}
    .esc-contact-form label{display:grid;gap:6px;color:#51687e;font-size:10px;font-weight:950}
    .esc-contact-form input,.esc-contact-form textarea{width:100%;border:1px solid #d8e2eb;border-radius:15px;background:#f9fbfd;color:#16324f;padding:12px 13px;font:inherit;font-size:13px;outline:none;transition:border-color .18s ease,box-shadow .18s ease,background .18s ease}
    .esc-contact-form input:focus,.esc-contact-form textarea:focus{border-color:#8eb3d8;background:#fff;box-shadow:0 0 0 4px rgba(23,92,168,.08)}
    .esc-contact-form textarea{min-height:145px;resize:vertical}
    .esc-contact-submit{min-height:50px;margin-top:2px;border:0;border-radius:15px;background:linear-gradient(135deg,#081f3b,#175ca8);color:#fff;font:inherit;font-size:12px;font-weight:950;cursor:pointer;box-shadow:0 13px 28px rgba(8,31,59,.18)}
    .esc-contact-note{margin:1px 2px 0;color:#8a99a8;font-size:10px;line-height:1.45;text-align:center}
    .esc-contact-toast{position:fixed;left:50%;bottom:90px;z-index:150;transform:translate(-50%,14px);opacity:0;pointer-events:none;padding:10px 13px;border-radius:13px;background:#081f3b;color:#fff;font-size:11px;font-weight:900;transition:.2s ease;box-shadow:0 15px 35px rgba(8,31,59,.22)}
    .esc-contact-toast.show{opacity:1;transform:translate(-50%,0)}

    @media(max-width:700px){
      .hero-join-strip{width:100%;display:grid;grid-template-columns:auto 1fr;gap:8px 10px;margin-top:12px;padding:9px}
      .hero-join-info{white-space:normal;gap:7px;font-size:9px}
      .hero-join-info i{display:none}
      .hero-actions{margin-top:22px!important}
      .hero-actions .button{flex:1 1 100%;width:100%}
      .next-event-card.esc-priority-event{margin:22px auto 12px}
      .next-event-actions{min-width:0;width:100%}
      .esc-contact-fab{right:14px;bottom:14px;width:54px;height:54px;min-height:54px;padding:0;justify-content:center}
      .esc-contact-fab-icon{width:auto;height:auto;background:transparent;font-size:20px}
      .esc-contact-fab-text{display:none}
      .esc-contact-panel{padding:18px;border-radius:23px}
    }
    @media(prefers-reduced-motion:reduce){
      .esc-contact-fab,.esc-contact-toast{transition:none}
    }
  `;
  document.head.appendChild(style);

  const progress = document.createElement('div');
  progress.className = 'esc-scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  const enhanceHomepageConversion = () => {
    const heroCopy = document.querySelector('.hero-copy');
    const eyebrow = heroCopy?.querySelector('.eyebrow');
    const heroActions = heroCopy?.querySelector('.hero-actions');

    if (heroCopy && eyebrow && !heroCopy.querySelector('.hero-join-strip')) {
      const joinStrip = document.createElement('div');
      joinStrip.className = 'hero-join-strip';
      joinStrip.innerHTML = `
        <span class="hero-join-free">İLK BULUŞMA ÜCRETSİZ</span>
        <span class="hero-join-info"><strong>20 Eylül Pazar · 19:00</strong><i></i>Eryaman 1-2 Coffee Lab</span>
      `;
      eyebrow.insertAdjacentElement('afterend', joinStrip);
    }

    if (heroActions) {
      heroActions.innerHTML = `
        <a class="button join-primary" href="${JOIN_FORM}" target="_blank" rel="noreferrer">Ücretsiz buluşmaya katıl <span>→</span></a>
        <a class="button join-instagram" href="${INSTAGRAM}" target="_blank" rel="noreferrer">Instagram'da gör <span>↗</span></a>
      `;
      if (!heroCopy.querySelector('.hero-games-link')) {
        heroActions.insertAdjacentHTML('afterend', '<a class="hero-games-link" href="./games/">Oyunları keşfet →</a>');
      }
    }

    const navCta = document.querySelector('.nav-cta');
    if (navCta) {
      navCta.href = JOIN_FORM;
      navCta.target = '_blank';
      navCta.rel = 'noreferrer';
      navCta.innerHTML = 'Hemen katıl <span>↗</span>';
    }

    const singleEventCta = document.querySelector('.meetup-price-card:first-child .meetup-price-cta');
    if (singleEventCta) {
      singleEventCta.href = JOIN_FORM;
      singleEventCta.target = '_blank';
      singleEventCta.rel = 'noreferrer';
      singleEventCta.textContent = 'Katılım formunu aç';
    }

    const finalActions = document.querySelector('.final-actions');
    if (finalActions) {
      finalActions.innerHTML = `
        <a class="button light-button" href="${JOIN_FORM}" target="_blank" rel="noreferrer">Ücretsiz buluşmaya katıl ↗</a>
        <a class="button outline-light" href="./games/">Game Hub'ı aç →</a>
      `;
    }

    [...document.querySelectorAll('.feedback-card')].slice(3).forEach((card) => card.classList.add('esc-feedback-hidden'));
  };

  const prioritizeNextEvent = () => {
    const card = document.querySelector('.next-event-card');
    const ticker = document.querySelector('.ticker');
    if (!card || !ticker) return false;

    card.classList.add('esc-priority-event');
    ticker.insertAdjacentElement('afterend', card);

    const copy = card.querySelector('.next-event-copy');
    if (copy && !copy.querySelector('.next-event-free')) {
      copy.insertAdjacentHTML('afterbegin', '<span class="next-event-free">İLK BULUŞMA ÜCRETSİZ</span>');
    }

    const oldMap = card.querySelector('.next-event-map');
    if (oldMap && !card.querySelector('.next-event-actions')) {
      const actions = document.createElement('div');
      actions.className = 'next-event-actions';
      actions.innerHTML = `
        <a class="next-event-join" href="${JOIN_FORM}" target="_blank" rel="noreferrer">Hemen katıl <span>↗</span></a>
        <a class="next-event-instagram" href="${INSTAGRAM}" target="_blank" rel="noreferrer">Instagram <span>↗</span></a>
        <a class="next-event-location" href="${MAP}" target="_blank" rel="noreferrer">Konumu aç →</a>
      `;
      oldMap.replaceWith(actions);
    }
    return true;
  };

  enhanceHomepageConversion();
  if (!prioritizeNextEvent()) {
    let attempts = 0;
    const eventTimer = window.setInterval(() => {
      attempts += 1;
      if (prioritizeNextEvent() || attempts >= 20) window.clearInterval(eventTimer);
    }, 100);
  }

  const fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'esc-contact-fab';
  fab.dataset.escContactFab = 'true';
  fab.setAttribute('aria-label', 'E-posta ile iletişime geç');
  fab.innerHTML = '<span class="esc-contact-fab-icon">✉</span><span class="esc-contact-fab-text">E-posta gönder</span>';
  document.body.appendChild(fab);

  const overlay = document.createElement('div');
  overlay.className = 'esc-contact-overlay';
  overlay.innerHTML = `
    <section class="esc-contact-panel" role="dialog" aria-modal="true" aria-labelledby="escContactTitle">
      <div class="esc-contact-head">
        <div>
          <span class="esc-contact-kicker">Bize yaz</span>
          <h2 id="escContactTitle">Nasıl yardımcı olabiliriz?</h2>
          <p>Bilgilerini ve mesajını yaz. Gönder dediğinde e-posta uygulaman hazır mesajla açılır.</p>
        </div>
        <button class="esc-contact-close" type="button" aria-label="Kapat">×</button>
      </div>
      <form class="esc-contact-form">
        <label>Ad Soyad
          <input name="name" type="text" autocomplete="name" required placeholder="Adın ve soyadın">
        </label>
        <label>E-posta
          <input name="email" type="email" autocomplete="email" required placeholder="ornek@email.com">
        </label>
        <label>Mesajın
          <textarea name="message" required placeholder="Bize ne hakkında yazmak istiyorsun?"></textarea>
        </label>
        <button class="esc-contact-submit" type="submit">E-postayı hazırla & gönder ↗</button>
        <div class="esc-contact-note">GitHub Pages statik çalıştığı için mesaj cihazındaki varsayılan e-posta uygulamasında gönderime hazır açılır.</div>
      </form>
    </section>
  `;
  document.body.appendChild(overlay);

  const toast = document.createElement('div');
  toast.className = 'esc-contact-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);

  const form = overlay.querySelector('.esc-contact-form');
  const closeBtn = overlay.querySelector('.esc-contact-close');
  const nameInput = form.elements.name;

  const open = () => {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => nameInput.focus(), 40);
  };

  const close = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    fab.focus();
  };

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
  };

  fab.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay.classList.contains('open')) close();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    const subject = `Eryaman Speaking Club web sitesi iletişim - ${name}`;
    const body = `Ad Soyad: ${name}\nE-posta: ${email}\n\nMesaj:\n${message}`;
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    showToast('E-posta uygulaman açılıyor…');
    window.setTimeout(() => {
      window.location.href = mailto;
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }, 120);
  });

  let ticking = false;
  const updateProgress = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = Math.max(0, Math.min(1, window.scrollY / max));
    progress.style.transform = `scaleX(${ratio})`;
    ticking = false;
  };
  const requestProgressUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateProgress);
  };

  updateProgress();
  window.addEventListener('scroll', requestProgressUpdate, { passive: true });
  window.addEventListener('resize', requestProgressUpdate, { passive: true });
})();
