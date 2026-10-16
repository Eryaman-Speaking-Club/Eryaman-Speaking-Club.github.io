# Eryaman Speaking Club — Etkinlik ve Katılım Merkezi

**Tarih:** 16 Ekim 2026
**Hedef:** Günlük işlemleri tek sayfada yapmak. Google Sheets eski katılım sistemini korumak ve merkezi paneldeki değişiklikleri Sheets ile güvenli biçimde eşitlemek.

## Hangi veri nereden yönetilir?

- **Etkinlik ve Katılım Merkezi** (/admin/#dynamicEvents): etkinlik planı, tarih/saat/mekân, hızlı iptal, yayınlama, katılım sayıları, “Listede”, “Katıldı” ve etkinlik bittikten sonra “Gelmedi” durumu. Tek günlük kontrol ekranı.
- **Google Sheets**: Katılım Yüz Yüze, Katılım Online, Kayıtlar ve E-posta Şablonları. Katılımın kesin/veri kaynağı; panel işlemleri ancak Sheet'e yazıldıktan ve Supabase'e geri okunduktan sonra tamamlandı sayılır.
- **Supabase**: etkinliklerin yayınlandığı canlı takvim, katılım yansıması, yönetici yetkisi, senkronizasyon kuyruğu ve güvenlik kontrolleri.
- **Web sitesi**: güncel yayımlanmış etkinlikleri Supabase'den gösterir.
- **E-posta**: online/yüz yüze ayrı şablon ve fiyatlar; gönderim izni **KAPALI** kalır, ayrı Gmail testi beklenir.

## Senaryolar

1. **Etkinliği iptal et:** Yönetim panelinde ETK satırından “Etkinliği İptal Et”, onayla. Katılım ve finans kayıtları silinmez. İptal siteden anında kaldırılır ve yaklaşık 5 dakika içinde Google Sheets Etkinlikler!M alanına aktarılır. İptal Sheet içinde “İptal” seçilerek de yapılabilir; aynı etkinlik sürümü kontrol edilir.
2. **Kişiyi listeye al:** Panel > ilgili ETK > Katılımı Yönet > “Listeye Ekle”. Üye, Sheet'teki Kayıtlar listesinden gelir. İstek kuyruğa alınır; güncel Apps Script, Google Sheets blokundaki **E (Listede)** ve **F (Katıldı)** kutucuklarını kontrol edip değiştirir; ardından Supabase görünümü güncellenir.
3. **Katıldı / Gelmedi:** Google Sheets **E=true, F=true** = Katıldı. **E=true, F=false** = etkinlik bitmediyse Listede; etkinlik bittiyse Gelmedi. Gelmeden önce işaretlenmiş Katıldı geri alınabilir.
4. **Listeden çıkar:** E=false, F=false, geçmiş satır silinmez. Son kişiyi çıkarmak yalnızca açık yönetici isteği varsa ve beklenen Sheets durumu doğrulanırsa mümkündür.
5. **Aynı üye iki yerde değişti:** Eski değerin doğru olduğu kanıtlanamazsa işlem **Çakışma** olarak işaretlenir; sistem diğer taraftaki kutucuğu körlemesine ezmez.
6. **Etkinliğin türünü online/yüz yüze değiştir:** Katılımcı varsa reddedilir; yanlış Google Sheets katılım sekmesine taşınmasını önler. Önce üye taşınma planı gerekir.

## Güvenlik

- Gerçek mesaj gönderimini hiçbir kurulum veya katılım işlemi otomatik açmaz.
- Admin'den katılım yazması için hem sunucu bağlantısı hem de **Apps Script v2** son 20 dakika içinde çalışmış ve **ESC Senkronizasyon!B6=AÇIK** olmalıdır. Eski script çalışırken panel düğmeleri kilitli kalır.
- Supabase'de `esc_sheet_members` ve `esc_sheet_attendance_actions` tablolarında RLS; salt-okunur erişim sadece yetkili yöneticiye. Değişiklikler yalnızca doğrulayan RPC ile yapılır.
- Önce Sheets hücresi değiştirilir, ardından aynı ETK'nin katılımcı listesi Supabase'e gönderilir, sonra istek onaylanır. Kısmi hata durumunda tekrar deneme/kontrol mekanizması vardır.
- Kişiler ve şifre/token değerleri GitHub'da tutulmaz.

## Bir defalık kullanıcı adımı: kurulu Apps Script dosyasını güncelle

**ÖNEMLİ:** Eski ESC_Sheets_Supabase_Sync.gs dosyasına ekleme yapma, ayrı bir ikinci kopya oluşturma. **Yalnızca o dosyanın bütün içeriğini** yeni sürümle değiştir. Mevcut `Kod.gs` ve `ESC_Email.gs` dosyalarına dokunma. `ESC_SHEETS_BRIDGE_TOKEN` komut dosyası özelliği korunur; yeniden token üretmek gerekmez.

1. [Yeni senkronizasyon kodu](https://github.com/Eryaman-Speaking-Club/Eryaman-Speaking-Club.github.io/blob/main/automation/sheets/ESC_Sheets_Supabase_Sync.gs) içeriğini Raw üzerinden kopyala.
2. [Apps Script](https://script.google.com/u/0/home/projects/1DJbgDDwRPR8wtplG5hjSbfFQN76b79-oMDPuZaT_Ti0IVfSFz9nokQuI/edit) içinde aynı isimli dosyayı aç → içeriğin tamamını yenisiyle değiştir → Kaydet.
3. `ESC_SYNC_SETUP` (tetikleyicileri yenile), `ESC_SYNC_PREVIEW` (gönderimsiz) ve `ESC_SYNC_run` (gerçek senkronizasyon, **e-posta göndermez**) fonksiyonlarını sırayla çalıştır.
4. Google Sheets `ESC Senkronizasyon!B2=BAĞLANDI`, `B4=YOK`, `B5=AÇIK`, `B6=AÇIK`, `B7=KAPALI` ve `E-posta Otomasyonu!B2=KAPALI` olmalı.
5. Yönetim paneli Katılımı Yönet ekranında “Apps Script v2 bağlı” doğrula. Önce test amaçlı bir gerçek kişinin mevcut kutucuğunu değiştirmeden liste/geldi sayılarını kontrol et; sonra bir kontrollü katılım işlemi yap.

## Teknik kayıtlar

- Web: `admin/admin-dynamic-events.js`, `admin/admin-sheets-sync.js`, `admin/index.html`, `admin/admin.js`
- Google: `automation/sheets/ESC_Sheets_Supabase_Sync.gs`
- Server: `supabase/functions/esc-sheets-bridge/index.ts`
- Veritabanı: `supabase/migrations/20261016_esc_unified_attendance_v2.sql`
- Testler: ROLLBACK ile yapıldı: yönetici kuyruk oluşturma, üyeyi listeye alma, Sheet snapshot'a geri yazıldığını teyit etme, no_show türetme, tür değiştirmede güvenlik. Ön yüzde mock veriyle 6 senaryo, Apps Script yardımcı fonksiyonunda ekleme, katıldı, idempotent tekrar ve çakışma testleri.

## Son sınır

**Yeni Apps Script v2 henüz kullanıcının gerçek Google Apps Script projesine aktarılmadı.** Bu nedenle site yayımlansa bile panelden katılım yazma kapalı tutulur. Yeni sunucu işlevleri ve site paneli hazır; son çift yönlü gerçek kullanım testi için kullanıcı dosyayı bir kez güncellemeli. Google Sheets'ten mevcut katılım işaretleme eskisi gibi çalışır.
