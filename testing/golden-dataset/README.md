# Golden Dataset — Sanal Deneme Kalite Ölçüm Seti

Bu klasör, sanal deneme sisteminin **tekrarlanabilir kalite ölçümü** için sabit veri setidir.
Model, prompt veya sağlayıcı değiştiğinde kalite **aynı veriyle** yeniden ölçülür — böylece
"yeni prompt daha mı iyi?" sorusunun cevabı tahmin değil, ölçüm olur.

> ⚠️ Bu depoya telif hakkı olan görsel koymayın. Kendi çektiğiniz veya kullanım hakkına
> sahip olduğunuz görseller kullanın (kendi ürün çekimleriniz idealdir).

## Klasör Yapısı

```
golden-dataset/
├── models/            ← 5 kadın fotoğrafı (deneme yapılacak kişiler)
│   ├── woman01.jpg
│   ├── woman02.jpg
│   ├── woman03.jpg
│   ├── woman04.jpg
│   └── woman05.jpg
├── scarves/           ← 5 eşarp ürün görseli
│   ├── PRS-0001.png
│   ├── PRS-0002.png
│   ├── PRS-0003.png
│   ├── PRS-0004.png
│   └── PRS-0005.png
└── README.md
```

## models/ — Kadın fotoğrafı gereksinimleri

Her fotoğraf **gerçek müşteri senaryosunu** temsil etmeli. 5 fotoğraf **çeşitlilik** içermeli:

| Dosya | Senaryo |
|-------|---------|
| woman01.jpg | Tam boy, elbiseli, düz önden, iç mekan |
| woman02.jpg | Üst beden (baş+omuz+göğüs), pencere ışığı |
| woman03.jpg | Tam boy, dış mekan, güneş ışığı |
| woman04.jpg | Üst beden, koyu renk kıyafet, stüdyo/sade fon |
| woman05.jpg | Tam boy, hareketli poz (hafif dönük), karışık ışık |

**Zorunlu kriterler (hepsi için):**
- Başı açık (eşarpsız/şapkasız) — sistem eşarbı EKLEYECEK
- Yüz net görünür, önden veya hafif açılı
- En az omuz + göğüs hizası kadrajda
- Tek kişi
- Net (bulanık değil), dengeli ışık
- Min. 768px genişlik, JPEG/PNG

## scarves/ — Eşarp görseli gereksinimleri

- **Flatlay** (düz serili) veya tam açık desen görseli — sade zeminde
- Desen TAMAMEN görünür, kenarlar kırpılmamış
- Dosya adı = SKU (ör. `PRS-0014.png`) — rapor bu adı kullanır
- Mevcut ürünlerden hızlı başlangıç: `public/images/products/k*_flatlay.jpg`
  dosyalarından 5'ini buraya SKU adıyla kopyalayabilirsiniz:
  ```bash
  cp public/images/products/k01_flatlay.jpg testing/golden-dataset/scarves/PRS-0014.jpg
  cp public/images/products/k02_flatlay.jpg testing/golden-dataset/scarves/PRS-0015.jpg
  cp public/images/products/k03_flatlay.jpg testing/golden-dataset/scarves/PRS-0016.jpg
  cp public/images/products/k04_flatlay.jpg testing/golden-dataset/scarves/PRS-0017.jpg
  cp public/images/products/k05_flatlay.jpg testing/golden-dataset/scarves/PRS-0018.jpg
  ```

## Çalıştırma

```bash
GEMINI_API_KEY=... npm run benchmark
```

- Ayarlar: `testing/config/benchmark.config.json`
- Çıktılar: `testing/results/<tarih>/…png`
- Raporlar: `testing/reports/report.json`, `report.md`, `index.html`

> 💰 Her kombinasyon gerçek AI çağrısıdır (≈$0.039/görsel). 5×5 = 25 görsel ≈ **$0.98**.

## QA — İki katmanlı değerlendirme

**1) Otomatik QA (script ölçer — teknik):** çıktı üretildi mi, çözünürlük, süre,
dosya boyutu, API hatası. Bunlar objektif ve otomatiktir.

**2) İnsan QA (sen puanlarsın — ticari):** `testing/reports/index.html` her görsel için
1–5 puanlama formu içerir:
- Yüz korunmuş mu?
- Elbise korunmuş mu?
- Eşarp doğal duruyor mu?
- Kumaş/ipek hissi gerçekçi mi?
- Satın alma güveni oluşturuyor mu?

Bir algoritma "müşteri bunu satın alır mı?" sorusunu ölçemez — o yüzden nihai
kabul kararı insan QA ortalamasına dayanır (hedef: ≥ 4/5).
