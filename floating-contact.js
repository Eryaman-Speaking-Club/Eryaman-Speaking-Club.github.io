(() => {
  'use strict';

  if (document.querySelector('[data-esc-contact-fab]')) return;

  const CONTACT_EMAIL = 'eryamanspeakingclub@gmail.com';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const style = document.createElement('style');
  style.dataset.escFloatingContact = 'true';
  style.textContent = `
    .esc-scroll-progress{position:fixed;left:0;top:0;z-index:110;width:100%;height:3px;transform:scaleX(0);transform-origin:left center;background:linear-gradient(90deg,#175ca8,#16a6a2,#f2a329,#f05f69);box-shadow:0 0 18px rgba(23,92,168,.18);pointer-events:none}
    .esc-scroll-orb-layer{position:fixed;inset:0;z-index:2;pointer-events:none;overflow:hidden}
    .esc-scroll-orb{position:absolute;border-radius:50%;will-change:transform;opacity:.085;filter:blur(.3px)}
    .esc-scroll-orb.orb-a{width:150px;height:150px;left:-72px;top:18%;background:#16a6a2}
    .esc-scroll-orb.orb-b{width:92px;height:92px;right:-34px;top:34%;border:18px solid #f05f69;background:transparent}
    .esc-scroll-orb.orb-c{width:118px;height:118px;left:-54px;top:61%;border:22px solid #f2a329;background:transparent}
    .esc-scroll-orb.orb-d{width:180px;height:180px;right:-92px;top:77%;background:#175ca8;opacity:.055}
    .esc-scroll-orb.orb-e{width:58px;height:58px;right:8%;top:54%;background:#16a6a2;opacity:.06}

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
      .esc-contact-fab{right:14px;bottom:14px;width:54px;height:54px;min-height:54px;padding:0;justify-content:center}
      .esc-contact-fab-icon{width:auto;height:auto;background:transparent;font-size:20px}
      .esc-contact-fab-text{display:none}
      .esc-contact-panel{padding:18px;border-radius:23px}
      .esc-scroll-orb{opacity:.055}
      .esc-scroll-orb.orb-d,.esc-scroll-orb.orb-e{display:none}
    }
    @media(prefers-reduced-motion:reduce){
      .esc-scroll-orb{display:none}
      .esc-contact-fab,.esc-contact-toast{transition:none}
    }
  `;
  document.head.appendChild(style);

  const progress = document.createElement('div');
  progress.className = 'esc-scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  const orbLayer = document.createElement('div');
  orbLayer.className = 'esc-scroll-orb-layer';
  orbLayer.setAttribute('aria-hidden', 'true');
  orbLayer.innerHTML = `
    <span class="esc-scroll-orb orb-a" data-speed="0.055" data-spin="18"></span>
    <span class="esc-scroll-orb orb-b" data-speed="-0.045" data-spin="-22"></span>
    <span class="esc-scroll-orb orb-c" data-speed="0.035" data-spin="14"></span>
    <span class="esc-scroll-orb orb-d" data-speed="-0.028" data-spin="-10"></span>
    <span class="esc-scroll-orb orb-e" data-speed="0.07" data-spin="26"></span>
  `;
  document.body.appendChild(orbLayer);

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

  if (!reduceMotion) {
    const orbs = [...orbLayer.querySelectorAll('.esc-scroll-orb')];
    let ticking = false;
    const updateScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const y = window.scrollY;
      const ratio = Math.max(0, Math.min(1, y / max));
      progress.style.transform = `scaleX(${ratio})`;
      orbs.forEach((orb) => {
        const speed = Number(orb.dataset.speed || 0);
        const spin = Number(orb.dataset.spin || 0);
        orb.style.transform = `translate3d(0, ${y * speed}px, 0) rotate(${ratio * spin}deg)`;
      });
      ticking = false;
    };
    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateScroll);
    };
    updateScroll();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
  } else {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.transform = `scaleX(${Math.max(0, Math.min(1, window.scrollY / max))})`;
  }
})();
