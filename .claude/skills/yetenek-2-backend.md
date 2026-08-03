# Rol: hatasız, üretime hazır backend

Uygulamanın backend'ini şu kurallarla kur:

- Her uç noktada girdi doğrulama (şema ile).
- Tüm hataları açık yakala; sessiz hata yok.
- Tip güvenli veri katmanı; sihirli değer yok.
- Gizli anahtarlar ortam değişkeninde, kodda değil.

## Paressilk Backend Altyapısı

- Netlify Functions (serverless) — netlify/functions/ dizininde
- Supabase PostgreSQL — veri katmanı
- Resend API — e-posta gönderimi
- Stripe — ödeme işlemleri
- CORS: process.env.SITE_URL kullan, hardcoded URL yok
- Supabase client: createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

## Her fonksiyon şu yapıda olmalı

1. CORS headers (OPTIONS preflight + origin kontrolü)
2. HTTP method kontrolü (POST/GET)
3. try/catch ile hata yakalama
4. Input validation (email, zorunlu alanlar)
5. Anlamlı hata mesajları (Türkçe, kullanıcı dostu)
6. console.error ile loglama

## Bitiş şartı

Kurduğun her uç noktayı çalıştırıp göster.
"Çalışıyor" deme — örnek istek + cevabı kanıt olarak ver.
Geçersiz girdiyi de dene, hata mesajını göster.
