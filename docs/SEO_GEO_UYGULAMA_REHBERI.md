# Eryaman Speaking Club — SEO & GEO Uygulama Haritası
Son güncelleme: 23 Ekim 2026. Bu doküman *nasıl uygulanır* sorusunu kod üzerinden yanıtlar. SEO/GEO teknik denetim puanları arama motoru sıralaması değildir.

## Genel mimari
- GitHub Pages: statik HTML, CSS, JS ve herkese açık dosyaları yayınlar.
- Supabase: admin CMS, etkinlik ve ölçüm verilerinin kaynağıdır.
- Gerçek organik sıralama: Google Search Console Performance raporuyla ölçülür. Bu veri GitHub veya SEO/GEO puanından alınamaz.
- GEO: yapay zekâ sistemlerinin açıkça anlayabileceği güvenilir, güncel ve erişilebilir kaynaklar üretir; ChatGPT/Gemini'de görünme garantisi vermez.

## SEO nerede uygulanır?
| Dosya | Görev | Güncelleme |
| --- | --- | --- |
| `index.html` | Türkçe ana sayfanın title, description, canonical, hreflang, schema, H1 ve gerçek içeriği | Arama niyeti veya sabit bilgiler değişirse |
| `en/index.html` | İngilizce sürümün eşdeğer meta ve içeriği | Dil sayfası değişirse |
| `events/index.html` | Etkinlik takvimi için ayrı sayfa başlığı, açıklama, canonical, CollectionPage şeması | Etkinlik sayfası değişirse |
| `games/index.html` | Ücretsiz konuşma oyunları için ayrı başlık ve açıklama | Oyun kataloğu değişirse |
| `ozel-dersler/index.html` | Birebir ders içeriğinin SEO alanları | Hizmet içeriği değişirse |
| `sitemap.xml` | Google/Bing'e keşfedilecek indekslenebilir canonical URL listesi | Sayfa eklendiğinde veya kaldırıldığında |
| `robots.txt` | Tarama izinleri ve sitemap yolu | Tarama politikası değişirse |
| `admin/admin-editor.js` | Yönetim panelindeki sayfa bazlı SEO/GEO kontrolü | Kontrol mantığı geliştirilirse |
| `esc-cms-runtime.js` | CMS metadata'sını tarayıcıda uygular; ilk HTML ile aynı olmak zorunda değildir | CMS değişirse |

Arama motoru için kritik başlık/açıklama/ana içerik mümkün olduğunca **ilk HTML yanıtında** bulunmalıdır. Supabase üzerinden tarayıcıda sonradan yapılan değişiklikler crawler tarafından her zaman görülmeyebilir. Özellikle dinamik admin SEO güncellemesinden sonra kaynak HTML'nin de yayımlanması gerekir.

## GEO nerede uygulanır?
- `index.html` ve `en/index.html` içindeki `application/ld+json`: Organization ve WebSite kimliği; gerçek sosyal hesaplar `sameAs`.
- `events/index.html`: tarihi uydurulmamış, etkinlik koleksiyonunu açıklayan CollectionPage şeması. Bireysel Event schema yalnızca gerçek, güncel, doğrulanmış etkinlik verisi varsa eklenmelidir.
- `llms.txt`: isteğe bağlı makine tarafından okunabilen kurum ve sayfa özeti. Arama motoru sıralama protokolü değildir.
- `robots.txt`: OAI-SearchBot'a açık erişim; botun erişebilmesi önerilme garantisi değildir.
- İçerik: gerçek mekân, format, yaş/seviye, koşullar, ilk katılım şartları gibi doğrulanabilir sorulara doğrudan cevap veren görünür metinler.

## Dinamik etkinlikte tek doğru veri kaynağı
- `event-config.js` geçmiş tarihli varsayılan veriyi yalnızca fallback olarak içerir. Gerçek etkinlik `esc_public_upcoming_events` kaydından gelir.
- `events/index.html` kayıtların listelendiği dinamik takvimdir.
- Statik ana sayfalarda tarihi geçmiş bir buluşmayı yaklaşan etkinlik gibi göstermeyin.
- Kayıt formunun URL'sini veya etkinlik veri modelini SEO için değiştirmeyin.
- Dinamik JS ile oluşturulan Event schema botlar için kesin görünür değildir. Gelecekte, etkinlik yayın akışında **doğrulanmış canlı veriyle** önceden oluşturulmuş HTML/Event JSON-LD üretilebilir. Geçmiş veya varsayımsal etkinlik için schema basılmamalı.

## Search Console kurulumu — yönetici işlemi
1. `https://search.google.com/search-console` adresine domain property olarak `eryamanspeakingclub.com` ekleyin.
2. Google'ın sağladığı **size özel TXT değerini** alan adını yöneten DNS paneline ekleyin. Rastgele doğrulama kaydı üretmeyin.
3. Site doğrulandıktan sonra `https://eryamanspeakingclub.com/sitemap.xml` haritasını gönderin.
4. URL Inspection ile `/`, `/en/`, `/events/`, `/games/` sayfalarını kontrol edin.
5. Performans > Search results > Queries bölümünde `Eryaman Speaking Club`, `Eryaman İngilizce konuşma kulübü`, `Ankara speaking club` terimlerini Türkiye filtresiyle değerlendirin.
6. Her hafta 28 günlük gösterim, tıklama, CTR, ortalama konum ve dönüşümü kaydedin. Yeni açılan hesaplarda veriler henüz olmayabilir.

## Bing / IndexNow
- `admin/admin.js` IndexNow URL değişiklik bildirimi yapmayı dener.
- `fetch(..., {mode:'no-cors'})` yanıtı doğrulanamaz; kodun başarılı sonuç dönmesi Bing'in indekslediğinin kanıtı değildir.
- Bing Webmaster Tools ile mülk doğrulaması ve URL'lerin gerçek durumu ayrıca takip edilmelidir.

## Örnek: yeni bir açıklayıcı sayfa yayınlamak
1. Gerçek kullanıcı sorusunu seçin: “Eryaman'da İngilizce konuşma pratiği nerede yapılır?”
2. Ayrı, özgün HTML sayfasında doğal başlık (title), gerçek açıklama (description), tek ana H1 ve soruyu yanıtlayan ilk paragraf yazın.
3. Sayfanın tam canonical URL'sini ekleyin; uygun schema yalnızca sayfanın gerçekten anlattığı şeyi yansıtsın.
4. Ana sayfa veya takvimden görünür bir `<a href="/yeni-sayfa/">` linki verin.
5. İndekslenebilir sayfayı `sitemap.xml` içine ekleyin.
6. Tarayıcıda kontrol edin; Google Search Console ile indeks ve performansı ölçün.

## Bu değişiklik paketinde yapılanlar
- Türkçe/İngilizce ana sayfadaki 11 Ekim 2026'ya ait eski metin ve bağlantılar genel etkinlik takvimine dönüştürüldü; kullanıcıya gerçek sonraki etkinlik bilgisi sunmaya devam eden JS mekanizması korundu.
- Eski tarihli etkinlik kartı JS doğrulayana kadar gizlenir; geçmiş etkinlik ilk HTML'de yaklaşan etkinlik gibi görünmez.
- Etkinlik sayfasına title, description, canonical, Open Graph, robots ve CollectionPage JSON-LD eklendi.
- `/events/` sitemap'e eklendi ve ana sayfalardan doğrudan linklendi.

## Kontrol listesi
- [ ] GitHub Pages deploy başarılı
- [ ] Gerçek domain HTTPS ve canonical yönlendirmeleri doğru
- [ ] `/robots.txt` ve `/sitemap.xml` erişilebilir
- [ ] `/events/` SSR/ilk HTML'de açıklama bulunuyor
- [ ] Search Console domain ownership doğrulandı
- [ ] 4 URL için indexing incelendi
- [ ] Yerel arama niyetine uygun özgün içerik planı oluşturuldu
- [ ] En az 28 gün gerçek performans verisi karşılaştırıldı

**Not:** Arama motoru sırası veya GEO'da tavsiye edilme oranı doğrulanana kadar hiçbir sayı başarı göstergesi olarak iddia edilmemelidir.
