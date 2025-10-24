const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addRoleColumn() {
  try {
    // Essayer d'ajouter la colonne role_principal
    console.log('Tentative d\'ajout de la colonne role_principal...')
    
    // Test simple pour voir si la colonne existe
    const { data, error } = await supabase
      .from('ressources')
      .select('role_principal')
      .limit(1)
    
    if (error && error.code === 'PGRST204') {
      console.log('❌ Colonne role_principal n\'existe pas encore')
      console.log('Vous devez exécuter manuellement le script SQL dans Supabase Dashboard:')
      console.log('')
      console.log('ALTER TABLE public.ressources ADD COLUMN IF NOT EXISTS role_principal text;')
      console.log('')
      console.log('Ou utiliser l\'interface Supabase pour ajouter cette colonne.')
    } else {
      console.log('✅ Colonne role_principal existe déjà')
    }

    // Vérifier les rôles disponibles
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('code, label')
      .eq('actif', true)
      .order('seniority_rank')

    if (rolesError) {
      console.log('❌ Erreur chargement rôles:', rolesError.message)
    } else {
      console.log('✅ Rôles disponibles:', roles.length)
      roles.forEach(role => {
        console.log(`  - ${role.code}: ${role.label}`)
      })
    }
    
  } catch (error) {
    console.error('Erreur:', error)
  }
}

addRoleColumn()
