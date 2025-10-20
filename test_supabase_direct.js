// Script pour vérifier directement les données dans Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  try {
    console.log('🔍 Vérification des données dans Supabase...\n')
    
    // Récupérer toutes les tâches
    const { data, error } = await supabase
      .from('planning_taches')
      .select(`
        *,
        affaires (code_affaire, nom),
        sites (nom)
      `)
      .order('date_debut_plan')
    
    if (error) {
      console.error('❌ Erreur:', error)
      return
    }
    
    console.log(`📊 Nombre de tâches dans la base: ${data.length}\n`)
    
    if (data.length > 0) {
      console.log('📋 Liste des tâches:')
      data.forEach((task, index) => {
        console.log(`${index + 1}. ${task.libelle_tache}`)
        console.log(`   ID: ${task.id}`)
        console.log(`   Affaire: ${task.affaires?.code_affaire || 'N/A'}`)
        console.log(`   Site: ${task.sites?.nom || 'N/A'}`)
        console.log(`   Dates: ${task.date_debut_plan} → ${task.date_fin_plan}`)
        console.log(`   Statut: ${task.statut}`)
        console.log('')
      })
    } else {
      console.log('⚠️  Aucune tâche trouvée dans la base')
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

checkData()

