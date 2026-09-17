(() => {
  'use strict';

  if (window.__escLanguageSwitcherLoaded) return;
  window.__escLanguageSwitcherLoaded = true;

  const STORAGE_KEY = 'esc-language-v1';
  const TR_TO_EN = {
    'Hakkımızda': 'About', 'Nasıl işliyor?': 'How it works', 'Katılım': 'Join', 'Etkinlikler': 'Events', 'Özel Dersler': 'Private Lessons', 'Yorumlar': 'Reviews', 'SSS': 'FAQ', 'Oyunlar': 'Games', 'Hemen katıl': 'Join now',
    "Eryaman'da gerçek İngilizce sohbetleri": 'Real English conversations in Eryaman', 'İLK BULUŞMA ÜCRETSİZ': 'FIRST MEETUP IS FREE', '20 Eylül Pazar · 19:00': 'Sunday, September 20 · 19:00', '20 Eylül Pazar': 'Sunday, September 20',
    'İngilizce konuş.': 'Speak English.', 'Rahatça.': 'Comfortably.', 'Özgüvenle.': 'Confidently.', 'Birlikte.': 'Together.', 'Gerçekten.': 'For real.',
    'İngilizceyi sınıftan çıkarıp gerçek hayata taşıyan sosyal bir topluluk. Yeni insanlarla tanış, oyunlara katıl, kahveni al ve mükemmel olma baskısı olmadan konuşmaya başla.': 'A social community that takes English out of the classroom and into real life. Meet new people, join the games, grab your coffee and start speaking without the pressure to be perfect.',
    'Ücretsiz buluşmaya katıl': 'Join the free meetup', "Instagram'da gör": 'See us on Instagram', 'Oyunları keşfet →': 'Explore the games →', 'İlk buluşma ücretsiz · A2–B2+ seviyelerine açık': 'First meetup is free · Open to A2–B2+ levels', 'Tek başına gelebilirsin · hazırlık gerekmez': 'Come on your own · no preparation needed',
    'Güzel soru! ⚡': 'Great question! ⚡', 'Kusursuz gramer yok mu?': 'Grammar not perfect?', 'Hiç sorun değil. 💬': 'No problem at all. 💬', 'GERÇEK İNSANLAR': 'REAL PEOPLE', 'GERÇEK İNGİLİZCE': 'REAL ENGLISH', '🎯 Oyunlar': '🎯 Games', '☕ Kahve': '☕ Coffee', '✨ Özgüven': '✨ Confidence', 'Devamını keşfet': 'Keep exploring',
    'DERS YOK': 'NO LESSONS', 'KONUŞMA VAR': 'JUST SPEAKING', 'YENİ İNSANLAR': 'NEW PEOPLE', 'İYİ ENERJİ': 'GOOD ENERGY',
    'Bir sonraki buluşma': 'Next meetup', 'Bu Pazar Eryaman’da buluşuyoruz.': 'Meet us in Eryaman this Sunday.', 'Kahve, sohbet ve İngilizce pratiği. İlk kez geliyorsan ilk buluşman ücretsiz.': 'Coffee, conversation and English practice. If it is your first time, your first meetup is free.', 'Konumu aç →': 'Open location →',
    '01 · Biz kimiz?': '01 · Who are we?', 'İngilizce burada ders değil.': 'English is not a lesson here.', 'Ortamın kendisi.': 'It is the whole atmosphere.',
    "Eryaman Speaking Club'ı, İngilizceyi anlayan ama gerçek hayatta yeterince kullanamayan insanlar için kurduk. Burada gramer dersi, sınav veya zorunlu performans yok.": 'We built Eryaman Speaking Club for people who understand English but do not get enough chances to use it in real life. There are no grammar lessons, exams or forced performances here.',
    "Vizyonumuz Eryaman'da “İngilizceyi nerede konuşacağım?” sorusuna doğal bir cevap olmak: düzenli buluşan, birbirini geliştiren, yeni insanlara açık ve konuşmayı günlük hayatın parçası hâline getiren bir topluluk.": 'Our vision is to become a natural answer to “Where can I actually speak English in Eryaman?” — a community that meets regularly, helps each other improve, welcomes new people and makes speaking part of everyday life.',
    'Rahatça konuş. Dikkatle dinle. Birlikte geliş.': 'Speak freely. Listen closely. Grow together.', 'Daha çok konuş': 'Speak more', 'Mantık basit: daha az teori, daha fazla gerçek sohbet.': 'The idea is simple: less theory, more real conversation.', 'Yeni insanlarla tanış': 'Meet new people', 'Yeni masalar, yeni hikâyeler ve dahil olması kolay bir topluluk.': 'New tables, new stories and a community that is easy to join.', 'Özgüven kazan': 'Build confidence', 'Hata yapmak serbest. Kurduğun her cümle gerçek bir pratiktir.': 'Mistakes are welcome. Every sentence you build is real practice.',
    'Konuşma pratiği': 'Speaking practice', 'Topluluk': 'Community', 'Kişisel gelişim': 'Personal growth', 'Yeni masa · yeni insanlar': 'New table · new people',
    '02 · Bir buluşma nasıl geçiyor?': '02 · What happens at a meetup?', 'Akşamın ritmi.': 'The rhythm of the evening.', 'Ne olacağını bilmediğin garip bir etkinlik değil. Akış rahat ve basit.': 'It is not one of those awkward events where you have no idea what will happen. The flow is relaxed and simple.',
    'Başlangıç': 'Start', 'Gel, yerleş, tanış': 'Arrive, settle in, meet people', 'Kahveni al, masana geç ve insanlarla tanış. Tek başına gelmek tamamen normal.': 'Grab your coffee, take a seat and meet people. Coming alone is completely normal.', '+15 dk': '+15 min', 'Isınma sohbetleri': 'Warm-up conversations', 'Kolay sorularla herkes konuşmaya başlar. Kimse bir anda sahneye çıkarılmaz.': 'Easy questions get everyone talking. Nobody is suddenly put on the spot.', '+40 dk': '+40 min', 'Oyunlar ve değişen gruplar': 'Games and rotating groups', 'Taboo, soru kartları, debate ve farklı mini oyunlarla konuşma doğal biçimde devam eder.': 'Conversation keeps flowing naturally through Taboo, question cards, debates and different mini games.', 'Son bölüm': 'Final part', 'Serbest sohbet': 'Open conversation', 'Etkinlik biter ama sohbet çoğu zaman bitmez. İnsanlar kalır, tanışır ve devam eder.': 'The event ends, but the conversation often does not. People stay, connect and keep talking.', 'Bir kahve, bir sohbet, bolca İngilizce.': 'One coffee, one conversation, lots of English.', 'Önceden hazırlanman gerekmiyor. Merakını getirmen yeterli.': 'No preparation needed. Just bring your curiosity.',
    '04 · Konuşmayı başlatan oyunlar': '04 · Games that start conversations', '“Ne konuşacağız?” derdini ortadan kaldırıyoruz.': 'We take away the “What are we going to talk about?” problem.', '12 oyunun tamamı': 'All 12 games', 'TAKIM ENERJİSİ': 'TEAM ENERGY', 'Anlat, yasaklı kelimelerden kaçın, takımına buldur.': 'Describe it, avoid the forbidden words and help your team guess.', 'Hemen oyna': 'Play now', 'CESUR & EĞLENCELİ': 'BOLD & FUN', 'Sıradaki oyuncu': 'Next player', 'Çarkı çevir. Truth veya Dare seç. Gerisini grup belirlesin.': 'Spin the wheel. Choose Truth or Dare. Let the group decide the rest.', 'TARAFINI SEÇ': 'PICK A SIDE', 'İki seçenekten birini seç ve nedenini savun.': 'Choose one of two options and defend your choice.', 'Harika bir sohbet başlatmanın 12 yolu': '12 ways to start a great conversation', 'Tüm oyunları keşfet ↗': 'Explore all games ↗',
    '05 · Kulüpten anlar': '05 · Moments from the club', 'Gerçek masalar.': 'Real tables.', 'Gerçek sohbetler.': 'Real conversations.', 'Burada tek kişilik pozlar yerine masayı, oyunu ve topluluk enerjisini gösteriyoruz. Çünkü kulübün özü birlikte konuşmak.': 'Instead of solo poses, we show the table, the games and the energy of the community — because the heart of the club is talking together.',
    'Masalar değişir, sohbet devam eder': 'Tables change, the conversation continues', 'Grup sohbetleri · Eryaman': 'Group conversations · Eryaman', 'Açık havada speaking table': 'Outdoor speaking table', 'Topluluk · sohbet · kahve': 'Community · conversation · coffee', 'Bir masa, birçok hikâye': 'One table, many stories', 'Oyun biter, sohbet sürer': 'The game ends, the conversation continues', 'Gerçek pratik': 'Real practice', 'İngilizce masanın doğal dili': 'English becomes the natural language at the table', 'Etkinlik anı': 'Meetup moment',
    'ONLINE ÖZEL DERS': 'ONLINE PRIVATE LESSONS', 'Birebir İngilizce özel dersleri inceleyin.': 'Explore one-to-one online English lessons.',
    'Ortam çok rahattı, insanlar samimiydi. İlk etkinliğim olmasına rağmen kısa sürede sohbete dahil oldum.': 'The atmosphere was very relaxed and the people were friendly. Even though it was my first event, I joined the conversation quickly.', 'Konuşma fırsatı gerçekten var. Ders gibi değil; sohbet akışı içinde İngilizce kullanıyorsun.': 'You genuinely get chances to speak. It does not feel like a lesson; you use English naturally in the flow of conversation.', 'Grubun enerjisini ve insanların seviyesini sevdim. Yeni insanlarla tanışmak en iyi taraflardan biriydi.': 'I liked the energy of the group and the level of the participants. Meeting new people was one of the best parts.', 'Who Am I? kısmı özellikle çok keyifliydi. İlk kez gelmeme rağmen oyuna ve sohbete dahil olmak kolaydı.': 'The Who Am I? part was especially fun. Even though it was my first time, it was easy to join both the game and the conversation.',
    'Katılımcı yorumu': 'Participant review', 'Etkinlik geri bildirimi': 'Event feedback', 'Etkinlik formu': 'Event form', '📝 Geri bildirim formu': '📝 Feedback form', '📷 Instagram @eryamanspeakingclub': '📷 Instagram @eryamanspeakingclub', '💬 WhatsApp topluluğu': '💬 WhatsApp community', 'Yukarıdaki metinler mevcut geri bildirim formlarındaki görüşlerin anonimleştirilmiş ve okunabilirlik için yeniden düzenlenmiş özetleridir; birebir alıntı değildir.': 'The comments above are anonymized, readability-edited summaries of feedback collected through our forms; they are not verbatim quotes.',
    '07 · Gelmeden önce': '07 · Before you come', 'İlk buluşmadan önce aklına takılabilecekler.': 'Things you may wonder before your first meetup.', 'Muhtemelen başkalarının da aklına geldi.': 'You are probably not the only one wondering.', 'İngilizce seviyem ne olmalı?': 'What English level do I need?', 'Günlük İngilizceyi anlayıp basit cümleler kurabiliyorsan katılabilirsin. Etkinlikler çoğunlukla A2–B2+ aralığında rahat çalışıyor ve kimse kusursuzluk beklemiyor.': 'If you can understand everyday English and build simple sentences, you can join. The meetups work comfortably for roughly A2–B2+ levels, and nobody expects perfection.', 'Tek başıma gelebilir miyim?': 'Can I come alone?', 'Evet. Birçok kişi ilk etkinliğine tek başına geliyor. Değişen gruplar ve oyunlar tanışmayı kolaylaştırıyor.': 'Yes. Many people come to their first meetup alone. Rotating groups and games make it easy to meet people.', 'Katılım ücretleri ne kadar?': 'How much does it cost?', "İlk buluşma ücretsizdir. Sonraki tek etkinlik katılımı 400 TL, 1 aylık üyelik 1.400 TL, 3 aylık üyelik ise toplam 3.900 TL'dir.": 'Your first meetup is free. After that, a single event is 400 TL, a 1-month membership is 1,400 TL and a 3-month membership is 3,900 TL in total.', 'Ödeme nasıl yapılıyor?': 'How does payment work?', 'Ödeme yöntemi, rezervasyon ve gerekli bilgiler kayıt sırasında paylaşılır. Güncel katılım detayları için Instagram hesabımızdan bize ulaşabilirsin.': 'Payment method, reservation details and required information are shared during registration. For current participation details, contact us on Instagram.', 'Burası İngilizce kursu mu?': 'Is this an English course?', 'Hayır. Sosyal bir speaking community. Biz ortamı ve aktiviteleri hazırlıyoruz; sohbeti katılımcılar oluşturuyor.': 'No. It is a social speaking community. We create the setting and activities; the participants create the conversation.', 'Hata yaparsam veya kelimeyi unutursam?': 'What if I make a mistake or forget a word?', 'Normal. Zaten kulübün varlık nedeni bu. Başka bir şekilde anlat, yardım iste ve devam et. İletişim kusursuz gramerden daha önemli.': 'That is normal — it is one of the reasons the club exists. Explain it another way, ask for help and keep going. Communication matters more than perfect grammar.', 'Buluşmalar nerede oluyor?': 'Where are the meetups held?', "Eryaman'da seçtiğimiz kafe ve sosyal mekânlarda buluşuyoruz. Güncel yer, gün ve saat bilgisi her etkinlikten önce Instagram ve WhatsApp üzerinden duyuruluyor.": 'We meet at selected cafés and social venues in Eryaman. The current place, day and time are announced on Instagram and WhatsApp before each event.', 'Online özel ders var mı?': 'Do you offer online private lessons?', 'Evet. Gülsüm Yağmur Akdeniz ile birebir online İngilizce özel ders için': 'Yes. For one-to-one online English lessons with Gülsüm Yağmur Akdeniz,', 'özel dersler sayfasından detayları inceleyebilirsin': 'you can view the details on the private lessons page', 'Özel ders fiyatları bu sayfada yayınlanmıyor; detaylar iletişim sırasında paylaşılır.': 'Private lesson prices are not published on this page; details are shared when you get in touch.', 'Web oyunlarını etkinlik dışında da kullanabilir miyim?': 'Can I use the web games outside the meetups?', "Evet. Game Hub'daki oyunlar ücretsizdir ve telefon, tablet veya bilgisayardan doğrudan tarayıcıda açılır.": 'Yes. The games in the Game Hub are free and open directly in your browser on a phone, tablet or computer.',
    'BİR SONRAKİ SOHBETİN BURADA BAŞLIYOR': 'YOUR NEXT CONVERSATION STARTS HERE', 'Daha az düşün.': 'Think less.', 'Daha çok konuş.': 'Speak more.', 'Ücretsiz buluşmaya katıl ↗': 'Join the free meetup ↗', "Game Hub'ı aç →": 'Open the Game Hub →',
    '08 · Katılım seçenekleri': '08 · Participation options', 'İlk buluşmayı ücretsiz dene.': 'Try your first meetup for free.', 'Sonra sana uygun şekilde devam et.': 'Then continue in the way that suits you.', 'Eryaman Speaking Club buluşmalarına ilk kez katılıyorsan ilk buluşman ücretsiz. Devamında tek etkinlik, 1 aylık veya 3 aylık katılım seçeneklerinden birini tercih edebilirsin.': 'If it is your first Eryaman Speaking Club meetup, your first one is free. After that, choose a single event, a 1-month membership or a 3-month membership.',
    'Tek Etkinlik': 'Single Event', '/ etkinlik': '/ event', 'İlk ücretsiz buluşmadan sonraki tek katılım ücreti.': 'Single-event price after your free first meetup.', 'Paket kullanmadan, uygun olduğun etkinliğe tek seferlik katılmak isteyenler için.': 'For anyone who wants to join an event once without committing to a package.', 'Katılım formunu aç': 'Open registration form', 'İlk buluşma ücretsiz': 'First meetup is free', 'Sonraki tek etkinlik 400 TL': 'Next single event: 400 TL', 'Yaklaşık 120 dakika konuşma pratiği': 'Around 120 minutes of speaking practice', 'Masa değişimi, oyunlar ve topluluk ortamı': 'Table rotation, games and community atmosphere',
    '3 Aylık Üyelik': '3-Month Membership', '/ 3 ay': '/ 3 months', 'Aylık ortalama': 'Monthly average', 'Daha düzenli katılım ve uzun vadeli speaking pratiği isteyenler için avantajlı seçenek.': 'A better-value option for more regular attendance and long-term speaking practice.', '3 aylık üyeliği sor': 'Ask about 3-month membership', '3 ay boyunca düzenli katılım': 'Regular attendance for 3 months', 'Aylık ortalama 1.300 TL': 'Monthly average: 1,300 TL', 'Speaking club oyunları ve masa rotasyonu': 'Speaking club games and table rotation', 'Topluluk içinde daha düzenli pratik': 'More consistent practice within the community',
    '1 Aylık Üyelik': '1-Month Membership', '/ ay': '/ month', 'Bir aylık düzenli katılım seçeneği.': 'A one-month regular attendance option.', 'Tek etkinlik yerine bir ay boyunca daha düzenli şekilde buluşmalara katılmak isteyenler için.': 'For anyone who wants to attend more regularly for a month instead of joining a single event.', '1 aylık üyeliği sor': 'Ask about 1-month membership', '1 aylık katılım': '1 month of participation', 'Düzenli konuşma pratiği': 'Regular speaking practice', 'Oyunlar ve sosyal topluluk ortamı': 'Games and a social community atmosphere', 'Etkinlik duyurularına göre rezervasyon': 'Reservation based on event announcements',
    'Ders yok. Konuşma var.': 'No lessons. Just speaking.', 'E-posta gönder': 'Send email', 'Bize yaz': 'Contact us', 'Nasıl yardımcı olabiliriz?': 'How can we help?', 'Bilgilerini ve mesajını yaz. Gönder dediğinde e-posta uygulaman hazır mesajla açılır.': 'Enter your details and message. When you send, your email app will open with the message ready.', 'Ad Soyad': 'Full name', 'E-posta': 'Email', 'Mesajın': 'Your message', 'E-postayı hazırla & gönder ↗': 'Prepare email & send ↗', 'GitHub Pages statik çalıştığı için mesaj cihazındaki varsayılan e-posta uygulamasında gönderime hazır açılır.': 'Because GitHub Pages is static, the message opens ready to send in your device’s default email app.', 'E-posta uygulaman açılıyor…': 'Opening your email app…', '💬 Kartlara tıkla · yeni sohbet gelsin': '💬 Tap the cards · get a new conversation', 'Online özel dersleri incele →': 'Explore online private lessons →'
  };

  const ATTR_TR_TO_EN = {
    'Eryaman Speaking Club ana sayfa': 'Eryaman Speaking Club home', 'Ana menü': 'Main navigation', 'Menüyü aç': 'Open menu', 'Speaking club sohbet illüstrasyonu': 'Speaking club conversation illustration', 'Kulüp yaklaşımı': 'Club approach', 'Bir sonraki Eryaman Speaking Club buluşması': 'Next Eryaman Speaking Club meetup', 'Eryaman Speaking Club grup fotoğrafları': 'Eryaman Speaking Club group photos', 'Galeri kontrolleri': 'Gallery controls', 'Önceki fotoğraf': 'Previous photo', 'Sonraki fotoğraf': 'Next photo', 'E-posta ile iletişime geç': 'Contact us by email', 'Kapat': 'Close', 'Adın ve soyadın': 'Your full name', 'Bize ne hakkında yazmak istiyorsun?': 'What would you like to ask us about?', 'Yeni sohbet kartı getir': 'Get a new conversation card', 'Yeni sohbet kartı için tıkla': 'Click for a new conversation card', 'İki sohbet kartını da yenile': 'Refresh both conversation cards', 'İki kartı da yenile': 'Refresh both cards'
  };

  const originalText = new WeakMap();
  const originalAttrs = new WeakMap();
  let currentLanguage = localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'tr';
  let observer;

  const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const preserveWhitespace = (raw, translated) => {
    const match = String(raw).match(/^(\s*)([\s\S]*?)(\s*)$/);
    return match ? `${match[1]}${translated}${match[3]}` : translated;
  };

  const ensureFourthFeedback = () => {
    const grid = document.querySelector('.feedback-grid');
    if (!grid || grid.querySelectorAll('.feedback-card').length >= 4) return;
    const card = document.createElement('article');
    card.className = 'feedback-card reveal visible';
    card.innerHTML = '<div class="quote-mark small">“</div><div class="feedback-stars">★★★★★</div><blockquote>Who Am I? kısmı özellikle çok keyifliydi. İlk kez gelmeme rağmen oyuna ve sohbete dahil olmak kolaydı.</blockquote><div class="feedback-source"><div class="feedback-avatar">04</div><div><b>Katılımcı yorumu</b><span>Etkinlik formu</span></div></div>';
    grid.appendChild(card);
  };

  const ensureSwitcher = () => {
    if (document.querySelector('.esc-lang-switch')) return;
    const nav = document.querySelector('.site-nav');
    if (!nav) return;
    const switcher = document.createElement('div');
    switcher.className = 'esc-lang-switch';
    switcher.setAttribute('role', 'group');
    switcher.setAttribute('aria-label', 'Language');
    switcher.innerHTML = '<button type="button" data-esc-lang="tr" aria-label="Türkçe">TR</button><span>/</span><button type="button" data-esc-lang="en" aria-label="English">EN</button>';
    const menuButton = nav.querySelector('.menu-btn');
    nav.insertBefore(switcher, menuButton || null);
    switcher.addEventListener('click', (event) => {
      const button = event.target.closest('[data-esc-lang]');
      if (!button) return;
      setLanguage(button.dataset.escLang);
    });
  };

  const ensureStyles = () => {
    if (document.querySelector('style[data-esc-language-style]')) return;
    const style = document.createElement('style');
    style.dataset.escLanguageStyle = 'true';
    style.textContent = `
      .esc-lang-switch{flex:0 0 auto;display:inline-flex;align-items:center;gap:3px;padding:4px;border:1px solid rgba(8,31,59,.12);border-radius:13px;background:rgba(247,250,252,.94);box-shadow:0 6px 18px rgba(8,31,59,.06)}
      .esc-lang-switch button{width:32px;height:30px;padding:0;border:0;border-radius:9px;background:transparent;color:#718397;font:inherit;font-size:10px;font-weight:1000;letter-spacing:.04em;cursor:pointer;transition:.18s ease}
      .esc-lang-switch button:hover{color:#081f3b;background:#edf3f8}.esc-lang-switch button.active{background:#081f3b;color:#fff;box-shadow:0 5px 13px rgba(8,31,59,.16)}.esc-lang-switch span{color:#a8b4bf;font-size:10px;font-weight:900}
      html[lang="en"] .meetup-price-card.featured:before{content:"BEST VALUE"}
      @media(max-width:1120px){.site-nav{gap:12px}.esc-lang-switch{margin-left:auto}.nav-brand{margin-right:0}.nav-links{margin-left:auto}}
      @media(max-width:760px){.esc-lang-switch{padding:3px;border-radius:12px}.esc-lang-switch button{width:29px;height:29px;font-size:9px}.esc-lang-switch span{font-size:9px}}
    `;
    document.head.appendChild(style);
  };

  const translateTextNode = (node) => {
    if (!node || !node.nodeValue || !normalize(node.nodeValue)) return;
    const currentKey = normalize(node.nodeValue);
    if (Object.prototype.hasOwnProperty.call(TR_TO_EN, currentKey)) {
      originalText.set(node, node.nodeValue);
      if (currentLanguage === 'en') node.nodeValue = preserveWhitespace(node.nodeValue, TR_TO_EN[currentKey]);
      return;
    }
    const original = originalText.get(node);
    if (!original) return;
    const originalKey = normalize(original);
    const expected = currentLanguage === 'tr' ? original : preserveWhitespace(original, TR_TO_EN[originalKey] || originalKey);
    if (node.nodeValue !== expected) node.nodeValue = expected;
  };

  const translateAttributes = (element) => {
    if (!(element instanceof Element)) return;
    const attributes = ['aria-label', 'placeholder', 'title', 'alt'];
    let saved = originalAttrs.get(element);
    if (!saved) { saved = {}; originalAttrs.set(element, saved); }
    attributes.forEach((name) => {
      if (!element.hasAttribute(name)) return;
      const current = element.getAttribute(name);
      if (ATTR_TR_TO_EN[current]) saved[name] = current;
      if (!saved[name]) return;
      const expected = currentLanguage === 'en' ? (ATTR_TR_TO_EN[saved[name]] || saved[name]) : saved[name];
      if (current !== expected) element.setAttribute(name, expected);
    });
  };

  const translateTree = (root = document.body) => {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) { translateTextNode(root); return; }
    if (root instanceof Element) translateAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let node = walker.currentNode;
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
      else if (node instanceof Element && !node.matches('script,style,noscript')) translateAttributes(node);
      node = walker.nextNode();
    }
  };

  const syncSwitcher = () => {
    document.querySelectorAll('[data-esc-lang]').forEach((button) => {
      const active = button.dataset.escLang === currentLanguage;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };

  const syncHead = () => {
    document.documentElement.lang = currentLanguage;
    document.title = currentLanguage === 'en' ? 'Eryaman Speaking Club · Speak, Meet, Grow' : 'Eryaman Speaking Club · Konuş, Tanış, Geliş';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = currentLanguage === 'en' ? 'Eryaman Speaking Club is a social speaking community in Ankara Eryaman for English conversation practice, meetups and interactive games.' : "Eryaman Speaking Club, Ankara Eryaman'da İngilizce konuşma pratiği, sosyal buluşmalar ve interaktif oyunlar için kurulmuş bir speaking community'dir.";
  };

  function setLanguage(language) {
    currentLanguage = language === 'en' ? 'en' : 'tr';
    localStorage.setItem(STORAGE_KEY, currentLanguage);
    ensureFourthFeedback();
    syncHead();
    translateTree(document.body);
    syncSwitcher();
    window.dispatchEvent(new CustomEvent('esc:languagechange', { detail: { language: currentLanguage } }));
  }

  const startObserver = () => {
    if (!('MutationObserver' in window) || observer) return;
    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData') { translateTextNode(mutation.target); return; }
        mutation.addedNodes.forEach((node) => translateTree(node));
        if (mutation.type === 'attributes') translateAttributes(mutation.target);
      });
      syncSwitcher();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'placeholder', 'title', 'alt'] });
  };

  ensureStyles();
  ensureFourthFeedback();
  ensureSwitcher();
  setLanguage(currentLanguage);
  startObserver();
})();
