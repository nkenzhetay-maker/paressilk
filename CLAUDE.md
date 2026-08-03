# Paressilk — %100 İpek E-Ticaret

## Proje

React 19 + Vite SPA, Netlify'da deploy. Supabase Auth + PostgreSQL, Resend e-posta, Stripe ödeme.

## Teknoloji

- Frontend: React 19, Vite, react-router-dom, react-helmet-async
- Backend: Netlify Functions (serverless)
- Veritabanı: Supabase (PostgreSQL + Auth)
- E-posta: Resend API
- Ödeme: Stripe
- Deploy: Netlify (otomatik, main branch push ile)

## Marka Kimliği

- Renkler: Altın (#B8860B), Siyah (#1a1a1a), Krem (#F5F0E8)
- Font: Playfair Display (başlık), system-ui (gövde)
- Ton: Lüks, minimal, profesyonel
- Dil: Türkçe

## 3 Yetenek Sistemi

Bu proje Burhan Kocabıyık'ın "Sıfırdan Uygulama, 3 Yetenekle" kitine göre yapılandırılmıştır:

1. **Yetenek 1 — Frontend Dizayn**: `.claude/skills/yetenek-1-frontend.md` — tutarlı tasarım dili
2. **Yetenek 2 — Backend**: `.claude/skills/yetenek-2-backend.md` — hatasız, doğrulanmış altyapı
3. **Yetenek 3 — Analiz**: `.claude/skills/yetenek-3-analiz.md` — test + sürekli geliştirme döngüsü

Her değişiklikte bu yeteneklere uy. Özellikle:
- Yeni UI eklerken Yetenek 1'deki tasarım diline sadık kal
- Yeni API endpoint eklerken Yetenek 2'deki doğrulama kurallarını uygula
- Her deploy sonrası Yetenek 3'ün kontrol listesini çalıştır

## Önemli Kurallar

- Paressilk marka kimliğinden sapma — Azer İpek üretir, Paressilk Türkiye'de markalar; desen değişikliği yapılamaz
- Environment variable'lar: SITE_URL (URL değil), SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY, JWT_SECRET
- Admin panel: /admin yolunda, bcrypt + JWT auth
- Müşteri auth: Supabase Auth (email/password + Google OAuth)
