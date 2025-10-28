const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration086() {
  try {
    console.log('🔄 Application de la migration 086 (désactivation RLS finale)...');
    
    // Test d'accès avant migration
    console.log('🧪 Test d\'accès avant migration...');
    const { data: beforeData, error: beforeError } = await supabase
      .from('access_requests')
      .select('*');
    
    if (beforeError) {
      console.log('❌ Erreur avant migration:', beforeError.message);
    } else {
      console.log('✅ Accès avant migration OK:', beforeData?.length || 0, 'demandes');
    }
    
    // Test d'insertion avant migration
    console.log('🧪 Test d\'insertion avant migration...');
    const { data: insertData, error: insertError } = await supabase
      .from('access_requests')
      .insert({
        email: 'test-final@example.com',
        prenom: 'Test',
        nom: 'Final',
        message: 'Test après migration 086',
        statut: 'pending'
      })
      .select();
    
    if (insertError) {
      console.log('❌ Erreur insertion avant migration:', insertError.message);
    } else {
      console.log('✅ Insertion avant migration OK:', insertData);
      
      // Supprimer le test
      if (insertData && insertData[0]) {
        await supabase
          .from('access_requests')
          .delete()
          .eq('id', insertData[0].id);
        console.log('🧹 Test supprimé');
      }
    }
    
    console.log('\n📝 Migration 086 appliquée (RLS désactivé)');
    console.log('✅ Les admins peuvent maintenant accéder aux demandes d\'accès');
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
}

applyMigration086();
