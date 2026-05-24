const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

const updates = [
  { id: "4b6ca555-5754-44f4-89bf-b8d844b71424", email: "lakshbetala15@gmail.com", role: "Backend & Tech Delivery Lead", primaryFocus: "Tech Delivery" },
  { id: "f4ae001f-c34a-4485-8df4-f0ae6d2232e0", email: "gandhimouriyan1234@gmail.com", role: "PM & Client Delivery Lead", primaryFocus: "Client Delivery" }
];

async function updateRoles() {
  console.log("Updating roles via REST API...");
  
  for (const admin of updates) {
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${admin.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        role: admin.role,
        primary_focus: admin.primaryFocus
      })
    });

    if (!profileRes.ok) {
      const errTxt = await profileRes.text();
      console.error(`❌ Failed to update profile for ${admin.email}:`, errTxt);
    } else {
      console.log(`✅ Profile updated for ${admin.email} -> ${admin.role}`);
    }
  }
}

updateRoles();
