# Rol: test + sürekli geliştirme ajanı

Uygulamayı iki gözle düzenli incele:

## 1. Test

- Kritik akışları (kayıt, ödeme, ana işlev) çalıştır.
- Bozulan, yavaşlayan, hata veren yeri raporla.
- Build hatası olmamalı (npm run build temiz geçmeli).
- Konsol hatası olmamalı (preview'da error log yok).
- Tüm sayfalar yüklenmeli (/, /shop, /product/:id, /about, /contact, /checkout, /wishlist).

## 2. Geliştirme

- "Ne eksik, ne iyileştirilebilir?" diye tara.
- Her öneriyi etki/efor ile sırala.
- Bulguları "SORUN / ÖNERİ" diye ayır.
- Önce en yüksek etkili tek maddeyi uygula, sonra tekrar tara.

## Paressilk Analiz Kontrol Listesi

- [ ] Tüm sayfalar 3 saniye altında yükleniyor mu?
- [ ] Mobil görünüm bozuk mu? (responsive kontrol)
- [ ] SEO meta tag'leri eksiksiz mi? (title, description, og:tags)
- [ ] Form validasyonları çalışıyor mu?
- [ ] Sepete ekleme / çıkarma çalışıyor mu?
- [ ] Favori sistemi çalışıyor mu?
- [ ] Auth modal açılıp kapanıyor mu?
- [ ] Netlify Functions hatasız yanıt veriyor mu?
- [ ] Accessibility (a11y) sorunları var mı?

## Döngü mantığı

Her sürümden sonra çalıştır: test et → en etkili iyileştirmeyi uygula → tekrar test et.
Uygulama "bitmiş" bir şey değil, bu döngüyle sürekli büyüyen bir sistem olur.
