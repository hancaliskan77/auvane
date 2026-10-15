# Teknik Şartname – ABD Sürümü

Oct 14, 2026 · @KadirHan

Uygulama bir kez hesaplar, sonucu saklar, kullanıcı açınca hazır olanı gösterir. Yapay zekâ yalnızca gece toplu üretimde ve premium ya da reklam karşılığında devreye girer.

## Mimari özeti

1. **Kayıt (1 kez):** Kullanıcı isim, doğum tarihi, saati ve yerini girer. Uygulama bunları sunucuya yollar (hesap yok, cihaz kimliği var). Sunucu RoxyAPI'den natal harita, Human Design, BaZi ve saat dilimini çeker, Pythagorean ve Destiny Matrix'i kendisi hesaplar, hepsini veritabanına yazar.
2. **Her gece (herkes için ortak):** Günün gökyüzü (transit) verisi kendi motorumuzla hesaplanır ve saklanır. Ücretsiz kullanıcının "günün cümlesi" bundan çıkar, yapay zekâ gerekmez.
3. **Her gece (yalnızca premium):** Kullanıcının saklı natal haritası ile bugünkü gökyüzü kıyaslanır (açı hesabı, kendi kodumuz). Sonuç yapay zekâya verilir, günlük cümle toplu üretilip saklanır. Pazartesi haftalık özet de aynı şekilde.
4. **Reklamla açılan tema:** Reklam izlenince tema özeti bir kez üretilir ve saklanır.
5. **Uygulama açılınca:** Yapay zekâ çağrılmaz. Hazır metin okunur.

## Seçilen araçlar

| Konu | Seçim | Neden |
| --- | --- | --- |
| Veritabanı ve zamanlı görevler | Supabase (Pro plan) | Yönetilen, otomatik yedek, sunucu bakımı yok |
| Sunucu kodu | TypeScript (Supabase fonksiyonları) | Uygulamayla aynı dil |
| Uygulama | React Native + Expo | İki telefon tek kod, küçük düzeltmeler mağaza onayı beklemez |
| Abonelik | RevenueCat | Apple ve Google abonelik karmaşasını o yönetir |
| Hata takibi | Sentry | Sorunu kullanıcı şikâyetinden önce görürüz |
| Astroloji verisi | RoxyAPI | Tek kapıdan çağrılır, değiştirilebilir |

Sabit gider yaklaşık 65 dolar/ay (Supabase yaklaşık 25, RoxyAPI yaklaşık 39). Fiyatlar kayıt öncesi sitelerinden doğrulanacak. Yapay zekâ gideri yalnızca premium ve reklam kullanımına bağlıdır, kimse kullanmazsa sıfırdır.

## Pythagorean numeroloji (kendi kodumuz)

Amaç: isimden ve doğum tarihinden dört sayı çıkarmak. API gerekmez.

**Harf değerleri**

| Değer | Harfler |
| --- | --- |
| 1 | A J S |
| 2 | B K T |
| 3 | C L U |
| 4 | D M V |
| 5 | E N W |
| 6 | F O X |
| 7 | G P Y |
| 8 | H Q Z |
| 9 | I R |

**Kurallar**

- Aksan ve noktalama silinir (é → e, ö → o), harf dışı her şey atılır.
- Sesli harfler: A E I O U. Y her zaman ünsüz sayılır (bilinçli basitleştirme; bazı kaynaklar Y'yi bazen sesli sayar, tutarlılık için tek kural).
- İndirgeme: rakamlar toplanıp tek haneye inilir. **11 ve 22 master sayı olarak korunur. 33, 6'ya iner** (karar: kullanıcıya gösterilecek özel sayı sayısını az tutuyoruz).
- **Expression:** isimdeki tüm harfler. **Soul Urge:** yalnız sesliler. **Personality:** yalnız ünsüzler.
- **Life Path:** ay, gün ve yıl ayrı ayrı indirgenir (11 ve 22 korunur), toplanıp yeniden indirgenir.

**Doğrulanmış test örnekleri** (beklenen değerler elle hesaplandı, kod çıktısından kopyalanmadı)

| Girdi | Beklenen |
| --- | --- |
| Alex Morgan | Expression 11 (toplam 47), Soul Urge 4 (13), Personality 7 (34) |
| 14 Haz 1993 | Life Path 6 (6 + 5 + 22 = 33 → 6) |
| 29 Kas 1990 | Life Path 5 (11 + 11 + 1 = 23) |
| 11 Nis 1996 | Life Path 22 (4 + 11 + 7) |
| 22 Nis 1992 | Life Path 11 (4 + 22 + 3 = 29) |
| 8 May 1983 | Life Path 7 (5 + 8 + 3 = 16) |
| 1 Oca 2000 | Life Path 4 |
| indirgeme(33) | 6 |
| "Zoë O'Neil" ve "Zoe ONeil" | aynı sonuç |

## Destiny Matrix (kendi kodumuz)

Amaç: doğum tarihinden 7 kart numarası (1–22) çıkarmak. Kartların anlamlarını yapay zekâ yorumlar, kodda yalnız sayılar vardır.

**Kural:** Bir sayı 22'den büyükse, 22 veya altına inene kadar 22 çıkarılır (29 → 7). 22 geçerli bir sonuçtır.

| Nokta | Hesap | Anlamı |
| --- | --- | --- |
| A | gün | Temel nokta (gün) |
| B | ay | Temel nokta (ay) |
| C | yılın rakamları toplamı | Temel nokta (yıl) |
| D | A + B + C | Merkez (kişiliğin çekirdeği) |
| E | A + D | Ruhsal yol |
| F | B + D | Kariyer |
| G | C + D | İlişkiler |

Kartların yorumları içerik aşamasında yazılır. Hesap kodu yalnızca sayı döndürür.

**Doğrulanmış test örnekleri**

| Girdi | Beklenen |
| --- | --- |
| 14 Haz 1993 | A 14, B 6, C 22 (1+9+9+3), D 20 (42), E 12 (34), F 4 (26), G 20 (42) |
| 29 Kas 1990 | A 7 |
| 1930–2012 arası çok sayıda tarih | tüm değerler 1 ile 22 arasında |

## Ay evresi ve günlük açı hesabı (kendi kodumuz)

Girdi olarak natal haritanın (RoxyAPI) ve günün gökyüzünün (kendi motorumuz) **Ekliptik boylamlar (0–360°)** kullanılır. Hesaplar tamamen yerel, çağrı gerektirmez.

**Ay evresi**

- Elongasyon = (Ay boylamı − Güneş boylamı) mod 360.
- Evre, 45°'lik dilimlerle bulunur (sınırlar 22,5° kaydırılmış): Yeni Ay, Hilal (büyüyen), İlk Dördün, Şişkin Ay (büyüyen), Dolunay, Şişkin Ay (küçülen), Son Dördün, Hilal (küçülen).
- Aydınlanma = (1 − cos(elongasyon)) / 2.

**Transit–natal açılar**

- Açı farkı = iki boylam arasındaki küçük fark (0–180°).
- Geçerli açılar: kavuşum 0°, sekstil 60°, kare 90°, üçgen 120°, karşıt 180°. Tolerans (orb) başlangıçta 5°, ürün denemesinde ayarlanabilir.
- Premium günlük cümle için yapay zekâya, günün gezegenlerinden kullanıcının Güneş, Ay ve Yükselen noktasına en yakın 3 açı verilir. Hepsi değil.
- Hesaplama tek saat dilimiyle yapılır (günün 12:00 UTC'si), böylece aynı gün herkes için aynı gökyüzü kullanılır.

**Doğrulanmış test örnekleri.** Ay ve Güneş konumları PyEphem efemeris kütüphanesiyle üretildi, evre adı beklentisi elongasyondan elle bulundu.

| Tarih (UTC) | Güneş | Ay | Beklenen evre |
| --- | --- | --- | --- |
| 14 Eki 2026 06:00 | 200,9° | 242,5° | Büyüyen hilal (elongasyon 41,6°) |
| 26 Eki 2026 12:00 | 213,1° | 37,5° | Dolunay (elongasyon 184,4°) |
| 9 Kas 2026 12:00 | 227,1° | 229,5° | Yeni Ay (elongasyon 2,3°) |

| Açı testi | Beklenen |
| --- | --- |
| 10° ve 12° | kavuşum, 2° sapma |
| 10° ve 130° | üçgen, 0° sapma |
| 350° ve 80° | kare, 0° sapma (360° sınırı geçilir) |
| 10° ve 40° | açı yok |
| 0° ve 183° | karşıt, 3° sapma |

**API ile karşılaştırma için örnek doğum:** 14 Haz 1993, 06:40 (New York yaz saati, UTC−4), Brooklyn 40,65 K 73,95 B. Efemeris sonucu: Güneş 83,38° (İkizler), Ay 17,6° (Koç), Yükselen 99,45° (Yengeç). RoxyAPI'nin sonucu Güneş ve Ay için 0,5°, Yükselen için 1° içinde çıkmalı. Fark büyükse saat dilimi ya da yaz saati hatası vardır.

## Doğum saati bilinmiyorsa

Saat bilinmeden kesin olmayan veriler vardır. Uygulama bunu gizlemez, açıkça gösterir.

| Veri | Saat yoksa | Uygulama davranışı |
| --- | --- | --- |
| Güneş burcu | Güvenilir (sınır günlerinde çok az risk) | Normal göster |
| Ay burcu | Çoğu gün güvenilir, burcun değiştiği günlerde belirsiz | Göster, sınır gününde "kesin değil" notu |
| Yükselen ve evler | Hesaplanamaz | "Doğum saatini ekleyince açılır" |
| Human Design | Hesaplanamaz (tip ve profil saate bağlı) | Aynı not |
| Pythagorean, Destiny Matrix, Çin | Saate bağlı değil (Çin'de BaZi saat sütünü hariç) | Normal göster |

**Kural:** Saat boşsa, yapay zekâya giden verilerde ilgili alanlar hiç olmaz ve komut, bunlardan söz etmemesini söyler. Yoksa uydurur. Kullanıcı saati sonradan ekleyince harita yeniden hesaplanır ve premium hikaye bir kez yeniden üretilir.

## Doğum yeri seçimi ve onay ekranı

Kullanıcı doğum yerini **yazamaz, listeden seçer.** Serbest metin hataya açıktır (Springfield, Portland gibi aynı isimli şehirler, yazım yanlışları) ve güven vermez. Aynı öneriyi Kadirhan Jovian Archive'in konum seçiminden gözlemledi.

**Kurallar**

- Yazarken öneri listesi açılır. Her satırda şehir, eyalet/bölge ve ülke görünür, böylece aynı isimliler ayırt edilir.
- Liste, uygulamanın içine gömülü bir şehir veri seti olur (GeoNames, yaklaşık 50 bin şehir, CC BY lisansı, kaynak gösterme gerekir). Faydaları: anında yanıt verir, ücretsizdir, çevrimdışı çalışır, kullanıcının yazdığı harfler sunucuya gitmez ve RoxyAPI çağrısı tasarrufı sağlar. Veri seti boyutu ve lisans kayıttan önce doldurularak doğrulanacak.
- Her şehirle birlikte enlem, boylam ve IANA saat dilimi adı gelir. Seçilmeden devam edilemez.
- Liste küçük bir kasabayı içermiyorsa, kullanıcı en yakın büyük şehri seçer ve ekranda yazar: "Yakın şehir seçildi." Konum farkeş edince Yükselen birkaç derece oynayabilir. Bu yüzden Yükselen burç sınırına 2°'den yakınsa ekranda "kesin değil" notu çıkar. Diğer hesaplar (Güneş, Ay, Human Design) konumdan etkilenmez.

**Onay ekranı (kayıttan hemen sonra, harita üretilmeden önce)**

- Ad, doğum zamanı (yerel), seçilen yer, o tarihteki saat dilimi (adı ve UTC farkı), UTC karşılığı yan yana gösterilir. "Doğru" ve "Düzenle" düğmeleri vardır. Prototipte Confirm ekranı.
- Yaz saati uygulanmışsa ekranda belirtilir. Kullanıcı hatayı burada yakalar.

**Saat dilimi uç durumları (IANA veritabanıyla doğrulandı)**

| Durum | Sonuç | Uygulama davranışı |
| --- | --- | --- |
| Rize, 21 Tem 1991 02:30 | UTC+3, UTC 20 Tem 23:30 (Jovian Archive ile aynı) | Normal |
| New York, 14 Haz 1993 06:40 | UTC−4 (yaz saati), UTC 10:40 | Normal |
| New York, 1 Kas 2026 01:30 | Belirsiz, iki an var (UTC 05:30 ya da 06:30) | "Bu saat iki kez yaşandı. Hangisi?" diye sorulur |
| New York, 8 Mar 2026 02:30 | Yok (saat 02:00'den 03:00'e atladı) | "Bu saat o gün yoktu, lütfen kontrol edin" der, devam ettirmez |
| Arizona (Phoenix) yaz | UTC−7, yaz saati yok | Normal |

Bu özel durumların her biri testtir.

## API katmanı ve RoxyAPI soruları

**Kural 1: Tek kapı.** Her dış servis (şimdilik yalnız RoxyAPI) tek bir dosyadan çağrılır. Uygulamadaki başka hiçbir yer RoxyAPI'yi bilmez. Servis değiştiğinde yalnız o dosya değişir.

**Kural 2: Sakla, tekrar çekme.** Kayıtta çekilen veri veritabanına yazılır, aynı kullanıcı için tekrar çağrılmaz. Servis bir gün çökse mevcut kullanıcılar etkilenmez, yalnız yeni kayıtlar bekler.

**Kural 3: Başarısızlıkta tekrar dene.** Çağrı başarısız olursa 3 kez, artan bekleyişle denenir. Yine olmazsa kullanıcıya "haritanı hazırlıyoruz" gösterilir ve iş arka planda sıraya alınır.

**Kayıt sırasında çağrılar (yaklaşık 4–5 çağrı/kullanıcı)**

- Şehir ve saat dilimi uygulamadaki yerel listeden gelir (API çağrısı yok)
- Natal harita
- Human Design
- BaZi (Çin)
- İşlenmiş çıktılar saklanır

**Günlük:** API çağrısı yok. Gökyüzü kendi motorumuzla hesaplanır.

**Kayıttan önce RoxyAPI'ye sorulacak sorular** (kod yazılmadan önce)

1. Plan başına aylık çağrı limiti nedir, aşılırsa ne olur? (Sitesinde limit görünmüyor.)
2. **Dönen sonucu kendi veritabanımızda saklamamıza izin var mı?** Tüm mimari buna dayanıyor.
3. Mobil uygulamada ticari kullanımının şartları ve erişilebilirlik (uptime) taahhütü nedir?
4. Doğum yeri için tarihsel saat dilimi (yaz saati, ülke değişiklikleri) doğru dönüyor mu? (Örnek doğum yukarıda; sonuç beklenen aralıkta olmalı.)

Hesap makinemiz (Pythagorean, Matrix, Ay, açılar) API'den bağımsızdır. Bunlar RoxyAPI kapansa da çalışır.

Kaynak: [RoxyAPI](https://roxyapi.com) (alan adı ve uç nokta isimleri sitesinde, 14 Eki 2026'da bakıldı).

## Yapay zekâ komutları ve maliyet tavanı

Model: Claude Sonnet serisi (Claude API). Tam model adı kod aşamasında dokümantasyondan doğrulanır.

**Ana komut (system prompt), ABD sürümü**

```text
You are a warm, perceptive guide who helps people understand themselves.
You will receive data about ONE person from several systems: Western astrology,
Pythagorean numerology, Human Design, Destiny Matrix, Chinese astrology, and the Moon.
Write ONE blended reading, never one section per system.

Rules:
- Do not list the systems one after another. When two systems point to the same
  trait, say it once. When they disagree, say so honestly ("part of you ... while
  another part ...").
- Speak to the reader as "you". Warm, plain, specific. No jargon unless you explain it.
- Never predict or promise. Use wording like "you tend to" or "you may notice".
- This is self-reflection, not fortune telling. Never give medical, legal or financial advice.
- Use ONLY the data provided. If a field is missing (for example the rising sign when
  the birth time is unknown), do not mention it and do not guess.
- Plain text only. No markdown, no emojis, no headings unless the format asks for them.
```

**Çıktı biçimleri**

| Ne | Uzunluk | Ne zaman üretilir | Kim görür |
| --- | --- | --- | --- |
| Tam hikaye (4 tema) | 600–900 kelime | Abonelik başlayınca, saat eklenince yeniden | Premium |
| Günlük cümle | 30–50 kelime | Gece toplu | Premium (kişiye özel) |
| Haftalık özet | 3–5 cümle | Pazartesi gece toplu | Premium |
| Tek tema özeti | 50–70 kelime | Reklam izlenince, 1 kez | Ücretsiz |
| Ücretsiz günün cümlesi | 1 cümle | Gece, herkese aynı | Ücretsiz (yapay zekâ yok, şablon) |

Uyumluluk analizi sonraki sürümde.

**Maliyet tavanı (zarar etmemek için)**

- Günlük harcama tavanı vardır. Başlangıç değeri 10 dolar/gün (ayarlanabilir, abone sayısıyla artar). Aşılırsa üretim durur, kullanıcıya son üretilen metin gösterilir, ekibe uyarı gider.
- Kullanıcı başına sınırlar: reklamla açılan tema günde 1, tam hikayenin yeniden üretilmesi haftada en fazla 1 (saat ekleme gibi nedenlerle).
- Premium kontrolü üretimden önce sunucuda yapılır. İstemci tarafının sözüne güvenilmez.
- Üretilen metin saklanmadan önce kontrol edilir: kelime sayısı aralıkta mı, markdown var mı, "you will" gibi kesin tahmin kalıpları var mı. Geçmezse bir kez yeniden üretilir.

## Anlam sözlüğü (yapay zekâya verilecek)

Yapay zekâya yalnız sayı vermek yetmez. Her sayının ne anlama geldiğini sözlükten alıp yanına ekleriz, böylece her kullanıcıya aynı sayı aynı anlamla anlatılır ve model anlam uydurmaz. Komuta bir kural eklenir: "Anlamları yalnız verilen sözlükten al." Aşağıdakiler **başlangıç taslakıdır**, içerik aşamasında düzenlenir.

**Numeroloji (1–9, 11, 22)**

| Sayı | Anahtar kelimeler |
| --- | --- |
| 1 | bağımsızlık, liderlik, girişim |
| 2 | işbirliği, duyarlılık, uyum |
| 3 | ifade, yaratıcılık, sosyallik |
| 4 | istikrar, çalışkanlık, düzen |
| 5 | özgürlük, değişim, merak |
| 6 | ilgi, sorumluluk, yuva |
| 7 | analiz, yalnızlık, içe dönük araştırma |
| 8 | hırs, güç, maddi ustalık |
| 9 | şefkat, tamamlama, idealizm |
| 11 (master) | sezgi, ilham, yüksek duyarlılık |
| 22 (master) | büyük şeyler inşa etmek, pratik vizyon |

Anlamın bağlamı: Life Path = ana yaşam dersi, Expression = yetenekler, Soul Urge = iç güdü, Personality = dışarıdan görünen yüz.

**Destiny Matrix (22 kart)**

| # | Kart | Anahtar kelimeler |
| --- | --- | --- |
| 1 | Magician | girişim, beceri, irade |
| 2 | High Priestess | sezgi, içsel bilgi |
| 3 | Empress | bakım, yaratıcılık, bolluk |
| 4 | Emperor | yapı, otorite, istikrar |
| 5 | Hierophant | gelenek, öğretme, değerler |
| 6 | Lovers | seçim, bağlantı, değerler |
| 7 | Chariot | hırs, yön, disiplin |
| 8 | Justice (teyit gerekli) | adalet, denge, hesap verebilirlik |
| 9 | Hermit | yalnızlık, bilgelik, içe dönüş |
| 10 | Wheel of Fortune | döngüler, değişim, şans |
| 11 | Strength (teyit gerekli) | cesaret, sabır, içsel güç |
| 12 | Hanged Man | teslimiyet, yeni bakış, duraklama |
| 13 | Death | bitişler, dönüşüm, bırakmak |
| 14 | Temperance | denge, ılımlılık, iyileşme |
| 15 | Devil | bağlanma, arzu, bağlayan alışkanlıklar |
| 16 | Tower | sarsıntı, ani değişim, atılım |
| 17 | Star | umut, yenilenme, ilham |
| 18 | Moon | sezgi, belirsizlik, hayal gücü |
| 19 | Sun | neşe, canlılık, netlik |
| 20 | Judgement | değerlendirme, çağrı, hesaplaşma |
| 21 | World | tamamlanma, bütünleşme |
| 22 | Fool | yeni başlangıç, özgürlük, güven |

Bazı Matrix kaynaklarında 8 ve 11 numaralı kartların yeri birbirine karşıt. Hangi sırayı kullanacağımız, bir Matrix kaynağıyla teyit edilmeden kodlanmaz.

**Human Design tipleri**

| Tip | Strateji | Anahtar kelimeler |
| --- | --- | --- |
| Manifestor | Harekete geçmeden önce bilgilendir | başlatıcı, bağımsız |
| Generator | Yanıt ver | sürdürülebilir enerji, üretkenlik |
| Manifesting Generator | Yanıt ver, sonra bilgilendir | çok yönlü, hızlı |
| Projector | Davet bekle | rehber, gözlemci |
| Reflector | Bir ay döngüsü bekle | ayna, çevreye duyarlı |

**Çin hayvanları ve elementleri**

| Hayvan | Anahtar kelimeler |
| --- | --- |
| Rat | çözüm üretken, hızlı |
| Ox | sağlam, çalışkan |
| Tiger | cesur, bağımsız |
| Rabbit | nazik, diplomatik |
| Dragon | özgüvenli, çekici |
| Snake | düşünceli, sezgisel |
| Horse | enerjik, özgürlük sever |
| Goat | yaratıcı, empatik |
| Monkey | zeki, oyuncu |
| Rooster | titiz, açık sözlü, çalışkan |
| Dog | sadık, dürüst |
| Pig | cömert, rahat |

| Element | Anahtar kelimeler |
| --- | --- |
| Wood | büyüme |
| Fire | tutku |
| Earth | süreklilik |
| Metal | disiplin |
| Water | uyum, derinlik |

Batı astrolojisinin (burçlar, gezegenler, açılar) anlamları modelin genel bilgisine bırakılır, çünkü geniş ve çok kaynaklıdır. Gerekirse sonra aynı biçimde sözlük eklenir.

## Abonelik, reklam, bildirim kuralları

**Abonelik (RevenueCat)**

- Ürünler: aylık 4,99 dolar, yıllık 39,99 dolar. 3 gün ücretsiz deneme yalnız yıllıkta.
- Tek "premium" yetkisi (entitlement) vardır. Sunucu, üretimden önce RevenueCat'ten yetkiyi kontrol eder.
- "Satın alımları geri yükle" düğmesi zorunludur. Hesap yok, geri yükleme Apple/Google satın alma kaydı üzerinden çalışır.
- Ekranda yenileme ve iptal metni gösterilir (prototipteki paywall metni).
- Mağaza komisyonu: Apple Small Business Program ve Google'ın ilk 1 milyon dolar indirimi ile %15 (başvuru gerekir, kayıtta doğrulanır).

**Reklam (AdMob)**

- **Reklam ana gelir değil, premium'a köprü.** ABD'de bir ödüllü reklam izlemesi yaklaşık $0,02 getirir (iOS ABD ödüllü eCPM ≈ $19,6; tek kaynak, tahmindir). Bir aylık abonelik net ≈ $4,04. Yani bir abone yaklaşık 200 izlemeye denk; reklam kullanıcıyı kırarsa kaybederiz.
- **Ödüllü reklam ana reklamdır:** günde 1 tema açma. Kullanıcı kendi seçer, en yüksek ödemeyi verir, kırmaz. İlk 2 ayda günde 2 hak A/B test edilir; deneme başlatma oranı düşmezse kalır.
- **Geçiş reklamı:** günde en fazla 1, ilk 3 oturumda yok. Yalnız bir tema okunduktan sonra gösterilir; uygulama açılışında, ilk sonuç ekranında ve paywall'un önünde/arkasında asla.
- **Banner reklam yok.** Geliri düşük (yaklaşık $0,5–2,5 eCPM) ve gizemli tasarımı bozar.
- **Reklam kategorileri engellenir:** kumar, yetişkin, siyaset, sağlık/tedavi iddiası, borç/kredi. Rakip astroloji uygulamalarının reklamı da engellenir (kullanıcıyı kaptırmayız).
- **Reklam yüklenmediyse boş yer bırakılmaz;** ödüllü hak düşmez, kullanıcıya "sonra tekrar dene" denir.
- **Başlangıçta yalnız AdMob.** İlk ay sonunda gelir verisine bakılır; gerekirse AdMob üzerinden 1–2 ek reklam ağı (bidding) eklenir, gelir artar.
- **Premium kullanıcıya hiç reklam SDK'si yüklenmez.** Yetki kontrolü reklam kodundan önce gelir.
- **Ölçüm ve geri alma kuralı:** ilk 1–2 ay reklam geliri, 1. ve 7. gün geri dönen kullanıcı ve deneme başlatma oranı izlenir. Reklam artırılan bir deney deneme başlatmayı veya geri dönmeyi düşürüyorsa geri alınır.

**iOS izin ekranı (ATT)**

- Takip izni ekranı uygulama açılışında değil, ilk sonuç ekranından sonra tek cümlelik açıklamayla çıkar.
- Reddederse kişiselleştirilmemiş reklam gösterilir (gelir biraz düşer, uygulama çalışmaya devam eder).

**Bildirim**

- Günlük 08:00 kullanıcının kendi saatinde, haftalık Pazartesi. Saat dilimi cihazdan alınır ve saklanır.
- Zamanlı görev saatte bir çalışır ve o saatte 08:00 olan kullanıcıları seçer.
- İzin ekranı ilk değer gösterildikten sonra istenir, ilk açılışta değil.
- Ücretsiz kullanıcı günlük genel cümleyi, premium kişiye özel cümleyi alır.

## Gizlilik ve onay (ABD)

Bu bölüm bir avukat kontrolü için ham maddedir, hukuki görüş değildir.

**Toplanan veri (en az)**

- İsim, doğum tarihi, saati ve yeri; cihaz kimliği; bildirim anahtarı; saat dilimi; abonelik durumu.
- Hesap, e-posta, telefon, konum izni yok.

**Onay ekranı (kayıttan önce)**

- Düz dille: "İsminiz ve doğum bilgileriniz, haritanızı ve yorumunuzu üretmek için astroloji veri sağlayıcımıza ve yapay zekâ sağlayıcımıza gönderilir." Onay kutusu boş gelir, kullanıcı işaretler. Apple'ın son kuralları kişisel verinin üçüncü taraf yapay zekâyla paylaşımı için açık izin ister (kayıt öncesi App Review Guidelines'tan doğrulanır).
- Reddederse uygulama haritasız kalır, yalnız genel içerik gösterilir.

**Zorunlu ekranlar ve bağlantılar**

- Gizlilik politikası ve kullanım şartları (uygulama içinde ve mağazada).
- "Verilerimi sil" düğmesi (CCPA/CPRA hakkı, hesap olmasa da bulunur): cihaza bağlı tüm kayıtları siler.
- Kişiselleştirilmiş reklam ABD eyalet yasalarında "paylaşım" sayılabilir: "Kişisel bilgilerimi satma/paylaşma" seçeneği ayarlarda yer alır.
- Yaş sınırı: 13 yaş altına hizmet verilmez (COPPA). Kayıtta yaş onayı alınır.
- Otomatik yenileme: Kaliforniya ve diğer eyaletlerin kuralları gereği fiyat, dönem, yenileme ve nasıl iptal edileceği açık ve kolay ulaşılabilir olmalı.
- Her yorum ekranında: "Self-reflection and entertainment. Not advice."

**Mağaza formları**

- Apple Privacy Nutrition Label ve Google Data safety: yukarıdaki veri listesine göre doldurulur.
- Apple ve Google'da ABD vergi formları (W-8BEN ile Türkiye şirketi için) muhasebeciyle doldurulur.

**Saklama süresi:** 24 ay hiç kullanılmayan kayıtlar otomatik silinir (öneri).

**Avukat/muhasebeci listesi:** gizlilik politikası, otomatik yenileme metni, ABD'de şirket gerekip gerekmediği, vergi, marka tescili (isim kesinleşince).

## Veritabanı tasarımı (Supabase / Postgres)

Kimlik: Supabase'in "anonim giriş" özelliğiyle her cihaz bir kullanıcı kimliği alır (e-posta, şifre yok). Kullanıcı yalnız kendi satırlarını okuyabilir (Row Level Security). Yazma işlemleri yalnızca sunucu fonksiyonlarından yapılır.

| Tablo | Ne saklar | Notlar |
| --- | --- | --- |
| profiles | kullanıcı kimliği, cihaz saat dilimi, bildirim saati, bildirim anahtarı, yapay zekâ onay zamanı, yaş onayı | Silinince tüm bağlı tablolar silinir |
| birth\_inputs | isim, doğum tarihi, saati (boş olabilir), yeri, enlem/boylam, doğum anındaki IANA saat dilimi ve UTC farkı | Saat bilinmiyorsa `time_known = false` |
| charts | natal harita, Human Design, Çin, numeroloji, Matrix (hepsi JSON), doğrulama durumu ve farkı, sürüm | Bir kez yazılır, saat eklenince yeniden hesaplanır |
| sky\_daily | tarih, günün gezegen boylamları | Herkes için ortak, günde 1 satır |
| readings | tür (hikaye, günlük, haftalık, tema), tema, tarih, metin, model, token sayısı, maliyet, işaret | (kullanıcı, tür, tema, tarih) tekil; aynısı ikinci kez üretilmez |
| unlocks | reklamla açılan temalar ve zamanı | Günde 1 sınırı sunucuda kontrol edilir |
| entitlements | premium aktif mi, ürün, bitiş zamanı | Yalnız RevenueCat webhook'u yazar |
| llm\_spend | gün ve toplam harcama | Günlük tavan buradan okunur |
| jobs | bekleyen işler (başarısız kayıt, toplu üretim), deneme sayısı, hata | Yeniden denemeler buradan yürür |

**Yeniden yükleme:** Anonim kimlik cihazla birlikte gider. Kullanıcı uygulamayı silip yükleyince doğum bilgilerini yeniden girer, premium ise "Satın alımları geri yükle" ile geri gelir. Hesap kurmayı bıraktığımız için bunun bedeli bu. İstenirse sonraki sürümde "Apple ile giriş" eklenir.

## Uygulama–sunucu bağlantıları ve zamanlı görevler

**Uygulamanın çağırdığı fonksiyonlar**

| Fonksiyon | Ne yapar |
| --- | --- |
| register | Onay kutusu işaretliyse isim ve doğum bilgisini alır, haritayı üretir, doğrular, kaydeder. Aynı istek iki kez gelirse ikinci kez üretmez. |
| home | Ana ekran için hazır veriyi döner: harita özeti, günün cümlesi, açılan temalar, premium durumu. Yapay zekâ çağrılmaz. |
| unlock-theme | Ödüllü reklam bitince tema özetini üretir. Günlük 1 sınırı ve reklam kanıtı sunucuda doğrulanır. |
| story | Premium tam hikayeyi döner. Yetki sunucuda kontrol edilir. |
| update-birth-time | Saati ekler, haritayı yeniden hesaplatır, hikayeyi bir kez yeniden üretir. |
| delete-me | Tüm kayıtları siler. |

**Dış dan gelen çağrılar**

- **RevenueCat webhook:** abonelik başladı, yenilendi, bitti bilgisini entitlements tablosuna yazar.
- **AdMob sunucu tarafı doğrulama (SSV):** Ödüllü reklam izlendi bilgisini AdMob sunucusu bize imzalı yollar. Bu olmadan uygulama "izledim" diye yalan söyleyip ücretsiz tema açabilir.

**Zamanlı görevler**

| Görev | Sıklık | İşi |
| --- | --- | --- |
| sky | Her gece | Önümüzdeki 3 günün gezegen konumlarını kendi motorumuzla hesaplayıp kaydeder |
| premium-daily | Her gece | Aktif abonelerin günlük cümlesini toplu üretir |
| premium-weekly | Pazartesi gecesi | Haftalık özeti toplu üretir |
| push | Saatte bir | O saatte yerel 08:00 olan kullanıcılara bildirim yollar |
| retry | 15 dakikada bir | Başarısız kayıtları ve üretimleri yeniden dener |
| cleanup | Haftada bir | 24 ay kullanılmayan kayıtları siler |

**Gökyüzü verisi için API gerekmiyor.** Gezegen konumları hesaplanır, gözlenmez. Bu yüzden gelecek günlerin konumlarını kendi motorumuzla (astronomy-engine, MIT lisansı) önceden hesaplarız. Sonuç: günde 1 RoxyAPI transit çağrısı gerekmez. RoxyAPI yalnız kayıtta (4–5 çağrı) kalır, ayrıca haftada bir karşılaştırma için kullanılır.

**Zaman kuralı:** Kullanıcının kendi yerel tarihi esas alınır, o tarihin 12:00 UTC anındaki gökyüzü kullanılır. Premium günlük cümle bir gün önceden üretilip saklanır, böylece 08:00 bildirimi her saat diliminde üretimi beklemez.

## Yapım sırası (Talha için)

Her adım, bitti sayılmak için kendi kontrolünü geçmek zorunda. Kontrol geçmeden sonraki adıma geçilmez.

| # | Adım | Bitti sayılma kontrolü |
| --- | --- | --- |
| 0 | Kod yazmadan önce: RoxyAPI sorularının cevabı, hesaplar (Apple Developer, Google Play, Supabase, RevenueCat, AdMob, Sentry), alan adı | Cevap "saklıyabilirsiniz" ise devam; değilse mimari yeniden konuşulur |
| 1 | Hesap paketi (Pythagorean, Matrix, Ay, açılar, gökyüzü) TypeScript'e taşınır | Şartnamedeki tüm test tabloları geçer. Human Design için Jovian Archive'den en az 5 farklı harita (Manifestor, Projector, Reflector, Manifesting Generator örnekleri dahil) bizim hesabımızla birebir tutar. Şu an yalnız 1 harita doğrulandı. |
| 2 | Sunucu iskeleti: veritabanı, anonim giriş, register fonksiyonu, RoxyAPI sarmalayıcısı, kendi hesabımızla doğrulama | Örnek doğum, API ve üç motor değerleriyle eşleşir |
| 3 | Uygulama kabuğu: kayıt ekranı, onay ekranı, ücretsiz sonuç ekranı (gerçek veriyle) | Kayıttan ücretsiz ekrana kadar tam akış çalışır |
| 4 | Gökyüzü görevi ve ücretsiz günün cümlesi (şablon) | 3 gün öncesinden konum hazır, ekranda görünüyor |
| 5 | Yapay zekâ hattı: tema özeti, tam hikaye, kontroller, harcama tavanı | 20 üretilen metin kontrol listesinden geçer; tavan test edilir |
| 6 | Ödüllü reklam, AdMob sunucu tarafı doğrulama, tema açma | Test reklamı izlenince tema açılır, izlenmeden açılmaz |
| 7 | RevenueCat, paywall, premium ekranlar, günlük ve haftalık üretim, bildirim | Sandbox abonelikle tüm premium akış, reklam gelmediği doğrulanır |
| 8 | Gizlilik: onay, veri silme, mağaza formları, hata takibi | Test planındaki 3, 4, 8 ve 9 numaralı testler |
| 9 | İç test (TestFlight, Google dahili test), sonra mağazaya gönderim | Test planının hepsi geçti |

Adlar ve marka tescili 0. adımdan önce kesinleşmeli, çünkü mağaza kaydı ve alan adı isme bağlı.

## Maliyet ve başabaş (ABD)

Tahmini rakamlardır. Fiyatlar ve kesintiler kayıt öncesi doğrulanacak. Reklam geliri kasıtlı olarak hesaba katılmadı (muhafazakâr).

**Sabit gider (aylık, yaklaşık)**

| Kalem | Tutar |
| --- | --- |
| Supabase Pro | 25 dolar |
| RoxyAPI | 39 dolar |
| Apple Developer (99 dolar/yıl) | 8,25 dolar |
| Alan adı (yaklaşık 15 dolar/yıl) | 1,25 dolar |
| **Toplam** | **\~73,5 dolar** |

Google Play tek seferlik 25 dolar. RevenueCat ve Sentry başlangıçta ücretsiz.

**Abone başı net gelir (mağaza %15 kesintisi, yapay zekâ \~0,20 dolar/ay tahmini)**

| Plan | Net/ay |
| --- | --- |
| Aylık 4,99 dolar | \~4,04 dolar |
| Yıllık 39,99 dolar (aylığa bölünmüş) | \~2,63 dolar |

**Başabaş:** Sabit gideri karşılamak için yalnız aylık abone ile 19, yalnız yıllık abone ile 28 abone gerekir. Karma abone tabanlı uygulamada bu aralıkta bir yerdedir. Abone yoksa yapay zekâ gideri sıfırdır, kayıp sabit gider kadardır (aylık \~73,5 dolar).

**Ücretsiz kullanıcı maliyeti**

- Yapay zekâ: tema özetleri bir kez üretilip saklandığı için kullanıcı başına en fazla 4 üretim, yani \~0,03 dolar (ömür boyu).
- RoxyAPI: kayıtta 4–5 çağrı. Plan limiti RoxyAPI cevabıyla netleşir.
- Reklam geliri bu maliyeti karşılamalı. Ödüllü reklam başına gerçek kazanç AdMob'dan ilk haftalarda ölçülür, ondan önce rakam vermiyorum.

**Vergi:** Türkiye şirketi kurum vergisi karlılıktan sonra uygulanır. Hesap kalemi muhasebeciyle netleşir.

## Test planı

Kod bitince aşağıdaki sırayla test edilir. Birinci adımı şimdiden çalıştırdık.

| # | Test | Nasıl | Geçti mi |
| --- | --- | --- | --- |
| 1 | Hesap birim testleri (18 adet) | Aşağıdaki referans kodla `node test.mjs` | Geçti (18/18), 14 Eki 2026 |
| 2 | RoxyAPI sonucu efemerisle aynı mı | Örnek doğum (yukarıda) RoxyAPI'ye gönderilir, Güneş/Ay 0,5° ve Yükselen 1° içinde olmalı | Bekliyor (kayıttan sonra) |
| 3 | Uçtan uca akış | Yeni cihaz, kayıt, ücretsiz ekran, test reklamı, paywall, sandbox satın alma, premium içerik, iptal, reklam geri geliyor | Bekliyor |
| 4 | Premium kullanıcıya reklam gelmiyor | Sandbox abonelikle tüm ekranlar gezilir, reklam isteği atılmamalı | Bekliyor |
| 5 | Maliyet | 100 sahte kullanıcıyla gece üretimi çalıştırılır, toplam maliyet ölçülür, tavan aşılınca durduğu görülür | Bekliyor |
| 6 | Doğum saati yok | Saatsiz kayıt: Yükselen ve Human Design gösterilmiyor, yorumda bunlardan söz edilmiyor | Bekliyor |
| 7 | İçerik güvenliği | 20 üretilen metinde "you will", markdown ve tıbbi/finans tavsiyesi taranır | Bekliyor |
| 8 | Veri silme | "Verilerimi sil" sonrası veritabanında kayıt kalmadığı kontrol edilir | Bekliyor |
| 9 | RoxyAPI çökmesi | API kapatılır, mevcut kullanıcılar açılıyor, yeni kayıt kuyruğa giriyor | Bekliyor |

## Ek: Referans kod (calc.mjs)

Tüm hesaplar saf fonksiyonlardır, bağımlılık yoktur. TypeScript'e taşınması kolaydır.

```js
// Reference implementation. Pure functions, no dependencies.

// ---------- Pythagorean numerology ----------
const VALUES = {};
'ABCDEFGHI'.split('').forEach((c, i) => (VALUES[c] = i + 1));
'JKLMNOPQR'.split('').forEach((c, i) => (VALUES[c] = i + 1));
'STUVWXYZ'.split('').forEach((c, i) => (VALUES[c] = i + 1));
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']); // Y is a consonant (documented simplification)

const MASTER = new Set([11, 22]); // 33 is reduced to 6
const digitSum = (n) => String(n).split('').reduce((a, d) => a + Number(d), 0);

export function reduceKeepMaster(n) {
  while (n > 9 && !MASTER.has(n)) n = digitSum(n);
  return n;
}

function letters(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('');
}

export function nameNumbers(name) {
  const ls = letters(name);
  const sum = (arr) => arr.reduce((a, c) => a + VALUES[c], 0);
  return {
    expression: reduceKeepMaster(sum(ls)),
    soulUrge: reduceKeepMaster(sum(ls.filter((c) => VOWELS.has(c)))),
    personality: reduceKeepMaster(sum(ls.filter((c) => !VOWELS.has(c)))),
  };
}

export function lifePath(year, month, day) {
  return reduceKeepMaster(
    reduceKeepMaster(month) + reduceKeepMaster(day) + reduceKeepMaster(digitSum(year)),
  );
}

// ---------- Destiny Matrix ----------
export function arcana(n) {
  while (n > 22) n -= 22;
  return n;
}

export function destinyMatrix(year, month, day) {
  const A = arcana(day);
  const B = arcana(month);
  const C = arcana(digitSum(year));
  const D = arcana(A + B + C);
  return { A, B, C, D, E: arcana(A + D), F: arcana(B + D), G: arcana(C + D) };
}

// ---------- Moon phase ----------
const norm360 = (x) => ((x % 360) + 360) % 360;

export function moonPhase(sunLon, moonLon) {
  const elong = norm360(moonLon - sunLon);
  const names = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
    'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
  const name = names[Math.floor(norm360(elong + 22.5) / 45) % 8];
  const illumination = (1 - Math.cos((elong * Math.PI) / 180)) / 2;
  return { elongation: elong, name, illumination };
}

// ---------- Transit-to-natal aspects ----------
const ASPECTS = [
  ['conjunction', 0], ['sextile', 60], ['square', 90], ['trine', 120], ['opposition', 180],
];

export function aspectBetween(lonA, lonB, orb = 5) {
  let d = Math.abs(norm360(lonA) - norm360(lonB));
  if (d > 180) d = 360 - d;
  let best = null;
  for (const [name, angle] of ASPECTS) {
    const off = Math.abs(d - angle);
    if (off <= orb && (!best || off < best.off)) best = { aspect: name, off: Math.round(off * 100) / 100 };
  }
  return best; // null when nothing within orb
}

export const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra',
  'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
export const signOf = (lon) => SIGNS[Math.floor(norm360(lon) / 30)];
```

Test dosyası (`test.mjs`) bu belgenin Pythagorean, Matrix, Ay evresi ve açı bölümlerindeki tablolarla birebir aynı değerleri doğrular; Talha kodu TypeScript'e taşırken bu tabloları test olarak kopyalar.

## Ek: Doğrulama sonuçları (14 Eki 2026)

**1. Üç bağımsız motor aynı sonucu verdi.** PyEphem, Astropy ve astronomy-engine ile aynı anlar için Güneş, Ay ve Yükselen hesaplandı (geosantrik, tarihin ekinoksu). Fark en fazla 0,005°.

| An (UTC) | Güneş | Ay | Yükselen (Brooklyn) |
| --- | --- | --- | --- |
| 14 Haz 1993 10:40 (doğum) | 83,38° İkizler | 17,60° Koç | 99,45° Yengeç |
| 14 Eki 2026 06:00 | 200,91° Terazi | 242,55° | – |
| 14 Eki 2026 12:00 (günlük referans anı) | 201,16° Terazi | 245,58° | – |

Tek bir motorun çıktısına dayanmadık. Bir motorda fark çıksaydı testimiz kalırdı.

**2. Saat dilimi ve yaz saati.** IANA saat dilimi veritabanından (Python zoneinfo) kontrol edildi: New York 1993'te yaz saati 4 Nisan'da başlayıp 31 Ekim'de bitti, 14 Haz 1993 06:40 = UTC−4 (EDT). Arizona (Phoenix) yaz saati kullanmıyor (UTC−7). Bu yüzden saat dilimi, şehir ve **tarih** birlikte çözülmeli, ülke ya da şehir başına tek sabit fark kullanılmamalı.

**3. Ay evreleri.** İki motor (PyEphem, astronomy-engine) aynı anı verdi (1 dakika fark):

| Evre | An (UTC) |
| --- | --- |
| İlk dördün | 18 Eki 2026 16:13 |
| Dolunay | 26 Eki 2026 04:12 |
| Son dördün | 1 Kas 2026 20:29 |
| Yeni Ay | 9 Kas 2026 07:02 |

**4. Çin hayvanı: yeni yıl sınırı hatası.** Doğum tarihi Çin Yeni Yılı'ndan önceyse önceki yılın hayvanı geçerlidir. Takvim kütüphanesiyle (lunardate) kontrol:

| Doğum | Sonuç |
| --- | --- |
| 14 Haz 1993 | Su Horozu |
| 15 Oca 1993 | Su Maymunu (1992'nin hayvanı, 1993 değil) |
| 22 Oca 1993 | Su Maymunu |
| 23 Oca 1993 | Su Horozu (Çin Yeni Yılı) |
| 4 Şub 2000 | Toprak Tavşanı |
| 5 Şub 2000 | Metal Ejderhası |

Ocak ve Şubat doğumluların bu hatayı alma riski yüksek. API'nin bu sınırlarda doğru çalıştığı test edilmeli. Ayrıca BaZi yıl sütünü Çin Yeni Yılı'nı değil Li Chun'u (yaklaşık 4 Şubat) sınır alır. İki farklı sınır aynı ekranda görünürse kullanıcı çelişki görebilir. **Karar (itiraz gelmedikçe geçerli):** Çin kartında hangi sınırı kullanıyoruz? Önerim: hayvan için Çin Yeni Yılı, BaZi yalnız API'den ve açıklamayla.

**5. Günlük açılar.** 14 Eki 2026 12:00 UTC'de transit Güneş 21° Terazi: natal Güneş'e (83,38°) üçgen, 2,22° sapma; natal Ay'a (17,60°) karşıt, 3,56° sapma. Prototipteki değerler buna göre güncellendi.

**Doğrulanmayanlar (açıkça)**

- **Human Design:** Sonradan doğrulandı, aşağıdaki "Human Design doğrulaması" bölümüne bak. Tek bir harita ile doğrulanmıştır, kodlamadan önce daha fazla haritayla genişletilecek.
- **RoxyAPI'nin kendi çıktısı:** Henüz anahtar yok. Kayıttan sonra yukarıdaki üç motor değerleriyle karşılaştırılacak.
- **Web kaynaklarından teyit:** timeanddate.com'daki Ay evresi ve yaz saati sayfalarına erişim izni verilmedi, bu yüzden internet kaynağı karşılaştırması yapılamadı. Yerine bağımsız yazılım motorlarıyla ve IANA veritabanıyla doğrulandı.

**Uygulamada sürekli güvence (öneri)**

- Kayıt anında RoxyAPI'nin Güneş, Ay ve Yükselen değerleri, bizim kendi hesabımızla (astronomy-engine, MIT lisansı, ticari kullanıma uygun) karşılaştırılır. Fark Güneş/Ay'da 0,5° ya da Yükselen'de 1°'den büyükse harita kullanıcıya gösterilmez, kayıt işaretlenir, ekibe haber gider.
- Burcun değiştiği sınıra 1°'den yakın bir konum varsa ekranda "sınırda" notu gösterilir.

## Human Design doğrulaması (14 Eki 2026)

**Referans:** Kadirhan'ın Jovian Archive sitesinden aldığı kendi haritası (doğum: 21 Tem 1991 02:30 yerel, Rize, Türkiye = UTC 20 Tem 23:30). Bu harita üretici sitenin kendi sonucudur, biz bunu kendi hesabımızla yeniden ürettik.

**Sonuç: 26 kapı/çizgi aktivasyonunun 26'sı tuttu.** Ayrıca tip, otorite, tanım, profil ve haç da tuttu.

| Ne | Sitenin sonucu | Bizim hesap |
| --- | --- | --- |
| Kişiliğin Güneş / Dünya | 56.2 / 60.2 | 56.2 / 60.2 |
| Tasarım Güneş / Dünya | 3.4 / 50.4 | 3.4 / 50.4 |
| Diğer 22 aktivasyon (Ay, gezegenler, düğümler) | Sitedeki liste | Hepsi aynı |
| Tip | Generator | Generator |
| Otorite | Sacral | Sacral |
| Tanım | Split | Split |
| Profil | 2/4 | 2/4 |
| Haç | Right Angle Cross of Laws (56/60 \| 3/50) | 56/60 \| 3/50 |

**Bulgular (kodlama kuralları)**

- **Tasarım anı:** Güneş'in tam 88° önceki konumu bulunur (88 gün değil. Bu örnekte 91 gün önce, mevsime göre 88 ile 92 gün arası değişir). Bisection ile çözülür.
- **Kapı çarkı:** Kapı 41'in başlangıcı 302° (Kova 2°). Her kapı 5,625°, her çizgi 0,9375°. Sıra ekteki kodda.
- **Ay düğümü: gerçek düğüm kullanılmalı, ortalama değil.** Ortalama düğüm ile Kuzey Düğüm 54.4 çıktı (site 54.5). Meeus düzeltmesiyle gerçek düğüm hesaplanınca tuttu. Çizgi sınırında 0,1° fark çizgiyi değiştirir.
- Tip ve tanım, aktif kapılardan çizilen kanallarla bulunur (36 kanal, 9 merkez).

**Henüz doğrulanmayan:** Bu **tek bir haritadır**. Kodlamadan önce en az 5 farklı haritayla (Manifestor, Projector, Reflector ve Manifesting Generator örnekleri dahil) karşılaştırılacak. Bunlar Jovian Archive'den ücretsiz alınır. Aynı haritalar RoxyAPI'yi de test edecek.

**Karar seçeneği:** Kendi motorumuz doğru çıktığı sürece Human Design için RoxyAPI'ye gerek kalmayabilir. Öneri: şimdilik ikisini birlikte çalıştır, uyuşmayan kayıtları günlüğe yaz, 5+ harita ve ilk haftalar sonrası karar ver.

**Prototip örneği:** 14 Haz 1993, 06:40 New York (UTC 10:40) için kendi hesabımız Manifestor, Emotional authority, Split, profil 1/3 verdi. Prototipteki "Projector 2/4" yer tutucusu buna göre değiştirildi.

## Ek: Human Design referans kodu (hd.mjs)

Bağımlılık: `astronomy-engine` (MIT).

```js
// Human Design chart from a UTC birth moment. Depends on astronomy-engine (MIT).
import * as A from 'astronomy-engine';
const n360 = (x) => ((x % 360) + 360) % 360, rad = Math.PI / 180;
export const WHEEL = [41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60];
const START = 302; // 2 deg Aquarius = start of gate 41
export function activation(lon) {
  const x = n360(lon - START) / 5.625;
  return { gate: WHEEL[Math.floor(x)], line: Math.floor((x % 1) * 6) + 1 };
}
function trueNode(date) {
  const T = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000 / 36525;
  const mean = 125.04452 - 1934.136261 * T;
  const D = 297.8501921 + 445267.1114034 * T, M = 357.5291092 + 35999.0502909 * T,
    F = 93.272095 + 483202.0175233 * T, L = 218.3164477 + 481267.88123421 * T;
  return n360(mean + (-1.4979 * Math.sin(2 * (D - F) * rad) - 0.15 * Math.sin(M * rad)
    - 0.1226 * Math.sin(2 * D * rad) + 0.1176 * Math.sin(2 * F * rad) - 0.0801 * Math.sin(2 * (L - F) * rad)));
}
const PLANETS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
function longitudes(date) {
  const o = { Sun: A.SunPosition(date).elon, Moon: A.EclipticGeoMoon(date).lon };
  for (const b of PLANETS) {
    const e = A.RotateVector(A.Rotation_EQJ_ECT(date), A.GeoVector(b, date, true));
    o[b] = n360(Math.atan2(e.y, e.x) / rad);
  }
  o.NorthNode = trueNode(date);
  o.Earth = n360(o.Sun + 180);
  o.SouthNode = n360(o.NorthNode + 180);
  return o;
}
export function designMoment(birth) {          // Sun exactly 88 degrees earlier on the ecliptic
  const target = n360(A.SunPosition(birth).elon - 88);
  let lo = birth.getTime() - 100 * 864e5, hi = birth.getTime() - 80 * 864e5;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (n360(A.SunPosition(new Date(mid)).elon - target) > 180) lo = mid; else hi = mid;
  }
  return new Date((lo + hi) / 2);
}
const CENTERS = { Head: [64,61,63], Ajna: [47,24,4,17,43,11], Throat: [62,23,56,35,12,45,33,8,31,20,16],
  G: [1,13,25,46,2,15,10,7], Heart: [21,40,26,51], Spleen: [48,57,44,50,32,28,18],
  Sacral: [5,14,29,59,9,3,42,27,34], SolarPlexus: [36,22,37,6,49,55,30], Root: [53,60,52,19,39,41,58,38,54] };
const CHANNELS = [[1,8],[2,14],[3,60],[4,63],[5,15],[6,59],[7,31],[9,52],[10,20],[10,34],[10,57],[11,56],[12,22],[13,33],[16,48],[17,62],[18,58],[19,49],[20,34],[20,57],[21,45],[23,43],[24,61],[25,51],[26,44],[27,50],[28,38],[29,46],[30,41],[32,54],[34,57],[35,36],[37,40],[39,55],[42,53],[47,64]];
const centerOf = (g) => Object.keys(CENTERS).find((c) => CENTERS[c].includes(g));
export function analyze(gates) {
  const on = new Set(gates);
  const chans = CHANNELS.filter(([a, b]) => on.has(a) && on.has(b));
  const defined = new Set();
  chans.forEach(([a, b]) => { defined.add(centerOf(a)); defined.add(centerOf(b)); });
  const adj = {}; defined.forEach((c) => (adj[c] = new Set()));
  chans.forEach(([a, b]) => { const x = centerOf(a), y = centerOf(b); adj[x].add(y); adj[y].add(x); });
  const seen = new Set(), comp = {}; let comps = 0;
  for (const c of defined) {
    if (seen.has(c)) continue; comps++;
    const st = [c];
    while (st.length) { const v = st.pop(); if (seen.has(v)) continue; seen.add(v); comp[v] = comps; adj[v].forEach((w) => st.push(w)); }
  }
  const motors = ['Sacral', 'SolarPlexus', 'Heart', 'Root'];
  const motorToThroat = defined.has('Throat') && motors.some((m) => defined.has(m) && comp[m] === comp.Throat);
  const type = defined.size === 0 ? 'Reflector'
    : defined.has('Sacral') ? (motorToThroat ? 'Manifesting Generator' : 'Generator')
    : (motorToThroat ? 'Manifestor' : 'Projector');
  const authority = defined.has('SolarPlexus') ? 'Emotional' : defined.has('Sacral') ? 'Sacral'
    : defined.has('Spleen') ? 'Splenic' : defined.has('Heart') ? 'Ego'
    : (defined.has('G') && comp.G === comp.Throat) ? 'Self-projected' : defined.size ? 'Mental' : 'Lunar';
  const definition = defined.size ? ['Single', 'Split', 'Triple Split', 'Quadruple Split'][comps - 1] : 'None';
  return { type, authority, definition, definedCenters: [...defined].sort(), channels: chans.map((c) => c.join('-')) };
}
export function humanDesign(birthUtc) {
  const P = longitudes(birthUtc), D = longitudes(designMoment(birthUtc));
  const side = (L) => Object.fromEntries(Object.keys(L).map((k) => { const a = activation(L[k]); return [k, `${a.gate}.${a.line}`]; }));
  const personality = side(P), design = side(D);
  const gates = [...Object.values(personality), ...Object.values(design)].map((s) => Number(s.split('.')[0]));
  const profile = `${personality.Sun.split('.')[1]}/${design.Sun.split('.')[1]}`;
  const g = (s) => s.split('.')[0];
  return { personality, design, profile, cross: `${g(personality.Sun)}/${g(personality.Earth)} | ${g(design.Sun)}/${g(design.Earth)}`, ...analyze(gates) };
}
```
