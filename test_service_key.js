// Vérifier les variables d'environnement
console.log('🔍 Vérification des variables d\'environnement:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ Manquante')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Présente' : '❌ Manquante')

// Test avec les clés hardcodées
const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc5MzU0MSwiZXhwIjoyMDc2MzY5NTQxfQ.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

console.log('\n🔑 Test avec clés hardcodées:')
console.log('URL:', supabaseUrl)
console.log('Service Key:', serviceRoleKey.substring(0, 20) + '...')

const { createClient } = require('@supabase/supabase-js')
const serviceSupabase = createClient(supabaseUrl, serviceRoleKey)

async function testServiceKey() {
  try {
    console.log('\n🧪 Test de la clé service...')
    const { data, error } = await serviceSupabase.auth.admin.listUsers()
    
    if (error) {
      console.error('❌ Erreur:', error.message)
      console.error('Code:', error.status)
    } else {
      console.log('✅ Clé service fonctionne!')
      console.log('👥 Nombre d\'utilisateurs:', data?.users?.length || 0)
    }
  } catch (err) {
    console.error('❌ Exception:', err.message)
  }
}

testServiceKey()
