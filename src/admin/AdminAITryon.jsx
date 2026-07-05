import { useState, useEffect, useCallback } from 'react';
import { readLog, computeStats, clearLog } from '../utils/tryonLog';

// Admin — AI Sanal Deneme paneli. Cost paneli + Generation log + motor durumu.
// Veri kaynağı: tarayıcı log deposu (Milestone 3'te sunucu tarafına taşınacak).

const usd = (n) => `$${(n || 0).toFixed(3)}`;
const card = { background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: 20 };
const statLabel = { fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: 6 };
const statValue = { fontSize: '1.7rem', fontFamily: 'var(--font-heading, serif)', color: '#1a1a1a' };

function Stat({ label, value, accent }) {
  return (
    <div style={card}>
      <p style={statLabel}>{label}</p>
      <p style={{ ...statValue, color: accent || '#1a1a1a' }}>{value}</p>
    </div>
  );
}

const STATUS_BADGE = {
  generated: { bg: '#e8f5e9', c: '#2e7d32', t: 'Üretildi' },
  rejected: { bg: '#fff3e0', c: '#e65100', t: 'Reddedildi' },
  error: { bg: '#ffebee', c: '#c62828', t: 'Hata' },
  unknown: { bg: '#eee', c: '#666', t: '—' },
};

export default function AdminAITryon() {
  const [log, setLog] = useState([]);
  const [stats, setStats] = useState(null);

  const refresh = useCallback(() => {
    setLog(readLog());
    setStats(computeStats());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleClear = () => {
    if (window.confirm('Tüm deneme kayıtları silinecek. Emin misiniz?')) {
      clearLog(); refresh();
    }
  };

  const geminiConfigured = false; // Milestone 1: motor henüz aktif değil (billing bekliyor)

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)', maxWidth: 1100, width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: '1.8rem' }}>AI Sanal Deneme</h1>
        <button onClick={refresh} style={{ padding: '8px 16px', border: '1px solid #ccc', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }}>Yenile</button>
      </div>

      {/* Motor durumu */}
      <div style={{ ...card, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, background: geminiConfigured ? '#e8f5e9' : '#fff8e1', borderColor: geminiConfigured ? '#a5d6a7' : '#ffe082' }}>
        <span style={{ fontSize: '1.4rem' }}>{geminiConfigured ? '✅' : '⏳'}</span>
        <div>
          <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
            Motor: Gemini 2.5 Flash Image — {geminiConfigured ? 'Aktif' : 'Billing bekliyor'}
          </p>
          <p style={{ fontSize: '0.78rem', color: '#777' }}>
            {geminiConfigured
              ? 'Sistem üretime hazır.'
              : 'Google AI Studio\'da billing aktif edilip Netlify\'a GEMINI_API_KEY eklendiğinde üretim başlar.'}
          </p>
        </div>
      </div>

      {/* Cost paneli */}
      <h2 style={{ fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>Maliyet Paneli</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 16 }}>
        <Stat label="Bugünkü İstek" value={stats?.todayRequests ?? 0} />
        <Stat label="Bugün Üretilen" value={stats?.todayGenerated ?? 0} />
        <Stat label="Bugünkü Maliyet" value={usd(stats?.todayCost)} accent="#2e7d32" />
        <Stat label="Ortalama Maliyet" value={usd(stats?.avgCost)} />
        <Stat label="Aylık Projeksiyon" value={usd(stats?.monthlyProjection)} accent="#e65100" />
        <Stat label="AI'a Gitmeden Reddedilen" value={stats?.rejectedBeforeAI ?? 0} accent="#1565c0" />
      </div>
      <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: 28 }}>
        Reddedilen fotoğraflar AI'a gönderilmez → tasarruf edilen çağrı: <b>{stats?.savedApiCalls ?? 0}</b>
        {stats?.avgDurationMs ? ` · Ortalama üretim süresi: ${(stats.avgDurationMs / 1000).toFixed(1)}s` : ''}
      </p>

      {/* Log paneli */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>Generation Log ({log.length})</h2>
        {log.length > 0 && <button onClick={handleClear} style={{ padding: '6px 12px', border: '1px solid #f0c0c0', color: '#c62828', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem' }}>Kayıtları Temizle</button>}
      </div>

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {log.length === 0 ? (
          <p style={{ padding: 32, textAlign: 'center', color: '#aaa', fontSize: '0.88rem' }}>
            Henüz kayıt yok. AI Playground'da bir deneme yaptığınızda burada listelenir.
          </p>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#fafafa', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>Zaman</th>
                <th style={{ padding: '10px 14px' }}>Durum</th>
                <th style={{ padding: '10px 14px' }}>SKU</th>
                <th style={{ padding: '10px 14px' }}>Stil</th>
                <th style={{ padding: '10px 14px' }}>Süre</th>
                <th style={{ padding: '10px 14px' }}>Maliyet</th>
                <th style={{ padding: '10px 14px' }}>Not</th>
              </tr>
            </thead>
            <tbody>
              {log.map(row => {
                const b = STATUS_BADGE[row.status] || STATUS_BADGE.unknown;
                return (
                  <tr key={row.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 14px', color: '#777' }}>{new Date(row.ts).toLocaleString('tr-TR')}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: b.bg, color: b.c, padding: '3px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }}>{b.t}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>{row.sku || '—'}</td>
                    <td style={{ padding: '10px 14px' }}>{row.style || '—'}</td>
                    <td style={{ padding: '10px 14px' }}>{row.durationMs ? `${(row.durationMs / 1000).toFixed(1)}s` : '—'}</td>
                    <td style={{ padding: '10px 14px' }}>{row.costUsd ? usd(row.costUsd) : '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#999' }}>{row.rejectCode || row.note || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
