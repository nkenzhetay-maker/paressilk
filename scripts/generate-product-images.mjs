#!/usr/bin/env node

const LUMA_API_KEY = process.env.LUMA_API_KEY;
const API_BASE = 'https://api.lumalabs.ai/dream-machine/v1/generations/image';

if (!LUMA_API_KEY) {
  console.error('❌ LUMA_API_KEY ortam değişkeni gerekli.');
  console.error('   export LUMA_API_KEY="your-key-here"');
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════
// PARESSILK ÜRÜN GÖRSELLERİ
// Not: Ürün desenleri Azer İpek orijinaldir.
// Görseller: ambalaj, lifestyle, flat-lay, etiket odaklı
// ═══════════════════════════════════════════════════════════

const WEBSITE_IMAGES = [
  // --- ÜRÜN FLAT-LAY ---
  {
    name: 'product-kelaghayi-burgundy',
    prompt: 'Overhead flat lay product photography of a luxury burgundy silk kelaghayi headscarf with traditional paisley patterns in gold, elegantly folded on white marble surface, natural soft light from left, ultra sharp textile texture detail visible, premium brand aesthetic, 8k',
    aspect_ratio: '1:1',
    category: 'website',
  },
  {
    name: 'product-kelaghayi-navy',
    prompt: 'Overhead flat lay of a navy blue silk kelaghayi scarf with teal turquoise paisley buta pattern, partially unfolded on light beige linen fabric, showing fringe detail, soft diffused natural light, luxury product photography, 8k quality',
    aspect_ratio: '1:1',
    category: 'website',
  },
  {
    name: 'product-scarf-emerald',
    prompt: 'Flat lay product photo of an emerald green pure silk scarf with subtle traditional motifs, rolled and partially draped on dark slate stone surface, dramatic side lighting showing silk sheen and luster, luxury brand photography, 8k',
    aspect_ratio: '3:4',
    category: 'website',
  },
  {
    name: 'product-scarf-cream-gold',
    prompt: 'Premium cream colored silk scarf with delicate gold printed border patterns, artfully draped in S-shape on clean white background, overhead shot, showing fabric transparency and luxurious drape, minimalist product photography, 8k',
    aspect_ratio: '3:4',
    category: 'website',
  },

  // --- AMBALAJ & ETİKET ---
  {
    name: 'packaging-gift-box-closed',
    prompt: 'Luxury matte black magnetic gift box with embossed gold logo on top, sitting on dark grey marble surface, dramatic spotlight from above, premium packaging product photography, high-end jewelry box aesthetic, 8k',
    aspect_ratio: '1:1',
    category: 'website',
  },
  {
    name: 'packaging-gift-box-open',
    prompt: 'Overhead view of open luxury black gift box containing a neatly folded navy silk scarf with paisley pattern, cream tissue paper, gold ribbon, and a small branded thank-you card, on dark surface, premium unboxing photography, 8k',
    aspect_ratio: '1:1',
    category: 'website',
  },
  {
    name: 'packaging-label-closeup',
    prompt: 'Extreme close-up macro photography of a luxury woven fabric label sewn onto silk scarf edge, label shows premium brand name in gold thread on black satin ribbon, shallow depth of field, soft bokeh background showing silk texture, 8k',
    aspect_ratio: '16:9',
    category: 'website',
  },

  // --- LIFESTYLE / EDİTORYAL ---
  {
    name: 'lifestyle-woman-kelaghayi',
    prompt: 'Elegant Turkish woman wearing a luxurious burgundy silk kelaghayi headscarf with gold paisley patterns, standing in front of old Istanbul stone architecture, golden hour warm sunlight, fashion editorial photography, shallow depth of field, cinematic, 8k',
    aspect_ratio: '3:4',
    category: 'website',
  },
  {
    name: 'lifestyle-woman-scarf-modern',
    prompt: 'Stylish young woman wearing a navy blue silk scarf as a neck accessory with a cream blazer, walking in a modern minimalist cafe interior, natural window light, contemporary fashion editorial, candid pose, 8k quality',
    aspect_ratio: '3:4',
    category: 'website',
  },
  {
    name: 'lifestyle-gift-moment',
    prompt: 'Close-up of elegant hands opening a luxury black gift box revealing a colorful silk scarf inside, warm ambient lighting, shallow depth of field, emotional gift-giving moment, premium brand campaign photography, 8k',
    aspect_ratio: '16:9',
    category: 'website',
  },

  // --- HERO / BANNER ---
  {
    name: 'hero-collection-wide',
    prompt: 'Multiple luxury silk scarves in jewel tones burgundy navy emerald and cream, artfully cascading and flowing on neutral beige marble surface, overhead wide shot, high-end fashion brand campaign, soft studio lighting, 8k, ultra wide format',
    aspect_ratio: '16:9',
    category: 'website',
  },
];

const INSTAGRAM_IMAGES = [
  // ═══ HEDİYE & KURUMSAL (%30 - ANA ODAK) ═══
  {
    name: 'ig-gift-corporate-desk',
    prompt: 'Luxury black gift box with gold embossed logo on a polished executive desk in a modern corner office, city skyline visible through window, silk scarf partially visible inside box, corporate gift concept, warm ambient lighting, premium business photography, square, 8k',
    aspect_ratio: '1:1',
    category: 'instagram-feed',
  },
  {
    name: 'ig-gift-unboxing-hands',
    prompt: 'Elegant female hands with minimal gold rings opening a luxury matte black magnetic gift box revealing a burgundy silk scarf with gold paisley pattern inside, cream tissue paper, close-up overhead shot, emotional unboxing moment, warm soft lighting, square, 8k',
    aspect_ratio: '1:1',
    category: 'instagram-feed',
  },
  {
    name: 'ig-gift-mothers-day',
    prompt: 'Beautiful gift composition: luxury black box with silk scarf, a handwritten card, fresh peonies, and a coffee cup on white marble breakfast tray, mothers day gift concept, bright warm morning light, aspirational lifestyle, square, 8k',
    aspect_ratio: '1:1',
    category: 'instagram-feed',
  },
  {
    name: 'ig-gift-corporate-set',
    prompt: 'Three identical luxury black gift boxes with gold branding arranged in a row on a conference table, each containing a different colored silk scarf, corporate bulk gift order concept, professional lighting, premium brand photography, square, 8k',
    aspect_ratio: '1:1',
    category: 'instagram-feed',
  },

  // ═══ STATÜ & KİŞİLİK (%25) ═══
  {
    name: 'ig-status-businesswoman',
    prompt: 'Confident professional Turkish businesswoman in a tailored black blazer with a burgundy silk scarf elegantly tied at her neck, standing in a modern glass office, power pose, natural light, editorial fashion portrait showing success and elegance, square, 8k',
    aspect_ratio: '1:1',
    category: 'instagram-feed',
  },
  {
    name: 'ig-status-meeting-detail',
    prompt: 'Close-up of a silk scarf detail on a womans shoulder during a business meeting, blurred laptop and coffee cup in background, focus on the luxurious fabric texture and pattern, the differentiating detail concept, warm tones, square, 8k',
    aspect_ratio: '1:1',
    category: 'instagram-feed',
  },
  {
    name: 'ig-status-self-investment',
    prompt: 'Elegant woman in her 30s looking at herself in an ornate gold mirror, adjusting her silk kelaghayi headscarf, luxurious bedroom interior, self-care and self-investment moment, warm golden hour light through curtains, intimate editorial, square, 8k',
    aspect_ratio: '1:1',
    category: 'instagram-feed',
  },

  // ═══ NADİR & ÖZEL ALGISI (%20) ═══
  {
    name: 'ig-rare-handcraft-detail',
    prompt: 'Extreme macro close-up of silk fabric showing individual thread weave pattern, subtle gold shimmer on burgundy background, artisan craftsmanship detail, dramatic side lighting creating texture shadows, rare handmade textile, square, 8k',
    aspect_ratio: '1:1',
    category: 'instagram-feed',
  },
  {
    name: 'ig-rare-limited-edition',
    prompt: 'Single luxury silk kelaghayi scarf spotlit on a dark velvet pedestal like a museum exhibit, dramatic spotlight from above, dark moody background, exclusive limited edition feeling, fine art product photography, square, 8k',
    aspect_ratio: '1:1',
    category: 'instagram-feed',
  },
  {
    name: 'ig-rare-certificate',
    prompt: 'Flat lay of a silk scarf corner with an elegant cream authenticity certificate card, a wax seal stamp, and the branded label visible, on dark leather surface, premium provenance and authenticity concept, overhead shot, warm tones, square, 8k',
    aspect_ratio: '1:1',
    category: 'instagram-feed',
  },

  // ═══ LIFESTYLE (%15) ═══
  {
    name: 'ig-lifestyle-istanbul',
    prompt: 'Elegant woman wearing silk kelaghayi headscarf walking through historic Istanbul streets with Bosphorus visible in background, golden hour, flowing dress, luxury handbag, cinematic travel fashion editorial, square, 8k',
    aspect_ratio: '1:1',
    category: 'instagram-feed',
  },
  {
    name: 'ig-lifestyle-evening',
    prompt: 'Woman at an upscale restaurant table, silk scarf draped over one shoulder of her black dress, candlelight reflecting on the silk fabric, champagne glass nearby, intimate luxury evening atmosphere, warm bokeh background, square, 8k',
    aspect_ratio: '1:1',
    category: 'instagram-feed',
  },

  // ═══ INSTAGRAM STORY / REELS (9:16) ═══
  {
    name: 'ig-story-gift-reveal',
    prompt: 'Vertical format: elegant hands lifting a silk scarf from a luxury black gift box, fabric flowing upward revealing paisley pattern, dramatic dark background with golden spotlight, cinematic gift reveal moment, slow motion feeling, 8k',
    aspect_ratio: '9:16',
    category: 'instagram-story',
  },
  {
    name: 'ig-story-boss-lady',
    prompt: 'Vertical full body shot of a powerful businesswoman in designer outfit with silk scarf, walking through a modern corporate lobby with marble floors and glass walls, confident stride, editorial fashion photography, cinematic lighting, 8k',
    aspect_ratio: '9:16',
    category: 'instagram-story',
  },
  {
    name: 'ig-story-craftsmanship',
    prompt: 'Vertical format artisan hands carefully folding and inspecting a silk kelaghayi scarf on a wooden workshop table, close-up showing the care and precision, warm workshop lighting, behind the scenes authenticity, 8k',
    aspect_ratio: '9:16',
    category: 'instagram-story',
  },
  {
    name: 'ig-story-styling-3ways',
    prompt: 'Vertical triptych composition showing three elegant ways to wear a silk scarf: as headscarf at top, as neck wrap in middle, as handbag accessory at bottom, clean minimal background, fashion styling tutorial format, bright lighting, 8k',
    aspect_ratio: '9:16',
    category: 'instagram-story',
  },
  {
    name: 'ig-story-quote-status',
    prompt: 'Minimalist vertical design: dark black background with subtle silk texture overlay, centered gold elegant typography space for quote, luxury brand aesthetic, premium feel, Instagram story format, 8k',
    aspect_ratio: '9:16',
    category: 'instagram-story',
  },

  // ═══ CAROUSEL (3:4) ═══
  {
    name: 'ig-carousel-why-silk',
    prompt: 'Split image: left side showing raw natural silk threads in golden light, right side showing finished luxury silk scarf with paisley pattern, transformation from material to art concept, editorial product photography, portrait 4:5, 8k',
    aspect_ratio: '3:4',
    category: 'instagram-carousel',
  },
  {
    name: 'ig-carousel-gift-guide',
    prompt: 'Beautifully arranged gift set flat lay: silk scarf in box, personalized card, gold ribbon, small perfume bottle, and fresh roses, on dark marble surface, ultimate luxury gift guide concept, overhead portrait format, warm lighting, 8k',
    aspect_ratio: '3:4',
    category: 'instagram-carousel',
  },
];

const ALL_IMAGES = [...WEBSITE_IMAGES, ...INSTAGRAM_IMAGES];

async function generateImage(product) {
  console.log(`\n🎨 Üretiliyor: ${product.name} [${product.category}]...`);

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LUMA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: product.prompt,
      aspect_ratio: product.aspect_ratio,
      model: 'photon-1',
      format: 'jpg',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API hatası (${res.status}): ${err}`);
  }

  const data = await res.json();
  console.log(`   ⏳ Generation ID: ${data.id}`);
  return data;
}

async function pollStatus(generationId) {
  const url = `https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`;

  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${LUMA_API_KEY}` },
    });
    const data = await res.json();

    if (data.state === 'completed') return data.assets?.image;
    if (data.state === 'failed') throw new Error(`Başarısız: ${data.failure_reason || 'bilinmeyen'}`);
    process.stdout.write('.');
  }
  throw new Error('Zaman aşımı');
}

async function downloadImage(imageUrl, filename, category) {
  const { writeFile, mkdir } = await import('fs/promises');

  let dir = 'public/images/products';
  if (category.startsWith('instagram')) {
    dir = `public/images/social/${category}`;
  }
  await mkdir(dir, { recursive: true });

  const res = await fetch(imageUrl);
  const buffer = Buffer.from(await res.arrayBuffer());
  const outputPath = `${dir}/${filename}.jpg`;
  await writeFile(outputPath, buffer);
  console.log(`\n   ✅ ${outputPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
  return outputPath;
}

async function main() {
  const args = process.argv.slice(2);

  let products = ALL_IMAGES;
  let label = 'tüm görseller';

  if (args[0] === '--list') {
    console.log('\n📋 Website Görselleri:');
    WEBSITE_IMAGES.forEach((p, i) => console.log(`  W${i + 1}. ${p.name} (${p.aspect_ratio})`));
    console.log('\n📸 Instagram Feed:');
    INSTAGRAM_IMAGES.filter(p => p.category === 'instagram-feed').forEach((p, i) => console.log(`  F${i + 1}. ${p.name} (${p.aspect_ratio})`));
    console.log('\n📱 Instagram Story/Reels:');
    INSTAGRAM_IMAGES.filter(p => p.category === 'instagram-story').forEach((p, i) => console.log(`  S${i + 1}. ${p.name} (${p.aspect_ratio})`));
    console.log('\n🖼️  Instagram Carousel:');
    INSTAGRAM_IMAGES.filter(p => p.category === 'instagram-carousel').forEach((p, i) => console.log(`  C${i + 1}. ${p.name} (${p.aspect_ratio})`));
    console.log(`\nToplam: ${ALL_IMAGES.length} görsel`);
    return;
  }

  if (args[0] === '--website') {
    products = WEBSITE_IMAGES;
    label = 'website görselleri';
  } else if (args[0] === '--instagram') {
    products = INSTAGRAM_IMAGES;
    label = 'instagram görselleri';
  } else if (args[0] === '--feed') {
    products = INSTAGRAM_IMAGES.filter(p => p.category === 'instagram-feed');
    label = 'instagram feed';
  } else if (args[0] === '--story') {
    products = INSTAGRAM_IMAGES.filter(p => p.category === 'instagram-story');
    label = 'instagram story';
  } else if (args[0] === '--custom') {
    const prompt = args.slice(1).join(' ');
    if (!prompt) { console.error('Kullanım: --custom "prompt"'); process.exit(1); }
    products = [{ name: `custom-${Date.now()}`, prompt, aspect_ratio: '1:1', category: 'custom' }];
    label = 'özel görsel';
  } else if (args[0] === '--only') {
    const indices = args.slice(1).map(Number);
    products = indices.map(i => ALL_IMAGES[i - 1]).filter(Boolean);
    label = `seçili ${products.length} görsel`;
  }

  console.log(`\n🧵 Paressilk Görsel Üretici`);
  console.log(`   ${label}: ${products.length} adet\n`);

  const results = [];
  for (const product of products) {
    try {
      const gen = await generateImage(product);
      const imageUrl = await pollStatus(gen.id);
      const path = await downloadImage(imageUrl, product.name, product.category);
      results.push({ name: product.name, path, status: 'ok' });
    } catch (err) {
      console.error(`\n   ❌ ${product.name}: ${err.message}`);
      results.push({ name: product.name, status: 'error', error: err.message });
    }
  }

  console.log('\n\n📊 Sonuç:');
  const ok = results.filter(r => r.status === 'ok');
  const fail = results.filter(r => r.status === 'error');
  console.log(`   ✅ Başarılı: ${ok.length}  ❌ Hatalı: ${fail.length}`);
  results.forEach(r => console.log(`   ${r.status === 'ok' ? '✅' : '❌'} ${r.name}`));
}

main();
