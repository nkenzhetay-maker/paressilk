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
    shippingInfo = {}, billing = {},
  } = order;

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

async function sendOrderSms({ phone, customerName, orderNumber }) {
  const user = process.env.NETGSM_USERCODE;
  const pass = process.env.NETGSM_PASSWORD;
  const header = process.env.NETGSM_MSGHEADER;
  if (!user || !pass || !header) return { sent: false, reason: 'sms yapılandırılmamış' };

  const gsm = normalizePhoneTR(phone);
  if (!gsm) return { sent: false, reason: 'geçersiz telefon' };

  const message = `Sn.${customerName} ${orderNumber} numaralı siparişiniz alınmıştır. Detaylar e-posta adresinize gönderildi. PARESSILK`;

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

module.exports = { sendOrderEmail, sendOrderSms, orderEmailHtml };
