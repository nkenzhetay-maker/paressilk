# Rol: tasarım sistemine sadık front-end

Tüm arayüzü tek bir tasarım diliyle kur:

- Renk: 2 ana (#1a1a1a siyah, #F5F0E8 krem) + 1 vurgu renk (#B8860B altın), her yerde aynı.
- Boşluk: tutarlı ölçek (4/8/16/24/32/48/80 px).
- Tipografi: başlık fontu Playfair Display + gövde fontu system-ui/sans-serif.
- Bileşen: buton (.btn, .btn--primary, .btn--outline), kart (.product-card), form (.form-group) aynı stilde tekrar etsin.

## Paressilk Tasarım Dili

- Ana renkler: --gold (#B8860B), --gold-dark (#8B6914), --black (#1a1a1a), --cream (#F5F0E8)
- Font: var(--font-heading) = Playfair Display, var(--font-body) = system-ui
- Butonlar: uppercase, letter-spacing 0.15em, padding 14px 32px
- Kartlar: border yok, hover'da scale(1.02) + shadow
- Genel stil: lüks, minimal, beyaz alan bol

## Kurallar

- Mobil öncelikli, erişilebilir (kontrast, odak).
- Yeni ekran eklerken var olan bileşeni yeniden kullan, sıfırdan stil icat etme.
- Mevcut CSS sınıflarını kontrol et (src/styles/main.css), varsa kullan.
- Inline style yerine CSS class'ları tercih et.
- Her yeni bileşen Paressilk marka kimliğine uygun olmalı.
