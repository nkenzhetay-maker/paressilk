// Sanal deneme log & maliyet deposu (tarayıcı tarafı, localStorage).
// Her üretim/ret denemesi buraya kaydedilir; admin Cost ve Log panelleri
// bu veriden beslenir. Milestone 3'te sunucu tarafı kalıcı loglamaya taşınacak.

const KEY = 'paressilk_tryon_log';
const MAX = 500;

export function readLog() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addLog(entry) {
  const log = readLog();
  const record = {
    id: `gen_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ts: Date.now(),
    status: 'unknown',       // 'generated' | 'rejected' | 'error'
    sku: null,
    style: null,
    engine: null,
    durationMs: null,
    costUsd: 0,
    rejectCode: null,
    ...entry,
  };
  log.unshift(record);
  if (log.length > MAX) log.length = MAX;
  try { localStorage.setItem(KEY, JSON.stringify(log)); } catch { /* kota */ }
  return record;
}

export function clearLog() {
  try { localStorage.removeItem(KEY); } catch { /* yut */ }
}

// Cost paneli için toplu metrikler
export function computeStats() {
  const log = readLog();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const today = log.filter(l => l.ts >= startOfDay);
  const generated = log.filter(l => l.status === 'generated');
  const todayGenerated = today.filter(l => l.status === 'generated');
  const rejected = log.filter(l => l.status === 'rejected');

  const todayCost = todayGenerated.reduce((s, l) => s + (l.costUsd || 0), 0);
  const totalCost = generated.reduce((s, l) => s + (l.costUsd || 0), 0);
  const avgCost = generated.length ? totalCost / generated.length : 0;
  const avgDuration = generated.length
    ? generated.reduce((s, l) => s + (l.durationMs || 0), 0) / generated.length
    : 0;

  const totalAttempts = log.length;
  const rejectRate = totalAttempts ? rejected.length / totalAttempts : 0;

  return {
    todayRequests: today.length,
    todayGenerated: todayGenerated.length,
    todayCost,
    avgCost,
    avgDurationMs: avgDuration,
    monthlyProjection: todayCost * 30,
    totalGenerated: generated.length,
    rejectedBeforeAI: rejected.length,
    savedApiCalls: rejected.length, // ret = AI'a gitmeden engellenen çağrı
    rejectRate,
  };
}
