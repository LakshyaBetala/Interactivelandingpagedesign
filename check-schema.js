const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkSchema() {
  const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`);
  const data = await res.json();
  const clientDef = data.definitions.clients;
  console.log("CLIENT SCHEMA:", JSON.stringify(clientDef, null, 2));
}

checkSchema();
