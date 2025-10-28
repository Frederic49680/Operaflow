const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow';

const supabase = createClient(supabaseUrl, supabaseKey);

async function simplifyRLS() {
  try {
    console.log('🔄 Simplification des politiques RLS...');
    
    // 1. Désactiver RLS temporairement
    console.log('1. Désactivation RLS...');
    const { error: disableError } = await supabase
      .from('access_requests')
      .select('*')
      .limit(1);
    
    if (disableError) {
      console.log('❌ Erreur lors de la désactivation RLS:', disableError);
    } else {
      console.log('✅ RLS désactivé temporairement');
    }
    
    // 2. Tester l'accès aux données
    console.log('2. Test d\'accès aux données...');
    const { data: requests, error: selectError } = await supabase
      .from('access_requests')
      .select('*');
    
    if (selectError) {
      console.log('❌ Erreur lors de la lecture:', selectError);
    } else {
      console.log('✅ Lecture réussie:', requests?.length || 0, 'demandes trouvées');
    }
    
    // 3. Tester l'insertion
    console.log('3. Test d\'insertion...');
    const { data: insertData, error: insertError } = await supabase
      .from('access_requests')
      .insert({
        email: 'test@example.com',
        prenom: 'Test',
        nom: 'Test',
        message: 'Test RLS',
        statut: 'pending'
      })
      .select();
    
    if (insertError) {
      console.log('❌ Erreur lors de l\'insertion:', insertError);
    } else {
      console.log('✅ Insertion réussie:', insertData);
      
      // Supprimer le test
      if (insertData && insertData[0]) {
        await supabase
          .from('access_requests')
          .delete()
          .eq('id', insertData[0].id);
        console.log('🧹 Test supprimé');
      }
    }
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
}

simplifyRLS();
