import { useState, useEffect } from 'react';

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('animate');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('fadeText'), 1800);
    const t2 = setTimeout(() => setPhase('fadeOut'), 3200);
    const t3 = setTimeout(() => onComplete(), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div className={`splash ${phase === 'fadeOut' ? 'splash--exit' : ''}`}>
      <div className="splash__content">
        <div className={`splash__icon ${phase !== 'animate' ? 'splash__icon--done' : ''}`}>
          <img
            src="/images/logo-wide.png"
            alt="Paressilk"
            className="splash__logo-img"
          />
        </div>
      </div>

      <style>{`
        .splash {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #0A0A0A;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.6s ease;
        }
        .splash--exit {
          opacity: 0;
          pointer-events: none;
        }
        .splash__content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .splash__icon {
          opacity: 0;
          transform: scale(0.9);
          animation: splashReveal 1.2s ease-out 0.3s forwards;
        }
        .splash__icon--done {
          filter: drop-shadow(0 0 20px rgba(200, 164, 86, 0.4));
        }
        .splash__logo-img {
          height: 60px;
          width: auto;
          filter: drop-shadow(0 0 0px rgba(200, 164, 86, 0));
          animation: glowPulse 2s ease-in-out 1.5s infinite;
        }
        @keyframes splashReveal {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes glowPulse {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(200, 164, 86, 0.2)); }
          50% { filter: drop-shadow(0 0 24px rgba(200, 164, 86, 0.6)); }
        }
        @media (max-width: 480px) {
          .splash__logo-img {
            height: 40px;
          }
        }
      `}</style>
    </div>
  );
}
