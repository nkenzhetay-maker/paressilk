import { useState } from 'react';
import { useUser } from '../context/UserContext';

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, register } = useUser();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });

  if (!showAuthModal) return null;

  const handleClose = () => {
    setShowAuthModal(false);
    setError('');
    setSuccess('');
    setMode('login');
    setForm({ firstName: '', lastName: '', email: '', password: '' });
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
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--gold)', marginBottom: 4 }}>
              PARESSILK
            </h2>
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

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Ad</label>
                  <input type="text" value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Soyad</label>
                  <input type="text" value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} />
                </div>
              </div>
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
