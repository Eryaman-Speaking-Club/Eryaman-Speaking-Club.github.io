# ESC E-posta Otomasyonu (Gmail + Google Sheets)

Bu modül, mevcut **Yönetim Paneli** Google Sheets dosyası üzerinde çalışacak bir Google Apps Script taslağıdır. Canlı site, Supabase ve WhatsApp hesapları değiştirilmez. Bu depo içindeki `ESC_Email.gs` dosyası tek başına çalışmaya başlamaz: **ilgili Google Sheets dosyasına Apps Script editörü üzerinden eklenmesi ve Gmail hesabıyla yetkilendirilmesi gerekir.**

## Mevcut veri kaynakları

- **Kayıt Formu**: A = zaman damgası, B = ad-soyad, E/O = e-posta, N = iletişim onayı. *Yeni Google Form cevabı* için `onFormSubmit` tetikleyicisi kullanılır.
- **Kayıtlar**: A = üye no, C = ad, D = e-posta, P = iletişim onayı; satır 5'ten itibaren. Bu sayfa mevcut kayıt formundan formüllerle beslenir; formüller değiştirilmez.
- **Etkinlikler**: A = etkinlik no, B = tarih, C = saat aralığı, D = tür, E = tema, F = mekân/platform, M = durum; satır 5'ten itibaren.
- **Katılım Yüz Yüze / Katılım Online**: A = etkinlik no, B = üye no, E = listede, F = katıldı; satır 4'ten itibaren.
- Yeni oluşan **E-posta Otomasyonu**: B2 = `KAPALI` (başlangıç durumu) veya `AÇIK`; B3 = yetkili Gmail adresi; **B4 = otomasyonun başlangıç tarihi**. Bu tarihten önce başlayan etkinlikler asla otomatik bildirim almaz. B4 `ESC_EMAIL_setup` sırasında yalnızca boşsa atanır.
- Yeni oluşan **E-posta Günlüğü**: tekil gönderim kimliği, tür, durum ve hata kaydı.
- Yeni oluşan **E-posta Engelleme**: A sütununda gönderim yapılmaması gereken adresler.

**Dikkat:** Sitedeki Google Form için halihazırda `Kayıt Formu` yanıt sayfasının güncellendiğini kontrol edin. Var olan Google Form bağlantısı farklı bir hesap/tabloya geçirilmişse önce form–tablo bağlantısını doğrulayın. `Form Yanıtları 7` ise katılım geri bildirim formudur ve bu otomasyonun kayıt kaynağı değildir.

## Kurulum (yalnızca yetkili ESC yöneticisi)

1. ESC Google hesabıyla **Yönetim Paneli** Google Sheets dosyasını açın ve **Uzantılar → Apps Script** yolunu izleyin.
2. Mevcut kodları silmeden **+ → Komut Dosyası** ile `ESC_Email.gs` adlı yeni bir dosya oluşturup bu depodaki `automation/email/ESC_Email.gs` içeriğini yapıştırın.
3. **Proje Ayarları → Saat dilimi:** `Europe/Istanbul` olarak ayarlayın.
4. `ESC_EMAIL_setup` fonksiyonunu çalıştırın ve izinleri doğrulayın. İlk kurulumda yardımcı sekmeler ile tetikleyiciler oluşturulur. **Sürüm yükseltmesinde bu fonksiyonu tekrar çalıştırın:** sadece `ESC_EMAIL_runScheduled` tetikleyicisi 15 dakikalık kontrollere yükseltilir; diğer `Kod.gs` / `onEdit` tetikleyicileri korunur. Kurulum tek başına **hiçbir katılımcıya e-posta göndermez**.
5. `E-posta Otomasyonu!B3` hücresinin Apps Script'i yetkilendiren **eryamanspeakingclub@gmail.com** hesabıyla eşleştiğini doğrulayın.
6. Kodun güncel sürümünü kullandığınızı kontrol edin; `ESC_EMAIL_setup` tekrar çalıştırıldığında B4 başlangıç tarihi mevcut değer korunarak hazırlanır.
7. `ESC_EMAIL_test` fonksiyonunu çalıştırın. **Yalnızca gönderici hesabına** bir test mesajı gider.
8. **`ESC_EMAIL_plan`** fonksiyonu (isteğe bağlı), katılımcılara mesaj göndermeden gelecekteki etkinliklerin planlanan 24 saat öncesi hatırlatma zamanını ve o anki alıcı sayısını günlüğe yazar. 
9. `ESC_EMAIL_preview` fonksiyonunu çalıştırıp Apps Script çalışma günlüklerini kontrol edin. Bu fonksiyon gerçek e-posta göndermeden mevcut etkinliklere göre kaç bildirimin uygun olduğunu gösterir.
10. Gerçek aktivasyon için önce formdaki iletişim onayını, katılımcı listesindeki e-postaları, etkinlik durumlarını ve tarihlerinin doğruluğunu kontrol edin. B2 değerini yalnızca hazırlıklar bittikten sonra **AÇIK** yapın.

## Gönderim mantığı

- **Yeni kayıt onayı**: Yalnızca aktivasyondan **sonraki** `Kayıt Formu` gönderimlerinde, geçerli e-posta ve açık iletişim onayı varsa. Her adrese en fazla bir otomatik hoş geldin e-postası.
- **Etkinlik hatırlatması**: Durumu `Planlandı` olan bir etkinliğe ilgili katılım sayfasında **Listede = TRUE** olarak bağlanan üyelere, etkinlikten **24 saat önce başlayan bir saatlik pencerede** gönderilir. Örnek: 18 Ekim 18.00 etkinliği için 17 Ekim 18.00–19.00 aralığı. Yükseltme sırasında eski saatlik tetikleyici **15 dakikalık** kontrolle değiştirilir; Apps Script dakikası dakikasına garanti etmez. Katılımcı hatırlatma penceresi geçtikten sonra eklenirse gecikmiş otomatik hatırlatma gönderilmez.
- **Etkinlik sonrası teşekkür**: Durumu **Tamamlandı** olan etkinliğe **Katıldı = TRUE** işaretli üyeler için, etkinlik bitiminden en erken 1 saat sonra ve en geç 7 gün içinde. Geriye dönük eski katılımcılara gereksiz toplu gönderim yapılmasını önlemek için açılıştan önce günlük ve etkinlik durumları gözden geçirilmeli.
- **Kod güncellemesi:** GitHub dosyasını değiştirmek, Google Apps Script editöründeki mevcut kodu güncellemez. Yöneticinin `ESC_Email.gs` içeriğini yeni sürümle değiştirip **kaydetmesi** gerekir. **Bu yükseltmede `ESC_EMAIL_setup` mutlaka bir kez yeniden çalıştırılmalıdır** ki eski saatlik kontrol 15 dakikaya geçsin. Kod kaydetmek ve setup çalıştırmak tek başına e-posta göndermez. Gerçek gönderimler için ayrıca **B2 = AÇIK** gerekir.
- **Başlangıç tarihi kuralı:** `E-posta Otomasyonu!B4` tarihinden önce başlayan etkinliklere hiçbir etkinlik bildirimi gönderilmez. Bu alan boş veya geçersizse zamanlı gönderim güvenlik nedeniyle durdurulur. Örneğin 14.10.2026 tarihli yeni kurulum 11 Ekim'de tamamlanmış bir etkinlik için geriye dönük teşekkür göndermez.
- `ESC_EMAIL_preview` yürütme günlüklerinde mesaj adayı sayısını **etkinlik ve bildirim türüne göre** listeler; kişisel e-posta adresleri loglanmaz.
- İptal edilen, tarihi eksik veya mekân/platform bilgisi olmayan etkinlikler atlanır. Bir etkinlik için katılım kaydı bulunmuyorsa otomatik hatırlatma gönderilmez.
- Tekil anahtarlar e-posta günlüğünde saklanır. Başarısız veya sonucu belirsiz gönderimler otomatik tekrar denenmez; yönetici inceler.
- Her çalıştırma en fazla **35** katılımcı mesajı göndermeye çalışır. Gmail'in günlük gönderim kotaları ayrıca geçerlidir.

## Gereken kontrol ve sınırlamalar

- Google Apps Script **çalıştırılıp yetkilendirilmeden otomasyon çalışmaz**. Bu depodaki kod geliştirici incelemesine sunulan bir hazırlıktır, aktif gönderim hizmeti değildir.
- E-posta otomasyonunu mevcut WhatsApp fonksiyonlarıyla veya eski Apps Script kodlarıyla karıştırmayın. Ana kod dosyalarını değiştirmek gerekmez.
- Yeni kayıt onayı, ödeme/katılım kesinleşmesi anlamına gelmez. Etkinlik hatırlatması için kayıtlı üye ile etkinlik bağlantısı gereklidir. Kayıt formundaki tercih alanı tek başına belirli bir etkinliğe kayıt oluşturmaz.
- Gönderen adres, script'i yetkilendiren hesapla aynı olmalıdır. Yetkisiz veya yanlış hesapta gönderim durdurulur.
- KVKK ve ticari elektronik ileti kuralları için etkinlik/kayıt bilgilendirmeleri ile pazarlama duyurularını ayırın. Açıkça pazarlama izni bulunmayan kişilere kampanya mesajı gönderilmemelidir.
- Üye mesaj istemezse **E-posta Engelleme** sekmesinin A sütununa e-posta adresini girin. Mevcut sistem otomatik abonelikten çıkış bağlantısı sunmaz; toplu promosyon gönderimi için ek izin ve abonelikten çıkma sistemi gerekir.
- Etkinlik bitişi sonrası teşekkür için **Etkinlikler!M** durumunun güncel olması gerekir. Planlandı olarak kalırsa teşekkür gönderilmez.
- Değişken etkinlik tarihleri ve veri temizliği nedeniyle ilk gerçek gönderimden önce küçük ölçekli, izinli kayıtlarla test edin.


## Düzenlenebilir e-posta şablonları

- Yönetim Paneli Google Sheets dosyasına **E-posta Şablonları** sekmesi eklendi.
- A sütunu: `reminder`, `welcome`, `thanks` sabit şablon kimlikleri.
- B sütunu: e-posta konusu, C sütunu: e-posta gövdesi, D sütunu: **AKTİF** durumu.
- Kullanılabilen değişkenler: `{{ad}}`, `{{tarih}}`, `{{saat}}`, `{{mekan}}`, `{{tur}}`, `{{tema}}`, `{{etkinlik}}`. Bilinmeyen değişken kullanılması halinde gönderim iptal edilir.
- Ödeme ve IBAN bilgileri **yalnızca erişim kontrollü Google Sheets şablonunda** bulunur; herkese açık GitHub kaynak koduna eklenmez.
- Dekont katılımcıdan **e-postayı yanıtlayarak** istenir. E-posta üzerinde WhatsApp'taki gibi “buradan” ifadesi kullanılmaz.
- Mevcut aktif Apps Script editörü GitHub'daki yeni kodu otomatik almaz. Yeni davranış için ESC yöneticisi `ESC_Email.gs` dosyasını son sürümle değiştirip kaydetmelidir.
- Bu adım **hiçbir gönderim başlatmaz**. E-posta Otomasyonu!B2 **KAPALI** tutulur.
- Etkinlik hatırlatmalarında mevcut, daha önceden ödeme yapmış veya paketi bulunan kişilerden tekrar ödeme istenmemesi gerektiği şablonda belirtilmiştir. Mevcut sistem otomatik ödeme durumu ayrımı yapmaz; gerekirse gönderimden önce katılımcılar yönetici tarafından kontrol edilmelidir.

## Performans ve yeni sürüm kontrolü (Ekim 2026)

Mevcut katılım tablolarının formül yapısı, her etkinlik için **500 ardışık satır** ayırır. İlk etkinlik 4. satırdan başlar, ETK-013 6004. ve ETK-017 8004. satırdan başlar. Eski sürümdeki `8000` satır kesmesi kaldırıldı; sistem artık sadece **zamanı gelmiş etkinliğe karşılık gelen 500 satırlık bloğu**, etkinliğin türüne göre doğru katılım sayfasından okur. Böylece 200 etkinliğe kadar olan mevcut tablo tasarımıyla uyumludur.

**Güvenli yükseltme**:

1. `E-posta Otomasyonu!B2` = **KAPALI** olarak kalsın.
2. Yalnızca `ESC_Email.gs` dosyasına GitHub'daki güncel kodu yapıştırıp kaydedin; `Kod.gs` değiştirilmez.
3. `ESC_EMAIL_setup` fonksiyonunu **bir kez** çalıştırın. Eski ESC e-posta zamanlayıcısı silinir, 15 dakikalık zamanlayıcı kurulur. Diğer tetikleyiciler etkilenmez.
4. İsterseniz `ESC_EMAIL_plan` fonksiyonunu çalıştırın: **hiç e-posta göndermez**; örneğin `ETK-013` için `17.10.2026 18:00` ve listedeki uygun kişi sayısını günlüğe yazar.
5. Gerçek otomatik gönderim, ancak ayrıca `E-posta Otomasyonu!B2` elle **AÇIK** yapılırsa gerçekleşebilir. Açmadan önce şablon, e-posta izni ve katılımcı durumları kontrol edilmelidir.

**Test kapsamı:** JavaScript sözdizimi kontrolü, kapalı anahtar, örnek zaman penceresi, tekrar göndermeme, ETK-017'nin 8004. satırda bulunması, Online/Yüz yüze tablo seçimi, hatalı blok eşleştirmesinde durma, iletişim izni, 35 mesajlık parti limiti ve tetikleyici yükseltmesi yerel sahte verilerle doğrulandı. Bunlar **canlı Google Apps Script çalıştırma testi değildir**; gerçek mesaj gönderilmedi.
