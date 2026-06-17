require('dotenv').config({path: '.env.local'});
fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/internal_products`, {
  headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
})
.then(r => r.json())
.then(d => {
  console.log(d.length ? Object.keys(d[0]) : "No data");
})
.catch(console.error);
