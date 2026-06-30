import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';

const categoryOptions = [
  { value: 'yeni-koleksiyon', label: 'Yeni Koleksiyon' },
  { value: 'kelaghayi', label: 'Kelaghayi' },
  { value: 'scarves', label: 'Eşarplar' },
  { value: 'chitme', label: 'Chitme' },
  { value: 'raw-silk', label: 'Ham İpek' },
  { value: 'carpet', label: 'Halılar' },
];

const emptyProduct = {
  name: '', nameEn: '', category: 'kelaghayi', price: '', description: '', descriptionEn: '',
  images: [], inStock: true, featured: false, tags: [],
  details: { material: '%100 Doğal İpek', dimensions: '', origin: 'El Yapımı', care: 'Kuru temizleme önerilir' },
};

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProduct, addProduct, updateProduct } = useProducts();
  const isEdit = !!id;
  const fileRef = useRef();
  const videoRef = useRef();

  const [form, setForm] = useState(emptyProduct);
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (isEdit) {
      const existing = getProduct(id);
      if (existing) {
        setForm(existing);
        setTagsInput(existing.tags?.join(', ') || '');
      }
    }
  }, [id]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDetailChange = (field, value) => {
    setForm(prev => ({ ...prev, details: { ...prev.details, [field]: value } }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({
          ...prev,
          images: [...(prev.images || []), ev.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(prev => ({ ...prev, video: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeVideo = () => {
    setForm(prev => ({ ...prev, video: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const product = {
      ...form,
      price: Number(form.price),
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
    };

    if (isEdit) {
      updateProduct(id, product);
    } else {
      addProduct(product);
    }
    navigate('/admin/products');
  };

  return (
    <div>
      <div className="admin-header">
        <h1>{isEdit ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h1>
        <button onClick={() => navigate('/admin/products')} className="btn btn--outline">Geri</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="product-form">
          <div>
            <div className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: 20 }}>Temel Bilgiler</h3>
              <div className="form-group">
                <label>Ürün Adı (TR)</label>
                <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Ürün Adı (EN)</label>
                <input type="text" value={form.nameEn} onChange={e => handleChange('nameEn', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Açıklama (TR)</label>
                <textarea rows="4" value={form.description} onChange={e => handleChange('description', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Açıklama (EN)</label>
                <textarea rows="4" value={form.descriptionEn} onChange={e => handleChange('descriptionEn', e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Kategori</label>
                  <select value={form.category} onChange={e => handleChange('category', e.target.value)}>
                    {categoryOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fiyat (TRY)</label>
                  <input type="number" value={form.price} onChange={e => handleChange('price', e.target.value)} required min="0" />
                </div>
              </div>
              <div className="form-group">
                <label>Etiketler (virgülle ayırın)</label>
                <input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="ipek, eşarp, hediye" />
              </div>
            </div>

            <div className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: 20 }}>Ürün Detayları</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Malzeme</label>
                  <input type="text" value={form.details?.material || ''} onChange={e => handleDetailChange('material', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Boyut</label>
                  <input type="text" value={form.details?.dimensions || ''} onChange={e => handleDetailChange('dimensions', e.target.value)} placeholder="90 x 180 cm" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Menşei</label>
                  <input type="text" value={form.details?.origin || ''} onChange={e => handleDetailChange('origin', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Bakım</label>
                  <input type="text" value={form.details?.care || ''} onChange={e => handleDetailChange('care', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: 20 }}>Görseller</h3>
              <div className="product-form__image-upload" onClick={() => fileRef.current?.click()}>
                <input type="file" ref={fileRef} accept="image/*" multiple onChange={handleImageUpload} />
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ marginBottom: 8 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <p style={{ fontSize: '0.85rem', color: '#888' }}>Görsel yüklemek için tıklayın</p>
                <p style={{ fontSize: '0.72rem', color: '#bbb' }}>JPG, PNG - Maks. 5MB</p>
              </div>
              {form.images?.length > 0 && (
                <div className="product-form__preview">
                  {form.images.map((img, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={img} alt={`Ürün ${i + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                      >x</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: 20 }}>Ürün Videosu</h3>
              {form.video ? (
                <div style={{ position: 'relative' }}>
                  <video src={form.video} controls style={{ width: '100%', borderRadius: 4, maxHeight: 200 }} />
                  <button
                    type="button"
                    onClick={removeVideo}
                    style={{ position: 'absolute', top: 8, right: 8, padding: '4px 10px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.72rem', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                  >Kaldır</button>
                </div>
              ) : (
                <div className="product-form__image-upload" onClick={() => videoRef.current?.click()} style={{ borderStyle: 'dashed' }}>
                  <input type="file" ref={videoRef} accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} />
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ marginBottom: 8 }}>
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  <p style={{ fontSize: '0.85rem', color: '#888' }}>Video yüklemek için tıklayın</p>
                  <p style={{ fontSize: '0.72rem', color: '#bbb' }}>MP4, MOV - Maks. 50MB - 1 adet</p>
                </div>
              )}
            </div>

            <div className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: 20 }}>Durum</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={form.inStock} onChange={e => handleChange('inStock', e.target.checked)} />
                  Stokta mevcut
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={form.featured} onChange={e => handleChange('featured', e.target.checked)} />
                  Öne çıkan ürün
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn--primary" style={{ width: '100%' }}>
              {isEdit ? 'Güncelle' : 'Ürünü Kaydet'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
