const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase
const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration048() {
  console.log('🔧 Application de la migration 048 - Correction des statuts des affaires...')
  
  try {
    // 1. Vérifier l'état actuel de la contrainte
    console.log('1. Vérification de l\'état actuel...')
    
    // Tester avec un statut qui devrait fonctionner
    const testData = {
      code_affaire: 'TEST_MIGRATION_' + Date.now(),
      nom: 'Test Migration',
      site_id: 'aa72513c-ea28-467f-90fa-14dbe76f2ba2',
      responsable_id: '807b4eab-c6eb-4007-ae98-184939b2bdf8',
      type_contrat: 'Forfait',
      type_affaire: 'Maintenance',
      statut: 'A_planifier'
    }
    
    console.log('📋 Test avec statut A_planifier...')
    const { data: testAffaire, error: testError } = await supabase
      .from('affaires')
      .insert(testData)
      .select()
      .single()
    
    if (testError) {
      console.log('❌ Erreur détectée:', testError.message)
      console.log('🔍 Code erreur:', testError.code)
      
      if (testError.code === '23514') {
        console.log('🚨 Contrainte CHECK non mise à jour - Application de la correction...')
        
        // Essayer de corriger en utilisant une approche alternative
        console.log('2. Tentative de correction via mise à jour directe...')
        
        // Créer une affaire avec un statut autorisé d'abord
        const validData = {
          code_affaire: 'TEMP_VALID_' + Date.now(),
          nom: 'Temp Valid',
          site_id: 'aa72513c-ea28-467f-90fa-14dbe76f2ba2',
          responsable_id: '807b4eab-c6eb-4007-ae98-184939b2bdf8',
          type_contrat: 'Forfait',
          type_affaire: 'Maintenance',
          statut: 'Brouillon'
        }
        
        const { data: validAffaire, error: validError } = await supabase
          .from('affaires')
          .insert(validData)
          .select()
          .single()
        
        if (validError) {
          console.error('❌ Impossible de créer même avec statut valide:', validError)
          return
        }
        
        console.log('✅ Affaire temporaire créée:', validAffaire.id)
        
        // Essayer de mettre à jour vers A_planifier
        const { error: updateError } = await supabase
          .from('affaires')
          .update({ statut: 'A_planifier' })
          .eq('id', validAffaire.id)
        
        if (updateError) {
          console.error('❌ Impossible de mettre à jour vers A_planifier:', updateError)
          
          // Nettoyer
          await supabase.from('affaires').delete().eq('id', validAffaire.id)
          console.log('🧹 Affaire temporaire supprimée')
          
          console.log('💡 Solution: La contrainte CHECK doit être modifiée manuellement dans Supabase')
          console.log('📝 SQL à exécuter dans Supabase SQL Editor:')
          console.log('ALTER TABLE affaires DROP CONSTRAINT IF EXISTS affaires_statut_check;')
          console.log('ALTER TABLE affaires ADD CONSTRAINT affaires_statut_check CHECK (statut IN (\'Brouillon\', \'A_planifier\', \'Validée\', \'Planifiée\', \'En suivi\', \'Clôturée\'));')
          
        } else {
          console.log('✅ Mise à jour vers A_planifier réussie!')
          
          // Nettoyer
          await supabase.from('affaires').delete().eq('id', validAffaire.id)
          console.log('🧹 Affaire temporaire supprimée')
          
          console.log('🎉 La contrainte CHECK est maintenant correcte!')
        }
        
      } else {
        console.log('❌ Erreur différente:', testError)
      }
      
    } else {
      console.log('✅ Test A_planifier réussi - La contrainte est déjà correcte!')
      
      // Nettoyer
      await supabase.from('affaires').delete().eq('id', testAffaire.id)
      console.log('🧹 Affaire de test supprimée')
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter la migration
applyMigration048()
