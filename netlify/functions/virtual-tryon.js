// Sanal deneme — hibrit gerçekçilik katmanı.
// Frontend, gerçek ürün desenini yerleştirdiği kompozit görseli gönderir;
// bu fonksiyon onu NVIDIA FLUX.1 Kontext'e gönderip kumaş kıvrımı/gölge ekleterek
// fotorealistik hale getirir. Desen zaten görselde olduğundan birebir korunur.
// API anahtarı yalnızca sunucuda tutulur, KVKK gereği hiçbir görsel saklanmaz.

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.SITE_URL || 'https://paressilk.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const NVCF_ASSETS = 'https://api.nvcf.nvidia.com/v2/nvcf/assets';
const KONTEXT_URL = 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-kontext-dev';

// Basit in-memory rate limit (IP başına). Serverless'ta yalnızca sıcak instance
// içinde paylaşılır; kalıcı koruma için ileride Upstash/Redis eklenebilir.
// Yine de otomatik kötüye kullanım/döngü saldırılarına ilk savunma hattıdır.
const RATE_WINDOW_MS = 60 * 1000;     // 1 dakika
const RATE_MAX_PER_WINDOW = 3;        // dakikada en fazla 3 istek
const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_MAX = 20;                   // IP başına günlük en fazla 20 istek
const hits = new Map();               // ip -> { windowStart, count, dayStart, dayCount }

function checkRateLimit(ip) {
  const now = Date.now();
  let h = hits.get(ip);
  if (!h) {
    h = { windowStart: now, count: 0, dayStart: now, dayCount: 0 };
    hits.set(ip, h);
  }
  if (now - h.windowStart > RATE_WINDOW_MS) { h.windowStart = now; h.count = 0; }
  if (now - h.dayStart > DAY_MS) { h.dayStart = now; h.dayCount = 0; }
  h.count += 1;
  h.dayCount += 1;
  // Map'in sınırsız büyümesini engelle
  if (hits.size > 5000) {
    for (const [k, v] of hits) { if (now - v.dayStart > DAY_MS) hits.delete(k); }
  }
  return h.count <= RATE_MAX_PER_WINDOW && h.dayCount <= DAY_MAX;
}

// Kontext'in kabul ettiği çıktı boyutları
const ALLOWED_DIMS = [1568, 1504, 1456, 1392, 1328, 1248, 1184, 1104, 1024, 944, 880, 832, 800, 752, 720, 688, 672];
function nearestDim(v) {
  return ALLOWED_DIMS.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a));
}

const REALISM_PROMPT =
  'Make this headscarf drape realistically on the woman with natural silk folds, ' +
  'soft fabric shadows and highlights, so it looks like a real photograph. ' +
  'Keep the exact same pattern, colors and design of the scarf completely unchanged. ' +
  'Keep her face, skin, pose and the background identical. Photorealistic fashion photo.';

async function uploadAsset(apiKey, buffer) {
  // 1) Presigned URL al
  const res = await fetch(NVCF_ASSETS, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ contentType: 'image/jpeg', description: 'tryon' }),
  });
  if (!res.ok) throw new Error(`asset init ${res.status}`);
  const { assetId, uploadUrl } = await res.json();

  // 2) Görseli S3'e yükle
  const put = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'image/jpeg',
      'x-amz-meta-nvcf-asset-description': 'tryon',
    },
    body: buffer,
  });
  if (!put.ok) throw new Error(`asset put ${put.status}`);

  return assetId;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Netlify env'de anahtar NVIDIA_API_KEY veya Nvapi_Apikey adıyla olabilir
  const apiKey = process.env.NVIDIA_API_KEY || process.env.Nvapi_Apikey;
  if (!apiKey) {
    return { statusCode: 503, headers: HEADERS, body: JSON.stringify({ error: 'AI servisi yapılandırılmamış', fallback: true }) };
  }

  // Rate limit: kredi harcayan endpoint kötüye kullanıma karşı korunur
  const ip =
    (event.headers['x-nf-client-connection-ip'] ||
      event.headers['client-ip'] ||
      (event.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      'unknown');
  if (!checkRateLimit(ip)) {
    return {
      statusCode: 429,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Çok fazla deneme. Lütfen biraz sonra tekrar deneyin.', fallback: true }),
    };
  }

  try {
    const { image, width, height } = JSON.parse(event.body || '{}');
    if (!image || typeof image !== 'string') {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Görsel gerekli' }) };
    }

    // data URI ise gövdeyi ayıkla
    const b64 = image.includes(',') ? image.split(',', 2)[1] : image;
    const buffer = Buffer.from(b64, 'base64');

    // Boyut sınırı (KVKK + maliyet): 8MB üstünü reddet
    if (buffer.length > 8 * 1024 * 1024) {
      return { statusCode: 413, headers: HEADERS, body: JSON.stringify({ error: 'Görsel çok büyük' }) };
    }

    const outW = nearestDim(Number(width) || 832);
    const outH = nearestDim(Number(height) || 1024);

    const assetId = await uploadAsset(apiKey, buffer);

    const res = await fetch(KONTEXT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'NVCF-INPUT-ASSET-REFERENCES': assetId,
      },
      body: JSON.stringify({
        prompt: REALISM_PROMPT,
        // example_id, NVCF-INPUT-ASSET-REFERENCES başlığındaki asset'in İNDEKSİdir (UUID değil).
        image: 'data:image/jpeg;example_id,0',
        width: outW,
        height: outH,
        cfg_scale: 2.5,
        steps: 30,
        seed: 42,
      }),
    });

    if (!res.ok) {
      // NVIDIA tarafı hata verirse frontend geometrik giydirmeye düşsün
      const detail = await res.text().catch(() => '');
      console.error('kontext error', res.status, detail.slice(0, 200));
      return {
        statusCode: 502,
        headers: HEADERS,
        body: JSON.stringify({ error: 'AI gerçekçilik katmanı şu an kullanılamıyor', fallback: true }),
      };
    }

    const data = await res.json();
    let outB64 = null;
    if (data.artifacts && data.artifacts[0]?.base64) outB64 = data.artifacts[0].base64;
    else if (data.image) outB64 = data.image.includes(',') ? data.image.split(',', 2)[1] : data.image;

    if (!outB64) {
      return { statusCode: 502, headers: HEADERS, body: JSON.stringify({ error: 'AI yanıtı boş', fallback: true }) };
    }

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ image: `data:image/jpeg;base64,${outB64}` }),
    };
  } catch (err) {
    console.error('virtual-tryon error', err.message);
    return {
      statusCode: 502,
      headers: HEADERS,
      body: JSON.stringify({ error: 'İşlem başarısız', fallback: true }),
    };
  }
};
