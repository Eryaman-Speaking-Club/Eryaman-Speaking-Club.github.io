# Eryaman Speaking Club — Bağımsız E-posta Gönderimi (Resend)

> **Durum: Kurulum hazır, dış servis doğrulaması bekleniyor.**
> Bu sistem ChatGPT, Google Apps Script, Gmail hesabına erişim veya açık bir bilgisayar gerektirmez.
> Supabase veritabanı, Edge Function ve Cron; Resend API ile otomatik çalışır.
> Gerçek gönderim yalnızca aşağıdaki alan adı + API anahtarı doğrulamasından sonra başlar.

## Akış

Öğrenci rezervasyon talebi gönderir → Supabase ders kaydı ve bildirim kuyruğu → Supabase Cron (her 2 dakikada bir) → \`esc-lesson-resend\` Edge Function → Resend → öğretmen / öğrenci adresi.

- Yeni ders: \`admin_new\` → \`eryamanspeakingclub@gmail.com\`, \`student_received\` → öğrenci.
- Öğretmen onayı: \`student_confirmed\` → öğrenciye Google Meet linki.
- Hatırlatmalar: \`reminder_24h\` ve \`reminder_1h\` → öğrencinin hesabındaki adres.
- İptal: \`student_cancelled\` → öğrenci.
- Takvim dışı alternatif saat talebi → \`eryamanspeakingclub@gmail.com\`.
- Birebir ders süresi 50 dakikadır. Rezervasyon başvurusu ile kesin ders onayı farklı durumlar olarak kalır.
- **Önemli:** Resend gönderici e-postası başka olabilir; öğretmen bildirimleri mevcut Gmail gelen kutusuna *alıcı olarak* iletilir. Gmail hesabını hiçbir yere bağlamak gerekmez.

## 1 — Gönderici alan adını doğrula

1. Kendi hesabınla [Resend](https://resend.com/) üzerinde kayıt oluştur.
2. [Domains](https://resend.com/domains) → Add Domain → \`eryamanspeakingclub.com\`.
3. Resend'in gösterdiği **kesin DNS kayıtlarını** alan adının DNS yönetimine ekle (ör. Cloudflare hesabında ilgili DNS bölümü). TXT/DKIM/SPF/MX adları/değerleri için **Resend panelindeki kayıtları esas al**; değerleri tahmin etme.
4. Resend'de Verify butonunu kullan; durum **Verified** olmadan gönderimi açma.

Mevcut web sitesinin A/CNAME kayıtlarını ve Gmail'e/başka bir servis sağlayıcısına ait mevcut gelen-posta MX kayıtlarını silme. Resend'in göndermeye özel önerdiği DNS kayıtlarını dikkatle ekle. İstersen \`notify.eryamanspeakingclub.com\` gibi bir alt alan adından da gönderim yapabilirsin; bu durumda aşağıdaki FROM adresini o doğrulanmış alt alan adına göre güncelle.

Resend belgesi: https://resend.com/docs/dashboard/domains/introduction

## 2 — API anahtarını yalnızca Supabase sunucusuna ekle

Resend → API Keys bölümünde **gönderim yetkili** bir anahtar oluştur. Anahtarı **buradaki sohbet ekranına, GitHub'a, sitenin HTML/JS dosyalarına, ekran görüntüsüne veya öğrenci paneline koyma.**

Supabase projesi: https://supabase.com/dashboard/project/bshzakigvtyjilolsfjp

Supabase Dashboard → Edge Functions → Secrets bölümüne şu üç gizli değişkeni ekle:

| Secret key | Değer | Not |
|---|---|---|
| \`ESC_RESEND_API_KEY\` | Resend'den aldığın \`re_...\` anahtarı | Yalnızca sunucu |
| \`ESC_RESEND_FROM\` | \`Eryaman Speaking Club <bildirim@eryamanspeakingclub.com>\` | Domain doğrulanmış olmalı |
| \`ESC_RESEND_ENABLED\` | \`true\` | **Yalnızca Resend alan adı Verified ise** |

Önce API key + FROM kaydedilip \`ESC_RESEND_ENABLED=false\` bırakılabilir. Böylece hiçbir gerçek e-posta gönderilmez. DNS Verified olduktan sonra \`true\` yapılabilir. Supabase sırları Edge Function'a otomatik ulaştırır; kodu yeniden dağıtmak gerekmez.

**Güvenlik:** Her 2 dakikada bir yapılan çağrının 80 karakterlik rastgele erişim tokenu Supabase Vault içinde saklıdır. Bu token asla GitHub'da veya sayfa kodunda bulunmaz. Başka bir Gmail/GPT bağlantısı gerekmiyor.

## 3 — Çalışma ve gönderim kontrolü

- Öğretmen panelini aç: https://eryamanspeakingclub.com/ozel-dersler/yonetim/
- Yetkili ESC yönetici hesabıyla giriş yap; **E-posta bildirimleri** bölümündeki Resend durumunu incele.
- Sunucu otomasyonu: Supabase Cron job adı \`esc-resend-private-lesson-mail\`, zamanlama \`*/2 * * * *\`.
- Edge Function: \`esc-lesson-resend\` (source: \`supabase/functions/esc-lesson-resend/index.ts\`).
- Alıcı adresi yönetim panelinin **Bildirim alıcı e-posta** alanından düzenlenebilir.
- Gerçek test: Yeni bir gelecekteki ders talebini test öğrenci hesabıyla oluştur; yönetici Gmail'in Gelen Kutusu / Spam / Tanıtımlar klasörlerini ve Resend Dashboard Email Logs'u kontrol et. Talebi onaylayıp öğrenciye Meet bağlantısı ve hatırlatma içeriğinin gitmesini ayrıca dene.
- **\`sent\`** = Resend API gönderimi kabul etti ve sağlayıcı mesaj ID'sini döndürdü. **Gelen kutusuna teslim** için Resend email event / delivery log'u ayrıca incelenmeli.

## Eski e-postalar ve çift gönderim güvenliği

Yeni sistemin kurulmasından **önce** oluşmuş eski bekleyen mesajlar otomatik gönderilmez; bu, günler önceki öğrencilere yanlışlıkla toplu e-posta gitmesini önler. Yeni sistem açıldıktan sonra oluşan ve halen geçerli derslere ait bildirimler işlenir.

Gönderim sırasında zaman aşımı veya sunucu hatası oluşursa mesaj \`uncertain\` olur; **otomatik tekrar gönderilmez**. Resend'in \`Idempotency-Key\` başlığı 24 saatlik çift gönderim koruması sağlar ama daha eski belirsiz gönderimleri manuel incelemek gerekir.

Supabase içinden kontrol:
~~~sql
select public.esc_lesson_email_delivery_overview();
select status,kind,count(*) from public.esc_lesson_mail_queue group by status,kind order by status,kind;
select status,count(*) from public.esc_lesson_time_request_mail group by status;
select jobid,jobname,active,schedule from cron.job where jobname='esc-resend-private-lesson-mail';
~~~

**Gizli anahtarların içeriğini, Vault tokenunu veya servisin şifresini sorgulara / GitHub'a koyma.**

## Sürdürme ve GPT bağımsızlığı

Sistemin yürütülmesi yalnızca Supabase + Resend'e bağlıdır. ChatGPT'yi aradan çıkardığında öğrenci girişi, 50 dakikalık ders rezervasyonları, Yağmur takvimi ve e-posta otomasyonları (servis etkinse) çalışmaya devam eder. Supabase Cron, sunucuda çalışır; Mac bilgisayarını açık bırakmak gerekmez.

Eski \`integrations/esc-lesson-gmail-worker.gs\` dosyası **artık aktif önerilen kurulum değildir**. Gmail Apps Script çalıştırmanı veya Gmail'i ChatGPT'ye bağlamanı önermiyoruz. Önceden açılmış Gmail tetikleyicileri varsa eski ve yeni işleyicilerin birlikte gönderim yapmadığını kontrol et.
