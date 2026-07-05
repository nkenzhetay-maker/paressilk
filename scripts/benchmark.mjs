#!/usr/bin/env node
/**
 * Golden Dataset Benchmark — tekrarlanabilir sanal deneme kalite ölçümü.
 *
 * Amaç: her model/prompt/sağlayıcı değişikliği AYNI veri setiyle karşılaştırılabilsin.
 *
 * Kullanım:
 *   GEMINI_API_KEY=... npm run benchmark
 *
 * Girdi : testing/golden-dataset/models/*  ×  testing/golden-dataset/scarves/*
 * Ayar  : testing/config/benchmark.config.json
 * Çıktı : testing/results/<runId>/*.png
 * Rapor : testing/reports/report.json + report.md + index.html
 *
 * QA iki katmandır:
 *  - OTOMATİK QA (bu script): çıktı üretildi mi, çözünürlük, süre, dosya boyutu, API hatası.
 *  - İNSAN QA (index.html): yüz/elbise/eşarp doğallığı/kumaş hissi/satın alma güveni (1-5).
 *    "Müşteri bunu satın alır mı?" sorusunu algoritma ölçemez — nihai karar insan QA'sıdır.
 *
 * ⚠️ Her kombinasyon gerçek AI çağrısıdır (para harcar). Script otomatik ÇALIŞTIRILMAZ;
 *    yalnızca elle `npm run benchmark` ile.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CFG = JSON.parse(fs.readFileSync(path.join(ROOT, 'testing/config/benchmark.config.json'), 'utf8'));

const DS = path.join(ROOT, 'testing/golden-dataset');
const RESULTS_ROOT = path.join(ROOT, CFG.output.resultsDir);
const REPORTS = path.join(ROOT, CFG.output.reportsDir);

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${CFG.model}:generateContent`;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// Prompt sürümleri — netlify/functions/virtual-tryon.js ile senkron tutulur.
const PROMPTS = {
  v1: 'You are given two images. The FIRST image is a photo of a woman. The SECOND image is a silk scarf ' +
      'with a specific printed pattern. Edit the FIRST image so she is wearing the scarf from the SECOND image, ' +
      'wrapped elegantly over her head covering her hair and draped naturally over both shoulders like a traditional silk headscarf. ' +
      'CRITICAL RULES: (1) Keep the scarf pattern, colors and design EXACTLY identical to the second image. ' +
      '(2) Never modify her face, eyes, nose, mouth, skin or identity. ' +
      '(3) Keep her existing clothing, body and the background completely unchanged. ' +
      '(4) Only add the scarf. Natural fabric folds, soft realistic shadows, silk sheen. Photorealistic, high resolution.',
};

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort().map(f => path.join(dir, f));
}

function inline(file) {
  const ext = path.extname(file).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  return { mime_type: mime, data: fs.readFileSync(file).toString('base64') };
}

// PNG/JPEG çözünürlüğü (harici bağımlılık olmadan)
function imageDims(buf) {
  try {
    if (buf[0] === 0x89 && buf[1] === 0x50) { // PNG
      return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) { // JPEG
      let i = 2;
      while (i < buf.length - 8) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
        }
        i += 2 + len;
      }
    }
  } catch { /* yut */ }
  return { w: null, h: null };
}

async function generate(modelFile, scarfFile, prompt) {
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }, { inline_data: inline(modelFile) }, { inline_data: inline(scarfFile) }] }],
    generationConfig: { responseModalities: ['IMAGE'] },
  });
  const t0 = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CFG.timeoutMs);
  try {
    const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
      body,
      signal: ctrl.signal,
    });
    const ms = Date.now() - t0;
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { ok: false, ms, error: `HTTP ${res.status}: ${t.slice(0, 140)}` };
    }
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const inl = parts.map(p => p.inline_data || p.inlineData).find(x => x?.data);
    if (!inl) return { ok: false, ms, error: 'API 200 döndü ama görsel yok' };
    return { ok: true, ms, buffer: Buffer.from(inl.data, 'base64') };
  } catch (e) {
    return { ok: false, ms: Date.now() - t0, error: e.name === 'AbortError' ? `timeout (${CFG.timeoutMs}ms)` : e.message };
  } finally {
    clearTimeout(timer);
  }
}

// ---------- Raporlar ----------

function writeMd(report) {
  const md = `# Sanal Deneme Benchmark Raporu

| Alan | Değer |
|------|-------|
| Tarih | ${report.date} |
| Provider | ${report.provider} |
| Model | ${report.model} |
| Prompt Version | ${report.promptVersion} |
| Kombinasyon | ${report.combinations} |
| Başarılı (otomatik QA) | ${report.autoQa.passed} |
| Başarısız | ${report.autoQa.failed} |
| Başarı oranı | ${report.autoQa.successRate} |
| Ortalama süre | ${report.avgTimeSec}s |
| Ortalama maliyet | $${report.avgCostUsd} |
| Toplam maliyet | $${report.totalCostUsd} |

> **Otomatik QA yalnızca tekniktir** (çıktı üretildi mi, çözünürlük, süre, hata).
> Ticari kalite kararı için \`index.html\` içindeki **İnsan QA** puanlamasını doldurun
> (hedef ortalama ≥ ${report.humanQaTarget}/5).

## Kombinasyonlar

| # | Model | Eşarp | Durum | Süre | Çözünürlük | Boyut | Hata |
|---|-------|-------|-------|------|-----------|-------|------|
${report.rows.map((r, i) =>
  `| ${i + 1} | ${r.model} | ${r.scarf} | ${r.ok ? '✅' : '❌'} | ${(r.ms / 1000).toFixed(1)}s | ${r.width && r.height ? `${r.width}×${r.height}` : '—'} | ${r.bytes ? Math.round(r.bytes / 1024) + 'KB' : '—'} | ${r.error || '—'} |`
).join('\n')}
`;
  fs.writeFileSync(path.join(REPORTS, 'report.md'), md);
}

function writeHtml(report, runDirRel) {
  const rows = report.rows.map((r, i) => `
    <tr data-id="${r.id}">
      <td>${i + 1}</td>
      <td>${r.ok ? `<img src="../results/${runDirRel}/${r.file}" loading="lazy">` : '<div class="noimg">üretilemedi</div>'}</td>
      <td>${r.model}<br><small>${r.scarf}</small></td>
      <td><span class="badge ${r.ok ? 'ok' : 'fail'}">${r.ok ? 'Üretildi' : 'Hata'}</span>${r.error ? `<br><small class="err">${r.error}</small>` : ''}</td>
      <td>${(r.ms / 1000).toFixed(1)}s</td>
      <td>${r.width && r.height ? `${r.width}×${r.height}` : '—'}</td>
      <td>$${report.avgCostUsd}</td>
      <td class="hq">${r.ok ? ['Yüz korunmuş', 'Saç korunmuş', 'Elbise korunmuş', 'Kumaş gerçekçiliği', 'Lüks görünüm', 'Satın alır mıydınız?'].map(k =>
        `<label>${k} <select data-k="${k}"><option value="">–</option>${[1, 2, 3, 4, 5].map(v => `<option>${v}</option>`).join('')}</select></label>`
      ).join('') + '<div class="avg">Ortalama: <b>–</b></div>' : '—'}</td>
    </tr>`).join('');

  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8">
<title>Benchmark Raporu — ${report.date}</title>
<style>
  body{font-family:system-ui,sans-serif;margin:24px;background:#fafafa;color:#222}
  h1{font-size:1.3rem} .meta{display:flex;gap:16px;flex-wrap:wrap;margin:12px 0 20px}
  .meta div{background:#fff;border:1px solid #e5e5e5;border-radius:8px;padding:10px 14px;font-size:.85rem}
  .meta b{display:block;font-size:1.1rem}
  table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e5e5;font-size:.82rem}
  th,td{padding:8px 10px;border-top:1px solid #eee;text-align:left;vertical-align:top}
  th{background:#f4f4f4} img{width:110px;border-radius:6px;display:block}
  .noimg{width:110px;height:80px;background:#eee;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:.7rem;color:#999}
  .badge{padding:2px 8px;border-radius:4px;font-size:.72rem;font-weight:600}
  .ok{background:#e8f5e9;color:#2e7d32}.fail{background:#ffebee;color:#c62828}
  .err{color:#c62828} .hq label{display:flex;justify-content:space-between;gap:6px;margin:2px 0;font-size:.75rem}
  .hq select{font-size:.75rem} .avg{margin-top:6px;font-size:.78rem;color:#555}
  .toolbar{margin:16px 0} button{padding:8px 14px;border:1px solid #ccc;border-radius:6px;background:#fff;cursor:pointer}
  .note{background:#fff8e1;border:1px solid #ffe082;border-radius:8px;padding:12px;font-size:.82rem;margin-bottom:16px}
</style></head><body>
<h1>Sanal Deneme Benchmark — İnsan QA Değerlendirmesi</h1>
<div class="meta">
  <div>Provider<b>${report.provider}</b></div>
  <div>Model<b>${report.model}</b></div>
  <div>Prompt<b>${report.promptVersion}</b></div>
  <div>Kombinasyon<b>${report.combinations}</b></div>
  <div>Otomatik QA geçen<b>${report.autoQa.passed}/${report.combinations}</b></div>
  <div>Ort. süre<b>${report.avgTimeSec}s</b></div>
  <div>Toplam maliyet<b>$${report.totalCostUsd}</b></div>
</div>
<div class="note"><b>İnsan QA:</b> Her üretilen görsel için 5 kriteri 1–5 puanlayın
(5 = mükemmel). Otomatik ölçüm bunları ölçemez: "eşarp doğal mı, ipek hissi var mı,
müşteri satın alır mı" kararı sizindir. Hedef genel ortalama: ≥ ${report.humanQaTarget}/5.
Puanlar tarayıcıda saklanır; "JSON İndir" ile dışa aktarın.</div>
<div class="toolbar"><button id="export">İnsan QA Puanlarını JSON İndir</button>
<span id="overall" style="margin-left:12px;font-size:.85rem"></span></div>
<table><thead><tr><th>#</th><th>Görsel</th><th>Girdi</th><th>Otomatik QA</th><th>Süre</th><th>Çözünürlük</th><th>Maliyet</th><th>İnsan QA (1-5)</th></tr></thead>
<tbody>${rows}</tbody></table>
<script>
const KEY='paressilk_benchmark_hq_${report.runId}';
const saved=JSON.parse(localStorage.getItem(KEY)||'{}');
function recalc(){
  let all=[],rows=document.querySelectorAll('tr[data-id]');
  rows.forEach(tr=>{
    const id=tr.dataset.id,vals=[...tr.querySelectorAll('select')].map(s=>+s.value).filter(Boolean);
    const avgEl=tr.querySelector('.avg b');
    if(avgEl){const a=vals.length?(vals.reduce((x,y)=>x+y)/vals.length):null;
      avgEl.textContent=a?a.toFixed(1):'–';if(a)all.push(a);}
  });
  const target=${report.humanQaTarget};
  if(all.length){
    const avg=all.reduce((x,y)=>x+y)/all.length;
    const pass=avg>=target;
    const el=document.getElementById('overall');
    el.innerHTML='Genel İnsan QA: <b>'+avg.toFixed(2)+'/5</b> ('+all.length+' görsel) — '+
      (pass?'<b style="color:#2e7d32">PASS ✅</b>':'<b style="color:#c62828">FAIL ❌ (hedef ≥ '+target+')</b>');
  } else { document.getElementById('overall').textContent=''; }
}
document.querySelectorAll('tr[data-id]').forEach(tr=>{
  const id=tr.dataset.id;
  tr.querySelectorAll('select').forEach(s=>{
    const k=id+'|'+s.dataset.k; if(saved[k])s.value=saved[k];
    s.addEventListener('change',()=>{saved[k]=s.value;localStorage.setItem(KEY,JSON.stringify(saved));recalc();});
  });
});
recalc();
document.getElementById('export').onclick=()=>{
  const blob=new Blob([JSON.stringify({runId:'${report.runId}',scores:saved},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='human-qa-${report.runId}.json';a.click();
};
</script></body></html>`;
  fs.writeFileSync(path.join(REPORTS, 'index.html'), html);
}

// ---------- Ana akış ----------

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY tanımlı değil.\n   Kullanım: GEMINI_API_KEY=... npm run benchmark');
    process.exit(1);
  }

  const models = listImages(path.join(DS, 'models'));
  const scarves = listImages(path.join(DS, 'scarves'));
  if (models.length === 0 || scarves.length === 0) {
    console.error('❌ Dataset eksik. testing/golden-dataset/README.md talimatlarına göre doldurun:');
    console.error(`   models/  : ${models.length} görsel (gereken: 5)`);
    console.error(`   scarves/ : ${scarves.length} görsel (gereken: 5)`);
    process.exit(1);
  }

  // ---------- AI READINESS GATE zorunluluğu ----------
  // Preflight geçmeden veya dataset/prompt DEĞİŞMİŞSE benchmark ÇALIŞMAZ.
  const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
  const promptText = PROMPTS[CFG.promptVersion] || PROMPTS.v1;
  const promptSha256 = sha256(Buffer.from(promptText));
  const fileHashes = [...models, ...scarves].map(f => sha256(fs.readFileSync(f)));
  const datasetHash = sha256(fileHashes.sort().join('')).slice(0, 16);

  const preflightPath = path.join(ROOT, 'testing/config/.preflight.json');
  if (!fs.existsSync(preflightPath)) {
    console.error('❌ AI Readiness Gate geçilmemiş. Önce:  GEMINI_API_KEY=... npm run preflight');
    process.exit(1);
  }
  const pf = JSON.parse(fs.readFileSync(preflightPath, 'utf8'));
  if (pf.datasetHash !== datasetHash) {
    console.error('❌ Dataset preflight sonrasında DEĞİŞMİŞ. Preflight\'ı yeniden çalıştırın.');
    console.error(`   preflight: ${pf.datasetHash}  şimdi: ${datasetHash}`);
    process.exit(1);
  }
  if (pf.promptSha256 !== promptSha256) {
    console.error('❌ PROMPT KİLİDİ İHLALİ: prompt preflight sonrasında değişmiş.');
    console.error('   Benchmark ortasında/öncesinde prompt değiştirilemez. Yeni sürüm tanımlayıp preflight\'ı yeniden çalıştırın.');
    process.exit(1);
  }

  // ---------- İNSAN ONAYI (maliyet onayı) ----------
  const totalPlanned = models.length * scarves.length * CFG.runsPerImage;
  const estCost = (totalPlanned * CFG.costPerImageUsd).toFixed(2);
  if (!process.argv.includes('--yes')) {
    console.log(`\n⚠️  ${totalPlanned} gerçek AI üretimi yapılacak. Tahmini maliyet: $${estCost} (worst case ~$${(estCost * 2).toFixed ? (Number(estCost) * 2).toFixed(2) : estCost})`);
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise(res => rl.question('Onaylıyor musunuz? (EVET yazın): ', res));
    rl.close();
    if (answer.trim().toUpperCase() !== 'EVET') {
      console.log('İptal edildi. Hiçbir üretim yapılmadı.');
      process.exit(0);
    }
  }

  const prompt = PROMPTS[CFG.promptVersion] || PROMPTS.v1;
  const runId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const runDir = path.join(RESULTS_ROOT, runId);
  fs.mkdirSync(runDir, { recursive: true });
  fs.mkdirSync(REPORTS, { recursive: true });

  // Manifest: bu benchmark HANGİ kod + prompt + dataset ile üretildi?
  // 6 ay sonra "prompt v8 / farklı model" karşılaştırmasında izlenebilirlik sağlar.
  const git = (cmd) => { try { return execSync(cmd, { cwd: ROOT }).toString().trim(); } catch { return 'unknown'; } };
  const manifest = {
    benchmarkId: runId,
    datasetVersion: CFG.datasetVersion || '1.0.0',
    provider: CFG.provider,
    model: CFG.model,
    promptVersion: CFG.promptVersion,
    style: CFG.style,
    generatedAt: new Date().toISOString(),
    gitCommit: git('git rev-parse HEAD'),
    branch: git('git branch --show-current'),
    promptSha256,
    datasetHash,
    datasetFiles: {
      models: models.map(f => path.basename(f)),
      scarves: scarves.map(f => path.basename(f)),
    },
  };
  fs.writeFileSync(path.join(REPORTS, 'benchmark_manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(runDir, 'benchmark_manifest.json'), JSON.stringify(manifest, null, 2));

  const total = models.length * scarves.length * CFG.runsPerImage;
  console.log(`\n🎬 Benchmark ${runId}`);
  console.log(`   ${models.length} model × ${scarves.length} eşarp × ${CFG.runsPerImage} = ${total} üretim`);
  console.log(`   Tahmini maliyet: ~$${(total * CFG.costPerImageUsd).toFixed(2)}\n`);

  const rows = [];
  let passed = 0, failed = 0, totalMs = 0;

  // Benzersiz üretim kimliği: RUN-YYYYMMDD-###-SKU-W##
  // Aynı ID dosya adında, JSON'da, HTML'de ve logda kullanılır —
  // "3. görsel neden kötüydü?" sorusu tek ID ile izlenir.
  const dateTag = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  let seq = 0;

  for (const m of models) {
    for (const s of scarves) {
      for (let run = 0; run < CFG.runsPerImage; run++) {
        seq++;
        const wTag = (path.basename(m).match(/woman(\d+)/i)?.[1] || String(seq)).padStart(2, '0');
        const sku = path.basename(s).split('_')[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
        const id = `RUN-${dateTag}-${String(seq).padStart(3, '0')}-${sku}-W${wTag}${CFG.runsPerImage > 1 ? `-r${run + 1}` : ''}`;
        process.stdout.write(`  • ${id} … `);
        const r = await generate(m, s, prompt);
        totalMs += r.ms;
        const row = { id, model: path.basename(m), scarf: path.basename(s), ok: r.ok, ms: r.ms, error: r.error || null, file: null, width: null, height: null, bytes: null };
        if (r.ok) {
          const file = `${id}.png`;
          fs.writeFileSync(path.join(runDir, file), r.buffer);
          const dims = imageDims(r.buffer);
          Object.assign(row, { file, width: dims.w, height: dims.h, bytes: r.buffer.length });
          passed++;
          console.log(`✅ ${(r.ms / 1000).toFixed(1)}s ${dims.w ? `${dims.w}×${dims.h}` : ''}`);
        } else {
          failed++;
          console.log(`❌ ${r.error}`);
        }
        rows.push(row);
      }
    }
  }

  const report = {
    runId,
    date: new Date().toISOString(),
    provider: CFG.provider,
    model: CFG.model,
    promptVersion: CFG.promptVersion,
    style: CFG.style,
    combinations: total,
    autoQa: {
      passed, failed,
      successRate: total ? `${Math.round((passed / total) * 100)}%` : '0%',
      note: 'Otomatik QA tekniktir: üretim başarısı, çözünürlük, süre, hata. Ticari kalite İnsan QA ile ölçülür (index.html).',
    },
    humanQaTarget: CFG.humanQaTarget,
    avgTimeSec: total ? +(totalMs / total / 1000).toFixed(1) : 0,
    avgCostUsd: CFG.costPerImageUsd,
    totalCostUsd: +(passed * CFG.costPerImageUsd).toFixed(3),
    resultsDir: path.relative(ROOT, runDir),
    rows,
  };

  fs.writeFileSync(path.join(REPORTS, 'report.json'), JSON.stringify(report, null, 2));
  writeMd(report);
  writeHtml(report, runId);

  console.log('\n================ BENCHMARK ÖZETİ ================');
  console.log(`  Üretim        : ${passed}/${total} (${report.autoQa.successRate})`);
  console.log(`  Ort. süre     : ${report.avgTimeSec}s`);
  console.log(`  Toplam maliyet: $${report.totalCostUsd}`);
  console.log(`  Görseller     : ${report.resultsDir}/`);
  console.log('  Raporlar      : testing/reports/report.json | report.md | index.html');
  console.log('\n  👉 Şimdi testing/reports/index.html dosyasını tarayıcıda açıp');
  console.log('     İNSAN QA puanlamasını yapın (ticari kalite kararı sizindir).');
  console.log('=================================================\n');
}

main().catch(e => { console.error(e); process.exit(1); });
