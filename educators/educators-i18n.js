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
    "Ses testi":"Voice test",
    "Ses motoru hazırlanıyor…":"Preparing voice engine…",
    "Doğal ses":"Natural voice",
    "Baştan":"Restart",
    "Oynat":"Play",
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

  Object.assign(TEXT,{
    "Öğretmen Platformu": "Teacher Platform",
    "Neden?": "Why?",
    "Platforma gir": "Open platform",
    "Her İngilizce öğretmeni için": "For every English teacher",
    "tam çalışma alanı.": "one complete workspace.",
    "İster Türkiye’de MEB ile, ister CEFR ile, ister özel ders veriyor ol: sınıfını, ders planını, materyallerini, oyunlarını ve öğrenci katılımını tek çalışma alanından yönet. Türkçe veya English kullan; menüler sade, kontroller büyük ve okunaklı.": "Whether you teach with MEB in Türkiye, CEFR, or private lessons, manage classes, lesson plans, resources, games and student participation in one workspace. Use Turkish or English with clear menus and large, readable controls.",
    "HER ÖĞRETMEN İÇİN": "FOR EVERY TEACHER",
    "Platformu Türkçe veya English kullan. MEB, CEFR, private tutoring ve serbest ders akışlarından ihtiyacına uygun olanı seç.": "Use the platform in Turkish or English. Choose MEB, CEFR, private tutoring or a fully custom teaching path.",
    "Türkçe + English": "Turkish + English",
    "MEB + CEFR + Private Tutor": "MEB + CEFR + Private Tutor",
    "ÖĞRETMEN ÇALIŞMA ALANI": "TEACHER WORKSPACE",
    "MÜFREDAT MERKEZİ": "CURRICULUM HUB",
    "SINIFLARIM": "MY CLASSES",
    "ÖZEL DERS ALANI": "PRIVATE TUTOR WORKSPACE",
    "DERSLERİM": "MY LIBRARY",
    "RAPORLAR": "REPORTS",
    "CANLI SINIF VERİSİ": "LIVE CLASS DATA",
    "Bugün": "Today",
    "Müfredat": "Curriculum",
    "Sınıflarım": "My Classes",
    "Özel Öğrenciler": "Private Students",
    "Ders Oluşturucu": "Lesson Builder",
    "Derslerim": "My Library",
    "Materyal Stüdyosu": "Resource Studio",
    "Oyun Kütüphanesi": "Game Library",
    "Sınıf Araçları": "Classroom Tools",
    "Raporlar": "Reports",
    "EĞİTİMCİ PLATFORMU · TEACHER PLATFORM": "EDUCATOR PLATFORM · TEACHER PLATFORM",
    "Öğretmen platformunu aç": "Open teacher platform",
    "Öğretmen platformuna gir": "Enter teacher platform",
    "Öğrenci koduyla katıl": "Join with a student code",
    "Oyun kütüphanesini aç": "Open game library",
    "Büyük ve okunaklı arayüz": "Large, readable interface",
    "Tek yerden ders yönetimi": "Manage teaching in one place",
    "MEB + CEFR akışı": "MEB + CEFR workflow",
    "2026–27 sınıf ve tema seçimiyle başla.": "Start with the 2026–27 grade and theme.",
    "Kaydet + tekrar kullan": "Save + reuse",
    "Derslerin hesabında kalsın, yeniden aç ve yazdır.": "Keep lessons in your account, reopen and print them.",
    "NEDEN HER GÜN AÇILSIN?": "WHY USE IT EVERY DAY?",
    "Öğretmenin beş ayrı aracını": "Replace five separate teacher tools",
    "tek çalışma akışına indir.": "with one teaching workflow.",
    "Hedefimiz yeni bir oyun sitesi olmak değil. Ders hazırlama, MEB teması, materyal, sınıf içi etkinlik, kaydetme ve sonuç takibini aynı öğretmen hesabında birleştirmek.": "This is not just another game site. It combines lesson planning, MEB themes, resources, classroom activities, saved work and results in one teacher account.",
    "MEB’den doğrudan derse": "From MEB directly to a lesson",
    "2026–27 TYMM akışında 5–7 ve 9–11. sınıflardan tema ve beceriyi seç; Lesson Builder’a geç.": "Choose a theme and skill for Grades 5–7 or 9–11 in the 2026–27 TYMM flow, then move straight to Lesson Builder.",
    "Türkiye’ye göre başlangıç": "Start from the Türkiye curriculum",
    "Bir kez hazırla, tekrar kullan": "Prepare once, reuse",
    "Kaydettiğin dersler My Library’de kalır. Sonraki sınıfta yeniden aç, düzenle veya yazdır.": "Saved lessons stay in My Library. Reopen, edit or print them for another class.",
    "Hazırlık emeğini kaybetme": "Keep the work you already did",
    "Sınıfta sekme değiştirme": "Stop switching tabs in class",
    "Ders akışı, speaking prompt, oyun, sınıf kodu ve canlı kontrol aynı platform içinde ilerler.": "Lesson flow, speaking prompts, games, class code and live controls stay in the same platform.",
    "Tek öğretmen çalışma alanı": "One teacher workspace",
    "Sonraki dersi veriye göre planla": "Plan the next lesson from data",
    "Öğrenci sonuçları geldikçe rapor ekranı gerçek etkinlik verisini ve tekrar edilmesi gereken alanı gösterir.": "As results arrive, reports show real activity data and what may need review.",
    "Rapor → karar → yeni ders": "Report → decision → next lesson",
    "ÖĞRETMEN HESABI": "TEACHER ACCOUNT",
    "İlk sınıfını oluştur ve kendi ders kütüphaneni başlat.": "Create your first class and start your own lesson library.",
    "Öğrenciler sınıf koduyla katılır; öğretmen tarafındaki içerikler hesabına bağlı kalır.": "Students join with a class code; teacher content stays linked to your account.",
    "Ücretsiz hesap oluştur →": "Create free account →",
    "Platformu incele": "Explore platform",
    "İlk sürümün odağı öğretmenin hazırlık süresini azaltmak. İçerik, sınıf profilinden otomatik türetilir; öğretmen isterse düzenler.": "The first goal is to reduce preparation time. Content is generated from the class profile and can always be edited by the teacher.",
    "Yaş, seviye, öğrenci sayısı ve ders hedefini seç.": "Choose age, level, student count and lesson goal.",
    "Konu ve süreye göre warm-up, vocabulary, speaking ve oyun akışı gelsin.": "Build a warm-up, vocabulary, speaking and game flow from the topic and duration.",
    "Öğrenciler kodla girsin; öğretmen tahtadan akışı yönetsin.": "Students join with a code; the teacher controls the flow from the board.",
    "Zorlanan kelimeler, katılım ve aktivite sonucu tek raporda toplansın.": "Collect difficult words, participation and activity results in one report.",
    "İlk kez mi kullanıyorsun?": "First time here?",
    "Dakikalar içinde ders oluştur": "Build a lesson in minutes",
    "Yaş, seviye, konu ve süreyi seç; akışı hazırla.": "Choose age, level, topic and duration; generate the flow.",
    "Kaydettiğim dersi aç": "Open a saved lesson",
    "Hazırladığın dersi tekrar kullan, düzenle veya yazdır.": "Reuse, edit or print a lesson you already prepared.",
    "İLK KURULUM": "GET STARTED",
    "Platformu 4 adımda kendi çalışma alanın yap.": "Make the platform your workspace in four steps.",
    "Giriş yapıldı": "Signed in",
    "İlk sınıfını oluştur": "Create your first class",
    "Yaş ve seviyeyi bir kez tanımla": "Set age and level once",
    "İlk dersini kaydet": "Save your first lesson",
    "Sonra tek tıkla yeniden kullan": "Reuse it later with one click",
    "Sınıfta başlat": "Start it in class",
    "Kodla öğrenci al ve canlı akışı dene": "Let students join by code and try the live flow",
    "Son kaydettiğin dersler": "Recently saved lessons",
    "Tümünü aç →": "Open all →",
    "Kaydedilmiş dersler yükleniyor…": "Loading saved lessons…",
    "Kodu kopyala": "Copy code",
    "Katılım linkini kopyala": "Copy join link",
    "Lise programı": "Upper-secondary programme",
    "Hazırlık sonrası program": "After-prep programme",
    "Resmî tema adları MEB kaynağına göre gösterilir; lisede Regular ve Hazırlık sonrası program ayrımı yapılır.": "Official theme names follow MEB sources; upper-secondary Regular and After-Prep programmes are separated.",
    "MEB kaynağı ↗": "MEB source ↗",
    "Profil → ders → ödev → tekrar → ilerleme": "Profile → lesson → homework → review → progress",
    "Özel ders öğretmeni ayrı Excel, not uygulaması ve oyun sekmeleri kullanmak yerine öğrencinin hedefini ve sonraki dersi aynı çalışma alanında tutar.": "Instead of separate spreadsheets, notes and game tabs, private tutors can keep learner goals and the next lesson in one workspace.",
    "Sınıflar ve kaydedilmiş dersler öğretmen hesabına bağlıdır. Private Students kartları şu an bu cihazda saklanır; hesaplar arası senkronizasyon backend fazında eklenecek.": "Classes and saved lessons are linked to the teacher account. Private Student cards are currently stored on this device; account sync will be added in the backend phase.",
    "Bir kez hazırla. Her sınıfta yeniden kullan.": "Prepare once. Reuse in every class.",
    "+ Yeni ders oluştur": "+ Create lesson",
    "Kaydet": "Save",
    "Ders planlarını hesabında tut.": "Keep lesson plans in your account.",
    "Yeniden kullan": "Reuse",
    "Aynı yapıyı başka sınıfa uyarla.": "Adapt the same structure for another class.",
    "Yazdır": "Print",
    "Öğretmen planını tek tıkla çıktı al.": "Print the teacher plan with one click.",
    "Derslerde ara": "Search lessons",
    "Tüm hedefler": "All goals",
    "↻ Yenile": "↻ Refresh",
    "Derslerin yükleniyor…": "Loading your lessons…",
    "Kaydettiğin dersler burada görünecek.": "Saved lessons will appear here.",
    "Planı kopyala": "Copy plan",
    "Yazdır / PDF": "Print / PDF",
    "Öğretmene karar aldıran gerçek sınıf verisi.": "Real class data that helps teachers decide what to do next.",
    "Tüm sınıflar": "All classes",
    "↻ Veriyi yenile": "↻ Refresh data",
    "SONUÇ KAYDI": "RESULT RECORDS",
    "Öğrenci etkinlikleri": "Student activities",
    "Puanlı etkinliklerde": "Across scored activities",
    "AKTİF ÖĞRENCİ": "ACTIVE STUDENTS",
    "Sonuç gönderen": "Students who submitted results",
    "EN ÇOK ÇALIŞILAN": "MOST PRACTISED",
    "Etkinlik türü": "Activity type",
    "SINIF VERİSİ": "CLASS DATA",
    "Henüz yeterli veri yok": "Not enough data yet",
    "Öğrenciler etkinlik tamamladıkça sonuçlar burada gerçek zamanlı özetlenir.": "Results are summarised here as students complete activities.",
    "SONRAKİ DERS ÖNERİSİ": "NEXT LESSON SUGGESTION",
    "Önce bir canlı etkinlik çalıştır.": "Run a live activity first.",
    "Platform, sonuçlar geldikçe hangi beceriyi tekrar etmenin daha mantıklı olduğunu gösterecek.": "As results arrive, the platform will suggest which skill may need review.",
    "Öğrenci karmaşık menüler görmez. Öğretmenin verdiği kodu girer, adını yazar ve aktif derse katılır.": "Students do not see complex menus. They enter the teacher's code, type their name and join the active class.",
    "Hesap gerekmez. Öğretmeninizin verdiği sınıf kodunu girin.": "No account needed. Enter the class code from your teacher.",
    "Planla → oynat → konuştur → takip et.": "Plan → run → speak → track.",
    "OTURUM KONTROLÜ": "SESSION CHECK",
    "Hesabınız açılıyor…": "Opening your account…",
    "Kayıtlı oturumunuz güvenli şekilde geri yükleniyor. Yeniden giriş yapmanız gerekmiyor.": "Your saved session is being restored securely. You do not need to sign in again.",
    "Sınıflarınızı yönetmek için giriş yapın.": "Sign in to manage your classes.",
    "Gerçek sınıf kodları, öğrenci katılımları ve ders kayıtları hesabınıza bağlıdır.": "Real class codes, student participation and lesson records are linked to your account.",
    "Öğretmen girişi →": "Teacher sign in →",
    "Çıkış": "Sign out",
    "Ücretsiz öğretmen hesabı oluştur": "Create a free teacher account",
    "Hesabınız açıldığında sınıflarınız ve dersleriniz cihazdan bağımsız olarak kaydedilir.": "Once your account is created, classes and lessons are saved across devices."
});

  Object.assign(TEXT,{
  "Ödevler": "Assignments",
  "Ders bittikten sonra öğrenme devam etsin.": "Keep learning going after class.",
  "ÖDEVLER": "ASSIGNMENTS",
  "YENİ ÖDEV": "NEW ASSIGNMENT",
  "Sınıfa görev gönder": "Send a task to the class",
  "Kaydettiğin bir dersi ödeve dönüştür veya sıfırdan kısa bir görev oluştur.": "Turn a saved lesson into homework or create a short task from scratch.",
  "Sınıf": "Class",
  "Önce sınıf seç": "Choose a class",
  "Kaydedilmiş ders": "Saved lesson",
  "opsiyonel": "optional",
  "Ders seçmeden devam et": "Continue without a saved lesson",
  "Başlık": "Title",
  "Öğrenci yönergesi": "Student instructions",
  "Ne yapmasını istediğini kısa ve net yaz.": "Write clearly and briefly what you want students to do.",
  "Son teslim": "Due date",
  "Durum": "Status",
  "Hemen yayınla": "Publish now",
  "Taslak kaydet": "Save draft",
  "Ödevi oluştur →": "Create assignment →",
  "Yayınlanan ödev, sınıf koduyla giriş yapan öğrencilerin ekranında otomatik görünür.": "Published assignments appear automatically for students who join with the class code.",
  "SINIF ÖDEVLERİ": "CLASS ASSIGNMENTS",
  "Yayınlanan ve taslak ödevler": "Published and draft assignments",
  "Ödevler yükleniyor…": "Loading assignments…",
  "Materyaller": "Resources",
  "Oyunlar": "Games",
  "Araçlar": "Tools",
  "Sınıflar, kaydedilmiş dersler ve özel öğrenci profilleri öğretmen hesabına bağlıdır. Aynı hesapla farklı cihazlardan kaldığın yerden devam edebilirsin.": "Classes, saved lessons and private student profiles are linked to your teacher account. Continue from where you left off on any device.",
  "Ders Oluşturucu": "Lesson Builder",
  "Özel Öğrenciler": "Private Students",
  "Sınıflarım": "My Classes",
  "Müfredat": "Curriculum",
  "Bugün": "Today"
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
    try{
      const url=new URL(location.href);
      url.searchParams.set("lang",current);
      history.replaceState(null,"",url.pathname+url.search+url.hash);
    }catch{}
    document.querySelectorAll("[data-edu-lang]").forEach(b=>b.classList.toggle("active",b.dataset.eduLang===current));
    translateTree(document.body);
    window.dispatchEvent(new CustomEvent("esc:languagechange",{detail:{lang:current}}));
  }
  function init(){
    const params=new URLSearchParams(location.search);
    const queryLang=params.get("lang");
    let saved="";
    try{saved=localStorage.getItem(STORAGE)||"";}catch{}
    if(queryLang==="tr"||queryLang==="en") current=queryLang;
    else if(saved==="tr"||saved==="en") current=saved;
    else current=(navigator.language||"").toLowerCase().startsWith("tr")?"tr":"en";
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