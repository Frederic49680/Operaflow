const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addCompetencePrincipaleColumn() {
  try {
    console.log('🔍 Vérification de la colonne competence_principale...')
    
    // Test 1: Vérifier si la colonne existe
    const { data: testData, error: testError } = await supabase
      .from('ressources')
      .select('competence_principale')
      .limit(1)
    
    if (testError) {
      console.log('❌ Erreur:', testError.message)
      if (testError.code === 'PGRST204') {
        console.log('📝 La colonne competence_principale n\'existe pas encore')
        console.log('🔧 Tentative d\'ajout de la colonne...')
        
        // Essayer d'ajouter la colonne via une requête simple
        const { error: alterError } = await supabase
          .from('ressources')
          .select('*')
          .limit(1)
        
        console.log('✅ Test de connexion réussi')
        console.log('⚠️  Vous devez ajouter manuellement la colonne competence_principale dans Supabase Dashboard')
        console.log('📋 SQL à exécuter:')
        console.log('ALTER TABLE public.ressources ADD COLUMN IF NOT EXISTS competence_principale text;')
        return
      }
    } else {
      console.log('✅ Colonne competence_principale existe')
    }

    // Test 2: Essayer d'insérer une valeur
    console.log('🧪 Test d\'insertion d\'une valeur competence_principale...')
    
    const { error: insertError } = await supabase
      .from('ressources')
      .update({ competence_principale: 'ELEC' })
      .eq('id', '00000000-0000-0000-0000-000000000000') // ID qui n'existe pas
    
    if (insertError) {
      console.log('❌ Erreur lors du test d\'insertion:', insertError.message)
    } else {
      console.log('✅ Test d\'insertion réussi')
    }
    
  } catch (error) {
    console.error('💥 Erreur générale:', error)
  }
}

addCompetencePrincipaleColumn()
