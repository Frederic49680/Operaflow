// Test de la table taches_ressources
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rrmvejpwbkwlmyjhnxaz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'
);

async function testTable() {
  try {
    console.log('🔍 Test de la table taches_ressources...');
    
    // Test 1: Vérifier si la table existe
    const { data, error } = await supabase
      .from('taches_ressources')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Erreur table taches_ressources:', error);
      return;
    }
    
    console.log('✅ Table taches_ressources accessible');
    console.log('📊 Données existantes:', data);
    
    // Test 2: Vérifier la structure
    const { data: structure, error: structureError } = await supabase
      .from('taches_ressources')
      .select('id, tache_id, ressource_id, charge_h, taux_affectation, competence')
      .limit(0);
    
    if (structureError) {
      console.log('❌ Erreur structure:', structureError);
    } else {
      console.log('✅ Structure de la table OK');
    }
    
  } catch (err) {
    console.log('❌ Erreur de connexion:', err.message);
  }
}

testTable();
