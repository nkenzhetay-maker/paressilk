import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProducts } from '../context/ProductContext';

const FOREHEAD = 10;
const CHIN = 152;
const LEFT_TEMPLE = 234;
const RIGHT_TEMPLE = 454;

function dist(a, b, w, h) {
  const dx = (a.x - b.x) * w;
  const dy = (a.y - b.y) * h;
  return Math.sqrt(dx * dx + dy * dy);
}

// Eşarbı başörtüsü tarzında giydirir: saçı ve başı örter, omuzlara dökülür,
// yüz açık kalır. Desen ürünün gerçek fotoğrafından geldiği için birebir korunur.
function drawScarfDrape(ctx, srcImg, pts, scarfImg, w, h) {
  const forehead = pts[FOREHEAD];
  const chin = pts[CHIN];
  const lt = pts[LEFT_TEMPLE];
  const rt = pts[RIGHT_TEMPLE];

  const faceW = Math.abs(rt.x - lt.x) * w;
  const faceH = dist(forehead, chin, w, h);
  const cx = ((lt.x + rt.x) / 2) * w;
  const cy = ((forehead.y + chin.y) / 2) * h;
  const angle = Math.atan2((rt.y - lt.y) * h, (rt.x - lt.x) * w);

  // Örtünün kapladığı alan: başın üstünden göğüsteki V ucuna kadar
  const hoodW = faceW * 3.1;
  const hoodH = faceH * 4.0;
  const topY = cy - faceH * 1.25;

  // 1) Eşarp katmanı — desen bozulmasın diye "cover" kırpma (esnetme yok)
  const layer = document.createElement('canvas');
  layer.width = w;
  layer.height = h;
  const lctx = layer.getContext('2d');

  const iw = scarfImg.naturalWidth;
  const ih = scarfImg.naturalHeight;
  const scale = Math.max(hoodW / iw, hoodH / ih);
  const dw = iw * scale;
  const dh = ih * scale;

  lctx.save();
  lctx.translate(cx, cy);
  lctx.rotate(angle);
  lctx.translate(-cx, -cy);
  lctx.drawImage(scarfImg, cx - dw / 2, topY - (dh - hoodH) / 2, dw, dh);
  lctx.restore();

  // 2) Örtü maskesi: baş üstünde kubbe + omuzlara genişleyen etek, kenarları yumuşak
  const mask = document.createElement('canvas');
  mask.width = w;
  mask.height = h;
  const mctx = mask.getContext('2d');
  mctx.filter = `blur(${Math.max(4, faceW * 0.06)}px)`;
  mctx.fillStyle = '#fff';

  mctx.save();
  mctx.translate(cx, cy);
  mctx.rotate(angle);
  mctx.translate(-cx, -cy);

  const domeRx = faceW * 1.05;
  const domeCy = cy - faceH * 0.10;
  const shoulderX = hoodW * 0.58;
  const shoulderY = cy + faceH * 1.5;
  const vPointY = cy + faceH * 2.65;

  mctx.beginPath();
  // Kubbe (başın üstü, saç çizgisinin üzerini örter)
  mctx.ellipse(cx, domeCy, domeRx, faceH * 1.12, 0, Math.PI, 2 * Math.PI);
  mctx.lineTo(cx + domeRx, domeCy);
  // Sağ yan: omuza doğru dışa açılan dökümlü kenar
  mctx.bezierCurveTo(
    cx + domeRx * 1.12, cy + faceH * 0.7,
    cx + shoulderX * 1.02, shoulderY - faceH * 0.4,
    cx + shoulderX, shoulderY
  );
  // Etek: omuzdan göğüsteki V ucuna inen üçgen katlama (kelaghayi tarzı)
  mctx.quadraticCurveTo(cx + hoodW * 0.24, cy + faceH * 1.95, cx, vPointY);
  mctx.quadraticCurveTo(cx - hoodW * 0.24, cy + faceH * 1.95, cx - shoulderX, shoulderY);
  // Sol yan
  mctx.bezierCurveTo(
    cx - shoulderX * 1.02, shoulderY - faceH * 0.4,
    cx - domeRx * 1.12, cy + faceH * 0.7,
    cx - domeRx, domeCy
  );
  mctx.closePath();
  mctx.fill();
  mctx.restore();

  // 3) Yüz ovalini maskeden çıkar — yüz açıkta kalır (kenarları yumuşak geçişli)
  mctx.globalCompositeOperation = 'destination-out';
  mctx.save();
  mctx.translate(cx, cy);
  mctx.rotate(angle);
  mctx.translate(-cx, -cy);
  mctx.beginPath();
  mctx.ellipse(cx, cy + faceH * 0.06, faceW * 0.46, faceH * 0.60, 0, 0, 2 * Math.PI);
  mctx.fill();
  mctx.restore();

  // 4) Maskeyi eşarp katmanına uygula
  lctx.globalCompositeOperation = 'destination-in';
  lctx.drawImage(mask, 0, 0);

  // 5) Kumaş hissi: hafif üstten ışık, altta gölge
  lctx.globalCompositeOperation = 'source-atop';
  const grad = lctx.createLinearGradient(0, topY, 0, topY + hoodH);
  grad.addColorStop(0, 'rgba(255,255,255,0.12)');
  grad.addColorStop(0.45, 'rgba(0,0,0,0.04)');
  grad.addColorStop(1, 'rgba(0,0,0,0.20)');
  lctx.fillStyle = grad;
  lctx.fillRect(0, 0, w, h);

  // Yüz kenarında içe düşen yumuşak gölge (derinlik hissi)
  lctx.save();
  lctx.translate(cx, cy);
  lctx.rotate(angle);
  lctx.translate(-cx, -cy);
  lctx.strokeStyle = 'rgba(0,0,0,0.22)';
  lctx.lineWidth = Math.max(2, faceW * 0.035);
  lctx.filter = `blur(${Math.max(2, faceW * 0.03)}px)`;
  lctx.beginPath();
  lctx.ellipse(cx, cy + faceH * 0.06, faceW * 0.48, faceH * 0.62, 0, 0, 2 * Math.PI);
  lctx.stroke();
  lctx.restore();

  // 6) Ana tuvale bindir
  ctx.drawImage(layer, 0, 0);
}

// Sanal deneme geçici olarak kapalı — AI motoru (Gemini API) billing aktif
// olunca true yapılır ve sayfa aynen geri açılır. Kod silinmedi, sadece geçitle.
const SANAL_DENEME_AKTIF = false;

function SanalDenemeYakinda() {
  return (
    <>
      <Helmet>
        <title>Sanal Deneme · Yakında | Paressilk</title>
        <meta name="description" content="Paressilk sanal deneme özelliği çok yakında hizmetinizde. İpek eşarplarımızı kendi fotoğrafınız üzerinde deneyimleyin." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div style={{
        minHeight: '70vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '80px 24px', background: 'var(--cream, #F5F0E8)',
      }}>
        <div style={{
          fontSize: '0.8rem', letterSpacing: '0.25em', color: 'var(--gold, #B8860B)',
          textTransform: 'uppercase', marginBottom: 20,
        }}>
          Paressilk · Yenilik
        </div>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
          stroke="var(--gold, #B8860B)" strokeWidth="1.3" style={{ marginBottom: 24 }}>
          <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
        </svg>
        <h1 style={{
          fontFamily: 'var(--font-heading, "Playfair Display", serif)',
          fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--ink, #1a1a1a)',
          margin: '0 0 16px', fontWeight: 500,
        }}>
          Sanal Deneme Çok Yakında
        </h1>
        <p style={{
          fontSize: '1.05rem', color: '#666', maxWidth: 520, lineHeight: 1.7,
          margin: '0 0 36px',
        }}>
          İpek eşarplarımızı kendi fotoğrafınız üzerinde deneyimleyebileceğiniz
          yapay zekâ destekli sanal deneme özelliğimiz üzerinde çalışıyoruz.
          Çok yakında hizmetinizde olacak.
        </p>
        <Link to="/shop" className="btn btn--primary" style={{
          background: 'var(--gold, #B8860B)', color: '#fff', padding: '14px 36px',
          textDecoration: 'none', letterSpacing: '0.05em', fontSize: '0.9rem',
          textTransform: 'uppercase',
        }}>
          Koleksiyonu Keşfet
        </Link>
      </div>
    </>
  );
}

export default function SanalDeneme() {
  if (!SANAL_DENEME_AKTIF) return <SanalDenemeYakinda />;

  return <SanalDenemeApp />;
}

function SanalDenemeApp() {
  const { products } = useProducts();
  const scarfProducts = products.filter(
    p => p.category === 'yeni-koleksiyon' || p.category === 'kelaghayi' || p.category === 'scarves'
  );

  const canvasRef = useRef(null);
  const scarfImgRef = useRef(null);
  const landmarkerRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadedImgRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [resultReady, setResultReady] = useState(false);
  const [skuSearch, setSkuSearch] = useState('');

  // AI gerçekçilik katmanı (hibrit) durumu
  const [aiConsent, setAiConsent] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiNote, setAiNote] = useState('');

  // Detaylı önizleme (tam ekran lightbox)
  const [previewSrc, setPreviewSrc] = useState(null);
  const [previewZoom, setPreviewZoom] = useState(false);

  useEffect(() => {
    if (scarfProducts.length > 0 && !selectedProduct) {
      setSelectedProduct(scarfProducts[0]);
    }
  }, [scarfProducts, selectedProduct]);

  // KVKK: sayfadan çıkınca tüm verileri temizle
  useEffect(() => {
    return () => {
      setUploadedPhoto(null);
      setResultReady(false);
      setAiResult(null);
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
      if (uploadedImgRef.current) {
        uploadedImgRef.current = null;
      }
    };
  }, []);

  // Hibrit: geometrik giydirme kompozitini AI'a gönderip gerçekçileştir.
  // Başarısız olursa sessizce geometrik sonuca düşer (fallback).
  const enhanceWithAI = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !aiConsent) return;
    setAiLoading(true);
    setAiNote('');
    setAiResult(null);
    try {
      const composite = canvas.toDataURL('image/jpeg', 0.92);
      const resp = await fetch('/api/virtual-tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: composite, width: canvas.width, height: canvas.height }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.image) {
        setAiResult(data.image);
      } else {
        // Fallback: geometrik giydirme sonucu ekranda kalır
        setAiNote(
          data.fallback
            ? 'AI gerçekçilik katmanı şu an yoğun. Aşağıdaki hazır sonucu kullanabilirsiniz.'
            : (data.error || 'AI işlemi tamamlanamadı, hazır sonuç gösteriliyor.')
        );
      }
    } catch (e) {
      setAiNote('Bağlantı hatası. Hazır sonuç gösteriliyor.');
    } finally {
      setAiLoading(false);
    }
  }, [aiConsent]);

  const loadMediaPipe = useCallback(async () => {
    if (landmarkerRef.current) return landmarkerRef.current;

    const { FaceLandmarker, FilesetResolver } = await import(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/vision_bundle.mjs'
    );

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
    );

    const landmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      numFaces: 1,
    });

    landmarkerRef.current = landmarker;
    return landmarker;
  }, []);

  const processPhoto = useCallback(async (imgElement) => {
    setLoading(true);
    setError('');
    setResultReady(false);
    setAiResult(null);
    setAiNote('');

    try {
      const landmarker = await loadMediaPipe();
      const result = landmarker.detect(imgElement);

      const canvas = canvasRef.current;
      canvas.width = imgElement.naturalWidth;
      canvas.height = imgElement.naturalHeight;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(imgElement, 0, 0);

      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const pts = result.faceLandmarks[0];
        const scarfImg = scarfImgRef.current;

        if (scarfImg && scarfImg.complete && scarfImg.naturalWidth > 0) {
          drawScarfDrape(ctx, imgElement, pts, scarfImg, canvas.width, canvas.height);
        }

        setResultReady(true);
      } else {
        setError('Fotoğrafta yüz tespit edilemedi. Lütfen yüzünüzün net göründüğü bir fotoğraf yükleyin.');
      }
    } catch (err) {
      setError('Fotoğraf işlenirken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [loadMediaPipe]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Lütfen bir fotoğraf dosyası seçin (JPG, PNG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Fotoğraf boyutu 10MB\'dan küçük olmalıdır.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setUploadedPhoto(dataUrl);
      setResultReady(false);
      setError('');
      setAiConsent(false); // Her yeni fotoğraf için AI rızası yeniden alınır (KVKK)

      const img = new Image();
      img.onload = () => {
        uploadedImgRef.current = img;
        if (selectedProduct && scarfImgRef.current?.complete) {
          processPhoto(img);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);

    // input'u sıfırla (aynı dosya tekrar seçilebilsin)
    e.target.value = '';
  }, [selectedProduct, processPhoto]);

  const handleScarfSelect = useCallback((product) => {
    setSelectedProduct(product);
    setResultReady(false);
  }, []);

  // Ürün değişince ve fotoğraf varsa yeniden işle
  const handleScarfLoaded = useCallback(() => {
    if (uploadedImgRef.current && uploadedPhoto) {
      processPhoto(uploadedImgRef.current);
    }
  }, [uploadedPhoto, processPhoto]);

  const handleSkuSearch = useCallback((value) => {
    setSkuSearch(value);
    if (value.length >= 3) {
      const found = scarfProducts.find(
        p => p.sku?.toLowerCase().includes(value.toLowerCase())
      );
      if (found) {
        handleScarfSelect(found);
      }
    }
  }, [scarfProducts, handleScarfSelect]);

  const clearPhoto = useCallback(() => {
    setUploadedPhoto(null);
    setResultReady(false);
    setError('');
    setAiResult(null);
    setAiNote('');
    setAiConsent(false);
    uploadedImgRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Tam ekran detaylı önizleme aç
  const openPreview = useCallback(() => {
    if (aiResult) {
      setPreviewSrc(aiResult);
    } else {
      const canvas = canvasRef.current;
      if (!canvas) return;
      setPreviewSrc(canvas.toDataURL('image/jpeg', 0.95));
    }
    setPreviewZoom(false);
  }, [aiResult]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);

  return (
    <>
      <Helmet>
        <title>Sanal Deneme — Eşarbınızı Deneyin | Paressilk</title>
        <meta name="description" content="Paressilk sanal deneme ile kelaghayi ve ipek eşarpları fotoğrafınız üzerinde görün. Satın almadan önce deneyin." />
      </Helmet>

      <div style={{ paddingTop: 'var(--header-height)', minHeight: '100vh', background: '#0A0A0A' }}>
        <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C8A456', marginBottom: 16 }}>
              Yapay Zeka Destekli
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 300, color: '#fff', marginBottom: 16 }}>
              Sanal Deneme
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#999', maxWidth: 560, margin: '0 auto', lineHeight: 1.8 }}>
              Fotoğrafınızı yükleyin, ürün seçin ve eşarbın üzerinizde nasıl göründüğünü görün. Temel deneme tamamen cihazınızda yapılır; isteğe bağlı AI gerçekçilik adımı ise yalnızca onayınızla çalışır.
            </p>
          </div>

          <div className="sanal-deneme-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40, alignItems: 'start' }}>

            {/* Photo area */}
            <div>
              <div style={{
                position: 'relative',
                width: '100%',
                minHeight: 400,
                background: '#1a1a1a',
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid rgba(200,164,86,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <canvas
                  ref={canvasRef}
                  onClick={resultReady ? openPreview : undefined}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    display: resultReady && !aiResult ? 'block' : 'none',
                    cursor: resultReady ? 'zoom-in' : 'default',
                  }}
                  title="Detaylı önizleme için tıklayın"
                />

                {aiResult && (
                  <img
                    src={aiResult}
                    alt="AI ile gerçekçileştirilmiş sonuç"
                    onClick={openPreview}
                    style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', cursor: 'zoom-in' }}
                    title="Detaylı önizleme için tıklayın"
                  />
                )}

                {aiLoading && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 16,
                    background: 'rgba(0,0,0,0.82)',
                  }}>
                    <div className="loading__spinner" />
                    <p style={{ color: '#C8A456', fontSize: '0.85rem' }}>
                      AI kumaşı gerçekçi hale getiriyor...
                    </p>
                    <p style={{ color: '#666', fontSize: '0.75rem' }}>
                      Bu işlem 10-30 saniye sürebilir
                    </p>
                  </div>
                )}

                {uploadedPhoto && !resultReady && !loading && (
                  <img
                    src={uploadedPhoto}
                    alt="Yüklenen fotoğraf"
                    style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                  />
                )}

                {!uploadedPhoto && !loading && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 20, cursor: 'pointer',
                    }}
                  >
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#C8A456" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p style={{ color: '#C8A456', fontSize: '1rem', fontWeight: 500 }}>
                      Fotoğrafınızı Yükleyin
                    </p>
                    <p style={{ color: '#666', fontSize: '0.82rem', maxWidth: 300, textAlign: 'center', lineHeight: 1.6 }}>
                      Boydan veya omuzdan yukarı bir fotoğraf seçin. Yüzünüz net görünmeli.
                    </p>
                  </div>
                )}

                {loading && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 16,
                    background: 'rgba(0,0,0,0.8)',
                  }}>
                    <div className="loading__spinner" />
                    <p style={{ color: '#C8A456', fontSize: '0.85rem' }}>
                      Yapay zeka fotoğrafı işliyor...
                    </p>
                    <p style={{ color: '#666', fontSize: '0.75rem' }}>
                      İlk yüklemede birkaç saniye sürebilir
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              {/* Controls */}
              <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    flex: 1, padding: '14px 24px', background: '#C8A456', color: '#0A0A0A',
                    border: 'none', fontSize: '0.78rem', fontWeight: 600,
                    letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
                  }}
                >
                  {uploadedPhoto ? 'Başka Fotoğraf Yükle' : 'Fotoğraf Yükle'}
                </button>

                {uploadedPhoto && (
                  <button
                    onClick={clearPhoto}
                    style={{
                      padding: '14px 18px', background: 'transparent', color: '#999',
                      border: '1px solid #444', fontSize: '0.78rem', cursor: 'pointer',
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}
                  >
                    Temizle
                  </button>
                )}
              </div>

              {resultReady && (
                <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                  <button
                    onClick={openPreview}
                    style={{
                      flex: 1, padding: '12px 24px', background: 'transparent', color: '#C8A456',
                      border: '1px solid #C8A456', fontSize: '0.75rem', fontWeight: 500,
                      letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                    }}
                  >
                    Detaylı Önizle
                  </button>
                  {selectedProduct && (
                    <Link
                      to={`/product/${selectedProduct.id}`}
                      style={{
                        flex: 1, padding: '12px 24px', background: '#C8A456', color: '#0A0A0A',
                        border: '1px solid #C8A456', fontSize: '0.75rem', fontWeight: 600,
                        letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center',
                        textDecoration: 'none',
                      }}
                    >
                      Ürünü Satın Al
                    </Link>
                  )}
                </div>
              )}

              {/* AI gerçekçilik katmanı (hibrit) */}
              {resultReady && !aiResult && (
                <div style={{
                  marginTop: 16, padding: 16, background: '#141414',
                  border: '1px solid rgba(200,164,86,0.25)', borderRadius: 8,
                }}>
                  <p style={{ color: '#C8A456', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                    Daha Gerçekçi İster misiniz? (AI)
                  </p>
                  <p style={{ color: '#999', fontSize: '0.75rem', lineHeight: 1.7, marginBottom: 12 }}>
                    Yapay zeka, eşarbın deseni birebir korunarak kumaş kıvrımı ve gölgelerini
                    ekleyip fotoğrafı daha gerçekçi hale getirir. Bunun için fotoğrafınız
                    güvenli sunucumuz üzerinden işlenir ve işlem biter bitmez silinir.
                  </p>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', marginBottom: 12 }}>
                    <input
                      type="checkbox"
                      checked={aiConsent}
                      onChange={(e) => setAiConsent(e.target.checked)}
                      style={{ marginTop: 3, accentColor: '#C8A456', cursor: 'pointer' }}
                    />
                    <span style={{ color: '#aaa', fontSize: '0.72rem', lineHeight: 1.6 }}>
                      Fotoğrafımın gerçekçilik işlemi için güvenli sunucuya gönderilip
                      işlem sonrası kalıcı olarak silinmesini onaylıyorum (KVKK).
                    </span>
                  </label>
                  <button
                    onClick={enhanceWithAI}
                    disabled={!aiConsent || aiLoading}
                    style={{
                      width: '100%', padding: '12px 24px',
                      background: aiConsent && !aiLoading ? '#C8A456' : '#333',
                      color: aiConsent && !aiLoading ? '#0A0A0A' : '#777',
                      border: 'none', fontSize: '0.75rem', fontWeight: 600,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      cursor: aiConsent && !aiLoading ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {aiLoading ? 'İşleniyor...' : 'AI ile Gerçekçi Yap'}
                  </button>
                  {aiNote && (
                    <p style={{ color: '#e0a94f', fontSize: '0.72rem', marginTop: 10, lineHeight: 1.6 }}>{aiNote}</p>
                  )}
                </div>
              )}

              {aiResult && (
                <button
                  onClick={() => { setAiResult(null); setAiNote(''); }}
                  style={{
                    width: '100%', marginTop: 12, padding: '10px 24px', background: 'transparent',
                    color: '#999', border: '1px solid #444', fontSize: '0.72rem',
                    letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                  }}
                >
                  Hazır (AI'sız) Sonuca Dön
                </button>
              )}

              {error && (
                <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: 12, lineHeight: 1.6 }}>{error}</p>
              )}
            </div>

            {/* Product selector sidebar */}
            <div>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#fff',
                marginBottom: 12, fontWeight: 400,
              }}>
                Ürün Seçin
              </h3>

              {/* SKU arama */}
              <div style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  value={skuSearch}
                  onChange={(e) => handleSkuSearch(e.target.value)}
                  placeholder="SKU ile ara (ör. PRS-0001)"
                  style={{
                    width: '100%', padding: '10px 14px', background: '#1a1a1a',
                    border: '1px solid #333', color: '#fff', fontSize: '0.82rem',
                    borderRadius: 4, outline: 'none', boxSizing: 'border-box',
                  }}
                />
                {skuSearch.length >= 3 && !scarfProducts.find(p => p.sku?.toLowerCase().includes(skuSearch.toLowerCase())) && (
                  <p style={{ fontSize: '0.72rem', color: '#e74c3c', marginTop: 4 }}>
                    Bu SKU ile ürün bulunamadı
                  </p>
                )}
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
                maxHeight: 400, overflowY: 'auto', paddingRight: 4,
              }}>
                {scarfProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleScarfSelect(p)}
                    style={{
                      padding: 0, border: selectedProduct?.id === p.id
                        ? '2px solid #C8A456' : '2px solid transparent',
                      background: 'none', cursor: 'pointer', borderRadius: 4,
                      overflow: 'hidden', transition: 'border-color 0.2s',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={p.images?.[1] || p.images?.[0]}
                      alt={p.name}
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                    />
                    <span style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'rgba(0,0,0,0.7)', color: '#ccc',
                      fontSize: '0.55rem', padding: '3px 4px', textAlign: 'center',
                      letterSpacing: '0.05em',
                    }}>
                      {p.sku}
                    </span>
                  </button>
                ))}
              </div>

              {selectedProduct && (
                <div style={{ marginTop: 20, padding: 16, background: '#1a1a1a', borderRadius: 8 }}>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: '#fff', marginBottom: 4 }}>
                    {selectedProduct.name}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#C8A456', marginBottom: 8 }}>
                    {formatPrice(selectedProduct.price)}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#666', marginBottom: 4 }}>
                    SKU: {selectedProduct.sku}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#666' }}>
                    {selectedProduct.details?.dimensions || '150 x 150 cm'} · %100 Doğal İpek
                  </p>
                  <Link
                    to={`/product/${selectedProduct.id}`}
                    style={{
                      display: 'block', marginTop: 12, padding: '10px 16px',
                      border: '1px solid #C8A456', color: '#C8A456', textAlign: 'center',
                      fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                      textDecoration: 'none',
                    }}
                  >
                    Ürün Detayları
                  </Link>
                </div>
              )}

              <div style={{
                marginTop: 20, padding: 16, background: 'rgba(200,164,86,0.08)',
                borderRadius: 8, fontSize: '0.78rem', color: '#999', lineHeight: 1.8,
              }}>
                <p style={{ color: '#C8A456', fontWeight: 500, marginBottom: 8 }}>Nasıl Kullanılır?</p>
                <p>1. Bir ürün seçin veya SKU numarası yazın</p>
                <p>2. "Fotoğraf Yükle" butonuna tıklayın</p>
                <p>3. Boydan veya omuzdan yukarı bir fotoğraf seçin</p>
                <p>4. AI eşarbı fotoğrafınıza yerleştirir</p>
                <p>5. Beğendiyseniz sonucu indirin</p>
              </div>

              <div style={{
                marginTop: 12, padding: 12, background: 'rgba(39,174,96,0.08)',
                borderRadius: 8, fontSize: '0.7rem', color: '#888', lineHeight: 1.7,
                border: '1px solid rgba(39,174,96,0.15)',
              }}>
                <p style={{ color: '#27ae60', fontWeight: 600, marginBottom: 4, fontSize: '0.72rem' }}>
                  Gizlilik Güvencesi
                </p>
                <p>Temel deneme tamamen tarayıcınızda yapılır, fotoğrafınız sunucuya gönderilmez. Yalnızca isteğe bağlı "AI ile Gerçekçi Yap" adımını onaylarsanız fotoğrafınız güvenli sunucuda işlenir ve işlem biter bitmez silinir. Hiçbir görsel saklanmaz. KVKK uyumlu.</p>
              </div>
            </div>
          </div>

          {/* Hidden scarf image for canvas overlay */}
          {selectedProduct && (
            <img
              ref={scarfImgRef}
              src={selectedProduct.images?.[1] || selectedProduct.images?.[0]}
              alt=""
              crossOrigin="anonymous"
              onLoad={handleScarfLoaded}
              style={{ display: 'none' }}
            />
          )}

        </div>
      </div>

      {/* Detaylı önizleme — tam ekran lightbox */}
      {previewSrc && (
        <div
          onClick={() => setPreviewSrc(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: 'rgba(0,0,0,0.94)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'auto',
          }}
        >
          <button
            onClick={() => setPreviewSrc(null)}
            aria-label="Kapat"
            style={{
              position: 'fixed', top: 20, right: 20, zIndex: 9001,
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.25)', fontSize: '1.2rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>
          <p style={{
            position: 'fixed', bottom: 20, left: 0, right: 0, textAlign: 'center',
            color: '#888', fontSize: '0.72rem', letterSpacing: '0.1em', zIndex: 9001,
            pointerEvents: 'none',
          }}>
            {previewZoom ? 'UZAKLAŞTIRMAK İÇİN GÖRSELE TIKLAYIN' : 'YAKINLAŞTIRMAK İÇİN GÖRSELE TIKLAYIN'} — KAPATMAK İÇİN DIŞARI TIKLAYIN
          </p>
          <img
            src={previewSrc}
            alt="Detaylı önizleme"
            onClick={(e) => { e.stopPropagation(); setPreviewZoom(z => !z); }}
            style={previewZoom
              ? { width: 'auto', maxWidth: 'none', minWidth: '120vw', cursor: 'zoom-out', margin: 'auto' }
              : { maxWidth: '94vw', maxHeight: '92vh', objectFit: 'contain', cursor: 'zoom-in' }}
          />
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .sanal-deneme-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
