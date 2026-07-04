const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const SITE_URL = process.env.SITE_URL || 'https://paressilk.com';

function buildEmailHtml(items) {
  const itemRows = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        ${item.images && item.images.length > 0
          ? `<img src="${item.images[0]}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />`
          : ''
        }
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; font-family: Arial, sans-serif; color: #1a1a1a;">
        <strong>${item.name}</strong>
        <br />
        <span style="color: #666; font-size: 13px;">Adet: ${item.qty}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; font-family: Arial, sans-serif; color: #B8860B; font-weight: bold; text-align: right;">
        ${(item.price * item.qty).toLocaleString('tr-TR')} TL
      </td>
    </tr>
  `).join('');

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="margin: 0; padding: 0; background-color: #F5F0E8;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: #1a1a1a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #B8860B; font-family: Georgia, serif; margin: 0; font-size: 28px; letter-spacing: 2px;">PARESSILK</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="font-family: Georgia, serif; color: #1a1a1a; text-align: center; margin-top: 0;">
            Sepetinizde ürünler bekliyor
          </h2>
          <p style="font-family: Arial, sans-serif; color: #555; text-align: center; line-height: 1.6;">
            Merhaba, sepetinize eklediğiniz ürünler hala sizi bekliyor. Stoklar sınırlı olabilir, alışverişinizi tamamlamayı unutmayın.
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            ${itemRows}
          </table>
          <div style="text-align: right; padding: 10px 12px; font-family: Arial, sans-serif;">
            <strong style="color: #1a1a1a; font-size: 16px;">Toplam: <span style="color: #B8860B;">${total.toLocaleString('tr-TR')} TL</span></strong>
          </div>
          <div style="text-align: center; margin: 30px 0 10px;">
            <a href="${SITE_URL}/shop" style="display: inline-block; background: #B8860B; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 4px; font-family: Arial, sans-serif; font-weight: bold; font-size: 16px; letter-spacing: 1px;">
              Alışverişi Tamamla
            </a>
          </div>
          <p style="font-family: Arial, sans-serif; color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
            Bu e-posta, sepetinizde bıraktığınız ürünleri hatırlatmak için gönderilmiştir.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

exports.handler = async (event) => {
  // Bu fonksiyon yalnızca zamanlanmış görev (cron) veya gizli token ile tetiklenebilir.
  // Aksi halde herkes çağırıp tüm kullanıcılara mail spam'i yaptırabilir.
  const isScheduled = !!(event.headers && (event.headers['x-nf-event'] === 'schedule' || event.headers['X-Nf-Event'] === 'schedule'));
  const cronSecret = process.env.CRON_SECRET;
  const provided = (event.headers && (event.headers['x-cron-secret'] || event.headers['X-Cron-Secret'])) || '';
  if (!isScheduled) {
    if (!cronSecret || provided !== cronSecret) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Yetkisiz' }) };
    }
  }

  try {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

    const { data: carts, error: fetchError } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('reminder_sent', false)
      .lt('updated_at', twoHoursAgo)
      .gt('updated_at', fortyEightHoursAgo);

    if (fetchError) {
      console.error('Fetch abandoned carts error:', fetchError);
      return { statusCode: 500, body: JSON.stringify({ error: 'Sepetler alınamadı' }) };
    }

    if (!carts || carts.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ message: 'Hatırlatılacak sepet yok', count: 0 }) };
    }

    let sentCount = 0;

    for (const cart of carts) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Paressilk <onboarding@resend.dev>',
            to: [cart.email],
            subject: 'Sepetinizde ürünler bekliyor - Paressilk',
            html: buildEmailHtml(cart.items),
          }),
        });

        if (!res.ok) {
          console.error(`Resend error for ${cart.email}:`, await res.text());
          continue;
        }

        const { error: updateError } = await supabase
          .from('abandoned_carts')
          .update({ reminder_sent: true })
          .eq('id', cart.id);

        if (updateError) {
          console.error(`Update reminder_sent error for ${cart.email}:`, updateError);
        }

        sentCount++;
      } catch (err) {
        console.error(`Error sending reminder to ${cart.email}:`, err);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `${sentCount} hatırlatma gönderildi`, count: sentCount }),
    };
  } catch (error) {
    console.error('Send cart reminder error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Bir hata oluştu' }) };
  }
};
