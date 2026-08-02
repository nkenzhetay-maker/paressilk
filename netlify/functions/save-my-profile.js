// Giriş yapmış müşterinin profil (iletişim + fatura) bilgilerini kaydeder.
// Token doğrulanır; müşteri no değiştirilemez; yalnızca izinli alanlar kaydedilir.

const { createClient } = require('@supabase/supabase-js');
const { getHeaders, bearer, resolveEmail, formatCustomerNo } = require('../lib/customer-auth.cjs');

const STR = (v, max = 200) => String(v ?? '').trim().slice(0, max);
const ALLOWED = [
  'firstName', 'lastName', 'phone',
  'address', 'city', 'district', 'postalCode',
  'tcNo',
  'invoiceType', 'companyName', 'taxOffice', 'taxNo',
  'billingSameAsShipping', 'billingAddress', 'billingCity', 'billingDistrict', 'billingPostalCode',
];

exports.handler = async (event) => {
  const headers = getHeaders(event, 'POST, OPTIONS');
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return { statusCode: 503, headers, body: JSON.stringify({ error: 'Yapılandırma eksik' }) };
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const email = await resolveEmail(bearer(event), supabase);
  if (!email) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Oturum doğrulanamadı' }) };

  try {
    const body = JSON.parse(event.body || '{}');
    const incoming = body.profile || {};

    // İzinli alanları temizle
    const clean = {};
    for (const k of ALLOWED) {
      if (incoming[k] === undefined) continue;
      clean[k] = typeof incoming[k] === 'boolean' ? incoming[k] : STR(incoming[k]);
    }
    // Basit doğrulamalar (boş bırakılabilir; doluysa formatlı olsun)
    if (clean.tcNo && !/^\d{11}$/.test(clean.tcNo)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'TC Kimlik No 11 haneli olmalıdır' }) };
    }
    if (clean.taxNo && !/^\d{10}$/.test(clean.taxNo)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Vergi No 10 haneli olmalıdır' }) };
    }

    // Mevcut veriyle birleştir (müşteri no'ya dokunma)
    const { data: existing } = await supabase.from('profiles').select('data, customer_no').eq('email', email).maybeSingle();
    const merged = { ...(existing?.data || {}), ...clean };

    const { data: row, error } = await supabase
      .from('profiles')
      .upsert({ email, data: merged, updated_at: new Date().toISOString() }, { onConflict: 'email' })
      .select('customer_no, data').single();
    if (error) throw error;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ email, customerNo: formatCustomerNo(row.customer_no), profile: row.data || {} }),
    };
  } catch (err) {
    console.error('save-my-profile:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Profil kaydedilemedi' }) };
  }
};
