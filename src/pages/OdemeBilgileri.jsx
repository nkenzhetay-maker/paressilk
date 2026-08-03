import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import BankInfoReveal from '../components/BankInfoReveal';

export default function OdemeBilgileri() {
  const [searchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get('siparis') || '';

  return (
    <>
      <Helmet>
        <title>Ödeme Bilgileri | Paressilk</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="container" style={{ padding: '64px 20px 96px', maxWidth: 640 }}>
        <h1
          style={{
            fontFamily: 'var(--font-heading, serif)',
            fontSize: '1.9rem',
            margin: '0 0 12px',
            color: '#1a1a1a',
          }}
        >
          Ödeme Bilgileri
        </h1>
        <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 32 }}>
          E-postanıza/SMS'inize gönderilen 6 haneli kod ile havale bilgilerimizi görüntüleyin.
        </p>

        <BankInfoReveal initialOrderNumber={initialOrderNumber} />
      </div>
    </>
  );
}
