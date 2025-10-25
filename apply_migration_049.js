// Application directe de la migration 049
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rrmvejpwbkwlmyjhnxaz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'
);

async function applyMigration() {
  try {
    console.log('🚀 Application de la migration 049...');
    
    // Créer la table competencies
    console.log('📋 Création de la table competencies...');
    const { error: competenciesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS competencies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nom TEXT NOT NULL,
          description TEXT,
          categorie TEXT,
          actif BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_competencies_nom ON competencies(nom);
        CREATE INDEX IF NOT EXISTS idx_competencies_actif ON competencies(actif);
        
        ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow public read access" ON competencies FOR SELECT USING (true);
        CREATE POLICY "Allow authenticated insert access" ON competencies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        CREATE POLICY "Allow authenticated update access" ON competencies FOR UPDATE USING (auth.role() = 'authenticated');
        CREATE POLICY "Allow authenticated delete access" ON competencies FOR DELETE USING (auth.role() = 'authenticated');
      `
    });
    
    if (competenciesError) {
      console.log('⚠️ Erreur competencies:', competenciesError);
    } else {
      console.log('✅ Table competencies créée');
    }
    
    // Créer la table taches_ressources
    console.log('📋 Création de la table taches_ressources...');
    const { error: tachesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS taches_ressources (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tache_id UUID REFERENCES planning_taches(id) ON DELETE CASCADE,
          ressource_id UUID REFERENCES ressources(id) ON DELETE CASCADE,
          charge_h NUMERIC DEFAULT 0,
          taux_affectation NUMERIC DEFAULT 100,
          competence TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_taches_ressources_tache ON taches_ressources(tache_id);
        CREATE INDEX IF NOT EXISTS idx_taches_ressources_ressource ON taches_ressources(ressource_id);
        
        ALTER TABLE taches_ressources ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow public read access" ON taches_ressources FOR SELECT USING (true);
        CREATE POLICY "Allow authenticated insert access" ON taches_ressources FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        CREATE POLICY "Allow authenticated update access" ON taches_ressources FOR UPDATE USING (auth.role() = 'authenticated');
        CREATE POLICY "Allow authenticated delete access" ON taches_ressources FOR DELETE USING (auth.role() = 'authenticated');
      `
    });
    
    if (tachesError) {
      console.log('⚠️ Erreur taches_ressources:', tachesError);
    } else {
      console.log('✅ Table taches_ressources créée');
    }
    
    // Insérer des données de base
    console.log('📊 Insertion des données de base...');
    const { error: insertError } = await supabase
      .from('competencies')
      .upsert([
        { nom: 'Électricité', description: 'Compétences en électricité générale', categorie: 'Technique' },
        { nom: 'CVC', description: 'Chauffage, Ventilation, Climatisation', categorie: 'Technique' },
        { nom: 'Plomberie', description: 'Installation et maintenance plomberie', categorie: 'Technique' },
        { nom: 'Sécurité', description: 'Sécurité au travail et prévention', categorie: 'Sécurité' },
        { nom: 'Management', description: 'Encadrement d\'équipe', categorie: 'Management' }
      ], { onConflict: 'nom' });
    
    if (insertError) {
      console.log('⚠️ Erreur insertion:', insertError);
    } else {
      console.log('✅ Données de base insérées');
    }
    
    console.log('🎉 Migration 049 appliquée avec succès !');
    
  } catch (error) {
    console.log('❌ Erreur lors de l\'application de la migration:', error);
  }
}

applyMigration();
