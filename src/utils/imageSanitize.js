// Görsel temizleme — EXIF/metadata SIYIRMA (KVKK/GDPR).
// Yüklenen fotoğrafta GPS, cihaz modeli, çekim zamanı gibi metadata olabilir.
// Görseli canvas'a çizip yeniden kodlayınca TÜM EXIF/metadata düşer.
// Aynı adımda büyük görselleri makul boyuta indiririz (maliyet + hız).

const MAX_EDGE = 1536; // AI için yeterli, gereksiz büyüklüğü önler

/**
 * dataURL veya File'dan EXIF'siz, normalize edilmiş bir JPEG dataURL üretir.
 * @param {string} dataUrl - "data:image/...;base64,..."
 * @returns {Promise<{clean:string, width:number, height:number, bytes:number}>}
 */
export function sanitizeImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
      w = Math.round(w * scale);
      h = Math.round(h * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      // Canvas'a çizim + re-encode => EXIF/GPS/cihaz bilgisi tamamen kaybolur
      ctx.drawImage(img, 0, 0, w, h);

      const clean = canvas.toDataURL('image/jpeg', 0.92);
      const bytes = Math.round((clean.length - clean.indexOf(',') - 1) * 0.75);
      resolve({ clean, width: w, height: h, bytes });
    };
    img.onerror = () => reject(new Error('Görsel okunamadı'));
    img.src = dataUrl;
  });
}
