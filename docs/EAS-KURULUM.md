# Bulut önizleme ve telefon derlemesi (Expo EAS)

KadirHan ve Talha farklı şehirlerde, farklı bilgisayarlarda çalışıyor. Hiçbir şey kimsenin bilgisayarına bağlı değil.
**`expo start` ile yerel sunucu paylaşılmaz. Netlify kullanılmaz.**

```
GitHub (tek doğru kaynak, private)
  ├─ PR açılınca ──► GitHub Actions ──► EAS Update ──► PR'a QR + bağlantı yorumu ──► telefonda Expo Go
  └─ elle tetik  ──► EAS Build ──► Android APK bağlantısı
                               └─► iPhone TestFlight (Apple Developer açılınca)
```

## Bir kez yapılacaklar (hesaplar KadirHan'da)

| # | Ne | Nerede | Not |
|---|---|---|---|
| 1 | Expo organizasyonu aç, Talha'yı üye yap | expo.dev | Organizasyonun kısa adı (slug) gizli değil, paylaşılır |
| 2 | Organizasyon için erişim anahtarı (token) oluştur | expo.dev → organizasyon → Access tokens | Sohbete/koda yazma |
| 3 | Anahtarı GitHub'a gizli alan olarak ekle: `EXPO_TOKEN` | GitHub repo → Settings → Secrets and variables → Actions | |
| 4 | **"EAS first-time setup"** iş akışını çalıştır, organizasyon adını yaz | GitHub → Actions → Run workflow | Projeyi organizasyona bağlar, `app.json`'a proje kimliğini yazar |
| 5 | Apple Developer Program ($99/yıl) | developer.apple.com | Yalnız iPhone için. Sonra App Store Connect API anahtarı oluşturup expo.dev → Credentials'a yükle (Mac ve terminal gerekmez) |
| 6 | Google Play Console ($25 bir kez) | play.google.com/console | Yalnız mağaza aşamasında |

Telefona **Expo Go** kur (App Store / Google Play, ücretsiz).

## Günlük kullanım

- **PR açınca:** "EAS preview" iş akışı kendiliğinden çalışır, PR'a bir yorum yazar: bağlantı + QR. Telefonda Expo Go ile okut, uygulama açılır. Her yeni commit önizlemeyi günceller.
- **Gerçek telefon derlemesi:** GitHub → Actions → "EAS build" → platform seç (android / ios / all) → Run. Özet sayfasındaki bağlantıdan APK iner. Derleme bulutta yapılır.
- **Web önizleme:** gerekirse `expo export --platform web` kullanılır. Yalnız ihtiyaç doğarsa ve KadirHan'a sorularak eklenir.

## Sınırlar

- Expo Go yalnız Expo'nun hazır modüllerini içerir. Reklam (AdMob), abonelik (RevenueCat) ve bildirim eklenince **geliştirme sürümü** (`development` profili, EAS Build) gerekir.
- Canlı (production) derleme, ayrı Pro Supabase projesine bağlanacak. `eas.json` içindeki `production` profilinde şimdilik ortam değerleri yok. İlk mağaza derlemesinden önce expo.dev → Environment variables'a eklenir.
- Uygulama kimliği `com.auvane.app` geçicidir (marka ve Apple hesabı netleşince değişir).

## Gizli anahtarlar nerede durur

| Anahtar | Yeri |
|---|---|
| Expo token | GitHub Actions secrets (`EXPO_TOKEN`) |
| Supabase service key | Supabase (fonksiyonlara otomatik verilir), GitHub'a gerekmez |
| Anthropic (Claude) anahtarı | Supabase → Edge Functions → Secrets (`ANTHROPIC_API_KEY`) |
| Supabase URL ve publishable anahtar | Herkese açık, uygulamanın içinde gider |
