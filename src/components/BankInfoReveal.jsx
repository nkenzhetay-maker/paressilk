import { useState } from 'react';

const GOLD = 'var(--gold, #B8860B)';
const GOLD_DARK = 'var(--gold-dark, #8a6600)';
const CREAM = 'var(--cream, #F5F0E8)';

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid #ddd',
  borderRadius: 6,
  fontSize: '0.95rem',
  fontFamily: 'system-ui, sans-serif',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.72rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#999',
  marginBottom: 6,
  fontFamily: 'system-ui, sans-serif',
};

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        marginLeft: 10,
        padding: '5px 12px',
        border: `1px solid ${GOLD}`,
        background: copied ? GOLD : '#fff',
        color: copied ? '#fff' : GOLD_DARK,
        borderRadius: 5,
        cursor: 'pointer',
        fontSize: '0.72rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {copied ? 'Kopyalandı ✓' : 'Kopyala'}
    </button>
  );
}

export default function BankInfoReveal({ initialOrderNumber = '' }) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(null);

  const orderLocked = Boolean(initialOrderNumber);

  const formatPrice = (amount, currency) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: (currency || 'try').toUpperCase(),
    }).format(amount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const on = orderNumber.trim();
    if (!on) { setError('Lütfen sipariş numaranızı girin.'); return; }
    if (!/^\d{6}$/.test(code)) { setError('Ödeme kodu 6 haneli olmalıdır.'); return; }

    setLoading(true);
    setInfo(null);
    try {
      const res = await fetch('/.netlify/functions/reveal-bank-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: on, code }),
      });
      const data = await res.json();
      if (res.ok && data.bank) {
        setInfo(data);
      } else {
        setError(data.error || 'Bilgiler görüntülenemedi. Lütfen tekrar deneyin.');
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, fontFamily: 'system-ui, sans-serif' }}>
      {!info ? (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Sipariş Numarası</label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="PS-XXXX"
              readOnly={orderLocked}
              style={{
                ...inputStyle,
                ...(orderLocked ? { background: '#f5f5f5', color: '#666', cursor: 'default' } : {}),
              }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>6 Haneli Ödeme Kodu</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Örn. 123456"
              autoComplete="one-time-code"
              style={{ ...inputStyle, letterSpacing: '0.3em', fontSize: '1.1rem' }}
            />
          </div>

          {error && (
            <p style={{ color: '#E74C3C', fontSize: '0.85rem', marginBottom: 14 }}>{error}</p>
          )}

          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px 20px',
              background: GOLD,
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.9rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {loading ? 'Kontrol ediliyor…' : 'Ödeme Bilgilerini Göster'}
          </button>
        </form>
      ) : (
        <div
          style={{
            background: CREAM,
            border: `1px solid ${GOLD}`,
            borderRadius: 10,
            padding: 28,
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-heading, serif)',
              fontSize: '1.25rem',
              margin: '0 0 20px',
              color: '#1a1a1a',
            }}
          >
            Havale / EFT Bilgileri
          </h3>

          <Row label="Banka Adı" value={info.bank.bankName} />

          <div style={{ marginBottom: 16 }}>
            <span style={labelStyle}>IBAN</span>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.02em' }}>
                {info.bank.iban}
              </span>
              <CopyButton value={info.bank.iban} />
            </div>
          </div>

          <Row label="Hesap Sahibi" value={info.bank.accountHolder} />
          <Row label="Tutar" value={formatPrice(info.amount, info.currency)} highlight />

          <div style={{ marginBottom: 4 }}>
            <span style={labelStyle}>Havale Açıklaması</span>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: GOLD_DARK, letterSpacing: '0.02em' }}>
                {info.reference || info.orderNumber}
              </span>
              <CopyButton value={info.reference || info.orderNumber} />
            </div>
          </div>

          <p style={{ fontSize: '0.78rem', color: '#8a6600', marginTop: 18, lineHeight: 1.6 }}>
            Havale açıklamasına mutlaka sipariş numaranızı yazınız. Aksi halde ödemeniz eşleştirilemeyebilir.
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <span style={labelStyle}>{label}</span>
      <div
        style={{
          fontSize: highlight ? '1.15rem' : '1rem',
          fontWeight: 600,
          color: highlight ? GOLD_DARK : '#1a1a1a',
        }}
      >
        {value}
      </div>
    </div>
  );
}
