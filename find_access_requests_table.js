const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rrmvejpwbkwlmyjhnxaz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'
);

async function findAccessRequests() {
  console.log('🔍 Recherche des demandes d\'accès...');
  
  // Essayer différentes tables possibles
  const tableNames = [
    'access_requests',
    'access_request', 
    'demandes_acces',
    'user_requests',
    'requests'
  ];
  
  for (const tableName of tableNames) {
    console.log(`\n📋 Test table: ${tableName}`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(5);
      
    if (error) {
      console.log(`❌ Table ${tableName} n'existe pas ou erreur:`, error.message);
    } else {
      console.log(`✅ Table ${tableName} existe avec ${data.length} entrées`);
      if (data.length > 0) {
        console.log('📊 Première entrée:', data[0]);
      }
    }
  }
  
  // Chercher des tables contenant "access" ou "request"
  console.log('\n🔍 Recherche de tables avec "access" ou "request"...');
  
  const searchTerms = ['access', 'request', 'demande'];
  
  for (const term of searchTerms) {
    console.log(`\n📋 Recherche "${term}"...`);
    
    // Essayer de deviner le nom de la table
    const possibleNames = [
      `${term}s`,
      `${term}_requests`,
      `${term}_demandes`,
      `user_${term}s`,
      `app_${term}s`
    ];
    
    for (const name of possibleNames) {
      const { data, error } = await supabase
        .from(name)
        .select('*')
        .limit(1);
        
      if (!error && data) {
        console.log(`✅ Trouvé table: ${name} avec ${data.length} entrées`);
      }
    }
  }
}

findAccessRequests().catch(console.error);
