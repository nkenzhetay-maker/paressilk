// Sanal deneme motoru — Google Gemini 2.5 Flash Image ("nano-banana") ile
// başörtüsü/şal giydirme. Kullanıcının HAM fotoğrafı + ürünün flatlay görseli
// Gemini'ye verilir; Gemini eşarbı kişinin başına/omzuna fotorealistik sarar,
// yüzü/kimliği/elbiseyi/arka planı korur, deseni birebir muhafaza eder.
//
// Motor-bağımsız yapı: engine tek fonksiyonda izole; ileride fal.ai/FASHN
// aynı arayüzle eklenebilir. API anahtarı yalnızca sunucuda, KVKK gereği
// hiçbir görsel kalıcı saklanmaz.

const GEMINI_MODEL = 'gemini-2.5-flash-image';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const COST_PER_IMAGE_USD = 0.039; // nano-banana yaklaşık birim maliyet (log/panel için)

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.SITE_URL || 'https://paressilk.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// --- Rate limit (kredi/para koruması) ---
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX_PER_WINDOW = 3;
const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_MAX = 20;
const hits = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  let h = hits.get(ip);
  if (!h) { h = { windowStart: now, count: 0, dayStart: now, dayCount: 0 }; hits.set(ip, h); }
  if (now - h.windowStart > RATE_WINDOW_MS) { h.windowStart = now; h.count = 0; }
  if (now - h.dayStart > DAY_MS) { h.dayStart = now; h.dayCount = 0; }
  h.count += 1; h.dayCount += 1;
  if (hits.size > 5000) { for (const [k, v] of hits) if (now - v.dayStart > DAY_MS) hits.delete(k); }
  return h.count <= RATE_MAX_PER_WINDOW && h.dayCount <= DAY_MAX;
}

// --- SKU bazlı drape stili (admin panelinden yönetilecek; şimdilik varsayılan) ---
const STYLE_INSTRUCTIONS = {
  headscarf: 'wrapped elegantly over her head, covering her hair, and draped naturally down over both shoulders like a traditional silk headscarf',
  shawl: 'draped softly over her shoulders and around the neck like an elegant silk shawl, hair left visible',
  loose_wrap: 'loosely wrapped around her neck and shoulders with natural silk folds',
};

function buildPrompt(style) {
  const placement = STYLE_INSTRUCTIONS[style] || STYLE_INSTRUCTIONS.headscarf;
  return (
    'You are given two images. The FIRST image is a photo of a woman. ' +
    'The SECOND image is a silk scarf with a specific printed pattern. ' +
    `Edit the FIRST image so she is wearing the scarf from the SECOND image, ${placement}. ` +
    'CRITICAL RULES: (1) Keep the scarf pattern, colors and design EXACTLY identical to the second image — do not invent or alter the pattern. ' +
    '(2) Never modify her face, eyes, nose, mouth, skin or identity. ' +
    '(3) Keep her existing clothing, body and the background completely unchanged. ' +
    '(4) Only add the scarf. Natural fabric folds, soft realistic shadows, silk sheen, correct perspective and gravity. ' +
    'Photorealistic, high resolution, no artifacts.'
  );
}

async function fetchAsInlineData(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`scarf fetch ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get('content-type') || 'image/jpeg';
  return { mime_type: mime.split(';')[0], data: buf.toString('base64') };
}

// --- Gemini motoru ---
async function runGemini(apiKey, userInline, scarfInline, style) {
  const body = JSON.stringify({
    contents: [{
      parts: [
        { text: buildPrompt(style) },
        { inline_data: userInline },
        { inline_data: scarfInline },
      ],
    }],
    generationConfig: { responseModalities: ['IMAGE'] },
  });

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (res.status === 429) {
    const e = new Error('quota'); e.kind = 'quota'; throw e;
  }
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    console.error('gemini error', res.status, t.slice(0, 200));
    const e = new Error('engine'); e.kind = 'engine'; throw e;
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  for (const p of parts) {
    const inl = p.inline_data || p.inlineData;
    if (inl?.data) return `data:${inl.mime_type || inl.mimeType || 'image/png'};base64,${inl.data}`;
  }
  const e = new Error('empty'); e.kind = 'empty'; throw e;
}

exports.handler = async (event) => {
  const t0 = Date.now();
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 503, headers: HEADERS, body: JSON.stringify({ error: 'AI motoru yapılandırılmamış', fallback: true }) };
  }

  const ip = event.headers['x-nf-client-connection-ip']
    || event.headers['client-ip']
    || (event.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || 'unknown';
  if (!checkRateLimit(ip)) {
    return { statusCode: 429, headers: HEADERS, body: JSON.stringify({ error: 'Çok fazla deneme. Lütfen biraz sonra tekrar deneyin.', fallback: true }) };
  }

  try {
    const { userImage, scarfImagePath, scarfImage, style } = JSON.parse(event.body || '{}');

    if (!userImage || typeof userImage !== 'string') {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Kullanıcı fotoğrafı gerekli' }) };
    }
    // Kullanıcı görseli data URI -> inline
    const uMatch = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(userImage);
    if (!uMatch) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Geçersiz görsel formatı' }) };
    }
    const userBuf = Buffer.from(uMatch[2], 'base64');
    if (userBuf.length > 12 * 1024 * 1024) {
      return { statusCode: 413, headers: HEADERS, body: JSON.stringify({ error: 'Görsel çok büyük' }) };
    }
    const userInline = { mime_type: uMatch[1], data: uMatch[2] };

    // Eşarp görseli: ya doğrudan base64 (scarfImage) ya da site üzerinden path
    let scarfInline;
    if (scarfImage && /^data:image\//.test(scarfImage)) {
      const sMatch = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(scarfImage);
      scarfInline = { mime_type: sMatch[1], data: sMatch[2] };
    } else if (scarfImagePath) {
      const base = process.env.SITE_URL || 'https://paressilk.com';
      const safePath = String(scarfImagePath).startsWith('/') ? scarfImagePath : `/${scarfImagePath}`;
      scarfInline = await fetchAsInlineData(`${base}${safePath}`);
    } else {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Ürün görseli gerekli' }) };
    }

    const resultImage = await runGemini(apiKey, userInline, scarfInline, style);

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        image: resultImage,
        meta: {
          engine: GEMINI_MODEL,
          style: style || 'headscarf',
          durationMs: Date.now() - t0,
          estimatedCostUsd: COST_PER_IMAGE_USD,
        },
      }),
    };
  } catch (err) {
    const kind = err.kind || 'unknown';
    const msg = kind === 'quota'
      ? 'AI kotası doldu (billing gerekli). Lütfen daha sonra tekrar deneyin.'
      : kind === 'empty'
        ? 'AI görsel üretemedi, lütfen farklı bir fotoğraf deneyin.'
        : 'AI işlemi tamamlanamadı.';
    console.error('virtual-tryon', kind, err.message);
    return {
      statusCode: kind === 'quota' ? 429 : 502,
      headers: HEADERS,
      body: JSON.stringify({ error: msg, fallback: true, kind, durationMs: Date.now() - t0 }),
    };
  }
};
