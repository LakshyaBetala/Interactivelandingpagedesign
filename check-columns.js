const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkColumns() {
  const authRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': supabaseKey },
    body: JSON.stringify({ email: 'lakshbetala15@gmail.com', password: 'admin@000' })
  });
  const token = (await authRes.json()).access_token;

  const res = await fetch(`${supabaseUrl}/rest/v1/clients?limit=1`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${token}` }
  });
  console.log("Clients Response:", await res.text());
}
checkColumns();
