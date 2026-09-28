(() => {
  "use strict";
  const STORAGE="escEducatorsLangV1";
  let current="tr";
  const original=new WeakMap();

  const TEXT={
    "Nasıl çalışır?":"How it works",
    "Tanıtım":"Tour",
    "Öğretmen paneli":"Teacher workspace",
    "Öğrenci girişi":"Student join",
    "Gelişim Planı":"Roadmap",
    "Oyunlar":"Games",
    "Öğretmen girişi":"Teacher login",
    "Öğretmen hesabına giriş yap":"Sign in to your teacher account",
    "Sınıflarınız, öğrenci kodlarınız ve dersleriniz hesabınıza kaydedilir.":"Your classes, student codes and lessons are saved to your account.",
    "Giriş":"Sign in",
    "Hesap oluştur":"Create account",
    "Adınız":"Your name",
    "E-posta":"Email",
    "Şifre":"Password",
    "Giriş yap →":"Sign in →",
    "Şifremi unuttum":"Forgot password",
    "Yeni sınıf oluştur":"Create a new class",
    "Bu bilgiler soru zorluğunu, kelime seçimini ve etkinlik tipini belirler.":"These settings guide question difficulty, vocabulary and activity type.",
    "Sınıf adı":"Class name",
    "Yaş grubu":"Age group",
    "Seviye":"Level",
    "Ana hedef":"Primary goal",
    "Maks. öğrenci":"Max students",
    "Sınıfı oluştur →":"Create class →",
    "İngilizce öğretmeninin":"The English teacher's",
    "çalışma merkezi.":"workspace.",
    "Türkiye'deki gerçek öğretmen akışına göre tasarlandı: MEB müfredatı, özel ders öğrencileri, lesson builder, vocabulary, grammar, speaking, oyunlar, worksheet ve sınıf araçları tek yerde.":"Built around real teaching workflows: curriculum, private students, lesson building, vocabulary, grammar, speaking, games, worksheets and classroom tools in one place.",
    "Öğretmen paneline gir":"Open teacher workspace",
    "Öğrenci olarak katıl":"Join as a student",
    "Dersi oluştur":"Create lesson",
    "Yaşa göre soru":"Age-adapted prompts",
    "Aynı CEFR seviyesi, farklı yaş dili.":"Same CEFR level, age-appropriate language.",
    "Seviyeye göre görev":"Level-adapted tasks",
    "Hazır ders akışı":"Ready lesson flow",
    "20–60 dakikalık sınıf planı.":"20–60 minute lesson plans.",
    "Esnek oyun modu":"Flexible game mode",
    "Takımsız, çift veya isteğe bağlı takım puanı.":"Solo, pair or optional team scoring.",
    "NASIL ÇALIŞACAK?":"HOW IT WORKS",
    "Dört adım. Tek ekran.":"Four steps. One workspace.",
    "Sınıfını tanımla":"Define your class",
    "Dersi oluştur":"Create the lesson",
    "Sınıfta başlat":"Start in class",
    "Sonucu gör":"Review the result",
    "İLK KEZ Mİ KULLANIYORSUN?":"NEW HERE?",
    "Öğretmen ne yapacağını ilk bakışta görsün.":"See the workflow at a glance.",
    "İnteraktif tanıtımı oynat":"Play interactive tour",
    "Doğrudan panele git →":"Go straight to the workspace →",
    "Ders planla":"Plan a lesson",
    "Materyali seç":"Choose materials",
    "Oyunu gerektiğinde kullan":"Use games when useful",
    "Takım modu opsiyonel":"Team mode is optional",
    "Nasıl kullanılır?":"How to use",
    "Bugün ne öğreteceksin?":"What are you teaching today?",
    "Okul dersi hazırla":"Plan a school lesson",
    "Özel ders öğrencisi":"Private student",
    "Şimdi bir oyun aç":"Open a game now",
    "Türkiye'deki öğretmen akışından başla.":"Start from the teaching workflow that fits you.",
    "Teaching path":"Teaching path",
    "Grade":"Grade",
    "Theme / unit":"Theme / unit",
    "Main skill":"Main skill",
    "Öğretmen seçer":"Teacher chooses",
    "Build this lesson →":"Build this lesson →",
    "Create resources":"Create resources",
    "Sınıflarını tek yerde yönet.":"Manage your classes in one place.",
    "Özel ders öğrencisini dersten derse taşı.":"Carry each private student from lesson to lesson.",
    "Her öğrenci için":"For each student",
    "Sınıfına uygun dersi oluştur.":"Build the lesson your class needs.",
    "English level":"English level",
    "Topic":"Topic",
    "Duration":"Duration",
    "Primary goal":"Primary goal",
    "Student count":"Student count",
    "Dersi yeniden oluştur":"Regenerate lesson",
    "Ders hazırlanıyor":"Building lesson",
    "Ders planını kaydet":"Save lesson plan",
    "Dersi başlat ▶":"Start lesson ▶",
    "Konuyu açar.":"Opens the topic.",
    "Hedef kelimeleri hazırlar.":"Prepares target vocabulary.",
    "Kısa uygulama; takım şart değil.":"Short practice; teams are optional.",
    "Öğrenci dili üretir.":"Students produce language.",
    "Dersi hızlıca kontrol eder.":"Quickly checks learning.",
    "Bir ders konusunu altı farklı materyale çevir.":"Turn one lesson topic into six resource types.",
    "Sınıf profiline göre çalışan oyunlar.":"Games that adapt to the class profile.",
    "Oyun ara: vocabulary, speaking, team...":"Search games: vocabulary, speaking, team...",
    "Takım destekli":"Team-supported",
    "Oyunu seç":"Choose a game",
    "Nasıl oynanır?":"How to play",
    "Modu seç":"Choose mode",
    "Next ile ilerle":"Move forward with Next",
    "Ders sırasında gereken küçük araçlar.":"Small tools you need during class.",
    "Grupları karıştır.":"Shuffle groups.",
    "Bir sonraki konuşmayı başlat.":"Start the next conversation.",
    "Öğretmene işe yarayan veri.":"Useful data for the teacher.",
    "Bu üç kelimeyi tekrar et.":"Review these three words.",
    "ÖĞRENCİ TARAFI":"STUDENT SIDE",
    "Çocuk için basit.":"Simple for students.",
    "Öğretmen için kontrollü.":"Controlled for teachers.",
    "Şifre zorunlu değil":"No password required",
    "Sadece sınıf kodu":"Class code only",
    "Yaşa uygun arayüz":"Age-appropriate UI",
    "Takım modu isteğe bağlı":"Team mode optional",
    "SONRAKİ AŞAMALAR":"NEXT STEPS",
    "Platform yol haritası":"Platform roadmap",
    "İngilizce öğretmeninin":"The English teacher's",
    "ders araç kutusu.":"teaching toolkit.",
    "Öğretmen paneline git":"Go to teacher workspace",
    "NASIL OYNANIR?":"HOW TO PLAY",
    "EN İYİ KULLANIM":"BEST FOR",
    "Oyun modu":"Game mode",
    "Takımsız":"No teams",
    "2 Takım":"2 Teams",
    "OPSİYONEL PUAN":"OPTIONAL SCORE",
    "Dersi nasıl yürüteceksin?":"How will you run the lesson?",
    "Puan sistemi bir ders zorunluluğu değildir. Speaking, pair-work veya bireysel etkinliklerde Takımsız seçili kalabilir.":"Scoring is optional. Keep No teams selected for speaking, pair work or individual activities.",
    "1. takımın adı":"Team 1 name",
    "2. takımın adı":"Team 2 name",
    "Sonraki aşama →":"Next stage →",
    "Serbest / Özel":"Custom / Free",
    "Tamamen serbest ders":"Fully custom lesson",
    "Müfredat zorunlu değil":"Curriculum is optional",
    "Ders yapısı":"Lesson structure",
    "Dengeli":"Balanced",
    "Speaking ağırlıklı":"Speaking-first",
    "Vocabulary ağırlıklı":"Vocabulary-first",
    "Grammar ağırlıklı":"Grammar-first",
    "Özel":"Custom",
    "Custom topic":"Custom topic",
    "Kendi konunu yaz":"Enter your own topic",
    "Warm-up":"Warm-up",
    "Vocabulary":"Vocabulary",
    "Practice Game":"Practice Game",
    "Speaking":"Speaking",
    "Exit":"Exit",
    "Resmî tema adları MEB kaynağına göre gösterilir; CEFR seviyesi öğretmenin seçimine bırakılır.":"Official theme names follow the MEB source; CEFR level remains the teacher's choice."
  };

  Object.assign(TEXT,{
    "Okul müfredatı":"School curriculum",
    "Sınıf ve resmî tema üzerinden ilerle.":"Follow grade and official MEB themes.",
    "Öğrenci hedefi ve seviyesine göre planla.":"Plan around the student's level and goals.",
    "General English":"General English",
    "CEFR ve beceri odaklı serbest akış.":"A flexible CEFR and skills-based path.",
    "Müfredat zorunlu değil; öğretmen karar verir.":"No curriculum required; the teacher decides.",
    "2026–27 döneminde 5–7 ve 9–11. sınıflarda TYMM uygulanır; 8. ve 12. sınıflar önceki programı sürdürür.":"In 2026–27, TYMM applies to Grades 5–7 and 9–11; Grades 8 and 12 continue the previous programme.",
    "Öğretmen kontrolü:":"Teacher control:",
    "Bu seçimler öneri üretir; Lesson Builder'da yaş, seviye, süre, konu ve ders aşamalarının tamamını değiştirebilirsin.":"These choices create recommendations; you can change age, level, duration, topic and every lesson stage in Lesson Builder.",
    "TYMM · 2026–27 aktif":"TYMM · active in 2026–27",
    "Önceki program · 2026–27":"Previous programme · 2026–27",
    "Ders yapısı · istediğini kullan, istediğini çıkar":"Lesson structure · keep only what you need",
    "Kendi konunu yaz":"Enter your own topic",
    "Aynı ayarlarla tekrar bastığında yeni soru ve yeni ders varyasyonu hazırlanır. Seçimleri değiştirerek farklı sınıf profilleri oluşturabilirsin.":"Press again with the same settings for a new question and lesson variation. Change the selections to build different class profiles.",
    "Soru, ders akışı ve etkinlikler yeniden hazırlanıyor…":"Questions, lesson flow and activities are being rebuilt…",
    "Yeni ders varyasyonu hazır ✓ İstersen tekrar basıp başka bir varyasyon oluşturabilirsin.":"New lesson variation ready ✓ You can regenerate again for another version.",
    "Tek sayfada öğretmenin kullanacağı hızlı çalışma kâğıdı.":"A compact worksheet the teacher can use immediately.",
    "Kelime öğretimi + tekrar + hızlı kontrol için tek paket.":"One pack for vocabulary teaching, review and a quick check.",
    "Kural ezberinden çok kullanım odaklı mini akış.":"A short, use-focused grammar flow rather than rule memorisation.",
    "Aynı konuyu farklı öğrenci tiplerine göre konuştur.":"Use the same topic with different learner profiles.",
    "Ders sonu veya bir sonraki ders başlangıcı için kontrol.":"A quick check for the end of class or the start of the next lesson.",
    "Özel ders ve sınıf öğretmeni için kısa, net ödev.":"Short, clear homework for private tutors and classroom teachers.",
    "Öğrencinin adı?":"Student name?",
    "Seviye? (A1, A2, B1, B2)":"Level? (A1, A2, B1, B2)",
    "Ana hedef?":"Main goal?",
    "Planlanacak":"To be planned",
    "Bu hızlı sürümde özel öğrenci kartları cihazda saklanır. Sonraki backend adımında öğretmen hesabına bağlanacak.":"In this beta, private-student cards are stored on the device. The next backend step will connect them to the teacher account.",
    "Sınıf → tema → beceri → ders akışı.":"Class → theme → skill → lesson flow.",
    "Seviye, hedef, ödev ve sonraki dersi takip et.":"Track level, goals, homework and the next lesson.",
    "Speaking, vocabulary, grammar veya takım oyunu.":"Speaking, vocabulary, grammar or a team-supported game.",
    "Okul sınıfı, özel ders veya speaking dersi. Akışı seç; panel seni müfredat, ders planı, materyal ve oyuna götürsün.":"School class, private lesson or speaking lesson. Choose a path and the workspace takes you to curriculum, planning, resources and games.",
    "2 dakikalık tur, ders planlama ve oyun modlarını gösterir.":"A short tour shows lesson planning and game modes.",
    "Turu göster":"Show tour",
    "Kapat":"Close",
    "Takımsız modda puan tutmak zorunda değilsin.":"No teams: you do not need to keep score.",
    "Her doğru cevapta +1 kullanabilirsin.":"You can add +1 for each correct answer.",
    "Takımsız modda yalnızca Next ile ilerleyebilirsin.":"No teams: simply move forward with Next.",
    "TAKIM 1":"TEAM 1",
    "TAKIM 2":"TEAM 2",
    "+10 Takım 1":"+10 Team 1",
    "+10 Takım 2":"+10 Team 2",
    "Derse hazır · Player 4":"Ready for class · Player 4",
    "5. Sınıf":"Grade 5",
    "6. Sınıf":"Grade 6",
    "7. Sınıf":"Grade 7",
    "8. Sınıf":"Grade 8",
    "9. Sınıf":"Grade 9",
    "10. Sınıf":"Grade 10",
    "11. Sınıf":"Grade 11",
    "12. Sınıf":"Grade 12",
    "Okul müfredatı":"School curriculum",
    "Öğretmen paneline gir":"Open teacher workspace",
    "Öğretmen hesabı":"Teacher account",
    "Sınıfı oluştur →":"Create class →",
    "Yeni sınıf oluştur":"Create a new class",
    "Ders planını kaydet":"Save lesson plan",
    "Sonraki aşama →":"Next stage →"
  });

  const PLACEHOLDERS={
    "Örn. 6-B / Junior Speaking":"e.g. 6-B / Junior Speaking",
    "En az 8 karakter":"At least 8 characters",
    "Oyun ara: vocabulary, speaking, team...":"Search games: vocabulary, speaking, team...",
    "Kendi konunu yaz":"Enter your own topic"
  };

  function tr(text){
    return TEXT[text] || text;
  }
  function preserveWhitespace(raw,newCore){
    const m=String(raw).match(/^(\s*)([\s\S]*?)(\s*)$/);
    return (m?.[1]||"")+newCore+(m?.[3]||"");
  }
  function applyTextNode(node){
    if(!node || !node.parentElement || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(node.parentElement.tagName))return;
    if(!original.has(node))original.set(node,node.nodeValue);
    const base=original.get(node);
    const core=base.trim();
    node.nodeValue=current==="en" && TEXT[core] ? preserveWhitespace(base,TEXT[core]) : base;
  }
  function translateTree(root=document.body){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let n; while((n=walker.nextNode())) applyTextNode(n);
    root.querySelectorAll?.("[placeholder]").forEach(el=>{
      if(!el.dataset.i18nPlaceholderOriginal)el.dataset.i18nPlaceholderOriginal=el.getAttribute("placeholder")||"";
      const base=el.dataset.i18nPlaceholderOriginal;
      el.setAttribute("placeholder",current==="en"?(PLACEHOLDERS[base]||base):base);
    });
    root.querySelectorAll?.("[aria-label]").forEach(el=>{
      if(!el.dataset.i18nAriaOriginal)el.dataset.i18nAriaOriginal=el.getAttribute("aria-label")||"";
      const base=el.dataset.i18nAriaOriginal;
      el.setAttribute("aria-label",current==="en"?(TEXT[base]||base):base);
    });
  }
  function setLang(lang){
    current=lang==="en"?"en":"tr";
    document.documentElement.lang=current;
    try{localStorage.setItem(STORAGE,current);}catch{}
    document.querySelectorAll("[data-edu-lang]").forEach(b=>b.classList.toggle("active",b.dataset.eduLang===current));
    translateTree(document.body);
    window.dispatchEvent(new CustomEvent("esc:languagechange",{detail:{lang:current}}));
  }
  function init(){
    try{current=localStorage.getItem(STORAGE)==="en"?"en":"tr";}catch{}
    document.querySelectorAll("[data-edu-lang]").forEach(b=>b.addEventListener("click",()=>setLang(b.dataset.eduLang)));
    setLang(current);
    const obs=new MutationObserver(records=>{
      for(const r of records){
        r.addedNodes.forEach(n=>{
          if(n.nodeType===Node.TEXT_NODE)applyTextNode(n);
          else if(n.nodeType===Node.ELEMENT_NODE)translateTree(n);
        });
      }
    });
    obs.observe(document.body,{subtree:true,childList:true});
  }
  window.ESCEduI18n={t:(s)=>current==="en"?tr(s):s,getLang:()=>current,setLang};
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();