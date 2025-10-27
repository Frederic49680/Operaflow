// Script pour vérifier l'existence des tables de gestion des utilisateurs
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('🔍 Vérification de l\'existence des tables de gestion des utilisateurs...')
  
  const tables = [
    'app_users',
    'roles', 
    'permissions',
    'user_roles',
    'role_permissions',
    'page_access_rules',
    'component_flags',
    'user_tokens',
    'audit_log'
  ]
  
  for (const table of tables) {
    try {
      console.log(`\n📋 Vérification de la table: ${table}`)
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`)
      } else {
        console.log(`✅ Table ${table}: Existe (${data?.length || 0} enregistrements)`)
      }
    } catch (err) {
      console.log(`❌ Table ${table}: Erreur - ${err.message}`)
    }
  }
  
  console.log('\n🎯 Vérification terminée!')
}

checkTables()
