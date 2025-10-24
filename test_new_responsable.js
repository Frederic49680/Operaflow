const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase
const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testNewResponsable() {
  console.log('🧪 Test avec le nouveau responsable_id de l\'utilisateur...')
  
  // Nouvelles données de l'utilisateur (responsable_id a changé)
  const userData = {
    code_affaire: '5G 1Z12M0',
    nom: 'Maintenance Batterie',
    site_id: 'aa72513c-ea28-467f-90fa-14dbe76f2ba2',
    responsable_id: '2e5631ee-f896-41c8-89d2-6642fde08fc7', // NOUVEAU ID
    client_id: '6a8248ec-0272-4e2b-b7c6-b6fe0b93bfb0'
  }
  
  try {
    // 1. Vérifier que le nouveau responsable existe
    console.log('1. Vérification du nouveau responsable...')
    
    const { data: responsable, error: respError } = await supabase
      .from('ressources')
      .select('id, nom, prenom, actif')
      .eq('id', userData.responsable_id)
      .single()
    
    if (respError) {
      console.error('❌ Nouveau responsable non trouvé:', respError)
      return
    } else {
      console.log('✅ Nouveau responsable trouvé:', `${responsable.prenom} ${responsable.nom}`)
      console.log('📊 Statut actif:', responsable.actif)
    }

    // 2. Tester la création avec le nouveau responsable
    console.log('2. Test de création avec le nouveau responsable...')
    
    const insertData = {
      code_affaire: userData.code_affaire,
      nom: userData.nom,
      site_id: userData.site_id,
      responsable_id: userData.responsable_id,
      client_id: userData.client_id,
      type_contrat: 'Forfait',
      type_affaire: 'Maintenance',
      statut: 'A_planifier',
      created_by: null
    }
    
    console.log('📋 Données à insérer:', insertData)
    
    const { data: affaire, error: insertError } = await supabase
      .from('affaires')
      .insert(insertData)
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Erreur création affaire:', insertError)
      console.log('🔍 Détails complets:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      })
    } else {
      console.log('✅ Affaire créée avec succès:', affaire.id)
      
      // Supprimer l'affaire de test
      const { error: deleteError } = await supabase
        .from('affaires')
        .delete()
        .eq('id', affaire.id)
      
      if (deleteError) {
        console.log('⚠️ Erreur lors de la suppression:', deleteError.message)
      } else {
        console.log('✅ Affaire de test supprimée')
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le test
testNewResponsable()
