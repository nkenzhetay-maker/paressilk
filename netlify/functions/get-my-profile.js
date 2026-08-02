// Giriş yapmış müşterinin profilini döndürür. Profil yoksa oluşturur
// (sistem otomatik müşteri no atar). Token doğrulanır; sadece kendi verisi.

const { createClient } = require('@supabase/supabase-js');
const { getHeaders, bearer, resolveEmail, formatCustomerNo } = require('../lib/customer-auth.cjs');

exports.handler = async (event) => {
  const headers = getHeaders(event, 'GET, OPTIONS');
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return { statusCode: 503, headers, body: JSON.stringify({ error: 'Yapılandırma eksik' }) };
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const email = await resolveEmail(bearer(event), supabase);
  if (!email) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Oturum doğrulanamadı' }) };

  try {
    let { data: row, error } = await supabase
      .from('profiles').select('customer_no, data').eq('email', email).maybeSingle();
    if (error) throw error;

    if (!row) {
      const ins = await supabase.from('profiles').insert({ email, data: {} }).select('customer_no, data').single();
      if (ins.error) throw ins.error;
      row = ins.data;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ email, customerNo: formatCustomerNo(row.customer_no), profile: row.data || {} }),
    };
  } catch (err) {
    console.error('get-my-profile:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Profil alınamadı' }) };
  }
};
