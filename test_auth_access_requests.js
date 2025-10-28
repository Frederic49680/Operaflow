const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rrmvejpwbkwlmyjhnxaz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'
);

async function testAccessRequestsWithAuth() {
  console.log('🔍 Test avec authentification...');
  
  // Se connecter avec l'utilisateur admin
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@operaflow.com',
    password: 'Admin123!'
  });
  
  if (authError) {
    console.error('❌ Erreur de connexion:', authError);
    return;
  }
  
  console.log('✅ Connexion réussie:', authData.user?.email);
  
  // Maintenant tester l'accès aux demandes
  const { data: requests, error } = await supabase
    .from('access_requests')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('❌ Erreur accès demandes:', error);
  } else {
    console.log('✅ Demandes récupérées:', requests.length);
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
  
  // Tester l'API avec le token d'authentification
  console.log('\n🔍 Test API avec token...');
  
  const token = authData.session?.access_token;
  if (token) {
    try {
      const response = await fetch('https://operaflow-ten.vercel.app/api/admin/access-requests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      const data = await response.json();
      
      console.log('📊 Status API:', response.status);
      console.log('📊 Response API:', JSON.stringify(data, null, 2));
      
    } catch (error) {
      console.error('❌ Erreur API:', error);
    }
  }
}

testAccessRequestsWithAuth().catch(console.error);
