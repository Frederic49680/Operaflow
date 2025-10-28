const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    const migrationSQL = fs.readFileSync('supabase/migrations/084_simplify_access_requests_rls.sql', 'utf8');
    
    console.log('🔄 Application de la migration 084...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Erreur migration:', error);
    } else {
      console.log('✅ Migration 084 appliquée avec succès');
      console.log('📊 Résultat:', data);
    }
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
}

applyMigration();
