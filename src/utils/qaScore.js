// Otomatik QA skoru — üretilen görseli orijinalle karşılaştırır.
// Mantık: AI yalnızca eşarbı EKLEMELİ; yüz, arka plan ve genel ışık DEĞİŞMEMELİ.
// Bu bölgelerdeki benzerlik ne kadar yüksekse skor o kadar yüksektir.
// QA < 90 => üretim FAILED sayılır (satışa uygun değil).
//
// Not: Bu hafif, bölge-bazlı bir ölçümdür (piksel benzerliği + parlaklık tutarlılığı).
// Milestone 3'te derin metrik (SSIM/embedding) ile güçlendirilebilir.

const SIZE = 256; // karşılaştırma çözünürlüğü

function toGrayCanvasData(imgOrDataUrl) {
  return new Promise((resolve, reject) => {
    const draw = (img) => {
      const c = document.createElement('canvas');
      c.width = SIZE; c.height = SIZE;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      resolve(ctx.getImageData(0, 0, SIZE, SIZE).data);
    };
    if (typeof imgOrDataUrl === 'string') {
      const img = new Image();
      img.onload = () => draw(img);
      img.onerror = reject;
      img.src = imgOrDataUrl;
    } else {
      draw(imgOrDataUrl);
    }
  });
}

// Bir dikdörtgen bölgede iki görselin benzerliği (0-100)
function regionSimilarity(a, b, x0, y0, x1, y1) {
  let diff = 0, n = 0;
  for (let y = Math.floor(y0 * SIZE); y < Math.floor(y1 * SIZE); y++) {
    for (let x = Math.floor(x0 * SIZE); x < Math.floor(x1 * SIZE); x++) {
      const i = (y * SIZE + x) * 4;
      const la = 0.299 * a[i] + 0.587 * a[i + 1] + 0.114 * a[i + 2];
      const lb = 0.299 * b[i] + 0.587 * b[i + 1] + 0.114 * b[i + 2];
      diff += Math.abs(la - lb); n++;
    }
  }
  const avg = n ? diff / n : 0;         // 0-255 ortalama fark
  return Math.max(0, 100 - (avg / 255) * 100 * 2); // fark büyüdükçe hızlı düşer
}

function meanLuma(a) {
  let s = 0;
  for (let i = 0; i < a.length; i += 4) s += 0.299 * a[i] + 0.587 * a[i + 1] + 0.114 * a[i + 2];
  return s / (a.length / 4);
}

/**
 * @param {string} inputDataUrl - orijinal (temizlenmiş) kullanıcı görseli
 * @param {string} outputDataUrl - AI çıktısı
 * @param {{cx:number,cy:number,w:number,h:number}} [faceBox] - 0-1 normalize yüz kutusu (opsiyonel)
 * @returns {Promise<{score:number, passed:boolean, breakdown:object}>}
 */
export async function computeQA(inputDataUrl, outputDataUrl, faceBox) {
  const [a, b] = await Promise.all([
    toGrayCanvasData(inputDataUrl),
    toGrayCanvasData(outputDataUrl),
  ]);

  // Yüz bölgesi (verilmezse üst-orta varsayılan)
  const f = faceBox || { cx: 0.5, cy: 0.32, w: 0.30, h: 0.34 };
  const fx0 = Math.max(0, f.cx - f.w / 2), fx1 = Math.min(1, f.cx + f.w / 2);
  const fy0 = Math.max(0, f.cy - f.h / 2), fy1 = Math.min(1, f.cy + f.h / 2);

  const face = regionSimilarity(a, b, fx0, fy0, fx1, fy1);
  // Arka plan: üst-sol + üst-sağ köşe şeritleri
  const bgL = regionSimilarity(a, b, 0, 0, 0.18, 0.6);
  const bgR = regionSimilarity(a, b, 0.82, 0, 1, 0.6);
  const background = (bgL + bgR) / 2;
  // Elbise/gövde: alt bölge (eşarp buraya düşebilir → tolerans katsayısı)
  const dressRaw = regionSimilarity(a, b, 0.25, 0.78, 0.75, 1);
  const dress = Math.min(100, dressRaw + 15);
  // Saç: yüz üstü bant (eşarp örtebilir → tolerans)
  const hairRaw = regionSimilarity(a, b, fx0, Math.max(0, fy0 - 0.15), fx1, fy0);
  const hair = Math.min(100, hairRaw + 20);
  // Işık tutarlılığı: genel parlaklık farkı
  const lighting = Math.max(0, 100 - Math.abs(meanLuma(a) - meanLuma(b)) / 255 * 100 * 2.5);

  // Ağırlıklı skor — yüz ve arka plan en kritik (kimlik + sahne korunmalı)
  const score = Math.round(
    face * 0.34 + background * 0.24 + lighting * 0.16 + dress * 0.16 + hair * 0.10
  );

  return {
    score,
    passed: score >= 90,
    breakdown: {
      face: Math.round(face),
      background: Math.round(background),
      lighting: Math.round(lighting),
      dress: Math.round(dress),
      hair: Math.round(hair),
    },
  };
}
