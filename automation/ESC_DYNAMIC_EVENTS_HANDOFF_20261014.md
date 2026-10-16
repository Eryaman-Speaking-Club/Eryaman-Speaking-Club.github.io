# Eryaman Speaking Club — Dinamik Etkinlik Yönetimi / Canlı Teslim

**Tarih:** 14 Ekim 2026
**Kaynak:** [PR #10 — birleştirildi](https://github.com/Eryaman-Speaking-Club/Eryaman-Speaking-Club.github.io/pull/10)
**Canlı site:** https://eryamanspeakingclub.com/
**Durum:** GitHub main dalına taşındı; GitHub Pages yayın iş akışı çalışıyor.
**Katılımcılara otomatik e-posta:** KAPALI (bilinçli güvenlik kilidi).

## Sistemin gerçek adresleri

- [Etkinlik yönetim paneli](https://eryamanspeakingclub.com/admin/#dynamicEvents)
- [Herkese açık, gerçek zamanlı buluşmalar ve kayıtlar](https://eryamanspeakingclub.com/events/)
- [E-posta kontrol ve mesaj şablonları](https://eryamanspeakingclub.com/admin/#emailAutomation)
- [GitHub ana kod deposu](https://github.com/Eryaman-Speaking-Club/Eryaman-Speaking-Club.github.io)
- [Gmail işçisi](https://github.com/Eryaman-Speaking-Club/Eryaman-Speaking-Club.github.io/blob/main/automation/email/ESC_Live_Gmail.gs)

## Neler yapıldı?

1. **Tek veri kaynağı Supabase:** Etkinlik ID, tarih/saat (Europe/Istanbul), tür, mekân, katılımcı ve durum.
2. **Yönetim paneli:** Etkinlik oluşturma, erteleme, iptal, tamamla, durum/yayın/kontenjan değiştir, katılımcı görüntüle ve katılım işaretle.
3. **Sıradaki etkinlik:** Ana sayfa gerçek *en yakın* etkinliği gösterir; online ve yüz yüze birlikte değerlendirilir. İptal veya geçmiş kayıt gösterilmez. Kayıt kapalıysa açık yazmaz.
4. **Haftalık kurallar:** Pazartesi 20.00 online ve Pazar 18.00 yüz yüze varsayılan açık, Cuma 20.00 varsayılan kapalı. Gerekirse panelden değiştirilir.
5. **Günlük otomatik etkinlik üretimi:** PostgreSQL `pg_cron` ile her gün 00.17 UTC (Türkiye 03.17), yaklaşık 35 gün ileriye planlama; elle taşınmış veya iptal edilmiş etkinliği ikinci kez oluşturmaz.
6. **Kayıt sayfası:** Her etkinliğe özgü kayıt, iletişim izni, kontenjan ve mükerrer kayıt koruması. Eski üye rehberini otomatik toplu kayıt yapmaz.
7. **Güvenli bildirim kuyruğu:** 15 dakikalık kontrol ile etkinlik bazında hatırlatma, erteleme/değişiklik, iptal, yeni kayıt ve ilk katılım teşekkürü için gönderim *hazırlama*. Geçmiş etkinliklere hatırlatma hazırlanmaz.
8. **E-posta kontrol paneli:** 6 şablon, önizleme, yönetici anahtarı ve ayrı Gmail gönderim düğmeleri. Gmail işçisi hazır ancak yetkilendirme yapılana kadar hiçbir katılımcıya mesaj yollamaz.
9. **Online buluşma bağlantısı:** Haftalık programa Google Meet linki bir kez kaydedilebilir. Yeni etkinlikler bu linki devralır; yaklaşan etkinliklerin boş linkleri de doldurulur.
10. **Eski çifte otomasyon kapalı:** Google Sheets `E-posta Otomasyonu!B2=KAPALI` ve `Etkinlik Takvimi!B2=KAPALI`. Eski `Kod.gs` dosyasına müdahale edilmedi.

## Veriler

- Supabase'e ETK-013 – ETK-022 arasında 10 planlı etkinlik aktarıldı.
- 18 Ekim etkinliğinin eski katılım tablosunda gerçekten **Listede** işaretli ve iletişim izni olan **1 kişilik** kaydı yeni etkinliğe `source=legacy` ile aktarıldı; otomatik hoş geldin e-postası oluşturulmadı.
- Eski kişi listesi bütünüyle taşınmadı. Gelecekte alıcılar sadece ilgili etkinliğe kayıtlı ve iletişim izni bulunan kişiler olmalı.
- Gönderim köprüsü anahtarı yaratılmadı ve e-posta servisi etkin değil.

## Test edilmiş durumlar

- GitHub: PR #10 `main` dalına birleştirildi, yayın iş akışı en az bir kez başarılı; son ek yamalar yayın kontrolüyle ayrıca doğrulanmalı.
- JavaScript ve Apps Script: temel sözdizimi kontrolleri geçti.
- Yönetim paneli: olay listesi, haftalık kurallar ve düğmeler sahte veriyle ekran üretme testini geçti.
- Kayıt sayfası: yüz yüze / online etkinliklerin saat ve mekânlarını doğru metinle üretme testi geçti.
- Ana sayfa: sahte veriyle bir sonraki online etkinliğin doğru seçimi, Google Meet etiketi ve online JSON-LD yapılandırması doğrulandı.
- Supabase: doğrulamalı yönetici ile etkinlik tarihi değişikliği, sürüm artışı ve değişiklik bildirim kuyruğu test edildi.
- Veritabanı deneme kayıtları `ROLLBACK` ile silindi; gerçek kişilere test e-postası gönderilmedi.
- pg_cron: bildirim kuyruğu işlem geçmişinde başarılı çalıştırma kayıtları görüldü.
- Tekrarlayan Meet linkinin ileri etkinliklerdeki boş bağlantıları doldurma mekanizması geçici işlemle test edildi ve geri alındı.

## Tek seferlik son işlemler

1. **Yönetici olarak siteyi aç:** `/admin/#dynamicEvents` bölümünde ETK-013 ve ETK-014 etkinliklerini incele. Gün/saat/mekân bilgilerini kontrol et.
2. **Yeni kayıt sayfasını aç:** `/events/`; bir deneme kaydı yalnızca uygun test e-postasıyla ve iletişim izniyle yapılmalı. CORS, kayıt ve kontenjan uçtan uca henüz gerçek tarayıcıda doğrulanmadı.
3. **Online program için sabit Meet linkini kaydet:** Yönetim panelindeki Pazartesi kuralını düzenleyerek bir kez ekle.
4. **Gmail bağlantısı:** Yönetim paneli `E-posta Otomasyonu` bölümünden gizli bir köprü anahtarı üret. Anahtarı yalnızca Apps Script proje özelliklerine `ESC_LIVE_BRIDGE_TOKEN` olarak yapıştır, **sohbet veya Sheets'e göndermeyin**.
5. `ESC_Live_Gmail.gs` dosyasını Apps Script projesinde **ayrı dosya** olarak ekle. `ESC_LIVE_setup` ve `ESC_LIVE_preview` ile tetikleyicileri kontrol et. Bunlar katılımcıya e-posta göndermez.
6. Test alıcısına kontrollü teslimat yapıp kayıt/onay/değişiklik/iptal/hatırlatma/teşekkür kurallarını doğruladıktan sonra iki ayrı gönderim anahtarını etkinleştir.
7. Eski Sheets e-posta anahtarı her zaman KAPALI kalmalı; yeni sistem kurulumuyla paralel gönderim çalışmamalı.

## Önemli sınır

**Sitenin statik kod yayını ve veritabanı testleri tamamlanmış olsa da**, oturum açılmış gerçek kullanıcı ile görsel tıklama testi ve gerçek Gmail teslimat testi yapılmadı. Bu iki kontrol olmadan “tam otomatik e-posta çalışıyor” demeyin. Kullanıcının bilgisayarı kapalıyken Supabase zamanlayıcıları çalışır; Gmail gönderimi ancak bir defalık yetkilendirmeden sonra etkinleşebilir.


## 15 Ekim 2026 — Yönetim paneli butonları ve veri kaynakları düzeltmesi

**Canlı yayına alındı:** GitHub Pages yayın işlemi `eec254c7a9` sürümünde başarılı.

### Tek yetkili veri kaynağı haritası
- **Canlı Etkinlik Yönetimi (`/admin/#dynamicEvents`) → Supabase `esc_events`.** Etkinliğin gününü, saatini, yerini, durumunu, yayını ve kayıtların açık/kapalı olmasını değiştirir.
- **Tekrarlayan Etkinlikler → Supabase `esc_event_rules`.** Yeni haftaların programını belirler. Daha önce açılmış/elle düzenlenmiş etkinlikler kendiliğinden başka güne taşınmaz.
- **Fiyatlar & Site Ayarları (`/admin/#events`) → Supabase CMS `event_config` fiyat alanları.** Yalnızca fiyatları yayınlar; tarih, mekân, katılımcı alanlarını değiştirmez. Eski etkinlik formu gizlendi.
- **Canlı Site Editörü (`/admin/#siteEditor`) → Supabase CMS sayfa içeriği.** Site metni/görsel/SEO; etkinlik programı değil.
- **Google Sheets → Eski finans ve katılım arşivi.** `Etkinlikler!A1:A2` açıklamaları güncellendi. Eski takvim ve e-posta anahtarları `KAPALI`.
- **E-posta Otomasyonu → Supabase bildirim kuyruğu/Gmail köprüsü.** Gerçek otomatik gönderim şimdilik `KAPALI`.

### Onarılan işlemler
1. **Taslak kaydet** ile **Kaydet ve Yayınla** birbirinden ayrıldı.
2. Her etkinlikte **Yayınla / Yayından kaldır** düğmesi var. Yayından kaldırmak kayıt alımını kapatır ama eski kişileri silmez.
3. **Düzenle** aynı ETK numarasını koruyarak tarih, saat ve mekânı değiştirir; sürüm çatışmaları kontrol edilir.
4. Hatalı tarih/saat/link ve kaydetme hataları formda gösterilir.
5. Haftalık kural değişikliği anında güvenli `esc_admin_refresh_schedule()` kontrolünü çalıştırır.
6. Yönetim panelindeki sekme URL adresinde korunur.
7. Dashboard ana veri kaynaklarını açıklar, Site Editörü etkinlik yönetimine yönlendirir.
8. Tarayıcı önbelleğini engellemek için `admin/index.html` JS sürümleri `20261015-buttons1` olarak değiştirildi.

### Testler ve güvenlik
- 7 örnek veri UI testi geçti: liste, yayından kaldırma, yeniden yayınlama, yerinde düzenleme, yeni etkinliği yayınlama, ayrı fiyat ekranı ve fiyat yayınlarken etkinlik bilgisini koruma.
- Gerçek yönetici rolüyle Supabase düzenleme/yayınlama ve CMS sayfa yayınlama RPC testleri **ROLLBACK** içinde başarılı. Üretimdeki test kayıtları kalıcı bırakılmadı.
- GitHub Pages yayın iş akışı `eec254c7a9` için başarılı.
- Üretimde Gmail köprüsü kapalı; e-posta teslim sayısı sıfır.

### Henüz gerçek tarayıcıda doğrulanmayanlar
Yönetici oturumu ile bütün butonların gerçek tıklama testi yapılmadı. Kullanıcı Mac'te Cmd+Shift+R ile sert yenileme yaptıktan sonra Düzenle, Yayınla, Fiyatları yayınla ve haftalık kural kaydını denemeli. Devam eden hata varsa ekran görüntüsü veya tam hata metni gerekli.

## 16 Ekim 2026 — Haftalık program kayıt hatası düzeltildi

- Yönetim paneli `esc_admin_save_weekly_rule` RPC'sini çağırıyordu ancak işlev Supabase'de eksikti. Güvenli yeni fonksiyon migration `esc_weekly_rule_atomic_admin_save_20261016` ile veritabanına eklendi.
- İşlev yalnızca yetkili etkinlik yöneticileri için kullanılabilir. Haftalık kuralı atomik kaydeder, kullanıcı işaretlerse gelecekteki uygun etkinlikleri tarih ve saat bakımından günceller ve yinelenen etkinlik oluşturucusunu çalıştırır.
- `manual_override=true` olan, katılımcı kaydı olan, iptal edilmiş ya da tamamlanmış etkinlikler koruma altındadır. Geçmiş tarih ve aynı saat/tür çakışması kontrolleri vardır.
- RPC gerçek yönetici JWT bağlamında bir transaction ile test edildi; `saved=true` ve `protected_manual=5` döndü. Bu, beş online etkinliğin manuel korumalı olduğunu gösterir.
- İkinci geri alınan testte ETK-016 etkinliğinin `manual_override` işareti geçici kaldırıldı; saat 20:30 ve yeni mekân bilgisi doğru güncellendi. Transaction ROLLBACK ile üretim verileri korunmuştur.
- Kullanıcı e-posta sistemini etkinleştirmedi; gerçek e-posta gönderimi halen KAPALI. Son tarih/saat değişiklikleri test dışında yapılmadı.
- Önemli ürün tercihi: Mevcut manuel düzenlemeli etkinlikleri otomatik güncellemiyoruz. Yönetici isterse tekil etkinliği düzenlemeli ya da ileride açık onayla toplu güncelleme ekranı hazırlanmalı.

## 16 Ekim 2026 — Yönetici girişi (HTTP 200 sonrasında SQLSTATE 25006) düzeltmesi

- Kullanıcının 09.19 TRT ekran görüntüsünde yönetici girişinde `cannot execute INSERT in a read-only transaction` hatası görüldü.
- Supabase `auth_logs` girişin gerçekten başarılı olduğunu (POST /token HTTP 200) gösterdi. Giriş şifresinde sorun yok.
- Supabase `postgres_logs` hata kaynağını doğrudan gösterdi: `esc_internal.check_api_request()` fonksiyonu PostgREST'in salt okunur RPC/SELECT işleminde `private.api_rate_limits` tablosuna INSERT yapmaya çalışıyordu (SQLSTATE 25006).
- Hata aynı salt okunur işlemle kontrollü biçimde yeniden üretildi.
- Veritabanı güvenlik fonksiyonu düzeltildi: `transaction_read_only=on` durumunda SQL'e yazan hız-limit kaydı atlanıyor; yazılabilir POST/PUT/PATCH/DELETE isteklerinde limit kodu çalışmaya devam ediyor.
- Düzeltmeden sonra gerçek `authenticated` rolü simülasyonunda `is_esc_admin()=true`, `esc_can_manage_events()=true` ve yönetici profilinin erişilebilir olduğu doğrulandı.
- Hız limiti yazma testi transaction içinde 1 geçici kayıt oluşturdu; ROLLBACK ile silindi. Şifre ve kullanıcı profilleri değiştirilmedi.
- Kalıcı migration: `supabase/migrations/20261016_esc_auth_readonly_rpc_guard.sql`.
- **Gerçek kullanıcının tarayıcısından yeniden giriş yapması henüz doğrulanmadı.** Önerilen doğrulama: `https://eryamanspeakingclub.com/admin/#dynamicEvents` adresinde Cmd+Shift+R ve tekrar giriş.


## 16 Ekim 2026 — Sol yönetim sekmeleri açılamıyor hatası düzeltildi

**Bulunan iki teknik neden:**
1. `admin/admin.js`, `go(view)` fonksiyonunda `$('#nav button').forEach(...)` çağırıyordu; `$` tek HTML elementi döndürdüğünden `forEach` bir JavaScript hatası veriyor ve menü değişimi duruyordu. Kod `document.querySelectorAll('#nav button').forEach(...)` ile düzeltildi. GitHub commit: `8e19da2e8ddcaeff026b0801c747535f8301e61b`.
2. `admin/admin.css` içinde `.auth-shell{display:grid}` ve `.app-shell{display:grid}` tarayıcının HTML `hidden` özniteliğini etkisiz bırakıyordu. Böylece giriş formu ile panel aynı anda görünüyordu. Genel `[hidden]{display:none!important}` kuralı eklendi. Commit: `4c490913adc4c03e683a620ec753e7c5406eeaf0`.

**Yayın:** `admin/index.html` dosyasında CSS/JS versiyonları yenilendi (`navfix1` / `navfix2`). GitHub Pages yayını `2520256ea13d9ca5b3e96b9375cee6162ca8d3a3` için başarılı.

**Test:**
- `admin.js` modül navigasyonu 9 sekme için çalıştı: içerik, URL hash ve aktif menü tam eşleşti.
- Chromium tarayıcı testi: girişten önce yalnızca giriş formu göründü, giriş sonrası yalnızca panel göründü; iki ayrı menü düğmesi tıklandı ve içerik değişti.
- Bu değişikliklerde veritabanı, mevcut etkinlik/katılımcı kayıtları ve e-posta gönderim ayarları değiştirilmedi.
- Gerçek kullanıcının kimlik doğrulanmış Safari oturumundaki son tıklama testi henüz kullanıcı tarafından teyit edilmedi.

**Kullanıcı kontrolü:** `https://eryamanspeakingclub.com/admin/#dynamicEvents` adresini aç, Mac'te Cmd+Shift+R ile yenile ve soldan farklı sekmelere tıkla.
