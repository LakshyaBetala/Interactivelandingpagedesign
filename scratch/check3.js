const fs = require('fs');
const envLocal = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_KEY = envLocal.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const dbItem = {
  name: "Test",
  stage: "Ideation",
  progress: 0,
  description: "test",
  lead_id: null,
  repo_link: "",
  sandbox_link: "",
  metrics: {},
};

fetch(`${SUPABASE_URL}/rest/v1/internal_products`, {
  method: 'POST',
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify(dbItem)
})
.then(res => res.json())
.then(data => {
  console.log("Response:", JSON.stringify(data, null, 2));
})
.catch(err => {
  console.error("Fetch error:", err);
});
