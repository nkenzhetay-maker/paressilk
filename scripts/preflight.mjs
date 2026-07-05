#!/usr/bin/env node
/**
 * AI READINESS GATE — Milestone 2 öncesi ön-uçuş kontrolü.
 *
 * Amaç: Gemini'ye tek bir GÖRSEL üretimi yapmadan önce deneyin bilimsel olarak
 * tekrarlanabilir olduğunu doğrulamak. Tüm maddeler GREEN olmadan benchmark çalışmaz.
 *
 * Kullanım:  GEMINI_API_KEY=... npm run preflight
 *
 * Kontroller:
 *  1. BILLING   — anahtar geçerli mi, model erişilebilir mi, kota var mı
 *                 (yalnızca minik METİN çağrısı; görsel üretimi YAPILMAZ)
 *  2. DATASET   — tam 5 model + 5 eşarp, çözünürlük, duplicate, bozuk dosya, dataset hash
 *  3. PROMPT    — kullanılacak promptun tamamı + SHA256 + uzunluk (FREEZE)
 *  4. COST      — 25 üretim maliyet/worst-case/süre tahmini
 *  5. DRY RUN   — her payload üretilir ve doğrulanır (API'ye GİTMEZ)
 *  6. APPROVAL  — benchmark otomatik BAŞLAMAZ; insan onayı gerekir
 *
 * Tüm kontroller geçerse testing/config/.preflight.json yazılır.
 * benchmark.mjs bu dosya olmadan (veya hash uyuşmazsa) ÇALIŞMAYI REDDEDER.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CFG = JSON.parse(fs.readFileSync(path.join(ROOT, 'testing/config/benchmark.config.json'), 'utf8'));
const DS = path.join(ROOT, 'testing/golden-dataset');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// benchmark.mjs ile AYNI prompt kaynağı (freeze bütünlüğü için tek yerden okunmalı;
// prompt değişikliği = yeni sürüm + yeni preflight zorunlu)
const PROMPTS = {
  v1: 'You are given two images. The FIRST image is a photo of a woman. The SECOND image is a silk scarf ' +
      'with a specific printed pattern. Edit the FIRST image so she is wearing the scarf from the SECOND image, ' +
      'wrapped elegantly over her head covering her hair and draped naturally over both shoulders like a traditional silk headscarf. ' +
      'CRITICAL RULES: (1) Keep the scarf pattern, colors and design EXACTLY identical to the second image. ' +
      '(2) Never modify her face, eyes, nose, mouth, skin or identity. ' +
      '(3) Keep her existing clothing, body and the background completely unchanged. ' +
      '(4) Only add the scarf. Natural fabric folds, soft realistic shadows, silk sheen. Photorealistic, high resolution.',
};

const G = (s) => `\x1b[32m${s}\x1b[0m`;
const R = (s) => `\x1b[31m${s}\x1b[0m`;
const Y = (s) => `\x1b[33m${s}\x1b[0m`;
const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? G('✓ GREEN') : R('✗ RED  ')}  ${name}${detail ? ` — ${detail}` : ''}`);
  return ok;
}

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort().map(f => path.join(dir, f));
}

function imageDims(buf) {
  try {
    if (buf[0] === 0x89 && buf[1] === 0x50) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < buf.length - 8) {
        if (buf[i] !== 0xff) { i++; continue; }
        const m = buf[i + 1], len = buf.readUInt16BE(i + 2);
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
          return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
        i += 2 + len;
      }
    }
  } catch { /* yut */ }
  return { w: null, h: null };
}

async function main() {
  console.log('\n================ AI READINESS GATE ================\n');

  // ---------- 1. BILLING ----------
  console.log('1) BILLING CHECK');
  const key = process.env.GEMINI_API_KEY;
  let billingOk = false;
  if (!key) {
    check('API key', false, 'GEMINI_API_KEY tanımlı değil');
  } else {
    check('API key', true, `${key.slice(0, 8)}…`);
    // Model erişimi (ücretsiz metadata GET)
    try {
      const mi = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${CFG.model}?key=${key}`, { headers: { 'User-Agent': UA } });
      check('Model erişimi', mi.ok, mi.ok ? CFG.model : `HTTP ${mi.status}`);
    } catch (e) { check('Model erişimi', false, e.message); }
    // Kota/billing: minik METİN çağrısı (görsel üretimi DEĞİL, maliyet ihmal edilebilir)
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${CFG.model}:generateContent?key=${key}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }], generationConfig: { responseModalities: ['IMAGE', 'TEXT'], maxOutputTokens: 8 } }),
      });
      if (r.status === 429) {
        const t = await r.text().catch(() => '');
        billingOk = check('Billing / kota', false, /free_tier/.test(t) ? 'FREE TIER — billing AKTİF DEĞİL (kart bağlanmalı)' : '429 kota doldu');
      } else {
        billingOk = check('Billing / kota', r.ok, r.ok ? 'kota kullanılabilir' : `HTTP ${r.status}`);
      }
    } catch (e) { check('Billing / kota', false, e.message); }
  }
  console.log(`  Model: ${CFG.model} · Görsel başına tahmini maliyet: $${CFG.costPerImageUsd}\n`);

  // ---------- 2. DATASET ----------
  console.log('2) DATASET VALIDATION');
  const models = listImages(path.join(DS, 'models'));
  const scarves = listImages(path.join(DS, 'scarves'));
  check('Model sayısı (tam 5)', models.length === 5, `${models.length}/5`);
  check('Eşarp sayısı (tam 5)', scarves.length === 5, `${scarves.length}/5`);

  const hashes = new Map();
  let corrupted = 0, lowRes = 0, dup = 0;
  const fileInfos = [];
  for (const f of [...models, ...scarves]) {
    const buf = fs.readFileSync(f);
    const h = sha256(buf);
    if (hashes.has(h)) dup++;
    hashes.set(h, f);
    const { w, hgt } = { w: imageDims(buf).w, hgt: imageDims(buf).h };
    if (!w) corrupted++;
    else if (w < 512) lowRes++;
    fileInfos.push({ file: path.basename(f), w, h: imageDims(buf).h, sha: h.slice(0, 12) });
  }
  check('Bozuk dosya yok', corrupted === 0, corrupted ? `${corrupted} bozuk` : 'tümü okunabilir');
  check('Çözünürlük ≥512px', lowRes === 0, lowRes ? `${lowRes} düşük çözünürlük` : 'uygun');
  check('Duplicate yok', dup === 0, dup ? `${dup} tekrar` : 'benzersiz');
  const datasetHash = sha256([...hashes.keys()].sort().join('')).slice(0, 16);
  console.log(`  Dataset hash: ${datasetHash} (datasetVersion ${CFG.datasetVersion})\n`);

  // ---------- 3. PROMPT FREEZE ----------
  console.log('3) PROMPT FREEZE');
  const prompt = PROMPTS[CFG.promptVersion];
  const promptOk = check('Prompt sürümü mevcut', !!prompt, CFG.promptVersion);
  let promptSha = null;
  if (prompt) {
    promptSha = sha256(Buffer.from(prompt));
    console.log(`  Prompt Version : ${CFG.promptVersion}`);
    console.log(`  Prompt SHA256  : ${promptSha}`);
    console.log(`  Prompt length  : ${prompt.length} karakter`);
    console.log(`  ---- PROMPT (benchmark boyunca DEĞİŞMEZ) ----`);
    console.log('  ' + prompt.replace(/(.{95})/g, '$1\n  '));
  }
  console.log('');

  // ---------- 4. BENCHMARK COST ----------
  console.log('4) BENCHMARK COST (henüz çalıştırılmıyor)');
  const total = models.length * scarves.length * (CFG.runsPerImage || 1);
  const est = total * CFG.costPerImageUsd;
  const worst = est * 2; // retry/tekrar payı
  console.log(`  Üretim sayısı   : ${total}`);
  console.log(`  Tahmini maliyet : $${est.toFixed(2)}`);
  console.log(`  Worst case      : $${worst.toFixed(2)}`);
  console.log(`  Beklenen süre   : ~${Math.round(total * 9 / 60)} dk (üretim başına ~9s)\n`);

  // ---------- 5. DRY RUN ----------
  console.log('5) DRY RUN — payload doğrulama (Gemini\'ye GİTMİYOR)');
  let payloadFail = 0;
  if (models.length && scarves.length && prompt) {
    console.log('  ID                              | Model              | SKU      | Çözünürlük | Payload | Maliyet');
    console.log('  ' + '-'.repeat(100));
    let seq = 0;
    const dateTag = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    for (const m of models) {
      for (const s of scarves) {
        seq++;
        const wTag = (path.basename(m).match(/woman(\d+)/i)?.[1] || String(seq)).padStart(2, '0');
        const sku = path.basename(s).split('_')[0].toUpperCase();
        const id = `RUN-${dateTag}-${String(seq).padStart(3, '0')}-${sku}-W${wTag}`;
        const mb = fs.readFileSync(m), sb = fs.readFileSync(s);
        const payloadBytes = Buffer.byteLength(JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: mb.toString('base64') } }, { inline_data: { mime_type: 'image/jpeg', data: sb.toString('base64') } }] }],
        }));
        const dims = imageDims(mb);
        const valid = payloadBytes < 20 * 1024 * 1024 && dims.w;
        if (!valid) payloadFail++;
        console.log(`  ${id} | ${path.basename(m).slice(0, 18).padEnd(18)} | ${sku.padEnd(8)} | ${String(dims.w + '×' + dims.h).padEnd(10)} | ${(payloadBytes / 1024 / 1024).toFixed(1)}MB   | $${CFG.costPerImageUsd}`);
      }
    }
    check('Tüm payloadlar geçerli', payloadFail === 0, payloadFail ? `${payloadFail} geçersiz` : `${total} payload hazır`);
  } else {
    check('Payload üretimi', false, 'dataset veya prompt eksik');
  }
  console.log('');

  // ---------- SONUÇ ----------
  const allGreen = results.every(r => r.ok);
  console.log('================ GATE SONUCU ================');
  if (allGreen) {
    const pass = {
      ready: true,
      timestamp: new Date().toISOString(),
      datasetHash,
      datasetVersion: CFG.datasetVersion,
      promptVersion: CFG.promptVersion,
      promptSha256: promptSha,
      model: CFG.model,
      combinations: total,
      estimatedCostUsd: +est.toFixed(2),
    };
    fs.writeFileSync(path.join(ROOT, 'testing/config/.preflight.json'), JSON.stringify(pass, null, 2));
    console.log(G('  ✅ READY FOR BENCHMARK — tüm kontroller GREEN'));
    console.log('  .preflight.json yazıldı (benchmark bu dosyayı doğrular).');
    console.log(Y('\n  6) HUMAN APPROVAL: Benchmark OTOMATİK BAŞLAMAZ.'));
    console.log('     Onaylıyorsanız çalıştırın:  GEMINI_API_KEY=... npm run benchmark');
  } else {
    try { fs.unlinkSync(path.join(ROOT, 'testing/config/.preflight.json')); } catch { /* yok */ }
    console.log(R('  ❌ NOT READY — kırmızı maddeler giderilmeden benchmark çalıştırılamaz:'));
    results.filter(r => !r.ok).forEach(r => console.log(R(`     • ${r.name}: ${r.detail || ''}`)));
  }
  console.log('=============================================\n');
  process.exit(allGreen ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
