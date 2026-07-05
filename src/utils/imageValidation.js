// Görsel doğrulama — AI'a göndermeden ÖNCE fotoğrafı kontrol eder.
// Amaç: kötü fotoğrafları erken reddedip hem kullanıcıyı yönlendirmek hem de
// gereksiz AI maliyetini önlemek. Tamamen tarayıcıda çalışır (KVKK).
//
// MediaPipe FaceLandmarker ile: yüz var mı, tek kişi mi, yüz konumu/boyutu.
// Canvas piksel analizi ile: çok karanlık / çok aydınlık.
//
// Not (bilinen sınır): omuz/poz tespiti bu aşamada yüz konumundan tahmin edilir;
// tam vücut pozu (PoseLandmarker) sonraki milestone'da eklenebilir.

let _landmarkerPromise = null;

export async function getFaceLandmarker() {
  if (_landmarkerPromise) return _landmarkerPromise;
  _landmarkerPromise = (async () => {
    const { FaceLandmarker, FilesetResolver } = await import(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/vision_bundle.mjs'
    );
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
    );
    return FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      numFaces: 2, // birden fazla yüzü yakalamak için 2
    });
  })();
  return _landmarkerPromise;
}

// Ortalama parlaklık (0-255) — basit luminance örneklemesi
function measureBrightness(img) {
  const c = document.createElement('canvas');
  const w = 128, h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * 128));
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return sum / (data.length / 4);
}

const FOREHEAD = 10, CHIN = 152, LEFT = 234, RIGHT = 454;

/**
 * @returns {Promise<{ok:boolean, code?:string, reason?:string, metrics?:object}>}
 */
export async function validatePhoto(img) {
  // 1) Parlaklık
  const brightness = measureBrightness(img);
  if (brightness < 45) {
    return { ok: false, code: 'too_dark', reason: 'Fotoğraf çok karanlık. Lütfen aydınlık bir ortamda çekilmiş bir fotoğraf yükleyin.', metrics: { brightness } };
  }
  if (brightness > 235) {
    return { ok: false, code: 'too_bright', reason: 'Fotoğraf çok parlak/patlamış. Lütfen daha dengeli ışıklı bir fotoğraf yükleyin.', metrics: { brightness } };
  }

  // 2) Yüz tespiti
  let result;
  try {
    const landmarker = await getFaceLandmarker();
    result = landmarker.detect(img);
  } catch (e) {
    // Model yüklenemezse validasyonu bloklamayalım — AI tarafı yine korur
    return { ok: true, code: 'validation_skipped', metrics: { brightness } };
  }

  const faces = result?.faceLandmarks || [];
  if (faces.length === 0) {
    return { ok: false, code: 'no_face', reason: 'Yüz tespit edilemedi. Lütfen yüzünüzün net göründüğü, önden çekilmiş bir fotoğraf yükleyin.', metrics: { brightness } };
  }
  if (faces.length > 1) {
    return { ok: false, code: 'multiple_people', reason: 'Fotoğrafta birden fazla kişi var. Lütfen yalnızca sizin göründüğünüz bir fotoğraf yükleyin.', metrics: { brightness, faces: faces.length } };
  }

  // 3) Yüz konumu / boyutu (kırpma & mesafe kontrolü)
  const pts = faces[0];
  const fw = Math.abs(pts[RIGHT].x - pts[LEFT].x);      // yüz genişliği (0-1)
  const foreheadY = pts[FOREHEAD].y;
  const chinY = pts[CHIN].y;

  if (fw < 0.06) {
    return { ok: false, code: 'too_small', reason: 'Kişi çok uzakta/küçük görünüyor. Lütfen kameraya biraz daha yakın, üst bedeniniz görünen bir fotoğraf yükleyin.', metrics: { brightness, faceWidth: fw } };
  }
  if (fw > 0.75) {
    return { ok: false, code: 'too_close', reason: 'Yüz çok yakın. Lütfen en az baş, omuz ve göğüs hizasının göründüğü bir fotoğraf yükleyin.', metrics: { brightness, faceWidth: fw } };
  }
  if (foreheadY < 0.02) {
    return { ok: false, code: 'head_cropped', reason: 'Başınızın üstü kırpılmış. Lütfen başınızın tamamı görünen bir fotoğraf yükleyin.', metrics: { brightness } };
  }
  // Çene kadraja çok yakınsa omuz/göğüs görünmüyor demektir
  if (chinY > 0.92) {
    return { ok: false, code: 'shoulders_missing', reason: 'Omuzlarınız görünmüyor. Başörtüsü denemesi için en az omuz ve göğüs hizasının göründüğü bir fotoğraf gerekir.', metrics: { brightness, chinY } };
  }

  return { ok: true, metrics: { brightness, faceWidth: fw, faces: 1 } };
}
