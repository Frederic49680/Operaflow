const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rrmvejpwbkwlmyjhnxaz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'
);

async function testAccessRequestsAPI() {
  console.log('🔍 Test de l\'API access-requests...');
  
  // Simuler l'appel API comme le fait le frontend
  try {
    const response = await fetch('https://operaflow-ten.vercel.app/api/admin/access-requests', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    console.log('📊 Status:', response.status);
    console.log('📊 Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.requests) {
      console.log('✅ Nombre de demandes:', data.requests.length);
      data.requests.forEach((req, index) => {
        console.log(`📋 Demande ${index + 1}:`, {
          id: req.id,
          email: req.email,
          prenom: req.prenom,
          nom: req.nom,
          statut: req.statut
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur API:', error);
  }
  
  // Test direct de la base de données
  console.log('\n🔍 Test direct de la base de données...');
  
  const { data: requests, error } = await supabase
    .from('access_requests')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('❌ Erreur base:', error);
  } else {
    console.log('✅ Demandes en base:', requests.length);
    requests.forEach((req, index) => {
      console.log(`📋 Demande ${index + 1}:`, {
        id: req.id,
        email: req.email,
        prenom: req.prenom,
        nom: req.nom,
        statut: req.statut
      });
    });
  }
}

testAccessRequestsAPI().catch(console.error);
