const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iwbljseulzbmackijtdr.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Ymxqc2V1bHpibWFja2lqdGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMTI2NDcsImV4cCI6MjA5NDc4ODY0N30.f-V8Xss6GrHwactBN2Dd4idkRJVhjpSiCdLKkQxxJzk';

// Skip realtime initialization which uses WebSocket
const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    // Disable realtime to avoid ws error in Node 20
    params: { eventsPerSecond: 10 }
  }
});

async function testInsert() {
  console.log("Testing insert into clients...");
  const { data, error } = await supabase.from('clients').insert({
    name: 'Test Client ' + Date.now(),
    project: 'Test Project',
    location: 'Test Location',
    category: 'Ongoing',
    stage: 'In Dev'
  }).select();

  if (error) {
    console.error("INSERT ERROR:", error);
  } else {
    console.log("INSERT SUCCESS:", data);
  }
}

testInsert();
