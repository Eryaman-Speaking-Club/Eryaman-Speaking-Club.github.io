# Eryaman Speaking Club — Dinamik Etkinlik Sistemi Teslim ve Devam Dosyası

**Tarih:** 14.10.2026  
**İşin kalıcı kaydı:** [GitHub PR #10](https://github.com/Eryaman-Speaking-Club/Eryaman-Speaking-Club.github.io/pull/10)  
**Çalışma dalı:** `feature/esc-email-automation`  
**Canlı yayın durumu:** HENÜZ YAYINLANMADI (taslak PR; `main` ile birleştirilmedi)  
**Gerçek katılımcılara e-posta gönderimi:** KAPALI

## Hedef
Etkinliklerin haftalık şablondan otomatik oluşturulması; fakat yönetim panelinden bir etkinlik tarihi, saati, mekânı veya durumu değiştirildiğinde bu güncellemenin aynı etkinlik numarası ve katılımcı listesiyle korunması. Tek gerçek veri kaynağı Supabase olacak. Google Sheets'teki eski otomasyon, yayın tamamlanmadan iki yönlü bir sisteme dönüşmeyecek.

## Somut tamamlanan işler
1. Supabase dinamik etkinlikler, haftalık kurallar, kayıtlar, olay değişiklik geçmişi, bildirim kuyruğu ve mesaj şablonları için tablolar oluşturuldu.
2. `ETK-013`–`ETK-022` arasında **10 planlı etkinlik** Supabase'e aktarıldı. 18 Ekim–16 Kasım 2026 arası örnekler var.
3. PostgreSQL zamanlayıcıları aktif:
   - `esc-dynamic-events-daily`: `17 0 * * *` (UTC), gelecekteki etkinlikleri otomatik üretir.
   - `esc-event-notification-intents`: `*/15 * * * *`, gönderim amaçlı uygun mesaj kuyruğunu hazırlar, **e-posta göndermez**.
4. GitHub üzerinde `admin/admin-dynamic-events.js`: yeni etkinlik, erteleme, mekân/tarih değişikliği, iptal, tamamlanma, katılımcı görünümü ve haftalık kural düzenleme.
5. `events/index.html`: Supabase'den yaklaşan etkinlikleri alarak etkinlik bazında kayıt sayfası.
6. `supabase/functions/esc-event-register/index.ts`: e-posta onayıyla güvenli kayıt servisi olarak Supabase'de dağıtıldı.
7. `event-config.js`: web sitesinde bir sonraki gerçek yüz yüze etkinliği Supabase'den okuma ve geçmiş tarihli etkinliği gizleme.
8. `admin/admin-email-automation.js`: mesaj şablonu düzenleme, önizleme, sunucu anahtarı ve kontrol paneli.
9. `supabase/functions/esc-email-bridge/index.ts`: sadece sunucular arası erişim için bildirim kuyruğu köprüsü; Supabase'de dağıtıldı.
10. `automation/email/ESC_Live_Gmail.gs`: ayrı Apps Script Gmail işçisi, bir defalık kurulum ve kontrol fonksiyonları.
11. Gmail eski `Kod.gs` dosyasına dokunulmadı; mevcut Google Sheets kayıtları silinmedi.

## Kontrol/test sonuçları
- GitHub PR #10 açık, **draft**, `main` dalıyla **merge edilmedi**.
- Kodların JS/GAS sözdizimi kontrolü başarıyla geçti.
- Supabase'de **10 etkinlik** ve **2 etkin PostgreSQL zamanlayıcı** doğrulandı.
- Tekrarlama fonksiyonunun tekrar çalıştırılması yeni kopya etkinlik oluşturmadı.
- Genel kullanıcı için sınırlandırılmış etkinlik görünümü çalışıyor; ham `esc_events` tablosuna anonim doğrudan okuma engellendi.
- Etkinlik kayıt + bildirim kuyruğu SQL testi **ROLLBACK** ile yapıldı; deneme katılımcısı kalıcı olarak eklenmedi.
- Son kontrol: gerçek kayıt sayısı **0**, mesaj kuyruğu **0**, yeni e-posta bağlantı anahtarı oluşturulmadı.
- Gerçek tarayıcıdan baştan sona kayıt, e-posta teslimi, yönetici yetkileri ve kullanıcı deneyimi **henüz doğrulanmadı**. Bu nedenle sistemin tamamen üretime hazır olduğu söylenemez.

## Önemli güvenlik durumu
1. Yeni Gmail köprüsü anahtarının oluşturulması ve aktif edilmesi bekliyor. Bu anahtar **sohbette/GitHub'da/Sheets'te saklanmamalıdır**.
2. E-posta köprüsü veritabanı anahtarı oluşturulmadığından katılımcılara otomatik e-posta gönderilemez.
3. Eski `E-posta Otomasyonu!B2` **KAPALI kalmalıdır**; iki sistem aynı anda hatırlatma yollamamalıdır.
4. Eski Google Sheets üyeleri otomatik olarak yeni kayıt sistemine aktarılmadı. E-posta alıcıları yalnızca ilgili etkinliğe açık rızasıyla kaydolan kişiler olmalıdır.
5. Değiştirilen veya iptal edilen etkinlikler aynı etkinlik kimliği altında saklanır; geçmişe dönük hatırlatma engellenir.

## Geri dönüldüğünde yapılacaklar (öncelik sırası)
1. **PR #10'u gözden geçir ve `main` dalına birleşme çatışması olmadan taşı.** Dal ana dala göre 4 commit geride; başka site değişikliklerini ezme.
2. Siteyi güncelledikten sonra `/admin/#dynamicEvents` ve `/events/` ekranlarını bir tarayıcıda kontrol et. Görsel, tarih/saat/mekân, yetki ve kayıt işlemlerini ayrı ayrı test et.
3. Test e-postası üzerinden gerçek kayıt yap, etkinlik iptali/ertelemesi ve kontenjan doğrulaması yap. Test kişilerini sil veya test veritabanı üzerinden işlem yap.
4. Yönetim paneli `E-posta Otomasyonu` bölümünden tek seferlik köprü anahtarı oluştur. Yalnızca Apps Script proje özelliklerine ekle.
5. `ESC_Live_Gmail.gs` dosyasını mevcut Apps Script projesine ayrı bir dosya olarak ekle; `ESC_LIVE_setup` ve `ESC_LIVE_preview` çalıştır. Tetikleyicileri doğrula.
6. Yeni sistemi açmadan önce eski `E-posta Otomasyonu!B2` anahtarının KAPALI olduğunu kontrol et.
7. Küçük kontrollü deneme ile hatırlatma, iptal, erteleme ve teşekkür mesajlarını doğrula; ancak bundan sonra Gmail/sunucu anahtarını etkinleştir.
8. Supabase cron geçmişi, teslim durumları ve hata günlüklerinin izlenmesini doğrula.

## Kalıcı kaynaklar
- [Taslak PR #10](https://github.com/Eryaman-Speaking-Club/Eryaman-Speaking-Club.github.io/pull/10)
- [Dinamik etkinlik yönetimi](https://github.com/Eryaman-Speaking-Club/Eryaman-Speaking-Club.github.io/blob/feature/esc-email-automation/admin/admin-dynamic-events.js)
- [Yeni kayıt sayfası](https://github.com/Eryaman-Speaking-Club/Eryaman-Speaking-Club.github.io/blob/feature/esc-email-automation/events/index.html)
- [Gmail işçisi](https://github.com/Eryaman-Speaking-Club/Eryaman-Speaking-Club.github.io/blob/feature/esc-email-automation/automation/email/ESC_Live_Gmail.gs)
- [Supabase migration](https://github.com/Eryaman-Speaking-Club/Eryaman-Speaking-Club.github.io/blob/feature/esc-email-automation/supabase/migrations/20261014_esc_dynamic_events.sql)

**Not:** Buradaki “çalışıyor” değerlendirmesi yalnızca test edilen bileşenleri kapsar. Canlı site `main` dalından yayınlandığı için bu PR birleştirilmeden yeni yönetim ekranları canlı sitede görünmez.
