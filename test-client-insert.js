const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testInsert() {
  const authRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': supabaseKey },
    body: JSON.stringify({ email: 'lakshbetala15@gmail.com', password: 'admin@000' })
  });
  const token = (await authRes.json()).access_token;

  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/get_enum_values`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${token}`
    }
  });
  // Instead of an rpc we don't have, let's just insert with an invalid stage and look at the HINT!
  
  const res2 = await fetch(`${supabaseUrl}/rest/v1/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${token}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ 
      name: 'Minimal Client',
      project: 'P',
      location: 'L',
      category: 'Potential',
      stage: 'INVALID_ENUM_VALUE'
    })
  });
  
  console.log("Body:", await res2.text());
}
testInsert();
