const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase
const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixAffairesStatuts() {
  console.log('🔧 Correction des statuts des affaires...')
  
  try {
    // 1. Supprimer la contrainte existante
    console.log('1. Suppression de la contrainte existante...')
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE affaires DROP CONSTRAINT IF EXISTS affaires_statut_check;'
    })
    
    if (dropError) {
      console.log('⚠️ Erreur lors de la suppression (peut être normal):', dropError.message)
    } else {
      console.log('✅ Contrainte supprimée')
    }

    // 2. Créer la nouvelle contrainte
    console.log('2. Création de la nouvelle contrainte...')
    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE affaires ADD CONSTRAINT affaires_statut_check 
            CHECK (statut IN ('Brouillon', 'A_planifier', 'Validée', 'Planifiée', 'En suivi', 'Clôturée'));`
    })
    
    if (addError) {
      console.error('❌ Erreur lors de l\'ajout de la contrainte:', addError)
      return
    }
    
    console.log('✅ Nouvelle contrainte créée')

    // 3. Vérifier les statuts actuels
    console.log('3. Vérification des statuts actuels...')
    const { data: affaires, error: selectError } = await supabase
      .from('affaires')
      .select('id, statut')
      .limit(10)
    
    if (selectError) {
      console.error('❌ Erreur lors de la vérification:', selectError)
      return
    }
    
    console.log('📊 Statuts actuels:', affaires?.map(a => a.statut) || 'Aucune affaire')
    
    // 4. Tester l'insertion d'une affaire de test
    console.log('4. Test d\'insertion avec statut A_planifier...')
    const testData = {
      code_affaire: 'TEST_' + Date.now(),
      nom: 'Test statut A_planifier',
      site_id: 'aa72513c-ea28-467f-90fa-14dbe76f2ba2', // Site existant
      responsable_id: '807b4eab-c6eb-4007-ae98-184939b2bdf8', // Responsable existant
      type_contrat: 'Forfait',
      type_affaire: 'Maintenance',
      statut: 'A_planifier'
    }
    
    const { data: testAffaire, error: testError } = await supabase
      .from('affaires')
      .insert(testData)
      .select()
      .single()
    
    if (testError) {
      console.error('❌ Erreur lors du test d\'insertion:', testError)
      return
    }
    
    console.log('✅ Test d\'insertion réussi:', testAffaire.id)
    
    // 5. Supprimer l'affaire de test
    console.log('5. Nettoyage de l\'affaire de test...')
    const { error: deleteError } = await supabase
      .from('affaires')
      .delete()
      .eq('id', testAffaire.id)
    
    if (deleteError) {
      console.log('⚠️ Erreur lors de la suppression du test:', deleteError.message)
    } else {
      console.log('✅ Affaire de test supprimée')
    }
    
    console.log('🎉 Correction des statuts terminée avec succès !')
    console.log('📋 Statuts autorisés: Brouillon, A_planifier, Validée, Planifiée, En suivi, Clôturée')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter la correction
fixAffairesStatuts()
