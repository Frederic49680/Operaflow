// Script de test pour vérifier les données de l'API Gantt
// Usage: node test_api_gantt.js

const SUPABASE_URL = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

async function testAPI() {
  try {
    console.log('🔍 Test de l\'API Gantt...\n')
    
    // Test 1: Récupérer les tâches via l'API
    console.log('1️⃣ Test de récupération des tâches')
    const response = await fetch('http://localhost:3000/api/gantt/tasks')
    const data = await response.json()
    
    console.log('✅ Réponse API:', data.success ? 'SUCCESS' : 'FAILED')
    console.log('📊 Nombre de tâches:', data.data?.length || 0)
    
    if (data.data && data.data.length > 0) {
      console.log('\n📋 Première tâche:')
      const firstTask = data.data[0]
      console.log('   ID:', firstTask.id)
      console.log('   Libellé:', firstTask.libelle_tache)
      console.log('   Affaire ID:', firstTask.affaire_id)
      console.log('   Site ID:', firstTask.site_id)
      console.log('   Code Affaire:', firstTask.code_affaire)
      console.log('   Site Nom:', firstTask.site_nom)
      console.log('   Date début:', firstTask.date_debut_plan)
      console.log('   Date fin:', firstTask.date_fin_plan)
      console.log('   Statut:', firstTask.statut)
      
      // Vérifier les problèmes
      console.log('\n🔍 Vérification des problèmes:')
      const problems = []
      
      if (!firstTask.libelle_tache) {
        problems.push('❌ Libellé manquant')
      }
      if (!firstTask.site_id) {
        problems.push('❌ Site ID manquant')
      }
      if (!firstTask.affaire_id) {
        problems.push('❌ Affaire ID manquant')
      }
      if (firstTask.site_nom === 'N/A') {
        problems.push('⚠️  Site nom = N/A')
      }
      if (firstTask.code_affaire === 'N/A') {
        problems.push('⚠️  Code affaire = N/A')
      }
      
      if (problems.length === 0) {
        console.log('✅ Aucun problème détecté')
      } else {
        console.log('❌ Problèmes détectés:')
        problems.forEach(p => console.log('   ', p))
      }
      
      // Afficher toutes les tâches
      console.log('\n📋 Toutes les tâches:')
      data.data.forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.libelle_tache || 'UNDEFINED'} - Site: ${task.site_nom || 'N/A'} - Affaire: ${task.code_affaire || 'N/A'}`)
      })
    } else {
      console.log('⚠️  Aucune tâche trouvée')
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

testAPI()

