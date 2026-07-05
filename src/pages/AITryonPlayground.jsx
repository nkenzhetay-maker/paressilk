import { useState, useRef, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useProducts } from '../context/ProductContext';
import { validatePhoto } from '../utils/imageValidation';
import { addLog } from '../utils/tryonLog';

const COST_PER_IMAGE_USD = 0.039;

// AI Playground / Developer Mode — iş sahibinin browser'da müşteri gibi test
// edebileceği ekran. Foto yükle → ürün + stil seç → prompt'u gör → Generate →
// çıktı + süre + maliyet + before/after. Motor: Gemini (Netlify /api/virtual-tryon).

const STYLES = [
  { key: 'headscarf', label: 'Başörtüsü (baş + omuz)' },
  { key: 'shawl', label: 'Omuz Şalı (saç açık)' },
  { key: 'loose_wrap', label: 'Boyun/Omuz Sarma' },
];

const PROMPT_PREVIEW = {
  headscarf: 'wrapped elegantly over her head, covering her hair, draped over both shoulders — traditional silk headscarf',
  shawl: 'draped softly over her shoulders and neck like an elegant silk shawl, hair visible',
  loose_wrap: 'loosely wrapped around neck and shoulders with natural silk folds',
};

export default function AITryonPlayground() {
  const { products } = useProducts();
  const scarfProducts = useMemo(
    () => products.filter(p => ['yeni-koleksiyon', 'kelaghayi', 'scarves'].includes(p.category)),
    [products]
  );

  const fileRef = useRef(null);
  const [userImage, setUserImage] = useState(null);
  const [selected, setSelected] = useState(null);
  const [style, setStyle] = useState('headscarf');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [valid, setValid] = useState(false);
  const [result, setResult] = useState(null);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');
  const abortRef = useRef(null);

  const scarfPath = useMemo(() => {
    if (!selected) return null;
    // Flatlay tercih: 2. görsel varsa (genelde flatlay) onu, yoksa ilk görsel
    return selected.images?.[1] || selected.images?.[0] || null;
  }, [selected]);

  const onFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(''); setResult(null); setMeta(null); setValid(false);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Desteklenmeyen format. Lütfen JPEG, PNG veya WEBP yükleyin.'); return;
    }
    if (file.size > 20 * 1024 * 1024) { setError('Görsel 20MB\'dan küçük olmalı.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setUserImage(dataUrl);
      // Yüklenince otomatik doğrula
      setValidating(true);
      const img = new Image();
      img.onload = async () => {
        const v = await validatePhoto(img);
        setValidating(false);
        if (v.ok) {
          setValid(true);
        } else {
          setValid(false);
          setError(v.reason);
          addLog({ status: 'rejected', rejectCode: v.code, note: v.reason });
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  const generate = useCallback(async () => {
    if (!userImage || !scarfPath) return;
    setLoading(true); setError(''); setResult(null); setMeta(null);
    abortRef.current = new AbortController();
    const t0 = performance.now();
    try {
      const resp = await fetch('/api/virtual-tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userImage, scarfImagePath: scarfPath, style }),
        signal: abortRef.current.signal,
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.image) {
        setResult(data.image);
        setMeta({ ...data.meta, clientMs: Math.round(performance.now() - t0) });
        addLog({ status: 'generated', sku: selected?.sku, style, engine: data.meta?.engine, durationMs: data.meta?.durationMs, costUsd: data.meta?.estimatedCostUsd ?? COST_PER_IMAGE_USD });
      } else {
        setError(data.error || 'İşlem başarısız.');
        if (data.meta || data.durationMs) setMeta({ durationMs: data.durationMs });
        addLog({ status: 'error', sku: selected?.sku, style, note: data.error || `HTTP ${resp.status}` });
      }
    } catch (e) {
      if (e.name === 'AbortError') setError('İşlem iptal edildi.');
      else setError('Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  }, [userImage, scarfPath, style]);

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  const box = { background: '#141414', border: '1px solid #2a2a2a', borderRadius: 8, padding: 16 };
  const label = { fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: 8 };

  return (
    <>
      <Helmet><title>AI Playground — Sanal Deneme Testi | Paressilk</title></Helmet>
      <div style={{ paddingTop: 'var(--header-height)', minHeight: '100vh', background: '#0A0A0A', color: '#eee' }}>
        <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C8A456' }}>Developer Mode</p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 300 }}>AI Sanal Deneme — Playground</h1>
            <p style={{ color: '#999', fontSize: '0.9rem', marginTop: 8 }}>
              Fotoğraf yükle, ürün ve stil seç, prompt'u gör, sonucu üret. Süre ve maliyet ölçülür.
            </p>
          </div>

          <div className="sanal-deneme-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
            {/* Sol: sonuç */}
            <div>
              <div style={{ ...box, minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                {loading && (
                  <div style={{ textAlign: 'center' }}>
                    <div className="loading__spinner" style={{ margin: '0 auto 16px' }} />
                    <p style={{ color: '#C8A456', fontSize: '0.85rem' }}>AI eşarbı giydiriyor…</p>
                    <button onClick={cancel} style={{ marginTop: 16, padding: '8px 20px', background: 'transparent', color: '#999', border: '1px solid #444', cursor: 'pointer', fontSize: '0.72rem' }}>İptal</button>
                  </div>
                )}
                {!loading && result && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
                    <div>
                      <p style={label}>Önce</p>
                      <img src={userImage} alt="önce" style={{ width: '100%', borderRadius: 4 }} />
                    </div>
                    <div>
                      <p style={label}>Sonra (AI)</p>
                      <img src={result} alt="sonra" style={{ width: '100%', borderRadius: 4 }} />
                    </div>
                  </div>
                )}
                {!loading && !result && userImage && (
                  <img src={userImage} alt="yüklenen" style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: 4 }} />
                )}
                {!loading && !result && !userImage && (
                  <p style={{ color: '#555', fontSize: '0.9rem' }}>Fotoğraf yükleyin →</p>
                )}
              </div>

              {error && (
                <div style={{ ...box, marginTop: 12, borderColor: 'rgba(231,76,60,0.4)', background: 'rgba(231,76,60,0.08)' }}>
                  <p style={{ color: '#e74c3c', fontSize: '0.85rem' }}>{error}</p>
                </div>
              )}

              {/* Developer paneli: süre / maliyet / motor */}
              {meta && (
                <div style={{ ...box, marginTop: 12 }}>
                  <p style={label}>Çalışma Detayı</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, fontSize: '0.8rem' }}>
                    {meta.engine && <div>Motor: <b style={{ color: '#C8A456' }}>{meta.engine}</b></div>}
                    {meta.style && <div>Stil: <b>{meta.style}</b></div>}
                    {meta.durationMs != null && <div>Sunucu süresi: <b>{(meta.durationMs / 1000).toFixed(1)}s</b></div>}
                    {meta.clientMs != null && <div>Toplam: <b>{(meta.clientMs / 1000).toFixed(1)}s</b></div>}
                    {meta.estimatedCostUsd != null && <div>Tahmini maliyet: <b style={{ color: '#27ae60' }}>${meta.estimatedCostUsd}</b></div>}
                  </div>
                </div>
              )}
            </div>

            {/* Sağ: kontroller */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={box}>
                <p style={label}>1 · Fotoğraf</p>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} style={{ display: 'none' }} />
                <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: '12px', background: '#C8A456', color: '#0A0A0A', border: 'none', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  {userImage ? 'Başka Fotoğraf' : 'Fotoğraf Yükle'}
                </button>
                {validating && <p style={{ fontSize: '0.72rem', color: '#C8A456', marginTop: 8 }}>Fotoğraf doğrulanıyor…</p>}
                {valid && !validating && <p style={{ fontSize: '0.72rem', color: '#27ae60', marginTop: 8 }}>✓ Fotoğraf uygun</p>}
                <p style={{ fontSize: '0.68rem', color: '#666', marginTop: 8 }}>En az üst beden (baş + omuz + göğüs) görünmeli. JPEG/PNG/WEBP, max 20MB.</p>
              </div>

              <div style={box}>
                <p style={label}>2 · Ürün</p>
                <select value={selected?.id || ''} onChange={(e) => setSelected(scarfProducts.find(p => p.id === e.target.value) || null)}
                  style={{ width: '100%', padding: '10px', background: '#0A0A0A', color: '#eee', border: '1px solid #333', borderRadius: 4 }}>
                  <option value="">— Seçin —</option>
                  {scarfProducts.map(p => <option key={p.id} value={p.id}>{p.sku} · {p.name}</option>)}
                </select>
                {scarfPath && <img src={scarfPath} alt="ürün" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 4, marginTop: 10 }} />}
              </div>

              <div style={box}>
                <p style={label}>3 · Giydirme Stili</p>
                <select value={style} onChange={(e) => setStyle(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#0A0A0A', color: '#eee', border: '1px solid #333', borderRadius: 4 }}>
                  {STYLES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>

              <div style={box}>
                <p style={label}>Kullanılacak Prompt (özet)</p>
                <p style={{ fontSize: '0.72rem', color: '#aaa', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "…she is wearing the scarf, {PROMPT_PREVIEW[style]}. Keep pattern, face, clothing & background unchanged."
                </p>
              </div>

              {(() => {
                const disabled = !userImage || !selected || !valid || loading || validating;
                return (
                  <button onClick={generate} disabled={disabled}
                    style={{ padding: '14px', background: disabled ? '#333' : '#C8A456', color: disabled ? '#777' : '#0A0A0A', border: 'none', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: disabled ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Üretiliyor…' : 'Generate'}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width:768px){.sanal-deneme-grid{grid-template-columns:1fr !important;}}`}</style>
    </>
  );
}
