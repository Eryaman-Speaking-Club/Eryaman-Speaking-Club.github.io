# Eryaman Speaking Club | Özel ders Gmail bildirimi

**Amaç:** Öğrenci bir veya birden fazla 50 dakikalık ders talebini gönderdiğinde öğretmene eryamanspeakingclub@gmail.com üzerinden bilgilendirme gitmesi. Öğrenciye talep/teyit, Google Meet linki, iptal ve ders öncesi hatırlatmalar da kuyruğa alınır.

**Güncel durum (28 Ekim 2026):** Supabase rezervasyon tetikleyicileri ve güvenli Gmail köprüsü hazır. **Gmail Apps Script işleyicisi henüz ESC hesabından yetkilendirilmedi.** Aşağıdaki adımlar tamamlanmadan mesajların gerçekten gönderildiği söylenemez.

## 1. ESC Gmail hesabında Apps Script'i açın

eryamanspeakingclub@gmail.com hesabıyla https://script.google.com/ adresine giriş yapın. Mevcut ESC Google Sheets hatırlatma projesine yeni dosya eklemek veya bağımsız Apps Script projesi açmak mümkündür.

[esc-lesson-gmail-worker.gs](./esc-lesson-gmail-worker.gs) dosyasını kopyalayıp Apps Script projesine kaydedin. Kaynak dosyada hiçbir e-posta şifresi veya gizli token bulunmaz.

## 2. Tokenu oluşturun

Apps Script içindeki **escPrepareLessonBridge** fonksiyonunu bir kez çalıştırın. Google'ın istediği izinleri onaylayın. Bu fonksiyon:
- Gizli tokenu Apps Script'in özel Script Properties bölümünde saklar.
- ESC Supabase köprü URL'sini oraya kaydeder.
- Yalnızca tokenun **64 karakterlik SHA-256 HASH** değerini Execution log'a yazar.

HASH değerini kopyalayın; **tokenun kendisini paylaşmayın**.

## 3. Supabase'te tokenun hash'ini etkinleştirin

Supabase projesi **bshzakigvtyjilolsfjp** → SQL Editor. Aşağıdaki SQL'i çalıştırın. HASH_DEGERINI_BURAYA_YAPISTIR bölümünü gerçek 64 karakterlik hash ile değiştirin:

~~~sql
insert into public.esc_email_bridge_config(id,token_hash,enabled,updated_at)
values(
  true,
  decode('HASH_DEGERINI_BURAYA_YAPISTIR','hex'),
  true,
  now()
)
on conflict (id) do update
  set token_hash=excluded.token_hash,
      enabled=true,
      updated_at=now();
~~~

**Uyarı:** Eğer bu köprü için daha önce çalışan başka bir Gmail işleyicisi varsa token değişikliği onu etkileyebilir. Etkinlik hatırlatmalarını da kontrol edin. İnceleme sırasında mevcut bridge config kaydı bulunmuyordu.

## 4. Testi ve otomasyonu etkinleştirin

Apps Script'te sırasıyla:
1. **escLessonMailHealth()** — güvenli bağlantının etkin olduğunu doğrular (mail göndermez).
2. **escLessonSendTest()** — gerçekten bir test maili gönderir. Gmail Gönderilmiş, Gelen Kutusu ve Spam klasörlerinde kontrol edin.
3. **escLessonMailWorker()** — kuyrukta zamanlanan özel ders mailini gönderir ve sonucunu kaydeder. Önce bekleyen tarihleri kontrol edin.
4. **escInstallLessonMailTrigger()** — işleyiciyi beş dakikada bir otomatik çalıştıracak tek bir zaman tetikleyicisi oluşturur.

Google hesabı bu yetkilendirmeyi yapmadan otomatik mail gönderimi çalışmaz.

## Akış

~~~text
Öğrenci ders talebini gönderir
    → Supabase rezervasyonu kaydeder
    → Öğrenci + ESC e-posta bildirimleri kuyruklanır
    → Güvenli esc-email-bridge (lesson_claim)
    → Gmail Apps Script: MailApp.sendEmail
    → Güvenli esc-email-bridge (lesson_ack)
    → Durum: sent / uncertain / failed
~~~

- **Yeni rezervasyon:** admin_new → eryamanspeakingclub@gmail.com, student_received → öğrenci.
- **Öğretmen onayı:** student_confirmed → Google Meet linkiyle öğrenci.
- **Hatırlatma:** Dersin 24 saat ve 1 saat öncesine planlanan mesajlar.
- **Alternatif saat talebi:** Ayrı takvim dışı saat bildirim kuyruğundan ESC adresine.
- **İptal:** student_cancelled → öğrenci.
- **Güvenlik:** Servis anahtarı GitHub veya istemci kodunda bulunmaz. Worker aynı mesajı tekrar göndermemek için önce 'sending' yapar ve Gmail sonucunu kaydeder. Bağlantı kesilirse otomatik tekrar yerine manuel kontrol gerekir.
- **Teslimat:** 'sent', Gmail Apps Script'in MailApp.sendEmail çağrısını başarılı tamamladığı anlamına gelir. Alıcının gelen kutusuna kesin teslim garantisi değildir.

## Bağlantılar ve hesap yetkisi

- [Öğretmen takvim yönetimi](https://eryamanspeakingclub.com/ozel-dersler/yonetim/) — yetkili ESC yönetici hesabını gerektirir.
- [Öğrenci paneli](https://eryamanspeakingclub.com/ozel-dersler/ogrenci/) — öğrenci kendi hesabıyla giriş yapar.
- [Özel ders tanıtım](https://eryamanspeakingclub.com/ozel-dersler/)

Bir öğrenci Gmail adresi ile oturum açıldığında yönetim yetkisi hatası çıkması güvenlik açısından normaldir. Yönetici ekranında doğru ESC hesabına geçin.

## Kuyruk durumu denetimi

~~~sql
select status,kind,count(*) from public.esc_lesson_mail_queue
group by status,kind order by status,kind;

select status,count(*) from public.esc_lesson_time_request_mail
group by status;
~~~

Öğrenci rezervasyonları, e-postadan bağımsız olarak öğrenci ve öğretmen panellerinde saklanır.
