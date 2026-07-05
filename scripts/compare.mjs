#!/usr/bin/env node
/**
 * A/B Prompt Karşılaştırması — `npm run compare`
 *
 * testing/results/<runId>/ klasörlerini tarar; her koşunun:
 *  - report.json           → otomatik metrikler (başarı, süre, maliyet, promptVersion)
 *  - business-qa-*.json    → jüri üyelerinin BAG puanları (business.html'den export)
 *  - human-qa-*.json       → insan QA puanları (index.html'den export)
 * verilerini birleştirir, promptVersion bazında karşılaştırır ve EN İYİ promptu seçer.
 *
 * Kullanım: benchmark'ı farklı promptVersion'larla koş (config'de değiştir + preflight),
 * jüri puanlarını ilgili results/<runId>/ klasörüne koy, sonra `npm run compare`.
 *
 * Çıktı: konsol tablosu + testing/reports/compare.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RESULTS = path.join(ROOT, 'testing/results');
const REPORTS = path.join(ROOT, 'testing/reports');

function jurorAverages(scoreFiles, questionCount) {
  // Her jüri dosyası: { scores: { "<imgId>|<idx-or-name>": "1-5" } }
  const perJuror = [];
  for (const f of scoreFiles) {
    try {
      const d = JSON.parse(fs.readFileSync(f, 'utf8'));
      const byImg = {};
      for (const [k, v] of Object.entries(d.scores || {})) {
        const [img] = k.split('|');
        (byImg[img] ||= []).push(Number(v));
      }
      const rowAvgs = Object.values(byImg)
        .filter(a => a.length >= questionCount)
        .map(a => a.reduce((x, y) => x + y, 0) / a.length);
      if (rowAvgs.length) {
        perJuror.push({
          juror: d.juror || path.basename(f),
          avg: rowAvgs.reduce((x, y) => x + y, 0) / rowAvgs.length,
          images: rowAvgs.length,
        });
      }
    } catch { /* bozuk dosya atla */ }
  }
  if (!perJuror.length) return null;
  return {
    jurors: perJuror,
    mean: perJuror.reduce((s, j) => s + j.avg, 0) / perJuror.length,
  };
}

function cciFromBusiness(scoreFiles, weights) {
  // CCI: Q index 1=LooksReal(gerçek foto), 3=WouldTrust, 4=WouldBuy (0 tabanlı)
  const acc = { q1: [], q3: [], q4: [] };
  for (const f of scoreFiles) {
    try {
      const d = JSON.parse(fs.readFileSync(f, 'utf8'));
      for (const [k, v] of Object.entries(d.scores || {})) {
        const idx = k.split('|')[1];
        if (idx === '1') acc.q1.push(Number(v));
        if (idx === '3') acc.q3.push(Number(v));
        if (idx === '4') acc.q4.push(Number(v));
      }
    } catch { /* atla */ }
  }
  if (!acc.q1.length && !acc.q3.length && !acc.q4.length) return null;
  const avg = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length / 5 : 0);
  return Math.round((avg(acc.q4) * weights.wouldBuy + avg(acc.q3) * weights.wouldTrust + avg(acc.q1) * weights.looksReal) * 100);
}

function main() {
  if (!fs.existsSync(RESULTS)) { console.error('testing/results yok.'); process.exit(1); }
  const runs = fs.readdirSync(RESULTS)
    .map(d => path.join(RESULTS, d))
    .filter(d => fs.statSync(d).isDirectory() && fs.existsSync(path.join(d, 'report.json')));

  if (!runs.length) {
    console.error('❌ Karşılaştırılacak koşu yok. Önce npm run benchmark çalıştırın.');
    process.exit(1);
  }

  const rows = [];
  for (const dir of runs) {
    const rep = JSON.parse(fs.readFileSync(path.join(dir, 'report.json'), 'utf8'));
    const files = fs.readdirSync(dir);
    const bagFiles = files.filter(f => /^business-qa-.*\.json$/.test(f)).map(f => path.join(dir, f));
    const hqFiles = files.filter(f => /^human-qa-.*\.json$/.test(f)).map(f => path.join(dir, f));
    const weights = rep.cciWeights || { wouldBuy: 0.4, wouldTrust: 0.3, looksReal: 0.3 };
    const threshold = rep.businessPassThreshold || 4.2;

    const bag = jurorAverages(bagFiles, 6);
    const hq = jurorAverages(hqFiles, 1); // insan QA: kısmi puanlar da sayılır
    const cci = cciFromBusiness(bagFiles, weights);

    rows.push({
      runId: rep.runId,
      promptVersion: rep.promptVersion,
      promptSha: (rep.promptSha256 || '').slice(0, 10),
      success: `${rep.autoQa.passed}/${rep.combinations}`,
      avgTime: rep.avgTimeSec,
      totalCost: rep.totalCostUsd,
      humanScore: hq ? +hq.mean.toFixed(2) : null,
      businessScore: bag ? +bag.mean.toFixed(2) : null,
      jurors: bag ? bag.jurors.length : 0,
      cci,
      pass: bag ? bag.mean >= threshold : null,
      threshold,
    });
  }

  rows.sort((a, b) => (b.businessScore ?? -1) - (a.businessScore ?? -1));

  console.log('\n================ A/B PROMPT KARŞILAŞTIRMASI ================\n');
  console.log('Run                  | Prompt | Üretim | Süre  | Maliyet | İnsan QA | Business | Jüri | CCI  | Sonuç');
  console.log('-'.repeat(110));
  for (const r of rows) {
    console.log(
      `${r.runId.padEnd(20)} | ${String(r.promptVersion).padEnd(6)} | ${r.success.padEnd(6)} | ${String(r.avgTime + 's').padEnd(5)} | $${String(r.totalCost).padEnd(6)} | ` +
      `${(r.humanScore ?? '—').toString().padEnd(8)} | ${(r.businessScore ?? '—').toString().padEnd(8)} | ${String(r.jurors).padEnd(4)} | ${(r.cci != null ? r.cci + '%' : '—').padEnd(4)} | ` +
      (r.pass == null ? 'puan bekleniyor' : r.pass ? 'PASS ✅' : `FAIL ❌ (<${r.threshold})`)
    );
  }

  const scored = rows.filter(r => r.businessScore != null);
  let bestLine = 'Henüz jüri puanı yok — business.html ile puanlayıp JSON\'ları koşu klasörüne koyun.';
  if (scored.length) {
    const best = scored[0];
    bestLine = `EN İYİ PROMPT: ${best.promptVersion} (Business ${best.businessScore}/5, CCI ${best.cci}%, run ${best.runId})`;
    console.log('\n🏆 ' + bestLine);
  } else {
    console.log('\nℹ️  ' + bestLine);
  }

  // compare.md
  fs.mkdirSync(REPORTS, { recursive: true });
  const md = `# A/B Prompt Karşılaştırması\n\nTarih: ${new Date().toISOString()}\n\n` +
    `| Run | Prompt | Üretim | Süre | Maliyet | İnsan QA | Business | Jüri | CCI | Sonuç |\n|---|---|---|---|---|---|---|---|---|---|\n` +
    rows.map(r => `| ${r.runId} | ${r.promptVersion} | ${r.success} | ${r.avgTime}s | $${r.totalCost} | ${r.humanScore ?? '—'} | ${r.businessScore ?? '—'} | ${r.jurors} | ${r.cci != null ? r.cci + '%' : '—'} | ${r.pass == null ? 'bekliyor' : r.pass ? 'PASS' : 'FAIL'} |`).join('\n') +
    `\n\n**${bestLine}**\n\n> Milestone 3'e geçiş şartı: Business Score ≥ ${rows[0]?.threshold ?? 4.2} VE en az 5 jüri üyesi.\n`;
  fs.writeFileSync(path.join(REPORTS, 'compare.md'), md);
  console.log(`\nRapor: testing/reports/compare.md\n`);
}

main();
