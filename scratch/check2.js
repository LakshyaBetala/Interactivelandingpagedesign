const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envLocal = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_KEY = envLocal.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
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
  console.log("Inserting...", dbItem);
  const { data, error } = await supabase.from("internal_products").insert(dbItem).select().single();
  if (error) {
    console.error("Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success:", data);
    await supabase.from("internal_products").delete().eq("id", data.id);
  }
}
test();
