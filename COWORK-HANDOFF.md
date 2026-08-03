# Paressilk Instagram & Marka İçerik Projesi — Cowork Handoff

> **Son güncelleme:** 28 Haziran 2026
> **Proje:** Paressilk lüks ipek e-ticaret markası — Instagram içerik üretimi + web sitesi güncellemesi
> **Durum:** İçerik üretimi %85 tamamlandı, yayınlama ve kalan ürünler devam edecek

---

## Marka Kimliği (ASLA SAPMA!)

- **Renkler:** Altın `#B8860B` | Siyah `#1a1a1a` | Krem `#F5F0E8`
- **Font:** Playfair Display (başlık), system-ui (gövde)
- **Ton:** Lüks, minimal, profesyonel, premium
- **Dil:** Türkçe
- **Slogan:** "Zarafetin İpek Dokunuşu"

## KRİTİK KURALLAR

1. **DESEN KORUMA:** AI görsel üretiminde ürün deseni/pattern birebir aynı kalmalı. Farklı desen = hukuki sorun. Azer İpek üretir, Paressilk Türkiye'de markalar — desen değişikliği yapılamaz.
2. **TEK TEK İLERLE:** Toplu ürün işlemesi yapma. Tek ürün → onay → sonraki ürün.
3. **HALÜSİNASYON YASAK:** Asla olmayan ürün görseli üretme. Sadece gerçek ürünlerle çalış.
4. **AI HİSSİ VERMEMELİ:** Tüm içerikler doğal, insan yapımı hissi vermeli.

---

## Ürün Kataloğu (products.json)

### Kategori: Kelaghayi (7 ürün)
| ID | Ürün | Fiyat | Görsel |
|----|------|-------|--------|
| kelaghayi-national-collection-150 | National Collection Kelaghayi | ₺2.450 | kelaghayi-1.jpg |
| kelaghayi-national-collection-2 | National Collection Kelaghayi II | ₺2.250 | kelaghayi-2.jpg |
| kelaghayi-national-collection-3 | National Collection Kelaghayi III | ₺2.250 | kelaghayi-3.jpg |
| kelaghayi-classic-1 | Classic Kelaghayi | ₺1.950 | kelaghayi-4.jpg |
| kelaghayi-classic-2 | Classic Kelaghayi II | ₺1.950 | kelaghayi-5.jpg |
| kelaghayi-elegant-1 | Elegant Collection Kelaghayi | ₺2.650 | kelaghayi-6.jpg |
| kelaghayi-elegant-2 | Elegant Kelaghayi | ₺2.450 | kelaghayi-7.jpg |

### Kategori: Eşarp / Scarves (6 ürün)
| ID | Ürün | Fiyat | Görsel |
|----|------|-------|--------|
| scarf-classic-1 | Classic İpek Eşarp | ₺1.750 | scarf-1.jpg |
| scarf-classic-2 | Classic İpek Eşarp II | ₺1.750 | scarf-2.jpg |
| scarf-federation | Özel Tasarım Kurumsal Eşarp | ₺3.200 | scarf-3.jpg |
| scarf-blue-rose | Blue Rose İpek Eşarp | ₺1.850 | scarf-4.jpg |
| scarf-pink-buta | Pink Buta İpek Eşarp | ₺1.850 | scarf-5.jpg |
| scarf-elegant | Elegant İpek Eşarp | ₺2.100 | scarf-6.jpg |

---

## TAMAMLANAN İŞLER

### 1. Instagram Reels (3 adet)
**Klasör:** `/paressilk/instagram-reels/`

| Dosya | Açıklama | Süre | Boyut |
|-------|----------|------|-------|
| `reel1_marka_tanitim.mp4` | V1+V2 birleştirme, altın saat ışığı, Paressilk text overlay | 21s | 16MB |
| `reel2_street_style.mp4` | V3+V5a+V5b, hızlı kesimler, paressilk.com overlay | 23s | 9.2MB |
| `reel3_closeup_luks.mp4` | V1+V2 slow motion 0.7x, "Zarafetin İpek Dokunuşu" | 28s | 17MB |
| `reel1_marka_tanitim_thumb.jpg` | Thumbnail 1080x1080 | - | 41KB |
| `reel2_street_style_thumb.jpg` | Thumbnail 1080x1080 | - | 49KB |
| `reel3_closeup_luks_thumb.jpg` | Thumbnail 1080x1080 | - | 49KB |

**Kaynak videolar** (WhatsApp tmp):
- V1: `/Users/nazgulkenjetay/Library/Containers/net.whatsapp.WhatsApp/Data/tmp/documents/FC9E7430-.../V1 .mp4` (21s, sarışın model, mor kelaghayi)
- V2: `...0A5565DE-.../V2.mp4` (11s, sarışın model, kahverengi kelaghayi, tarihi bina)
- V3: `...CEE998B7-.../v3 .mp4` (17s, esmer model, sarı eşarp, sokak)
- V4: `...09F7371E-.../v4.mp4` (16s, esmer model, ayak detay)
- V5a: `...1D367F6D-.../v5 (1).mp4` (18s, esmer model, turkuaz eşarp)
- V5b: `...2966C434-.../v5(2).mp4` (14s, esmer model, somon kelaghayi)

**Video frame'ler:** `/paressilk/video-frames/` (v1-frame.jpg ... v5b-frame.jpg)

### 2. Ürün Fotoğrafları — scarf-classic-1 (TAMAMLANDI)
**Klasör:** `/paressilk/product-professional/`

İşlem: Background removal (rembg AI) + Color grade (contrast +15%, saturation +20%, sharpness +30%, brightness +5%)

| Dosya | Format | Arka Plan |
|-------|--------|-----------|
| `scarf-classic-1-full-cream.jpg` | Full-res (4240x2832) | Krem #F5F0E8 |
| `scarf-classic-1-full-white.jpg` | Full-res | Beyaz |
| `scarf-classic-1-full-black.jpg` | Full-res | Siyah #1a1a1a |
| `scarf-classic-1-ig-cream.jpg` | 1080x1080 | Krem |
| `scarf-classic-1-ig-white.jpg` | 1080x1080 | Beyaz |
| `scarf-classic-1-ig-black.jpg` | 1080x1080 | Siyah |
| `scarf-classic-1-ig45-*.jpg` | 1080x1350 (4:5) | Her 3 renk |
| `scarf-classic-1-transparent.png` | Full-res | Şeffaf |
| `scarf-classic-1-DSC09751-*.jpg` | Katlanmış görünüm | Krem, IG, IG45 |
| `scarf-classic-1-DSC09880-*.jpg` | Tam açık (farklı açı) | Krem, IG, IG45 |
| `scarf-classic-1-DSC09884-*.jpg` | Yakın çekim detay | Krem, IG, IG45 |

**Carousel post (branded):** `/paressilk/instagram-content/posts/scarf-classic-1/`
- `slide1-hero-branded.jpg` — Hero shot, alt barda "Paressilk | Classic İpek Eşarp | ₺1.750 | %100 El Yapımı İpek"
- `slide2-detail-branded.jpg` — Desen detayı, "Desen Detayı ›" text
- `slide3-folded.jpg` — Katlanmış görünüm
- `slide4-dark-branded.jpg` — Siyah arka plan, "paressilk.com" text

**Site güncellemesi:** `public/images/products/scarf-1.jpg` profesyonel versiyonla güncellendi (backup: scarf-1-backup.jpg)

### 3. Instagram Captions + Hashtags
**Dosya:** `/paressilk/instagram-content/captions.md`

6 caption hazır:
1. **Marka Tanıtım Reel** — İlk tanışma, CTA "Link in bio" | Set A + C
2. **Ürün Post** — Hikaye + fiyat (₺2.450 örnek) + sipariş | Set B + C
3. **Street Style Reel** — Günlük şıklık, versatillik | Set A + B
4. **Carousel "Yeni Koleksiyon"** — "Sola kaydır", heyecan | Set A + B + C
5. **Story BTS** — Üretim süreci, zanaat | Set C
6. **Close-up Lüks Reel** — İpek dokusu, deneyim | Set A + C

3 hashtag seti:
- **Set A:** Genel lüks moda (20 hashtag) — #luxury #silk #fashion ...
- **Set B:** Türkiye/bölgesel (22 hashtag) — #türkiye #ipek #modaturkiye ...
- **Set C:** Niş/ürün (23 hashtag) — #paressilk #kelaghayi #ipekeşarp ...

### 4. Story Highlight Kapakları (5 adet)
**Klasör:** `/paressilk/instagram-content/highlights/`

| Dosya | İkon | Boyut |
|-------|------|-------|
| `01-koleksiyon.svg` + `.png` | Elmas | 1080x1080 |
| `02-kelaghayi.svg` + `.png` | Kelaghayi silüeti | 1080x1080 |
| `03-esarp.svg` + `.png` | Akan eşarp | 1080x1080 |
| `04-hediye.svg` + `.png` | Hediye kutusu | 1080x1080 |
| `05-hakkimizda.svg` + `.png` | Kalp içinde "P" | 1080x1080 |

Stil: Siyah (#1a1a1a) daire, altın (#B8860B) ikon, minimal çizgi, Hermès/Chanel minimalizmi

### 5. Adobe Express Templates (7 slide)
**Express URL:** https://new.express.adobe.com/id/urn:aaid:sc:AP:b82d5a3e-bc6a-4e3e-8968-590c813a10b7
**Kaynak HTML:** `/paressilk-instagram-templates.html`

- Slide 1: Post template (1080x1080) — altın çerçeve, fotoğraf placeholder
- Slide 2-6: Story highlight kapakları (1080x1920)
- Slide 7: Carousel "Yeni Koleksiyon 2026" (1080x1080) — krem bg, altın tipografi

### 6. Web Sitesi Güncellemeleri
- **Video Hero Section:** `src/pages/Home.jsx` + `src/styles/global.css` güncellendi
  - Desktop: autoplay muted loop video arka plan + overlay
  - Mobile: poster image fallback
  - "Paressilk" altın başlık + "Zarafetin İpek Dokunuşu" italic alt başlık
  - CTA: "Koleksiyonu Keşfet" butonu
  - Video path: `/videos/hero.mp4` (placeholder — Reel'lerden birini buraya koyabilirsin)
- **Ürün görseli:** scarf-1.jpg profesyonel versiyonla değiştirildi

---

## KALAN GÖREVLER (Cowork'te devam edilecek)

### Öncelik 1: Instagram Yayınlama
- [ ] **Carousel Post:** scarf-classic-1 (4 slide hazır, dosya yükleme gerekiyor)
  - Dosyalar: `/instagram-content/posts/scarf-classic-1/slide1-hero-branded.jpg` ... `slide4-dark-branded.jpg`
  - Caption: captions.md > "Ürün Post" bölümünü kullan (fiyatı ₺1.750 olarak güncelle)
  - Hashtag: Set B + Set C
- [ ] **Reel 1 yükle:** `reel1_marka_tanitim.mp4` + Caption: "Marka Tanıtım Reel"
- [ ] **Reel 2 yükle:** `reel2_street_style.mp4` + Caption: "Street Style Reel"
- [ ] **Reel 3 yükle:** `reel3_closeup_luks.mp4` + Caption: "Close-up Lüks Reel"
- [ ] **Story Highlight'ları ayarla:** 5 kapak PNG'yi yükle

### Öncelik 2: Kalan Ürün Fotoğrafları
Drive'daki diğer ürünlerin profesyonelleştirilmesi (aynı pipeline: rembg → color grade → 3 format):

- [ ] **scarf-pink-buta** (DSC09744-09745) — Pembe/fuşya buta eşarp
- [ ] **scarf-classic-2** (DSC09754-09757) — Fıstık yeşili/lime, pembe buta
- [ ] **scarf-elegant** (DSC09758-09763) — Krem/bej, siyah-altın paisley
- [ ] **scarf-blue-rose** (DSC09764-09765) — Turkuaz/teal, koyu paisley
- [ ] **Kelaghayi ürünleri** — Drive'da fotoğraf yok, sitedeki görseller kullanılabilir

### Öncelik 3: İçerik Takvimi Uygulaması
Haftalık plan (captions.md'deki sıra):
- Pazartesi: Reel 1 (Marka Tanıtım)
- Salı: Ürün Post (scarf-classic-1 carousel)
- Çarşamba: Carousel "Yeni Koleksiyon"
- Perşembe: Reel 2 (Street Style)
- Cuma: Ürün Post (sonraki ürün)
- Cumartesi: Story BTS
- Pazar: Reel 3 (Close-up Lüks)

### Öncelik 4: Influencer Persona
- 2 model tespit edildi: 1 sarışın (V1-V2), 1 esmer (V3-V5)
- Video frame'ler: `/video-frames/` (v1-frame.jpg ... v5b-frame.jpg)
- Influencer persona oluşturulup ürün tanıtımlarında kullanılacak
- **DİKKAT:** AI ile yüz üretme/değiştirme yapma — sadece video kliplerden gerçek kareler kullan

### Öncelik 5: Web Sitesi Ek İşler
- [ ] hero.mp4 dosyasını `public/videos/` klasörüne yerleştir (Reel 1'den kısa versiyon kesebilirsin)
- [ ] Diğer ürün görsellerini profesyonel versiyonlarla güncelle
- [ ] Craftsmanship component (önceki session'dan kalan)
- [ ] ProductCard hover second image
- [ ] Micro-interactions + storytelling sayfası

---

## TEKNİK NOTLAR

### Kullanılan Araçlar
- **rembg** (Python): Background removal — `pip3 install rembg onnxruntime` ile kurulu
- **Pillow/PIL**: Color grading, crop, resize
- **ffmpeg**: Video düzenleme, text overlay, birleştirme
- **sips** (macOS): RAW → JPG dönüşüm
- **Adobe Express** (Claude Design): Template tasarımı
- **Chrome MCP**: Instagram yönetimi (dosya yükleme kısıtlı)

### Fotoğraf İşleme Pipeline (tekrar kullanılacak)
```bash
# 1. RAW → JPG
sips -s format jpeg -s formatOptions 90 input.ARW --out output.jpg

# 2. Background removal + color grade (Python)
from rembg import remove
from PIL import Image, ImageEnhance
# Remove bg → cream/white/black bg → contrast 1.15 → saturation 1.2 → sharpness 1.3 → brightness 1.05
# Output: full-res, 1080x1080 (IG), 1080x1350 (IG 4:5)
```

### Instagram Yükleme Sorunu
Chrome MCP file_upload sadece session ile paylaşılan dosyaları kabul ediyor. Çözüm alternatifleri:
1. Kullanıcı manuel olarak "Bilgisayardan seç" ile dosyaları seçer
2. Computer-use ile Finder'dan drag & drop (Chrome "read" tier'da — sınırlı)
3. Instagram Graph API (Business account + Facebook Page gerekli)

### Google Drive Ürün Fotoğrafları Eşleştirmesi
```
DSC09744-09745 → scarf-pink-buta (pembe/fuşya buta)
DSC09746-09753 → scarf-classic-1 (yeşil yaprak — İŞLENDİ ✅)
DSC09754-09757 → scarf-classic-2 (fıstık yeşili/lime + pembe buta)
DSC09758-09763 → scarf-elegant (krem/bej + siyah-altın paisley)
DSC09764-09765 → scarf-blue-rose (turkuaz/teal + koyu paisley)
DSC09766        → yeni/varyasyon (nane yeşili/jade + koyu paisley)
```

### Higgsfield (KULLANMA — desen değiştiriyor)
- Workspace: `9dfb82e8-c0b2-4d6c-ac59-7243a9f6541c`
- ~192 kredi kaldı
- product-photoshoot komutu desenleri değiştiriyor — hukuki sorun

### GEÇERSİZ İÇERİKLER (SİL)
`/instagram-content/` klasöründeki şu PNG dosyaları Higgsfield tarafından üretildi ve YANLIŞ desenlere sahip:
- pink-buta-1.png, pink-buta-2.png
- green-scarf-1.png, green-scarf-2.png
- elegant-scarf-1.png, elegant-scarf-2.png
- kelaghayi-purple-1.png, kelaghayi-purple-2.png
- kelaghayi-orange-1.png, kelaghayi-orange-2.png
- kelaghayi-red-1.png, kelaghayi-red-2.png, kelaghayi-red-1.jpg
- blue-rose-1.png, blue-rose-2.png
- kelaghayi-brown-1.png, kelaghayi-brown-2.png
**Bu dosyalar asla kullanılmamalı — desen halüsinasyonu var!**

---

## DOSYA HARİTASI

```
/paressilk/
├── COWORK-HANDOFF.md              ← Bu dosya
├── paressilk-instagram-templates.html  ← Express kaynak HTML
├── public/images/products/        ← Site ürün görselleri (scarf-1.jpg güncellendi)
├── src/pages/Home.jsx             ← Video hero section eklendi
├── src/styles/global.css          ← Hero CSS güncellendi
├── src/data/products.json         ← 13 ürün kataloğu
├── product-originals/             ← RAW → JPG çevrilmiş orijinaller
│   ├── DSC09751.jpg
│   ├── DSC09880.jpg
│   ├── DSC09884.jpg
│   └── DSC09886.jpg
├── product-professional/          ← Profesyonelleştirilmiş ürün fotoğrafları
│   ├── scarf-classic-1-*.jpg      ← 19 dosya (3 bg x 3 format + varyasyonlar)
│   └── scarf-classic-1-transparent.png
├── instagram-reels/               ← 3 Reel + 3 thumbnail
│   ├── reel1_marka_tanitim.mp4 + thumb
│   ├── reel2_street_style.mp4 + thumb
│   └── reel3_closeup_luks.mp4 + thumb
├── instagram-content/
│   ├── captions.md                ← 6 caption + 3 hashtag seti
│   ├── highlights/                ← 5 SVG + 5 PNG (story kapakları)
│   ├── posts/scarf-classic-1/     ← 4 branded carousel slide
│   └── *.png                      ← ⚠ GEÇERSİZ Higgsfield çıktıları
└── video-frames/                  ← 6 video frame (model referansları)
```
