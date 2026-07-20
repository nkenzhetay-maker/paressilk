// src/pages/InstagramPage.jsx
// Route: /instagram  →  paressilk.com/instagram
import React from 'react';
import './InstagramPage.css';

const PRODUCTS = [
  { id: 'kelaghayi-national-collection-150', img: 'kelaghayi-1.jpg', name: 'National Collection Kelaghayi', cat: 'Kelaghayi', likes: 328, featured: true },
  { id: 'scarf-federation',                  img: 'scarf-3.jpg',     name: 'Kurumsal Özel Tasarım Eşarp', cat: 'Eşarp',     likes: 214 },
  { id: 'scarf-pink-buta',                   img: 'scarf-5.jpg',     name: 'Pink Buta İpek Eşarp',         cat: 'Eşarp',     likes: 267 },
  { id: 'kelaghayi-elegant-1',               img: 'kelaghayi-6.jpg', name: 'Elegant Collection Kelaghayi', cat: 'Kelaghayi', likes: 391 },
  { id: 'scarf-blue-rose',                   img: 'scarf-4.jpg',     name: 'Blue Rose İpek Eşarp',         cat: 'Eşarp',     likes: 183 },
  { id: 'kelaghayi-national-collection-2',   img: 'kelaghayi-2.jpg', name: 'National Collection II',       cat: 'Kelaghayi', likes: 156 },
  { id: 'scarf-classic-1',                   img: 'scarf-1.jpg',     name: 'Classic İpek Eşarp',           cat: 'Eşarp',     likes: 244 },
  { id: 'kelaghayi-classic-1',               img: 'kelaghayi-4.jpg', name: 'Classic Kelaghayi',            cat: 'Kelaghayi', likes: 198 },
  { id: 'scarf-elegant',                     img: 'scarf-6.jpg',     name: 'Elegant İpek Eşarp',           cat: 'Eşarp',     likes: 312 },
];

const HIGHLIGHTS = [
  { img: 'kelaghayi-1.jpg', label: 'Koleksiyon' },
  { img: 'kelaghayi-6.jpg', label: 'Kelağayı'  },
  { img: 'scarf-3.jpg',     label: 'Eşarp'       },
  { img: 'scarf-5.jpg',     label: 'Hediye'      },
  { img: 'kelaghayi-3.jpg', label: 'Hakkımızda'  },
];

const REELS = [
  { img: 'kelaghayi-1.jpg', label: 'Kelağayı' },
  { img: 'scarf-5.jpg',     label: 'Pink Buta'  },
  { img: 'kelaghayi-6.jpg', label: 'Elegant'    },
  { img: 'scarf-3.jpg',     label: 'Kurumsal'   },
  { img: 'kelaghayi-3.jpg', label: 'Koleksiyon' },
];

const BASE = '/images/products/';

export default function InstagramPage() {
  return (
    <div className="ig-page">

      {/* PROFİL */}
      <section className="ig-hero">
        <div className="ig-profile">
          <div className="ig-avatar-wrap">
            <img className="ig-avatar" src={`${BASE}kelaghayi-1.jpg`} alt="Paressilk" />
          </div>
          <div className="ig-profile-info">
            <div className="ig-handle">@paressilk</div>
            <div className="ig-name">Paressilk — Zarafetin İpek Dokunuşu</div>
            <div className="ig-stats">
              <div className="ig-stat"><span className="ig-stat-num">13</span><span className="ig-stat-label">Ürün</span></div>
              <div className="ig-stat"><span className="ig-stat-num">Takip Et</span><span className="ig-stat-label">Instagram</span></div>
              <div className="ig-stat"><span className="ig-stat-num">UNESCO</span><span className="ig-stat-label">İpek Mirası</span></div>
            </div>
          </div>
        </div>
        <p className="ig-bio">
          %100 el yapımı doğal ipek · Azerbaycan'ın kadim <span>kelaghayi</span> geleneği<br />
          İpek Yolu'ndan Boğaziçi'ne · <span>paressilk.com</span>
        </p>
        <a href="https://instagram.com/paressilk" target="_blank" rel="noreferrer" className="ig-follow-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
          Instagram'da Takip Et
        </a>
      </section>

      {/* HIGHLIGHTS */}
      <section className="ig-highlights">
        <div className="highlights-row">
          {HIGHLIGHTS.map(h => (
            <a key={h.label} className="highlight-item" href="/products">
              <div className="highlight-ring">
                <img className="highlight-img" src={`${BASE}${h.img}`} alt={h.label} />
              </div>
              <span className="highlight-label">{h.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ÜRÜN GRID */}
      <section className="ig-grid-section">
        <div className="ig-grid">
          {PRODUCTS.map(p => (
            <a
              key={p.id}
              href={`/product/${p.id}`}
              className={`ig-post${p.featured ? ' ig-post--featured' : ''}`}
            >
              <img src={`${BASE}${p.img}`} alt={p.name} loading="lazy" />
              <div className="ig-post-overlay">
                <div className="ig-post-likes">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  {p.likes}
                </div>
                <p className="ig-post-caption">{p.name}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* REELS */}
      <section className="ig-reels-section">
        <h3 className="reels-title">Reels</h3>
        <div className="reels-row">
          {REELS.map(r => (
            <div key={r.label} className="reel-card">
              <img src={`${BASE}${r.img}`} alt={r.label} loading="lazy" />
              <div className="reel-play" />
              <span className="reel-label">{r.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="ig-cta">
        <p className="ig-cta-subtitle">Bizi Takip Edin</p>
        <h2 className="ig-cta-title">Hazar'dan Boğaziçi'ne<br /><em>İpek Bir Yolculuk</em></h2>
        <div className="gold-divider" />
        <p className="ig-cta-desc">
          Her paylaşımımızda bir zanaat hikayesi, bir desen sırrı, bir kültür köprüsü.
        </p>
        <div className="ig-cta-links">
          <a href="https://instagram.com/paressilk" target="_blank" rel="noreferrer" className="btn-primary">Instagram'a Git</a>
          <a href="/products" className="btn-outline">Alışverişe Başla</a>
        </div>
      </section>

    </div>
  );
}
