const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createCompetencePrincipaleColumn() {
  try {
    console.log('🔧 Ajout de la colonne competence_principale...')
    
    // Méthode 1: Essayer d'ajouter via une requête de test
    console.log('📝 Tentative d\'ajout de la colonne...')
    
    // Test d'insertion avec la nouvelle colonne
    const { data: testData, error: testError } = await supabase
      .from('ressources')
      .select('id, nom, competence_principale')
      .limit(1)
    
    if (testError) {
      console.log('❌ Colonne competence_principale n\'existe pas encore')
      console.log('📋 Vous devez ajouter manuellement la colonne dans Supabase Dashboard:')
      console.log('')
      console.log('ALTER TABLE public.ressources ADD COLUMN competence_principale text;')
      console.log('')
      console.log('Puis ajouter la contrainte de clé étrangère:')
      console.log('ALTER TABLE public.ressources ADD CONSTRAINT fk_competence_principale FOREIGN KEY (competence_principale) REFERENCES public.competencies(code) ON DELETE SET NULL;')
      return
    } else {
      console.log('✅ Colonne competence_principale existe déjà')
    }
    
    // Test d'insertion d'une valeur
    console.log('🧪 Test d\'insertion d\'une valeur...')
    const { error: insertError } = await supabase
      .from('ressources')
      .update({ competence_principale: 'ELEC' })
      .eq('id', '00000000-0000-0000-0000-000000000000') // ID qui n'existe pas
    
    if (insertError) {
      console.log('❌ Erreur test insertion:', insertError.message)
    } else {
      console.log('✅ Test d\'insertion réussi')
    }
    
  } catch (error) {
    console.error('💥 Erreur générale:', error)
  }
}

createCompetencePrincipaleColumn()
