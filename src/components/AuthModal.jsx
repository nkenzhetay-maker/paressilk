import { useState } from 'react';
import { useUser } from '../context/UserContext';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, register, loginWithGoogle } = useUser();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    phone: '', address: '', city: '', district: '', postalCode: '',
  });

  if (!showAuthModal) return null;

  const handleClose = () => {
    setShowAuthModal(false);
    setError('');
    setSuccess('');
    setMode('login');
    setForm({ firstName: '', lastName: '', email: '', password: '', phone: '', address: '', city: '', district: '', postalCode: '' });
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form);
        setSuccess('Kayıt başarılı! E-posta adresinize doğrulama linki gönderildi.');
        setMode('login');
        setForm(prev => ({ ...prev, password: '' }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: '#fff', width: 420, maxWidth: '100%', maxHeight: '90vh',
          overflow: 'auto', position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: 16, right: 16, background: 'none', border: 'none',
            cursor: 'pointer', fontSize: '1.2rem', color: '#888',
          }}
          aria-label="Kapat"
        >
          ✕
        </button>

        <div style={{ padding: '40px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <img src="/images/logo.png" alt="Paressilk" style={{ height: 36, marginBottom: 8 }} />
            <p style={{ fontSize: '0.8rem', color: '#888', letterSpacing: '0.1em' }}>
              {mode === 'login' ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
            </p>
          </div>

          {error && (
            <p style={{ color: '#e74c3c', fontSize: '0.82rem', textAlign: 'center', marginBottom: 16, padding: '8px 12px', background: '#fdf0ef', borderRadius: 4 }}>
              {error}
            </p>
          )}
          {success && (
            <p style={{ color: '#27ae60', fontSize: '0.82rem', textAlign: 'center', marginBottom: 16, padding: '8px 12px', background: '#eafaf1', borderRadius: 4 }}>
              {success}
            </p>
          )}

          <button
            onClick={async () => {
              try {
                await loginWithGoogle();
              } catch (err) {
                setError(err.message || 'Google ile giriş yapılamadı');
              }
            }}
            style={{
              width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: 4,
              background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 10, fontSize: '0.88rem', fontWeight: 500,
              color: '#333', marginBottom: 20, transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            type="button"
          >
            <GoogleIcon />
            Google ile {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#ddd' }} />
            <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>veya</span>
            <div style={{ flex: 1, height: 1, background: '#ddd' }} />
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Ad</label>
                    <input type="text" value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Soyad</label>
                    <input type="text" value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Telefon</label>
                  <input type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="05XX XXX XX XX" required />
                </div>
              </>
            )}

            <div className="form-group">
              <label>E-posta</label>
              <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Şifre</label>
              <input
                type="password"
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                required
                minLength={6}
                placeholder={mode === 'register' ? 'En az 6 karakter' : ''}
              />
            </div>

            {mode === 'register' && (
              <>
                <div style={{ borderTop: '1px solid #eee', marginTop: 16, paddingTop: 16, marginBottom: 8 }}>
                  <p style={{ fontSize: '0.78rem', color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Teslimat Bilgileri</p>
                </div>
                <div className="form-group">
                  <label>Adres</label>
                  <textarea rows="2" value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder="Mahalle, sokak, bina no, daire no" required />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>İl</label>
                    <input type="text" value={form.city} onChange={e => handleChange('city', e.target.value)} placeholder="İstanbul" required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>İlçe</label>
                    <input type="text" value={form.district} onChange={e => handleChange('district', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Posta Kodu</label>
                  <input type="text" value={form.postalCode} onChange={e => handleChange('postalCode', e.target.value)} placeholder="34000" maxLength={5} />
                </div>
              </>
            )}

            <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading
                ? (mode === 'login' ? 'Giriş yapılıyor...' : 'Kayıt oluşturuluyor...')
                : (mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: '#666' }}>
            {mode === 'login' ? (
              <p>
                Hesabınız yok mu?{' '}
                <button
                  onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--gold-dark)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}
                >
                  Kayıt Ol
                </button>
              </p>
            ) : (
              <p>
                Zaten hesabınız var mı?{' '}
                <button
                  onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--gold-dark)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}
                >
                  Giriş Yap
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
