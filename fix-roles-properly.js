const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function fixRoles() {
  // 1. Sign in as Lakshya to get JWT
  const authRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey
    },
    body: JSON.stringify({
      email: 'lakshbetala15@gmail.com',
      password: 'admin@000'
    })
  });
  
  const authData = await authRes.json();
  if (!authRes.ok) {
    console.error("Auth error:", authData);
    return;
  }
  
  const token = authData.access_token;
  console.log("Logged in successfully. Got JWT.");

  // 2. Update Lakshya
  const res1 = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.4b6ca555-5754-44f4-89bf-b8d844b71424`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${token}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      role: 'Backend & Tech Delivery Lead',
      primary_focus: 'Tech Delivery'
    })
  });
  console.log("Lakshya update status:", res1.status, await res1.text());

  // 3. Update Mouriyan
  const res2 = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.f4ae001f-c34a-4485-8df4-f0ae6d2232e0`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${token}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      role: 'PM & Client Delivery Lead',
      primary_focus: 'Client Delivery'
    })
  });
  console.log("Mouriyan update status:", res2.status, await res2.text());

  console.log("Roles fixed!");
}

fixRoles();
