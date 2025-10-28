const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow';

async function checkKeys() {
  console.log('🔍 Vérification des clés Supabase...');
  
  // Test avec la clé anon
  console.log('\n1. Test avec clé anon:');
  const anonClient = createClient(supabaseUrl, anonKey);
  
  try {
    const { data: anonData, error: anonError } = await anonClient.auth.admin.createUser({
      email: 'test-anon@example.com',
      password: 'test123',
      email_confirm: true
    });
    
    if (anonError) {
      console.log('❌ Erreur anon:', anonError.message);
      console.log('🔍 Code erreur:', anonError.status);
    } else {
      console.log('✅ Succès avec clé anon');
    }
  } catch (err) {
    console.log('❌ Exception anon:', err.message);
  }
  
  // Test de lecture simple avec anon
  console.log('\n2. Test lecture avec clé anon:');
  try {
    const { data: requests, error: readError } = await anonClient
      .from('access_requests')
      .select('*')
      .limit(1);
    
    if (readError) {
      console.log('❌ Erreur lecture:', readError.message);
    } else {
      console.log('✅ Lecture réussie avec anon');
    }
  } catch (err) {
    console.log('❌ Exception lecture:', err.message);
  }
  
  console.log('\n📝 Conclusion:');
  console.log('- La clé fournie semble être la clé ANON');
  console.log('- Pour créer des utilisateurs, nous avons besoin de la clé SERVICE_ROLE');
  console.log('- La clé SERVICE_ROLE commence généralement par "eyJ..." mais a un rôle différent');
}

checkKeys();
