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
│   ├── woman01_front.jpg
│   ├── woman02_front.jpg
│   ├── woman03_front.jpg
│   ├── woman04_front.jpg
│   └── woman05_front.jpg
├── scarves/           ← 5 eşarp ürün görseli
│   ├── PRS0001_classic.jpg
│   ├── PRS0002_modern.jpg
│   ├── PRS0003_loose.jpg
│   ├── PRS0004_shawl.jpg
│   └── PRS0005_silk.jpg
└── README.md
```

> 📌 **DOSYA ADLARI SABİTTİR — asla değişmez.** Yıllarca aynı adlarla aynı dataset
> kullanılır; böylece "prompt v1 vs v8" veya "Gemini vs başka model" karşılaştırmaları
> her zaman birebir aynı veri üzerinde yapılır. Görsel değişimi = datasetVersion artar
> (`testing/config/benchmark.config.json` → `datasetVersion`).

## models/ — Kadın fotoğrafı gereksinimleri

Her fotoğraf **gerçek müşteri senaryosunu** temsil etmeli. 5 fotoğraf **çeşitlilik** içermeli:

| Dosya | Senaryo |
|-------|---------|
| woman01_front.jpg | Tam boy, elbiseli, düz önden, iç mekan |
| woman02_front.jpg | Üst beden (baş+omuz+göğüs), pencere ışığı |
| woman03_front.jpg | Tam boy, dış mekan, güneş ışığı |
| woman04_front.jpg | Üst beden, koyu renk kıyafet, stüdyo/sade fon |
| woman05_front.jpg | Tam boy, hareketli poz (hafif dönük), karışık ışık |

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
- Dosya adı standardı: `SKU_stil.jpg` (ör. `PRS0001_classic.jpg`) — rapor bu adı kullanır
- Mevcut ürünlerden hızlı başlangıç:
  ```bash
  cp public/images/products/k01_flatlay.jpg testing/golden-dataset/scarves/PRS0001_classic.jpg
  cp public/images/products/k02_flatlay.jpg testing/golden-dataset/scarves/PRS0002_modern.jpg
  cp public/images/products/k03_flatlay.jpg testing/golden-dataset/scarves/PRS0003_loose.jpg
  cp public/images/products/k04_flatlay.jpg testing/golden-dataset/scarves/PRS0004_shawl.jpg
  cp public/images/products/k05_flatlay.jpg testing/golden-dataset/scarves/PRS0005_silk.jpg
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
1–5 puanlama formu içerir (6 kriter):
- Yüz korunmuş mu?
- Saç korunmuş mu?
- Elbise korunmuş mu?
- Kumaş gerçekçiliği (ipek hissi)?
- Lüks görünüm?
- **Satın alır mıydınız?** ← en kritik kriter: amaç güzel görsel değil, satış dönüşümü

Form genel ortalamayı hesaplar ve **PASS / FAIL** kararı verir (hedef: ≥ 4/5).
Bir algoritma "müşteri bunu satın alır mı?" sorusunu ölçemez — nihai kabul kararı
insan QA ortalamasına dayanır.

## 🏛 Business Acceptance Gate (BAG) — Milestone 3'ün SON kapısı

`testing/reports/business.html` (her koşunun kendi klasöründe de kopyası var) —
mühendislik değil, **müşteri güveni** ölçer. 6 ticari soru (1-5):

1. Eşarp doğal giyilmiş görünüyor mu?
2. Bunun gerçek bir fotoğraf olduğuna inanır mıydınız?
3. Paressilk'in lüks imajını koruyor mu?
4. Satın almadan önce bu önizlemeye güvenir miydiniz?
5. **Sadece bu önizlemeye bakarak satın alır mıydınız?**
6. Bu özelliği bir arkadaşınıza tavsiye eder miydiniz?

- **Overall Commercial Score:** PASS ≥ **4.2** / FAIL < 4.2 — Milestone 3'e geçiş şartı
- **Customer Confidence Index (CCI):** %40 satın alma + %30 güven + %30 gerçeklik

### 5 kişilik jüri (tek kişinin beğenisi yeterli değil)
Önerilen jüri: siz + aile bireyi + bir kadın arkadaş + Paressilk'ten biri + modaya
ilgili biri. Her üye `business.html`'i açar, **kendi adını yazar**, aynı 25 görseli
puanlar, "JSON İndir" ile dışa aktarır. JSON dosyaları o koşunun
`testing/results/<runId>/` klasörüne konur → `npm run compare` hepsini birleştirir.

### A/B Prompt Testi
1. `benchmark.config.json` → `promptVersion: "v1"` → preflight → benchmark → jüri puanlar
2. Yeni prompt tanımla (v2) → config'i güncelle → preflight → benchmark → aynı jüri puanlar
3. `npm run compare` → koşuları yan yana kıyaslar, **en iyi promptu otomatik seçer**

Prompt kilidi sayesinde her koşu tek bir prompt sürümüyle üretilir — sonuçlar
bilimsel olarak karşılaştırılabilir.

## 👥 Gerçek Kullanıcı Testi (Milestone 2 sonrası kural)

Benchmark PASS olsa bile, Milestone 3'ten önce **en az 10 gerçek kullanıcı**
(hedef müşteri profiline yakın) sistemi kendi fotoğrafıyla denemeli. Sorulacaklar:
- Fotoğraf yüklemek kolay mıydı?
- Bekleme süresi kabul edilebilir miydi?
- Sonuç sana güven verdi mi?
- Bu görsele bakarak eşarbı satın almayı düşünür müydün?

Bu geri bildirim teknik benchmark kadar değerlidir — UX sorunları ancak gerçek
kullanıcıyla ortaya çıkar.
