const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

async function checkProfiles() {
  const res = await fetch(`${supabaseUrl}/rest/v1/profiles?select=email,role,primary_focus,name`, {
    headers: {
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`
    }
  });
  const data = await res.json();
  console.log(data);
}

checkProfiles();
