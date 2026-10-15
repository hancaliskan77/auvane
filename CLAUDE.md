# Auvane – proje notları (önce bunu oku)

ABD pazarı için doğum haritası ve kendini keşfetme uygulaması. Kullanıcı ad, doğum tarihi, saati ve yerini girer. Yedi sistem hesaplanır (Batı astrolojisi, Pythagorean yaşam yolu, Pythagorean isim numerolojisi, Human Design, Destiny Matrix, Çin astrolojisi, Ay). Bir yapay zekâ bunları tek bir kişisel okumada birleştirir.

Kullanıcıya yanıtlar **Türkçe, kısa ve sade** olsun. Kod, commit mesajları ve değişken adları İngilizce olabilir.

## Kesin kararlar (değiştirmeden önce KadirHan'a sor)

**Ürün**
- Pazar ABD, arayüz İngilizce. Ad **Auvane** (geçici: marka, App Store ve alan adı kontrolleri sürüyor).
- Ücretsiz: her sistemden tek satırlık ham sonuç, genel günlük cümle, hafif reklam; reklam izleyen kullanıcı günde 1 tema açar.
- Premium ($4.99/ay, $39.99/yıl, 3 günlük deneme yalnız yıllıkta): 4 temalı tam okuma, kişisel günlük cümle, haftalık görünüm, ham veri + yorum, reklamsız.
- Hedef: kullanıcı kazanmak, zarar etmemek. Başabaş yaklaşık 19 aylık veya 28 yıllık abone.

**Teknoloji**
- Uygulama: Expo (React Native + TypeScript). Web hedefi de açık kalsın (ekranlar tarayıcıda da çalışsın).
- Arka yüz: Supabase (TypeScript sunucu fonksiyonları, anonim giriş, RLS, zamanlı görevler). Geliştirme için ayrı ücretsiz proje, canlı için ayrı Pro proje.
- Abonelik RevenueCat, hata takibi Sentry, reklam AdMob, harita verisi RoxyAPI, yapay zekâ Claude Sonnet serisi.
- Capacitor değerlendirildi, Expo seçildi (bağlayıcısı var, iPhone derlemesi için Mac gerekmez).

**Mimari kuralı**
- Kullanıcı bir kez kayıt olur; harita hesaplanır ve saklanır. Uygulama açılınca saklı metni okur. **Açılışta yapay zekâ çağrısı yok.**
- Yapay zekâ yalnız premium ve ödüllü reklam için, gece toplu üretir.
- Gökyüzü konumları `astronomy-engine` ile yerelde hesaplanır (3 gün ileriye). RoxyAPI yalnız kayıtta (kullanıcı başına yaklaşık 3–5 çağrı) ve haftalık karşılaştırmada kullanılır.

**Hesap kuralları (testlerle kilitli, değiştirme)**
- Pythagorean harf değerleri, ünlüler AEIOU (Y ünsüz). Usta sayılar yalnız 11 ve 22 (33 → 6). Yaşam yolu: ay, gün, yıl ayrı ayrı indirgenir.
- Destiny Matrix: arcana(n) = ≤22 olana kadar 22 çıkar. A=gün, B=ay, C=yılın rakamlar toplamı, D=A+B+C, E=A+D, F=B+D, G=C+D. **Açık madde:** 8 ve 11 numaralı kartın sırası (Justice/Strength) bir kaynaktan teyit edilmedi.
- Ay evresi: elongation, 45° dilimler 22.5° kaydırılmış; aydınlanma (1−cos)/2. Açılar 0/60/90/120/180, orb 5°. Günlük referans anı: kullanıcının yerel gününün 12:00 UTC'si.
- Human Design: kapı çarkı 41. kapı 302°'de başlar, kapı 5.625°, çizgi 0.9375°. Tasarım anı = Güneş'in tam 88° öncesi (bisection). **Gerçek Ay düğümü** kullan (ortalama değil). Tip, otorite, tanım 36 kanal ve 9 merkezden çıkar.
- Çin hayvanı: Çin Yeni Yılı sınırı (Ocak–Şubat doğumları önceki yılın hayvanı olabilir). BaZi yalnız API'den, açıklamayla.

**Doğum yeri ve saat**
- Serbest metin yok. Çevrimdışı GeoNames şehir listesinden seçilir (CC BY, IANA saat dilimi dahil). Onay ekranında yerel saat, o tarihteki saat dilimi ve UTC gösterilir.
- Belirsiz yaz saati saati (ör. New York 2026-11-01 01:30) kullanıcıya sorulur; var olmayan saat (2026-03-08 02:30) reddedilir.
- Doğrulama hattı: RoxyAPI Güneş ve Ay'ı bizim hesapla karşılaştırılır (tolerans Güneş/Ay 0.5°, Yükselen 1°). Tutmazsa harita gösterilmez, işaretlenir.
- Yükselen bir burç sınırına 2°'den yakınsa "kesin değil" notu. Doğum saati bilinmiyorsa Yükselen ve Human Design gizlenir.

**Yapay zekâ**
- Günlük harcama tavanı (başlangıç $10/gün), kullanıcı başı sınır (ödüllü tema günde 1, hikâye yenileme haftada ≤1), sunucuda abonelik kontrolü.
- Çıktı doğrulama: kelime sayısı, markdown yok, "you will" yok. Anlam sözlüğü komuta verilir.

**Reklam**
- Reklam ana gelir değil, premium'a köprü. Ödüllü reklam ana reklam (günde 1 tema; ilk 2 ayda günde 2 hak A/B test).
- Geçiş reklamı günde ≤1, ilk 3 oturumda yok, yalnız tema okunduktan sonra; açılışta, ilk sonuç ekranında, paywall çevresinde yok. Banner yok.
- Kategori engeli: kumar, yetişkin, siyaset, tedavi iddiası, kredi, rakip astroloji. Premiumda hiç reklam SDK'sı yüklenmez. iOS izin penceresi ilk sonuç ekranından sonra. İlk ay yalnız AdMob.

**Gizlilik**
- İsim ve doğum verisini astroloji ve yapay zekâ sağlayıcılarına göndermeden önce açık onay. Veri silme düğmesi. 13+ yaş kapısı. "Satma/paylaşma" (CCPA/CPRA). 24 ay hareketsiz hesabı sil.

## Çalışma kuralları
- **Konuşma kuralı (kalıcı, değişmez):** Kullanıcılar yazılımcı değil, "yazılımcıların üst aklı". Hiç bilmeyen biriyle konuşur gibi, çok kısa ve sade yaz; teknik terim kullanma. Karmaşık bir durumda, istenmese bile önce şema/görsel (ASCII diyagram veya artifact) ile anlat.
- Yapım sırası ve her adımın "bitti sayılma kontrolü" şartnamede (bkz. `docs/LINKS.md`). Kontrol geçmeden sonraki adıma geçme.
- Hesap testleri: `cd ref && npm install && npm test`. Hesap kodu değişirse önce test ekle/güncelle. Testler geçmeden birleştirme yok.
- Anahtarları koda yazma. `.env` dosyaları git'e girmez. Gizli anahtarlar GitHub, Expo (EAS) ve Supabase'in gizli alanlarında durur. Uygulamaya yalnız herkese açık Supabase anahtarı girer.
- Depo **özel (private)** kalır. `ref/hd.test.mjs` içinde KadirHan'ın kişisel doğum bilgileri var; depoyu public yapma, başkasıyla paylaşma.
- Reklam, abonelik ve bildirim web'de çalışmaz. Web sürümünde bunlar sahte buton olarak görünsün.
- Kararlar KadirHan'da (konsept ve tasarım), uygulamayı Talha kurar. Şüphe varsa hesap kurallarını kendin değiştirme, sor.

## İlk görev: Yapım adımı 1
`ref/` klasöründeki `calc.mjs` ve `hd.mjs` kodunu TypeScript'e taşı (ör. `packages/calc`). `test.mjs` ve `hd.test.mjs` aynı değerlerle geçsin. Human Design için KadirHan'dan gelecek 4 ek Jovian Archive haritasını (Manifestor, Projector, Reflector, Manifesting Generator) teste ekle; şu an yalnız 1 gerçek harita doğrulandı.

## Açık maddeler (KadirHan takip eder)
RoxyAPI e-postasının cevabı (veri saklama izni kritik), marka/App Store/alan adı kontrolleri, Apple Developer hesabı, avukat ve muhasebeci maddeleri (gizlilik metni, W-8BEN), GeoNames boyut ve lisans teyidi, mağaza komisyon indirimi programları, Apple 5.1.2(i) güncel metni.
