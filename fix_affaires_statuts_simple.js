const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase
const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixAffairesStatuts() {
  console.log('🔧 Test de création d\'affaire avec statut A_planifier...')
  
  try {
    // Tester d'abord avec un statut autorisé
    console.log('1. Test avec statut "Brouillon"...')
    const testData1 = {
      code_affaire: 'TEST_BROUILLON_' + Date.now(),
      nom: 'Test statut Brouillon',
      site_id: 'aa72513c-ea28-467f-90fa-14dbe76f2ba2',
      responsable_id: '807b4eab-c6eb-4007-ae98-184939b2bdf8',
      type_contrat: 'Forfait',
      type_affaire: 'Maintenance',
      statut: 'Brouillon'
    }
    
    const { data: testAffaire1, error: testError1 } = await supabase
      .from('affaires')
      .insert(testData1)
      .select()
      .single()
    
    if (testError1) {
      console.error('❌ Erreur avec statut Brouillon:', testError1)
    } else {
      console.log('✅ Test Brouillon réussi:', testAffaire1.id)
      
      // Supprimer l'affaire de test
      await supabase.from('affaires').delete().eq('id', testAffaire1.id)
      console.log('✅ Affaire de test supprimée')
    }

    // Tester avec A_planifier
    console.log('2. Test avec statut "A_planifier"...')
    const testData2 = {
      code_affaire: 'TEST_A_PLANIFIER_' + Date.now(),
      nom: 'Test statut A_planifier',
      site_id: 'aa72513c-ea28-467f-90fa-14dbe76f2ba2',
      responsable_id: '807b4eab-c6eb-4007-ae98-184939b2bdf8',
      type_contrat: 'Forfait',
      type_affaire: 'Maintenance',
      statut: 'A_planifier'
    }
    
    const { data: testAffaire2, error: testError2 } = await supabase
      .from('affaires')
      .insert(testData2)
      .select()
      .single()
    
    if (testError2) {
      console.error('❌ Erreur avec statut A_planifier:', testError2)
      console.log('🔍 Détails de l\'erreur:', {
        code: testError2.code,
        message: testError2.message,
        details: testError2.details,
        hint: testError2.hint
      })
    } else {
      console.log('✅ Test A_planifier réussi:', testAffaire2.id)
      
      // Supprimer l'affaire de test
      await supabase.from('affaires').delete().eq('id', testAffaire2.id)
      console.log('✅ Affaire de test supprimée')
    }

    // Vérifier les contraintes actuelles
    console.log('3. Vérification des contraintes actuelles...')
    const { data: affaires, error: selectError } = await supabase
      .from('affaires')
      .select('id, statut')
      .limit(5)
    
    if (selectError) {
      console.error('❌ Erreur lors de la vérification:', selectError)
    } else {
      console.log('📊 Affaires existantes:', affaires?.map(a => ({ id: a.id, statut: a.statut })) || 'Aucune')
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le test
fixAffairesStatuts()
