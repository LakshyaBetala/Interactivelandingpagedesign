const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

const updates = [
  { email: "lakshbetala15@gmail.com", role: "Backend & Tech Delivery Lead", primaryFocus: "Tech Delivery" },
  { email: "gandhimouriyan1234@gmail.com", role: "PM & Client Delivery Lead", primaryFocus: "Client Delivery" }
];

async function updateRoles() {
  console.log("Updating roles via REST API...");
  
  for (const admin of updates) {
    // 1. Get the user id by email
    const idRes = await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.${admin.email}&select=id`, {
      method: "GET",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`
      }
    });

    const idData = await idRes.json();
    if (!idData || idData.length === 0) {
      console.error(`User not found: ${admin.email}`);
      continue;
    }

    const userId = idData[0].id;

    // 2. Update profile
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
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
