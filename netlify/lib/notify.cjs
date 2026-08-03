// Sipariş bildirim kütüphanesi — e-posta (Resend) + SMS (Netgsm).
// stripe-webhook (kart) ve place-bank-order (havale) ortak kullanır.
//
// SMS için Netgsm hesabı + operatör onaylı başlık gerekir (env yoksa sessizce atlanır):
//   NETGSM_USERCODE, NETGSM_PASSWORD, NETGSM_MSGHEADER (ör. PARESSILK)

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const fmtTL = (n) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n || 0);

// ---------- E-POSTA ----------

// Sisman örneği tarzında sipariş dekontu.
// Not: Fiyatlar KDV dahildir; yanlış oran hesaplamamak için KDV ayrıştırması yapılmaz.
function orderEmailHtml(order) {
  const {
    orderNumber, customerName, paymentLabel, items = [],
    subtotal, discountTL, promoLabel, shippingTL, grandTotal,
    shippingInfo = {}, billing = {}, accessCode,
  } = order;

  const siteUrl = process.env.SITE_URL || 'https://paressilk.com';
  const isBank = accessCode && /havale|eft/i.test(String(paymentLabel || ''));
  // Havale ödeme kodu kutusu — müşteri bu kodu sitede girince IBAN görünür.
  const bankCodeBlock = isBank ? `
    <div style="background:#fffaf0;border:1px solid #e8d9b5;border-radius:8px;padding:24px;margin-top:16px;text-align:center;">
      <h3 style="margin:0 0 6px;font-size:16px;color:#8a6600;">Ödeme (Havale/EFT) Bilgileri</h3>
      <p style="margin:0 0 14px;color:#555;font-size:13px;line-height:1.6;">
        Güvenliğiniz için IBAN bilgilerimiz yalnızca aşağıdaki koda özeldir.<br>
        Bu kodu ödeme bilgileri sayfasına girerek hesap bilgilerimizi görüntüleyin.
      </p>
      <div style="display:inline-block;background:#fff;border:2px dashed #B8860B;border-radius:8px;padding:12px 26px;margin-bottom:14px;">
        <span style="font-size:12px;color:#999;letter-spacing:2px;display:block;">ÖDEME KODUNUZ</span>
        <span style="font-size:30px;font-weight:bold;letter-spacing:8px;color:#1a1a1a;">${esc(accessCode)}</span>
      </div>
      <div>
        <a href="${siteUrl}/odeme-bilgileri?siparis=${encodeURIComponent(orderNumber)}"
           style="display:inline-block;background:#B8860B;color:#fff;text-decoration:none;padding:11px 26px;border-radius:6px;font-size:14px;font-weight:bold;">
          Ödeme Bilgilerini Görüntüle →
        </a>
      </div>
      <p style="margin:14px 0 0;color:#888;font-size:12px;">Havale açıklamasına sipariş numaranızı yazmayı unutmayın: <b>${esc(orderNumber)}</b></p>
    </div>` : '';

  const rows = items.map(it => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;">${esc(it.name)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${fmtTL(it.price)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;">x${Number(it.qty) || 1}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${fmtTL(it.price * (Number(it.qty) || 1))}</td>
    </tr>`).join('');

  const billingRows = billing.invoiceType === 'kurumsal'
    ? `
      <tr><td style="padding:8px 0;"><b>Fatura Tipi</b></td><td>Kurumsal</td></tr>
      <tr><td style="padding:8px 0;"><b>Şirket Ünvanı</b></td><td>${esc(billing.companyName)}</td></tr>
      <tr><td style="padding:8px 0;"><b>Vergi Dairesi</b></td><td>${esc(billing.taxOffice)}</td></tr>
      <tr><td style="padding:8px 0;"><b>Vergi No</b></td><td>${esc(billing.taxNo)}</td></tr>`
    : `
      <tr><td style="padding:8px 0;"><b>Fatura Tipi</b></td><td>Bireysel</td></tr>
      <tr><td style="padding:8px 0;"><b>TC Kimlik No</b></td><td>${esc(maskTc(billing.tcNo))}</td></tr>`;

  return `<!doctype html><html lang="tr"><body style="margin:0;background:#f5f2ec;font-family:Arial,Helvetica,sans-serif;color:#222;">
  <div style="max-width:640px;margin:0 auto;padding:24px 16px;">
    <div style="text-align:center;padding:18px 0;">
      <span style="font-size:24px;letter-spacing:2px;color:#B8860B;font-weight:bold;">PARESSILK</span>
      <div style="font-size:11px;color:#999;letter-spacing:3px;margin-top:2px;">%100 DOĞAL İPEK</div>
    </div>

    <div style="background:#fff;border:1px solid #e8e2d5;border-radius:8px;padding:24px;">
      <table width="100%"><tr>
        <td><h2 style="margin:0;font-size:20px;">Sipariş Dekontu</h2></td>
        <td style="text-align:right;color:#888;font-size:12px;">${new Date().toLocaleString('tr-TR')}</td>
      </tr></table>

      <p style="margin:18px 0 6px;">Merhaba <b>${esc(customerName)}</b>,</p>
      <p style="margin:0 0 18px;color:#555;">Siparişiniz alınmıştır. Sipariş detayları aşağıdadır.</p>

      <table style="font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:6px 24px 6px 0;"><b>Sipariş No</b></td><td>: ${esc(orderNumber)}</td></tr>
        <tr><td style="padding:6px 24px 6px 0;"><b>Ödeme Türü</b></td><td>: ${esc(paymentLabel)}</td></tr>
        <tr><td style="padding:6px 24px 6px 0;"><b>Kargo Firması</b></td><td>: Yurtiçi Kargo</td></tr>
      </table>

      <table width="100%" style="border-collapse:collapse;font-size:14px;margin-top:20px;">
        <thead><tr style="background:#faf7f0;">
          <th style="padding:10px 8px;text-align:left;border-bottom:2px solid #B8860B;">Ürün</th>
          <th style="padding:10px 8px;text-align:right;border-bottom:2px solid #B8860B;">Fiyat</th>
          <th style="padding:10px 8px;text-align:center;border-bottom:2px solid #B8860B;">Miktar</th>
          <th style="padding:10px 8px;text-align:right;border-bottom:2px solid #B8860B;">Toplam</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>

      <table width="100%" style="font-size:14px;margin-top:14px;">
        <tr><td style="text-align:right;padding:4px 0;color:#555;">Ara Toplam:</td><td style="text-align:right;width:120px;">${fmtTL(subtotal)}</td></tr>
        ${discountTL > 0 ? `<tr><td style="text-align:right;padding:4px 0;color:#27AE60;">İndirim${promoLabel ? ` (${esc(promoLabel)})` : ''}:</td><td style="text-align:right;color:#27AE60;">−${fmtTL(discountTL)}</td></tr>` : ''}
        <tr><td style="text-align:right;padding:4px 0;color:#555;">Kargo Ücreti:</td><td style="text-align:right;">${shippingTL > 0 ? fmtTL(shippingTL) : 'Ücretsiz'}</td></tr>
        <tr><td style="text-align:right;padding:8px 0;font-size:16px;"><b>Genel Toplam (KDV Dahil):</b></td><td style="text-align:right;font-size:16px;"><b>${fmtTL(grandTotal)}</b></td></tr>
      </table>
    </div>

    ${bankCodeBlock}

    <div style="background:#fff;border:1px solid #e8e2d5;border-radius:8px;padding:24px;margin-top:16px;">
      <h3 style="margin:0 0 12px;font-size:15px;border-bottom:1px solid #eee;padding-bottom:8px;">Teslimat Bilgileri</h3>
      <table style="font-size:13px;">
        <tr><td style="padding:6px 18px 6px 0;"><b>Adı Soyadı</b></td><td>: ${esc(shippingInfo.name)}</td></tr>
        <tr><td style="padding:6px 18px 6px 0;"><b>Telefon</b></td><td>: ${esc(shippingInfo.phone)}</td></tr>
        <tr><td style="padding:6px 18px 6px 0;vertical-align:top;"><b>Adres</b></td><td>: ${esc(shippingInfo.address)} ${esc(shippingInfo.district)} / ${esc(shippingInfo.city)}</td></tr>
      </table>
    </div>

    <div style="background:#fff;border:1px solid #e8e2d5;border-radius:8px;padding:24px;margin-top:16px;">
      <h3 style="margin:0 0 12px;font-size:15px;border-bottom:1px solid #eee;padding-bottom:8px;">Fatura Bilgileri</h3>
      <table style="font-size:13px;">${billingRows}</table>
    </div>

    <div style="background:#fff;border:1px solid #e8e2d5;border-radius:8px;padding:20px;margin-top:16px;font-size:11px;color:#777;line-height:1.7;">
      <b style="font-size:12px;color:#444;">İade ve İptal</b><br>
      Web sitemiz üzerinden sipariş veren ALICI, ön bilgilendirme formu ve mesafeli satış sözleşmesini kabul etmiş sayılır.
      6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında 14 gün içinde
      cayma hakkınız bulunmaktadır (kullanılmamış, lekelenmemiş, hasarsız ürünlerde geçerlidir).
    </div>

    <div style="text-align:center;font-size:11px;color:#999;padding:18px 0;">
      Paressilk · paressilk.com · Sorularınız için WhatsApp: +90 533 485 07 48
    </div>
  </div>
</body></html>`;
}

function maskTc(tc) {
  const s = String(tc || '');
  return s.length === 11 ? `${s.slice(0, 3)}*****${s.slice(-3)}` : s;
}

async function sendOrderEmail(order) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !order.customerEmail) return { sent: false, reason: 'email yapılandırılmamış' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: process.env.ORDER_EMAIL_FROM || 'Paressilk <siparis@paressilk.com>',
        to: [order.customerEmail],
        subject: `Sipariş Dekontu — ${order.orderNumber} | Paressilk`,
        html: orderEmailHtml(order),
      }),
    });
    if (!res.ok) {
      console.error('order email error', res.status, (await res.text().catch(() => '')).slice(0, 150));
      return { sent: false, reason: `resend ${res.status}` };
    }
    return { sent: true };
  } catch (e) {
    console.error('order email exception', e.message);
    return { sent: false, reason: e.message };
  }
}

// ---------- SMS (Netgsm) ----------

function normalizePhoneTR(phone) {
  let p = String(phone || '').replace(/\D/g, '');
  if (p.startsWith('90')) p = p.slice(2);
  if (p.startsWith('0')) p = p.slice(1);
  return /^5\d{9}$/.test(p) ? p : null;
}

async function sendOrderSms({ phone, customerName, orderNumber, accessCode }) {
  const user = process.env.NETGSM_USERCODE;
  const pass = process.env.NETGSM_PASSWORD;
  const header = process.env.NETGSM_MSGHEADER;
  if (!user || !pass || !header) return { sent: false, reason: 'sms yapılandırılmamış' };

  const gsm = normalizePhoneTR(phone);
  if (!gsm) return { sent: false, reason: 'geçersiz telefon' };

  const message = accessCode
    ? `Sn.${customerName} ${orderNumber} numarali siparisiniz alindi. Odeme kodunuz: ${accessCode}. IBAN icin bu kodu sitede girin. PARESSILK`
    : `Sn.${customerName} ${orderNumber} numaralı siparişiniz alınmıştır. Detaylar e-posta adresinize gönderildi. PARESSILK`;

  try {
    // Netgsm REST v2 (JSON)
    const res = await fetch('https://api.netgsm.com.tr/sms/rest/v2/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64'),
      },
      body: JSON.stringify({
        msgheader: header,
        encoding: 'TR',
        messages: [{ msg: message, no: `90${gsm}` }],
      }),
    });
    const body = await res.text().catch(() => '');
    if (!res.ok) {
      console.error('sms error', res.status, body.slice(0, 120));
      return { sent: false, reason: `netgsm ${res.status}` };
    }
    return { sent: true };
  } catch (e) {
    console.error('sms exception', e.message);
    return { sent: false, reason: e.message };
  }
}

// ---------- ÖN SİPARİŞ BİLDİRİMLERİ ----------

function preorderEmailHtml(pre) {
  const { preorderNumber, customerName, productName, sku, shippingInfo = {} } = pre;
  return `<!doctype html><html lang="tr"><body style="margin:0;background:#f5f2ec;font-family:Arial,Helvetica,sans-serif;color:#222;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="text-align:center;padding:18px 0;">
      <span style="font-size:24px;letter-spacing:2px;color:#B8860B;font-weight:bold;">PARESSILK</span>
      <div style="font-size:11px;color:#999;letter-spacing:3px;margin-top:2px;">%100 DOĞAL İPEK</div>
    </div>
    <div style="background:#fff;border:1px solid #e8e2d5;border-radius:8px;padding:24px;">
      <div style="text-align:center;margin-bottom:16px;">
        <div style="display:inline-block;background:#e8f5e9;color:#2e7d32;padding:8px 18px;border-radius:20px;font-size:13px;font-weight:bold;">✓ Ön Siparişiniz Onaylandı</div>
      </div>
      <p style="margin:12px 0 6px;">Merhaba <b>${esc(customerName)}</b>,</p>
      <p style="margin:0 0 18px;color:#555;line-height:1.7;">
        <b>${esc(productName)}</b> ürünü için ön siparişiniz alınmıştır. Ürün stoğa girdiğinde
        sizinle iletişime geçip önceliği size vereceğiz. Bu aşamada herhangi bir ücret alınmamıştır.
      </p>
      <table style="font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:6px 24px 6px 0;"><b>Ön Sipariş No</b></td><td>: ${esc(preorderNumber)}</td></tr>
        <tr><td style="padding:6px 24px 6px 0;"><b>Ürün</b></td><td>: ${esc(productName)}</td></tr>
        ${sku ? `<tr><td style="padding:6px 24px 6px 0;"><b>Ürün Kodu</b></td><td>: ${esc(sku)}</td></tr>` : ''}
      </table>
      ${shippingInfo.address ? `
      <div style="margin-top:18px;padding-top:14px;border-top:1px solid #eee;font-size:13px;color:#555;">
        <b>İletişim / Teslimat</b><br>
        ${esc(shippingInfo.name)}<br>${esc(shippingInfo.phone)}<br>${esc(shippingInfo.address)}
      </div>` : ''}
    </div>
    <div style="text-align:center;font-size:11px;color:#999;padding:18px 0;">
      Paressilk · paressilk.com · Sorularınız için WhatsApp: +90 533 485 07 48
    </div>
  </div>
</body></html>`;
}

async function sendPreorderEmail(pre) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !pre.customerEmail) return { sent: false, reason: 'email yapılandırılmamış' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: process.env.ORDER_EMAIL_FROM || 'Paressilk <siparis@paressilk.com>',
        to: [pre.customerEmail],
        subject: `Ön Siparişiniz Onaylandı — ${pre.productName} | Paressilk`,
        html: preorderEmailHtml(pre),
      }),
    });
    if (!res.ok) {
      console.error('preorder email error', res.status, (await res.text().catch(() => '')).slice(0, 150));
      return { sent: false, reason: `resend ${res.status}` };
    }
    return { sent: true };
  } catch (e) {
    console.error('preorder email exception', e.message);
    return { sent: false, reason: e.message };
  }
}

async function sendPreorderSms({ phone, customerName, productName, preorderNumber }) {
  const user = process.env.NETGSM_USERCODE;
  const pass = process.env.NETGSM_PASSWORD;
  const header = process.env.NETGSM_MSGHEADER;
  if (!user || !pass || !header) return { sent: false, reason: 'sms yapılandırılmamış' };
  const gsm = normalizePhoneTR(phone);
  if (!gsm) return { sent: false, reason: 'geçersiz telefon' };
  const message = `Sn.${customerName} ${preorderNumber} numarali on siparisiniz onaylandi. Urun stoga girince size oncelik verilecektir. PARESSILK`;
  try {
    const res = await fetch('https://api.netgsm.com.tr/sms/rest/v2/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64') },
      body: JSON.stringify({ msgheader: header, encoding: 'TR', messages: [{ msg: message, no: `90${gsm}` }] }),
    });
    if (!res.ok) {
      console.error('preorder sms error', res.status, (await res.text().catch(() => '')).slice(0, 120));
      return { sent: false, reason: `netgsm ${res.status}` };
    }
    return { sent: true };
  } catch (e) {
    console.error('preorder sms exception', e.message);
    return { sent: false, reason: e.message };
  }
}

module.exports = { sendOrderEmail, sendOrderSms, orderEmailHtml, sendPreorderEmail, sendPreorderSms };
