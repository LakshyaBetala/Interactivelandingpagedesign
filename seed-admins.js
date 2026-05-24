const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Using Anon Key, make sure Email Confirm is disabled!

const admins = [
  { email: "lakshbetala15@gmail.com", password: "admin@000", name: "Lakshya", role: "PM & Client Delivery Lead", category: "admin", colorVar: "var(--color-admin-lakshya)", primaryFocus: "Client Delivery" },
  { email: "gandhimouriyan1234@gmail.com", password: "admin@000", name: "Mouriyan", role: "Backend & Tech Delivery Lead", category: "admin", colorVar: "var(--color-admin-mouriyan)", primaryFocus: "Client Delivery" },
  { email: "monarchankit25@gmail.com", password: "admin@000", name: "Ankit", role: "Outreach & Marketing Lead", category: "admin", colorVar: "var(--color-admin-ankit)", primaryFocus: "Outreach & Marketing" },
  { email: "muskanabani01@gmail.com", password: "admin@000", name: "Muskan", role: "Brand & Marketing Director", category: "admin", colorVar: "var(--color-admin-muskan)", primaryFocus: "Outreach & Marketing" }
];

async function seedAdmins() {
  console.log("Seeding 4 admins into Supabase via REST API...");
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env.");
    return;
  }

  for (const admin of admins) {
    console.log(`\nCreating user: ${admin.email}`);
    
    // 1. Sign up the user via Supabase Auth API
    const authRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey
      },
      body: JSON.stringify({
        email: admin.email,
        password: admin.password,
        data: {
          name: admin.name,
          role: admin.role,
          category: admin.category
        }
      })
    });

    const authData = await authRes.json();
    if (!authRes.ok) {
      console.error(`❌ Failed to create auth user for ${admin.email}:`, authData.msg || authData.message || authData.error_description || JSON.stringify(authData));
      continue;
    }

    const userId = authData.user?.id || authData.id;
    console.log(`✅ Auth user created with UUID: ${userId}`);

    // 2. Update profile via PostgREST
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}` // Using anon key for patch, relies on RLS
      },
      body: JSON.stringify({
        role: admin.role,
        category: admin.category,
        color_var: admin.colorVar,
        primary_focus: admin.primaryFocus,
        name: admin.name
      })
    });

    if (!profileRes.ok) {
      const errTxt = await profileRes.text();
      console.error(`❌ Failed to update profile for ${admin.email}:`, errTxt);
    } else {
      console.log(`✅ Profile updated for ${admin.email}`);
    }
  }
  
  console.log("\n🎉 Seeding complete!");
}

seedAdmins();
