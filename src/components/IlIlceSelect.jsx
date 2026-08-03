// İl / İlçe açılır liste — yazım hatasını önler (kullanıcı listeden seçer).
// İl seçilince ilçe listesi güncellenir; il değişince ilçe sıfırlanır.
// İki kullanım: variant="form" (Checkout, .form-group + <label>),
//               variant="inline" (Hesap, span label + inline style).
import ilData from '../data/turkiye-il-ilce.json';

const ILLER = Object.keys(ilData);

export default function IlIlceSelect({
  city, district, onCity, onDistrict,
  variant = 'form', required = false, inputStyle, labelStyle,
}) {
  const ilceler = ilData[city] || [];
  const handleCity = (v) => { onCity(v); onDistrict(''); };

  if (variant === 'inline') {
    return (
      <>
        <div>
          <span style={labelStyle}>İl</span>
          <select style={inputStyle} value={city || ''} onChange={e => handleCity(e.target.value)}>
            <option value="">Seçiniz</option>
            {ILLER.map(il => <option key={il} value={il}>{il}</option>)}
          </select>
        </div>
        <div>
          <span style={labelStyle}>İlçe</span>
          <select style={inputStyle} value={district || ''} disabled={!city} onChange={e => onDistrict(e.target.value)}>
            <option value="">{city ? 'Seçiniz' : 'Önce il seçin'}</option>
            {ilceler.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="form-group">
        <label>İl</label>
        <select required={required} value={city || ''} onChange={e => handleCity(e.target.value)}>
          <option value="">Seçiniz</option>
          {ILLER.map(il => <option key={il} value={il}>{il}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>İlçe</label>
        <select required={required} value={district || ''} disabled={!city} onChange={e => onDistrict(e.target.value)}>
          <option value="">{city ? 'Seçiniz' : 'Önce il seçin'}</option>
          {ilceler.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
    </>
  );
}
