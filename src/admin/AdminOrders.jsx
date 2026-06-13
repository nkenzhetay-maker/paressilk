export default function AdminOrders() {
  return (
    <div>
      <div className="admin-header">
        <h1>Siparişler</h1>
      </div>
      <div className="admin-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1" style={{ marginBottom: 16 }}>
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: 8 }}>Sipariş Yönetimi</h3>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>Ödeme sistemi entegre edildiğinde siparişler burada görüntülenecektir.</p>
        <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: 8 }}>iyzico veya Stripe entegrasyonu için destek ekibinizle iletişime geçin.</p>
      </div>
    </div>
  );
}
