import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!login(username, password)) {
      setError('Kullanıcı adı veya şifre hatalı.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A' }}>
      <div style={{ width: 400, maxWidth: '90%', padding: 40, background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--gold)', marginBottom: 8 }}>PARESSILK</h2>
          <p style={{ fontSize: '0.8rem', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Yönetim Paneli</p>
        </div>
        {error && <p style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: 16, textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Kullanıcı Adı</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Şifre</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn--primary" style={{ width: '100%' }}>Giriş Yap</button>
        </form>
      </div>
    </div>
  );
}
